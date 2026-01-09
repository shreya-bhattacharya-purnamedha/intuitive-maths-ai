'use client';

import { useState, useRef } from 'react';
import { Course, PricingModality, useWorldTreeStore } from '@/lib/stores/worldTreeStore';

interface AdminPanelProps {
  onClose: () => void;
}

type TabType = 'branding' | 'courses' | 'pricing';

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('branding');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingPricing, setEditingPricing] = useState<PricingModality | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    companyName,
    tagline,
    logoUrl,
    courses,
    pricingModalities,
    setCompanyName,
    setTagline,
    setLogoUrl,
    updateCourse,
    addCourse,
    removeCourse,
    updatePricingModality,
  } = useWorldTreeStore();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCourse = (course: Course) => {
    updateCourse(course.id, course);
    setEditingCourse(null);
  };

  const handleAddCourse = () => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: 'New Course',
      description: 'Course description',
      icon: '📖',
      color: '#6366f1',
      status: 'placeholder',
      price: { membership: 0, annual: 199, oneTime: 49 },
    };
    addCourse(newCourse);
    setEditingCourse(newCourse);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--viz-grid)]">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--surface-elevated)] rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--viz-grid)]">
          {(['branding', 'courses', 'pricing'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-[var(--primary)] text-white'
                  : 'hover:bg-[var(--surface-elevated)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center overflow-hidden border-2 border-dashed border-[var(--viz-grid)]">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-4xl">🌳</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm"
                    >
                      Upload Logo
                    </button>
                    {logoUrl && (
                      <button
                        onClick={() => setLogoUrl(null)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm ml-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--viz-grid)] focus:border-[var(--primary)] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--viz-grid)] focus:border-[var(--primary)] outline-none"
                />
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Manage Courses</h3>
                <button
                  onClick={handleAddCourse}
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Course
                </button>
              </div>

              {editingCourse ? (
                <CourseEditor
                  course={editingCourse}
                  onSave={handleSaveCourse}
                  onCancel={() => setEditingCourse(null)}
                  onDelete={() => {
                    removeCourse(editingCourse.id);
                    setEditingCourse(null);
                  }}
                />
              ) : (
                <div className="grid gap-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--viz-grid)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{course.icon}</span>
                        <div>
                          <div className="font-medium">{course.title}</div>
                          <div className="text-sm text-[var(--foreground)]/60">
                            {course.status === 'active' ? '🟢 Active' :
                             course.status === 'coming-soon' ? '🟡 Coming Soon' : '⚪ Placeholder'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingCourse(course)}
                        className="px-3 py-1.5 text-sm bg-[var(--surface)] rounded-lg hover:bg-[var(--viz-grid)]"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <h3 className="font-medium mb-4">Pricing Modalities</h3>

              {editingPricing ? (
                <PricingEditor
                  pricing={editingPricing}
                  onSave={(p) => {
                    updatePricingModality(p.id, p);
                    setEditingPricing(null);
                  }}
                  onCancel={() => setEditingPricing(null)}
                />
              ) : (
                <div className="grid gap-3">
                  {pricingModalities.map((pricing) => (
                    <div
                      key={pricing.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--viz-grid)]"
                    >
                      <div>
                        <div className="font-medium">{pricing.name}</div>
                        <div className="text-sm text-[var(--foreground)]/60">
                          ${pricing.price}/{pricing.period}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingPricing(pricing)}
                        className="px-3 py-1.5 text-sm bg-[var(--surface)] rounded-lg hover:bg-[var(--viz-grid)]"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Course Editor Component
function CourseEditor({
  course,
  onSave,
  onCancel,
  onDelete,
}: {
  course: Course;
  onSave: (course: Course) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState(course);

  const iconOptions = ['📖', '🧮', '👔', '🧠', '💻', '🎨', '🤖', '🎵', '📚', '🚀', '💡', '🔬', '🌟', '🎯'];
  const colorOptions = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b'];

  return (
    <div className="bg-[var(--surface-elevated)] rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Course['status'] })}
            className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
          >
            <option value="active">Active</option>
            <option value="coming-soon">Coming Soon</option>
            <option value="placeholder">Placeholder</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Icon</label>
          <div className="flex flex-wrap gap-2">
            {iconOptions.map((icon) => (
              <button
                key={icon}
                onClick={() => setForm({ ...form, icon })}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                  form.icon === icon ? 'bg-[var(--primary)]' : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => setForm({ ...form, color })}
                className={`w-10 h-10 rounded-lg ${
                  form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--surface-elevated)]' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Internal Link (for active courses)</label>
          <input
            type="text"
            value={form.internalLink || ''}
            onChange={(e) => setForm({ ...form, internalLink: e.target.value })}
            placeholder="/course/part-1/chapter-1-vectors"
            className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Graphy Link</label>
          <input
            type="text"
            value={form.graphyLink || ''}
            onChange={(e) => setForm({ ...form, graphyLink: e.target.value })}
            placeholder="https://graphy.com/course/..."
            className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Pricing</label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[var(--foreground)]/60 mb-1">Membership</label>
            <input
              type="number"
              value={form.price?.membership || 0}
              onChange={(e) => setForm({ ...form, price: { ...form.price, membership: Number(e.target.value) } })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--foreground)]/60 mb-1">Annual ($)</label>
            <input
              type="number"
              value={form.price?.annual || 0}
              onChange={(e) => setForm({ ...form, price: { ...form.price, annual: Number(e.target.value) } })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--foreground)]/60 mb-1">One-Time ($)</label>
            <input
              type="number"
              value={form.price?.oneTime || 0}
              onChange={(e) => setForm({ ...form, price: { ...form.price, oneTime: Number(e.target.value) } })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-[var(--viz-grid)]">
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
        >
          Delete Course
        </button>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[var(--surface)] rounded-lg text-sm hover:bg-[var(--viz-grid)]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Pricing Editor Component
function PricingEditor({
  pricing,
  onSave,
  onCancel,
}: {
  pricing: PricingModality;
  onSave: (pricing: PricingModality) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(pricing);
  const [newFeature, setNewFeature] = useState('');

  const addFeature = () => {
    if (newFeature.trim()) {
      setForm({ ...form, features: [...form.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  };

  return (
    <div className="bg-[var(--surface-elevated)] rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-2">Price ($)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Period</label>
            <select
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
            >
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="one-time">One-Time</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Features</label>
        <div className="space-y-2 mb-2">
          {form.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => {
                  const newFeatures = [...form.features];
                  newFeatures[index] = e.target.value;
                  setForm({ ...form, features: newFeatures });
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)] text-sm"
              />
              <button
                onClick={() => removeFeature(index)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Add new feature"
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--viz-grid)] outline-none focus:border-[var(--primary)] text-sm"
            onKeyPress={(e) => e.key === 'Enter' && addFeature()}
          />
          <button
            onClick={addFeature}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="highlighted"
          checked={form.highlighted || false}
          onChange={(e) => setForm({ ...form, highlighted: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="highlighted" className="text-sm">Highlight this pricing option</label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--viz-grid)]">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-[var(--surface)] rounded-lg text-sm hover:bg-[var(--viz-grid)]"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
