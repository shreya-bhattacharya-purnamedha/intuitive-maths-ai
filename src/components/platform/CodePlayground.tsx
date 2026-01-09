'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useVisualizationStore } from '@/lib/stores/visualizationStore';

interface CodePlaygroundProps {
  id?: string;
  language?: 'python' | 'javascript';
  initialCode: string;
  linkedVisualization?: string;
  title?: string;
  description?: string;
  className?: string;
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string[]) => Promise<void>;
  globals: {
    get: (name: string) => unknown;
  };
}

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
    pyodide?: PyodideInterface;
  }
}

export function CodePlayground({
  language = 'python',
  initialCode,
  linkedVisualization,
  title = 'Code Playground',
  description,
  className = '',
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode.trim());
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pyodideRef = useRef<PyodideInterface | null>(null);

  const { setVector, setParameter } = useVisualizationStore();

  // Load Pyodide when component mounts (only for Python)
  useEffect(() => {
    if (language !== 'python') return;

    const loadPyodideScript = async () => {
      // Check if already loaded
      if (window.pyodide) {
        pyodideRef.current = window.pyodide;
        setIsPyodideReady(true);
        return;
      }

      setIsPyodideLoading(true);

      try {
        // Load Pyodide script dynamically
        if (!document.querySelector('script[src*="pyodide"]')) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
          script.async = true;
          document.head.appendChild(script);

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Pyodide'));
          });
        }

        // Initialize Pyodide
        if (window.loadPyodide) {
          const pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
          });

          // Load numpy by default for math operations
          await pyodide.loadPackage(['numpy']);

          window.pyodide = pyodide;
          pyodideRef.current = pyodide;
          setIsPyodideReady(true);
        }
      } catch (err) {
        console.error('Failed to load Pyodide:', err);
        setError('Failed to load Python runtime. Please refresh the page.');
      } finally {
        setIsPyodideLoading(false);
      }
    };

    loadPyodideScript();
  }, [language]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(150, textarea.scrollHeight)}px`;
    }
  }, [code]);

  const runPython = useCallback(async () => {
    if (!pyodideRef.current) {
      setError('Python runtime not ready. Please wait...');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      // Capture stdout
      await pyodideRef.current.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `);

      // Run the user's code
      await pyodideRef.current.runPythonAsync(code);

      // Get the output
      const stdout = await pyodideRef.current.runPythonAsync(`
sys.stdout.getvalue()
      `);

      setOutput(String(stdout) || '(No output)');

      // Check for visualization updates
      if (linkedVisualization) {
        try {
          // Check if there's a result variable to send to visualization
          const result = pyodideRef.current.globals.get('result');
          if (result && Array.isArray(result)) {
            if (result.length === 2 && typeof result[0] === 'number') {
              setVector(linkedVisualization, result as [number, number]);
            }
          }

          // Check for individual x, y variables
          const x = pyodideRef.current.globals.get('x');
          const y = pyodideRef.current.globals.get('y');
          if (typeof x === 'number' && typeof y === 'number') {
            setVector(linkedVisualization, [x, y]);
          }
        } catch {
          // No visualization update needed
        }
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsRunning(false);
    }
  }, [code, linkedVisualization, setVector]);

  const runJavaScript = useCallback(() => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      // Create a custom console to capture output
      const outputs: string[] = [];
      const customConsole = {
        log: (...args: unknown[]) => outputs.push(args.map(String).join(' ')),
        error: (...args: unknown[]) => outputs.push(`Error: ${args.map(String).join(' ')}`),
        warn: (...args: unknown[]) => outputs.push(`Warning: ${args.map(String).join(' ')}`),
      };

      // Create a function that runs the code with custom console
      const runCode = new Function('console', 'setVector', 'setParameter', `
        ${code}
      `);

      // If linked to a visualization, provide setter functions
      const vizSetVector = linkedVisualization
        ? (vec: [number, number]) => setVector(linkedVisualization, vec)
        : () => {};
      const vizSetParam = linkedVisualization
        ? (val: number) => setParameter(linkedVisualization, val)
        : () => {};

      runCode(customConsole, vizSetVector, vizSetParam);

      setOutput(outputs.join('\n') || '(No output)');
    } catch (err) {
      setError(String(err));
    } finally {
      setIsRunning(false);
    }
  }, [code, linkedVisualization, setVector, setParameter]);

  const handleRun = useCallback(() => {
    if (language === 'python') {
      runPython();
    } else {
      runJavaScript();
    }
  }, [language, runPython, runJavaScript]);

  const handleReset = useCallback(() => {
    setCode(initialCode.trim());
    setOutput('');
    setError('');
  }, [initialCode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Run code with Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }

    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newCode = code.substring(0, start) + '    ' + code.substring(end);
        setCode(newCode);
        // Set cursor position after the inserted spaces
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      }
    }
  }, [code, handleRun]);

  return (
    <div className={`code-playground bg-[var(--surface)] rounded-xl border border-[var(--viz-grid)] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-elevated)] border-b border-[var(--viz-grid)]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
          </div>
          <span className="text-sm font-medium text-[var(--foreground)]/70">
            {title}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--primary)]/20 text-[var(--primary)]">
            {language === 'python' ? 'Python' : 'JavaScript'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {language === 'python' && isPyodideLoading && (
            <span className="text-xs text-[var(--foreground)]/50 flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading Python...
            </span>
          )}
          <button
            onClick={handleReset}
            className="text-xs px-3 py-1.5 rounded-md bg-[var(--surface)] hover:bg-[var(--viz-grid)] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="px-4 py-2 text-sm text-[var(--foreground)]/60 border-b border-[var(--viz-grid)]">
          {description}
        </div>
      )}

      {/* Code Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full p-4 bg-[#1e1e2e] text-[var(--foreground)] font-mono text-sm leading-relaxed resize-none focus:outline-none"
          style={{ minHeight: '150px', tabSize: 4 }}
        />

        {/* Line numbers overlay hint */}
        <div className="absolute bottom-2 right-2 text-xs text-[var(--foreground)]/30">
          {language === 'python' ? '⌘/Ctrl + Enter to run' : '⌘/Ctrl + Enter to run'}
        </div>
      </div>

      {/* Run Button */}
      <div className="px-4 py-3 border-t border-[var(--viz-grid)] bg-[var(--surface-elevated)]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRun}
            disabled={isRunning || (language === 'python' && !isPyodideReady)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--success)] hover:bg-[var(--success)]/90 disabled:bg-[var(--viz-grid)] disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
          >
            {isRunning ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Run Code
              </>
            )}
          </button>
          {language === 'python' && !isPyodideReady && !error && (
            <span className="text-sm text-[var(--foreground)]/60 flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading Python runtime... (first load may take 10-20s)
            </span>
          )}
          {language === 'python' && isPyodideReady && (
            <span className="text-xs text-[var(--success)]">Python ready</span>
          )}
        </div>
      </div>

      {/* Output Panel */}
      {(output || error) && (
        <div className="border-t border-[var(--viz-grid)]">
          <div className="px-4 py-2 bg-[var(--surface-elevated)] text-xs font-medium text-[var(--foreground)]/60">
            Output
          </div>
          <div className={`p-4 font-mono text-sm whitespace-pre-wrap ${error ? 'bg-red-500/10 text-red-400' : 'bg-[#1e1e2e] text-[var(--foreground)]'}`}>
            {error || output}
          </div>
        </div>
      )}
    </div>
  );
}
