'use client';

import { useParams } from 'next/navigation';
import { ChapterLayout } from '@/components/platform/ChapterLayout';
import { getChapterMeta, getAdjacentChapters, courseStructure } from '@/lib/mdx';
import { Callout } from '@/components/ui/Callout';
import { VectorExplorer } from '@/components/visualizations/linear-algebra/VectorExplorer';
import { MatrixTransformer } from '@/components/visualizations/linear-algebra/MatrixTransformer';
import { DimensionalityReducer } from '@/components/visualizations/linear-algebra/DimensionalityReducer';
import { DerivativeSensitivity } from '@/components/visualizations/calculus/DerivativeSensitivity';
import { JacobianVisualizer } from '@/components/visualizations/calculus/JacobianVisualizer';
import { LossLandscape } from '@/components/visualizations/calculus/LossLandscape';
import { BackpropFlow } from '@/components/visualizations/calculus/BackpropFlow';
import { DistributionExplorer } from '@/components/visualizations/probability/DistributionExplorer';
import { BayesUpdater } from '@/components/visualizations/probability/BayesUpdater';
import { NeuronBuilder } from '@/components/visualizations/neural-networks/NeuronBuilder';
import { DecisionBoundary } from '@/components/visualizations/neural-networks/DecisionBoundary';
import { ManifoldExplorer } from '@/components/visualizations/neural-networks/ManifoldExplorer';
import { UniversalApproximator } from '@/components/visualizations/neural-networks/UniversalApproximator';
import { MNISTExplorer } from '@/components/visualizations/neural-networks/MNISTExplorer';
import { LatentSpaceExplorer } from '@/components/visualizations/neural-networks/LatentSpaceExplorer';
import { VAEPipeline } from '@/components/visualizations/neural-networks/VAEPipeline';
import { InterpolationDemo } from '@/components/visualizations/neural-networks/InterpolationDemo';
import { AttentionVisualizer } from '@/components/visualizations/transformers/AttentionVisualizer';
import { TransformerBlock } from '@/components/visualizations/transformers/TransformerBlock';
import { QueryKeyValue } from '@/components/visualizations/transformers/QueryKeyValue';
import { EmergenceSimulator } from '@/components/visualizations/transformers/EmergenceSimulator';
import { ThreePillars } from '@/components/visualizations/transformers/ThreePillars';
import { JourneyRecap } from '@/components/visualizations/transformers/JourneyRecap';
import { CodePlayground } from '@/components/platform/CodePlayground';

// Chapter 1 content component
function Chapter1Vectors() {
  return (
    <div className="space-y-8">
      {/* Section 1.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 1.1: The Physics of Data</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: "The Treasure Map"
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            <strong>Traditional View:</strong> A vector is a list of numbers, e.g.,{' '}
            <code className="math-inline">[3, 2]</code>.
          </p>

          <p>
            <strong>The Intuitive View:</strong> A vector is a <em>movement</em>.
          </p>

          <p>
            Imagine a treasure map. The instruction isn&apos;t &quot;dig at coordinate (3,2).&quot;
            The instruction is <strong>&quot;walk 3 steps East, then 2 steps North.&quot;</strong>
          </p>

          <p>
            The vector is the <em>arrow</em> representing that journey. It has a{' '}
            <strong>length</strong> (how far you walked) and a <strong>direction</strong>{' '}
            (which way you faced).
          </p>
        </div>

        <Callout type="insight">
          If you start at a different location but walk the same distance and direction,{' '}
          <em>it is the same vector</em>. In AI, vectors represent relationships and features,
          not just raw locations.
        </Callout>

        {/* Interactive Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: The Arrow in the Void</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Watch the animation below, then drag the arrow to explore. Notice how all the
            ghost arrows represent the <em>same</em> vector—same length, same direction,
            different starting points.
          </p>

          <VectorExplorer
            id="treasure-map-vector"
            initialVector={[3, 2]}
            interactive={true}
            showGhostVectors={true}
            showComponents={true}
            buildUpMode={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Section 1.2 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 1.2: The &quot;Space&quot; of Things</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: "The Recipe Space"
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            <strong>The Question:</strong> How do we visualize more than 3 dimensions?
          </p>

          <p>
            Imagine a &quot;Cookie Vector.&quot;
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Dimension 1: Sugar (grams)</li>
            <li>Dimension 2: Flour (grams)</li>
            <li>Dimension 3: Butter (grams)</li>
          </ul>

          <p>
            A specific cookie recipe is a single <em>point</em> in this 3D &quot;flavor space.&quot;
          </p>

          <p>
            Now add Dimension 4: Chocolate Chips. Add Dimension 5: Vanilla. You can no longer
            draw it, but the <em>logic</em> holds. Two recipes that are &quot;close&quot; in this
            5D space will taste similar. Two recipes far apart will taste different.
          </p>
        </div>

        <Callout type="aha" title="The Mind-Bending Truth">
          A 1080p image is just a single point in a <strong>2,073,600-dimensional space</strong>{' '}
          (one dimension per pixel). Every image you&apos;ve ever seen is a coordinate in this
          impossibly vast universe.
        </Callout>
      </section>

      {/* Section 1.3 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 1.3: Similarity is an Angle (The Dot Product)</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: "The Solar Panel"
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            <strong>The Problem:</strong> How does an AI know if &quot;cat&quot; is similar to
            &quot;kitten&quot;? It measures the <em>angle</em> between their vectors.
          </p>

          <p>
            Imagine the Sun (Vector A) shining on a Solar Panel (Vector B).
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>If the panel faces the sun directly (0° angle), maximum energy is captured. <strong>(Maximum similarity)</strong></li>
            <li>If the panel is perpendicular (90° angle), no energy is captured. <strong>(Zero similarity / Orthogonal)</strong></li>
            <li>If the panel faces away (180° angle), it&apos;s negative alignment. <strong>(Opposites)</strong></li>
          </ul>

          <p>
            The <strong>Dot Product</strong> calculates this alignment. It tells us how much
            of Vector A is &quot;pushing&quot; in the direction of Vector B.
          </p>
        </div>

        {/* Dot Product Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: The Projection (Shadow)</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Drag the blue vector and watch how the dot product changes. When vectors point
            in similar directions, the dot product is high. When perpendicular, it&apos;s zero.
          </p>

          <VectorExplorer
            id="dot-product-demo"
            initialVector={[3, 2]}
            interactive={true}
            showDotProduct={[4, 1]}
            showProjection={true}
            className="mx-auto"
          />
        </div>

        <Callout type="insight">
          The dot product measures how much one vector aligns with another. This is the
          foundation of how AI measures &quot;similarity&quot; between concepts.
        </Callout>

        {/* Code Example for Dot Product */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Try it: Calculate the Dot Product</h4>
          <CodePlayground
            language="python"
            title="Dot Product Calculator"
            description="Modify the vectors and see how the dot product changes based on their alignment."
            initialCode={`import numpy as np

# Two vectors - try changing these values!
vector_a = np.array([3, 2])
vector_b = np.array([4, 1])

# Calculate dot product (two equivalent ways)
dot_product_manual = vector_a[0]*vector_b[0] + vector_a[1]*vector_b[1]
dot_product_numpy = np.dot(vector_a, vector_b)

# Calculate magnitudes
magnitude_a = np.linalg.norm(vector_a)
magnitude_b = np.linalg.norm(vector_b)

# Calculate angle between vectors
cos_angle = dot_product_numpy / (magnitude_a * magnitude_b)
angle_degrees = np.degrees(np.arccos(cos_angle))

print(f"Vector A: {vector_a}")
print(f"Vector B: {vector_b}")
print()
print(f"Dot Product: {dot_product_numpy}")
print(f"  = {vector_a[0]}*{vector_b[0]} + {vector_a[1]}*{vector_b[1]}")
print(f"  = {vector_a[0]*vector_b[0]} + {vector_a[1]*vector_b[1]}")
print()
print(f"Angle between vectors: {angle_degrees:.1f} degrees")
print()
if dot_product_numpy > 0:
    print("Positive dot product = vectors point in similar directions")
elif dot_product_numpy < 0:
    print("Negative dot product = vectors point in opposite directions")
else:
    print("Zero dot product = vectors are perpendicular!")`}
          />
        </div>
      </section>

      {/* Interactive Lab */}
      <section className="bg-[var(--surface-elevated)] rounded-xl p-6 mt-12">
        <h2 className="text-2xl font-bold mb-4">Interactive Lab: The Personality Vector</h2>

        <p className="text-[var(--foreground)]/80 mb-6">
          Let&apos;s make this personal. We&apos;ll define a 2-dimensional &quot;Personality Space&quot;:
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[var(--surface)] p-4 rounded-lg">
            <h4 className="font-medium mb-2">X-axis: Introversion ↔ Extroversion</h4>
            <p className="text-sm text-[var(--foreground)]/60">
              -10 = Very Introverted, +10 = Very Extroverted
            </p>
          </div>
          <div className="bg-[var(--surface)] p-4 rounded-lg">
            <h4 className="font-medium mb-2">Y-axis: Logic ↔ Emotion</h4>
            <p className="text-sm text-[var(--foreground)]/60">
              -10 = Very Emotional, +10 = Very Logical
            </p>
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-lg p-4">
          <h4 className="font-medium mb-3">Try it yourself:</h4>
          <ol className="list-decimal list-inside space-y-2 text-[var(--foreground)]/80">
            <li>Drag the vector tip to represent yourself in personality space</li>
            <li>Where would your best friend be? (Hint: Similar personalities = close in space)</li>
            <li>Where would your opposite be? (Hint: Opposite personalities = pointing the other way)</li>
          </ol>
        </div>

        <div className="mt-6">
          <VectorExplorer
            id="personality-vector"
            initialVector={[2, 3]}
            interactive={true}
            showMagnitudeRuler={true}
            showAngleArc={true}
            className="mx-auto"
          />
        </div>

        {/* Code Playground for Cosine Similarity */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Try it: Calculate Cosine Similarity</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Run this Python code to see how we measure similarity between vectors using the dot product.
          </p>

          <CodePlayground
            language="python"
            title="Cosine Similarity"
            description="The cosine similarity measures the angle between two vectors. A value of 1 means identical direction, 0 means perpendicular, -1 means opposite."
            initialCode={`import numpy as np

# Define two personality vectors
# Dimensions: [Extroversion, Logic]
alice = np.array([3, 4])   # Extroverted and logical
bob = np.array([4, 3])     # Similar to Alice
carol = np.array([-2, -3]) # Opposite personality

def cosine_similarity(v1, v2):
    """Calculate cosine similarity between two vectors"""
    dot_product = np.dot(v1, v2)
    magnitude_v1 = np.linalg.norm(v1)
    magnitude_v2 = np.linalg.norm(v2)
    return dot_product / (magnitude_v1 * magnitude_v2)

# Calculate similarities
print("Personality Similarity Analysis")
print("=" * 35)
print(f"Alice's vector: {alice}")
print(f"Bob's vector:   {bob}")
print(f"Carol's vector: {carol}")
print()
print(f"Alice vs Bob:   {cosine_similarity(alice, bob):.3f}")
print(f"Alice vs Carol: {cosine_similarity(alice, carol):.3f}")
print()
print("1.0 = Identical direction")
print("0.0 = Perpendicular (unrelated)")
print("-1.0 = Opposite direction")`}
          />
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Key Takeaways</h2>

        <div className="grid gap-4">
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
            <p>
              <strong>Vectors are movements, not locations.</strong> The vector [3, 2] means
              &quot;walk 3 East and 2 North&quot;—starting from anywhere.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
            <p>
              <strong>Data lives in high-dimensional space.</strong> Images, text, and sounds
              are all points in vast vector spaces. Similar things cluster together.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
            <p>
              <strong>The dot product measures similarity.</strong> When vectors point in the
              same direction, they&apos;re similar. This is how AI compares concepts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Chapter 2 content component
function Chapter2Matrices() {
  return (
    <div className="space-y-8">
      {/* Section 2.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 2.1: The Machine Metaphor</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Space-Warping Machine&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            <strong>Traditional View:</strong> A matrix is a grid of numbers, like a spreadsheet.
          </p>

          <p>
            <strong>The Intuitive View:</strong> A matrix is a <em>machine</em> that warps space itself.
          </p>

          <p>
            Imagine you have a sheet of graph paper. A matrix grabs that paper and <strong>stretches</strong>,{' '}
            <strong>rotates</strong>, <strong>shears</strong>, or <strong>flips</strong> it—transforming
            every point on the paper in a consistent way.
          </p>

          <p>
            The key insight: <em>Once you know where the basis vectors land, you know where EVERYTHING lands.</em>
          </p>
        </div>

        <Callout type="insight">
          A 2×2 matrix has exactly 4 numbers. Those 4 numbers tell you where the two basis vectors
          î (pointing right) and ĵ (pointing up) end up after the transformation. That&apos;s it—that&apos;s
          the whole story.
        </Callout>

        {/* Interactive Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: Watch Space Transform</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Click the preset buttons to see different transformations. Notice how the entire grid
            warps, but the <span className="text-[var(--viz-vector-primary)] font-bold">blue î</span> and{' '}
            <span className="text-[var(--viz-vector-secondary)] font-bold">green ĵ</span> vectors tell
            the whole story.
          </p>

          <MatrixTransformer
            id="space-warping-demo"
            interactive={true}
            showGrid={true}
            showBasisVectors={true}
            showUnitSquare={true}
            showDeterminant={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Section 2.2 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 2.2: Reading the Matrix</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Columns Tell the Story
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Here&apos;s the secret to reading any 2×2 matrix instantly:
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-mono mb-2">
                  [<span className="text-[var(--viz-vector-primary)]">a</span>{' '}
                  <span className="text-[var(--viz-vector-secondary)]">b</span>]
                </div>
                <div className="text-4xl font-mono">
                  [<span className="text-[var(--viz-vector-primary)]">c</span>{' '}
                  <span className="text-[var(--viz-vector-secondary)]">d</span>]
                </div>
              </div>
              <div className="text-2xl">=</div>
              <div className="text-center space-y-2">
                <p>
                  <span className="text-[var(--viz-vector-primary)] font-bold">First column [a, c]</span>
                  <br />
                  <span className="text-sm text-[var(--foreground)]/60">Where î lands</span>
                </p>
                <p>
                  <span className="text-[var(--viz-vector-secondary)] font-bold">Second column [b, d]</span>
                  <br />
                  <span className="text-sm text-[var(--foreground)]/60">Where ĵ lands</span>
                </p>
              </div>
            </div>
          </div>

          <p>
            That&apos;s it! The matrix <code className="math-inline">[[2, 0], [0, 1]]</code> means:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>î (which was at [1, 0]) now lands at [2, 0]—stretched horizontally</li>
            <li>ĵ (which was at [0, 1]) stays at [0, 1]—unchanged</li>
          </ul>
        </div>

        <Callout type="aha" title="The Aha! Moment">
          When you see a matrix, don&apos;t see a grid of numbers. See TWO ARROWS: where the
          horizontal unit vector lands (first column) and where the vertical unit vector lands
          (second column). The entire transformation is encoded in those two destinations!
        </Callout>
      </section>

      {/* Section 2.3 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 2.3: The Determinant—Area and Orientation</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Hydraulic Press&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The <strong>determinant</strong> tells you two things:
          </p>

          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li>
              <strong>How much area scales:</strong> If det = 2, areas double. If det = 0.5, areas halve.
            </li>
            <li>
              <strong>Whether orientation flips:</strong> Negative determinant means the space got
              &quot;flipped&quot; like a mirror image.
            </li>
          </ol>

          <p>
            The critical case: <strong>det = 0</strong>. This means the transformation{' '}
            <em>squishes space into a lower dimension</em>—a 2D plane becomes a line, or even a point.
            Information is lost forever.
          </p>
        </div>

        <Callout type="insight">
          In AI, a determinant of zero means your transformation loses information. Neural networks
          generally avoid this—they want to preserve the ability to distinguish between different inputs.
        </Callout>

        {/* Code Playground */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Try it: Calculate the Determinant</h4>
          <CodePlayground
            language="python"
            title="Matrix Determinant"
            description="The determinant tells you how much area scales. Try different matrices!"
            initialCode={`import numpy as np

# Define a matrix - try changing these values!
matrix = np.array([
    [2, 1],
    [1, 3]
])

# Calculate the determinant
det = np.linalg.det(matrix)

print("Matrix:")
print(matrix)
print()
print(f"Determinant: {det:.2f}")
print()

if abs(det) < 0.001:
    print("Determinant is ~0: Space collapses to a lower dimension!")
    print("Information is LOST - this transformation is not reversible.")
elif det < 0:
    print(f"Negative determinant: Space is FLIPPED (mirrored)")
    print(f"Area scales by factor of {abs(det):.2f}")
else:
    print(f"Positive determinant: Orientation preserved")
    print(f"Area scales by factor of {det:.2f}")

# Bonus: Check if the matrix is invertible
print()
if abs(det) > 0.001:
    inverse = np.linalg.inv(matrix)
    print("Matrix is invertible! Inverse:")
    print(inverse)
else:
    print("Matrix is NOT invertible (singular matrix)")`}
          />
        </div>
      </section>

      {/* Section 2.4 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 2.4: Matrix Multiplication as Composition</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;Stacking Machines&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            When you multiply two matrices, you&apos;re <strong>composing transformations</strong>.
            It&apos;s like putting one machine after another:
          </p>

          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>First, apply transformation B</li>
            <li>Then, apply transformation A</li>
            <li>The result (A × B) is a single matrix that does both in one step</li>
          </ol>

          <p>
            <strong>Warning:</strong> Order matters! A × B ≠ B × A in general.
            Rotating then scaling is different from scaling then rotating.
          </p>
        </div>

        <Callout type="insight">
          Neural networks are literally just chains of matrix multiplications with non-linear
          &quot;activation functions&quot; in between. Each layer is a transformation, and the
          whole network is a composition of transformations!
        </Callout>

        {/* Code Playground for Matrix Multiplication */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Try it: Matrix Multiplication</h4>
          <CodePlayground
            language="python"
            title="Composing Transformations"
            description="See how multiplying matrices composes transformations. Notice: order matters!"
            initialCode={`import numpy as np

# Two transformations
rotate_90 = np.array([
    [0, -1],
    [1, 0]
])

scale_2x = np.array([
    [2, 0],
    [0, 2]
])

# Compose them in different orders
rotate_then_scale = scale_2x @ rotate_90
scale_then_rotate = rotate_90 @ scale_2x

print("Rotate 90° matrix:")
print(rotate_90)
print()
print("Scale 2x matrix:")
print(scale_2x)
print()
print("Rotate THEN Scale (scale @ rotate):")
print(rotate_then_scale)
print()
print("Scale THEN Rotate (rotate @ scale):")
print(scale_then_rotate)
print()

# Are they the same?
if np.allclose(rotate_then_scale, scale_then_rotate):
    print("Same result! (This is special)")
else:
    print("Different results! Order matters in matrix multiplication.")

# Apply to a vector
v = np.array([1, 0])
print()
print(f"Original vector: {v}")
print(f"After rotate-then-scale: {rotate_then_scale @ v}")
print(f"After scale-then-rotate: {scale_then_rotate @ v}")`}
          />
        </div>
      </section>

      {/* Interactive Lab */}
      <section className="bg-[var(--surface-elevated)] rounded-xl p-6 mt-12">
        <h2 className="text-2xl font-bold mb-4">Interactive Lab: Build Your Own Transformation</h2>

        <div className="bg-[var(--surface)] rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-2">How to Use:</h4>
          <ol className="list-decimal list-inside space-y-2 text-[var(--foreground)]/80">
            <li>Use the <strong>preset buttons</strong> to see common transformations</li>
            <li>Or <strong>edit the matrix values directly</strong> in the 2×2 grid of number inputs</li>
            <li>The <span className="text-[var(--viz-vector-primary)] font-bold">blue column</span> controls where î (the horizontal arrow) lands</li>
            <li>The <span className="text-[var(--viz-vector-secondary)] font-bold">green column</span> controls where ĵ (the vertical arrow) lands</li>
            <li>Watch how the grid, unit square, and determinant change as you modify values</li>
          </ol>
        </div>

        <MatrixTransformer
          id="build-your-own"
          interactive={true}
          showGrid={true}
          showBasisVectors={true}
          showUnitSquare={true}
          showDeterminant={true}
          className="mx-auto"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">Challenges</h3>
        <p className="text-[var(--foreground)]/70 mb-4">
          Try to create these transformations by editing the matrix values above:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[var(--surface)] p-4 rounded-lg">
            <h4 className="font-medium mb-2">Challenge 1: Pure 45° Rotation</h4>
            <p className="text-sm text-[var(--foreground)]/60 mb-3">
              Rotate everything by 45° counterclockwise without stretching.
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-[var(--primary)] hover:underline">Show hint</summary>
              <p className="mt-2 p-2 bg-[var(--surface-elevated)] rounded text-[var(--foreground)]/70">
                For rotation by angle θ: use [[cos(θ), -sin(θ)], [sin(θ), cos(θ)]].
                <br />For 45°: cos(45°) ≈ 0.71, sin(45°) ≈ 0.71
                <br />Try: <code className="text-[var(--primary)]">[[0.71, -0.71], [0.71, 0.71]]</code>
              </p>
            </details>
          </div>

          <div className="bg-[var(--surface)] p-4 rounded-lg">
            <h4 className="font-medium mb-2">Challenge 2: Collapse to a Line</h4>
            <p className="text-sm text-[var(--foreground)]/60 mb-3">
              Make the determinant = 0. Watch the yellow square become a line!
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-[var(--primary)] hover:underline">Show hint</summary>
              <p className="mt-2 p-2 bg-[var(--surface-elevated)] rounded text-[var(--foreground)]/70">
                Determinant = (a×d) - (b×c). Make this equal zero.
                <br />Easiest way: make one column a multiple of the other.
                <br />Try: <code className="text-[var(--primary)]">[[1, 2], [1, 2]]</code> or <code className="text-[var(--primary)]">[[2, 1], [4, 2]]</code>
              </p>
            </details>
          </div>

          <div className="bg-[var(--surface)] p-4 rounded-lg">
            <h4 className="font-medium mb-2">Challenge 3: Shear (Area = 1)</h4>
            <p className="text-sm text-[var(--foreground)]/60 mb-3">
              Slant the space but keep the area unchanged (det = 1).
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-[var(--primary)] hover:underline">Show hint</summary>
              <p className="mt-2 p-2 bg-[var(--surface-elevated)] rounded text-[var(--foreground)]/70">
                A shear keeps one axis fixed and slides the other.
                <br />For horizontal shear: <code className="text-[var(--primary)]">[[1, k], [0, 1]]</code> where k is any number.
                <br />Try: <code className="text-[var(--primary)]">[[1, 1.5], [0, 1]]</code>
              </p>
            </details>
          </div>

          <div className="bg-[var(--surface)] p-4 rounded-lg">
            <h4 className="font-medium mb-2">Challenge 4: Mirror + Scale 2×</h4>
            <p className="text-sm text-[var(--foreground)]/60 mb-3">
              Flip horizontally AND double the size. Determinant should be -4.
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-[var(--primary)] hover:underline">Show hint</summary>
              <p className="mt-2 p-2 bg-[var(--surface-elevated)] rounded text-[var(--foreground)]/70">
                Horizontal flip: negate the first column.
                <br />Scale 2×: multiply everything by 2.
                <br />Try: <code className="text-[var(--primary)]">[[-2, 0], [0, 2]]</code>
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Key Takeaways</h2>

        <div className="grid gap-4">
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
            <p>
              <strong>Matrices are transformations, not data.</strong> A matrix doesn&apos;t store
              information—it describes how to warp space.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
            <p>
              <strong>Columns reveal destinations.</strong> The first column shows where î lands,
              the second shows where ĵ lands. That&apos;s the complete picture.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
            <p>
              <strong>Determinant = area scaling.</strong> Zero means collapse (information loss),
              negative means flip. This matters for neural network design.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
            <p>
              <strong>Multiplication = composition.</strong> Neural networks are chains of matrix
              transformations. Each layer reshapes the space of possibilities.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Chapter 3 content component
function Chapter3Dimensionality() {
  return (
    <div className="space-y-8">
      {/* Section 3.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 3.1: The Curse of Dimensionality</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Problem: &quot;Too Many Dimensions&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Remember the Cookie Vector from Chapter 1? Each ingredient was a dimension:
            sugar, flour, butter, chocolate chips, vanilla...
          </p>

          <p>
            Now imagine a <strong>real machine learning problem</strong>:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>An image: 1,000,000 dimensions (one per pixel)</li>
            <li>A genome: 3,000,000,000 dimensions (one per base pair)</li>
            <li>A document: 50,000+ dimensions (one per word in vocabulary)</li>
          </ul>

          <p>
            This is the <strong>curse of dimensionality</strong>: in high dimensions,
            everything is far from everything else. Distances become meaningless.
            Algorithms break down.
          </p>
        </div>

        <Callout type="insight">
          Here&apos;s the miracle: real data almost never fills its full dimensional space.
          A million-pixel image of a face isn&apos;t just any random million numbers—it&apos;s
          constrained by the structure of faces. The &quot;real&quot; data lives on a much
          smaller surface.
        </Callout>
      </section>

      {/* Section 3.2 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 3.2: The Shadow on the Wall</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;Plato&apos;s Cave&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Imagine prisoners in a cave, chained to face a wall. Behind them, a fire
            casts shadows of objects onto the wall. The prisoners can only see these
            2D shadows of the 3D world.
          </p>

          <p>
            <strong>Dimensionality reduction is choosing the best shadow.</strong>
          </p>

          <p>
            Some projections preserve important structure (you can tell a circle from
            a square). Others destroy it (everything looks like a line). The art is
            finding the projection that keeps what matters.
          </p>
        </div>

        {/* Interactive Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: Finding the Best Shadow</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Drag the slider to rotate the projection angle. Notice how some angles preserve
            the cluster separation (good shadow) while others squish everything together
            (bad shadow). Click &quot;Find Optimal Angle&quot; to let PCA find the best direction.
          </p>

          <DimensionalityReducer
            id="shadow-demo"
            dataset="clusters"
            interactive={true}
            showProjectionLine={true}
            showProjectedPoints={true}
            showVariance={true}
            className="mx-auto"
          />
        </div>

        <Callout type="aha" title="The Key Insight">
          The green projected points are the &quot;shadow&quot; of the blue points. When you
          find a good angle, the two clusters stay separated even in 1D! This is what
          dimensionality reduction does—it finds the view that preserves what matters.
        </Callout>
      </section>

      {/* Section 3.3 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 3.3: PCA—Finding the Principal Shadows</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Principal Component Analysis
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            <strong>PCA (Principal Component Analysis)</strong> is an algorithm that automatically
            finds the best projection directions. It asks: &quot;Which direction captures the
            most variance (spread) in the data?&quot;
          </p>

          <p>
            The steps are:
          </p>

          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Find the direction of maximum variance → <strong>First principal component</strong></li>
            <li>Find the next direction (perpendicular) with most remaining variance → <strong>Second PC</strong></li>
            <li>Continue until you have as many components as original dimensions</li>
            <li>Keep only the top few components to reduce dimensionality</li>
          </ol>
        </div>

        <Callout type="insight">
          Variance = information. A direction with high variance is a direction where
          data points are spread out and distinguishable. A direction with low variance
          is one where everything is squished together—less useful for telling things apart.
        </Callout>

        {/* Code Playground */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Try it: PCA in Action</h4>
          <CodePlayground
            language="python"
            title="Principal Component Analysis"
            description="See how PCA finds the directions of maximum variance and reduces dimensionality."
            initialCode={`import numpy as np

# Generate some 2D data with a clear direction
np.random.seed(42)
n_points = 100

# Data spread mostly along a diagonal
t = np.random.randn(n_points)
x = t * 2 + np.random.randn(n_points) * 0.3
y = t * 1.5 + np.random.randn(n_points) * 0.3
data = np.column_stack([x, y])

print("Original data shape:", data.shape)
print(f"  → {data.shape[1]} dimensions, {data.shape[0]} samples")
print()

# Center the data (subtract mean)
mean = data.mean(axis=0)
centered = data - mean
print(f"Data mean: [{mean[0]:.2f}, {mean[1]:.2f}]")

# Compute covariance matrix
cov_matrix = np.cov(centered.T)
print()
print("Covariance matrix:")
print(cov_matrix.round(2))

# Find eigenvalues and eigenvectors
eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)

# Sort by eigenvalue (largest first)
idx = eigenvalues.argsort()[::-1]
eigenvalues = eigenvalues[idx]
eigenvectors = eigenvectors[:, idx]

print()
print("Principal Components (eigenvectors):")
print(f"  PC1: [{eigenvectors[0,0]:.3f}, {eigenvectors[1,0]:.3f}]")
print(f"  PC2: [{eigenvectors[0,1]:.3f}, {eigenvectors[1,1]:.3f}]")

print()
print("Variance explained:")
total_var = eigenvalues.sum()
for i, ev in enumerate(eigenvalues):
    pct = (ev / total_var) * 100
    print(f"  PC{i+1}: {pct:.1f}%")

print()
print(f"If we keep only PC1, we preserve {eigenvalues[0]/total_var*100:.1f}% of variance!")
print("That's dimensionality reduction: 2D → 1D with minimal information loss.")`}
          />
        </div>
      </section>

      {/* Section 3.4 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 3.4: Why This Matters for AI</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Manifold Hypothesis
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The <strong>manifold hypothesis</strong> is one of the core beliefs of modern AI:
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6 text-center">
            <p className="text-xl italic">
              &quot;Real-world data lies on a low-dimensional manifold embedded in high-dimensional space.&quot;
            </p>
          </div>

          <p>
            What does this mean? Think of a sheet of paper crumpled into a ball:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>The paper exists in 3D space (the room)</li>
            <li>But the paper itself is 2D—a surface</li>
            <li>All points on the paper follow the 2D structure</li>
          </ul>

          <p>
            Similarly, images of faces might exist in a million-dimensional pixel space,
            but the <em>actual</em> faces only vary along perhaps 50 meaningful dimensions:
            age, lighting, expression, pose, identity...
          </p>
        </div>

        <Callout type="insight">
          Neural networks are manifold learners. They discover the hidden low-dimensional
          structure in data and learn to work with it. This is why they can generalize—they
          find the true &quot;shape&quot; of the data.
        </Callout>

        {/* Different Dataset Demo */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Explore: Different Data Shapes</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            This dataset has points spread along a diagonal. Notice how PCA finds
            the diagonal as the first principal component—the direction of maximum spread.
          </p>

          <DimensionalityReducer
            id="diagonal-demo"
            dataset="diagonal"
            interactive={true}
            showProjectionLine={true}
            showProjectedPoints={true}
            showVariance={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Interactive Lab */}
      <section className="bg-[var(--surface-elevated)] rounded-xl p-6 mt-12">
        <h2 className="text-2xl font-bold mb-4">Interactive Lab: The Image Compression Demo</h2>

        <p className="text-[var(--foreground)]/80 mb-6">
          PCA is used in image compression! Each principal component captures a pattern.
          Keep more components → better quality. Keep fewer → smaller file.
        </p>

        <CodePlayground
          language="python"
          title="Image Compression with PCA"
          description="See how keeping fewer principal components compresses an image while preserving structure."
          initialCode={`import numpy as np

# Simulate a simple 8x8 "image" with a pattern
# (In real applications, you'd use actual image data)
np.random.seed(42)

# Create a pattern: gradient + noise
image = np.zeros((8, 8))
for i in range(8):
    for j in range(8):
        # Diagonal gradient pattern
        image[i, j] = (i + j) / 14 + np.random.randn() * 0.1

print("Original 'image' (8x8 = 64 values):")
print(np.round(image, 2))
print()

# Flatten and apply PCA
flat = image.flatten().reshape(1, -1)  # 1 sample, 64 features

# For a single image, we'll show the concept differently
# Let's create multiple "images" (samples) to run PCA properly
n_images = 20
images = np.zeros((n_images, 64))
for k in range(n_images):
    img = np.zeros((8, 8))
    for i in range(8):
        for j in range(8):
            img[i, j] = (i + j) / 14 + np.random.randn() * 0.1
    images[k] = img.flatten()

# Run PCA
mean = images.mean(axis=0)
centered = images - mean
cov = np.cov(centered.T)
eigenvalues, eigenvectors = np.linalg.eig(cov)

# Sort by eigenvalue
idx = eigenvalues.argsort()[::-1]
eigenvalues = eigenvalues[idx].real
eigenvectors = eigenvectors[:, idx].real

# Calculate cumulative variance explained
total_var = eigenvalues.sum()
cumulative_var = np.cumsum(eigenvalues) / total_var * 100

print("Variance explained by top components:")
for i in range(min(10, len(eigenvalues))):
    print(f"  Top {i+1} components: {cumulative_var[i]:.1f}%")

print()
print("Insight: We can represent 64-dimensional images")
print("with far fewer dimensions and still preserve most info!")`}
        />
      </section>

      {/* Key Takeaways */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Key Takeaways</h2>

        <div className="grid gap-4">
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
            <p>
              <strong>High dimensions are deceptive.</strong> Real data rarely fills its
              full dimensional space—it lives on lower-dimensional surfaces (manifolds).
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
            <p>
              <strong>Dimensionality reduction = smart projection.</strong> Like choosing
              the best shadow, we project high-dimensional data onto lower dimensions
              while preserving what matters.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
            <p>
              <strong>PCA finds maximum variance directions.</strong> The principal components
              are the axes along which data varies most—the most informative views.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
            <p>
              <strong>Neural networks learn manifolds.</strong> Deep learning discovers
              the hidden low-dimensional structure in data, which is why it generalizes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Chapter 4 content component
function Chapter4Derivatives() {
  return (
    <div className="space-y-8">
      {/* Section 4.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 4.1: The AI Engineer&apos;s Definition</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Forget &quot;Rate of Change&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            In calculus class, you learned: &quot;The derivative is the rate of change.&quot;
            Technically true, but not intuitive.
          </p>

          <p>
            For AI, think of it this way:
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6 text-center">
            <p className="text-2xl font-bold text-[var(--primary)]">
              Derivative = Sensitivity
            </p>
            <p className="text-lg mt-2 text-[var(--foreground)]/70">
              &quot;If I nudge the input, how loudly does the output scream?&quot;
            </p>
          </div>

          <p>
            A large derivative means the output is <em>very sensitive</em> to changes in input.
            A small derivative means the output barely notices. Zero derivative? The output
            doesn&apos;t care at all—at least not at this exact point.
          </p>
        </div>

        <Callout type="insight">
          In neural networks, we use derivatives to figure out which weights matter most.
          If changing a weight barely affects the output (low derivative), don&apos;t bother
          updating it much. If it has huge impact (high derivative), adjust it carefully!
        </Callout>
      </section>

      {/* Section 4.2 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 4.2: The DJ Mixing Board</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Imagine you&apos;re a DJ at a club. Your mixing board has 100 knobs:
            bass, treble, reverb, delay, volume for each track...
          </p>

          <p>
            The crowd is dancing. You want to make them dance <em>harder</em>.
            Which knob should you turn?
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>High derivative knob:</strong> You nudge it slightly, and the crowd
              goes WILD (or runs away). High sensitivity = high impact.
            </li>
            <li>
              <strong>Low derivative knob:</strong> You spin it all the way, and nobody
              notices. Low sensitivity = low impact.
            </li>
            <li>
              <strong>Zero derivative:</strong> You&apos;re at a peak or valley—turning
              the knob either direction initially does nothing.
            </li>
          </ul>

          <p>
            The derivative tells you: <strong>which knobs matter right now?</strong>
          </p>
        </div>

        {/* Interactive Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: Feel the Sensitivity</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Move the slider to explore different points on the curve. Watch how the
            sensitivity meter changes. At steep parts of the curve, small x changes
            cause big y changes. At flat parts, y barely moves.
          </p>

          <DerivativeSensitivity
            id="sensitivity-explorer"
            interactive={true}
            showTangentLine={true}
            showSensitivityMeter={true}
            showNudgeAnimation={true}
            initialFunction="quadratic"
            className="mx-auto"
          />
        </div>

        <Callout type="aha" title="The Key Insight">
          The tangent line (yellow dashed) shows the derivative visually. Steep tangent =
          high sensitivity. Flat tangent = low sensitivity. The derivative IS the slope
          of this line.
        </Callout>
      </section>

      {/* Section 4.3 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 4.3: Special Functions in AI</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Activation Functions and Their Derivatives
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Neural networks use special functions called <strong>activation functions</strong>.
            Their derivatives have important properties:
          </p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <h4 className="font-bold text-[var(--viz-vector-primary)] mb-2">ReLU: max(0, x)</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                Derivative is 1 for x &gt; 0, and 0 for x &lt; 0.
                Binary sensitivity: either full or nothing!
              </p>
            </div>
            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <h4 className="font-bold text-[var(--viz-vector-secondary)] mb-2">Sigmoid: 1/(1+e⁻ˣ)</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                Derivative is highest at x=0, vanishes at extremes.
                This is the &quot;vanishing gradient problem.&quot;
              </p>
            </div>
          </div>

          <p>
            Try switching between functions in the visualization above. Notice how ReLU
            has a sudden jump in sensitivity at x=0, while sigmoid is smooth but fades
            at the edges.
          </p>
        </div>

        <Callout type="insight">
          The &quot;vanishing gradient problem&quot; happens when derivatives become tiny.
          If sensitivity is near zero, the network can&apos;t learn—it doesn&apos;t know
          which way to adjust. ReLU became popular partly because it avoids this (for x &gt; 0).
        </Callout>

        {/* Code Playground */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Try it: Compute Derivatives</h4>
          <CodePlayground
            language="python"
            title="Derivatives in Python"
            description="See how to compute derivatives numerically and symbolically."
            initialCode={`import numpy as np

# The derivative measures sensitivity
# Let's compute it for different functions

def numerical_derivative(f, x, h=0.0001):
    """Compute derivative numerically: (f(x+h) - f(x)) / h"""
    return (f(x + h) - f(x)) / h

# Define some functions
def quadratic(x):
    return x ** 2

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def relu(x):
    return np.maximum(0, x)

# Test point
x = 2.0

print("At x = 2.0:")
print("-" * 40)

# Quadratic: derivative should be 2x = 4
deriv = numerical_derivative(quadratic, x)
print(f"f(x) = x²")
print(f"  f({x}) = {quadratic(x)}")
print(f"  f'({x}) ≈ {deriv:.4f}  (exact: {2*x})")
print()

# Sigmoid: derivative is s(x) * (1 - s(x))
s = sigmoid(x)
exact_deriv = s * (1 - s)
deriv = numerical_derivative(sigmoid, x)
print(f"f(x) = sigmoid(x)")
print(f"  f({x}) = {s:.4f}")
print(f"  f'({x}) ≈ {deriv:.4f}  (exact: {exact_deriv:.4f})")
print()

# ReLU: derivative is 1 for x > 0
deriv = numerical_derivative(relu, x)
print(f"f(x) = ReLU(x)")
print(f"  f({x}) = {relu(x)}")
print(f"  f'({x}) ≈ {deriv:.4f}  (exact: 1.0)")
print()

# Show how sensitivity varies
print("Sigmoid sensitivity at different points:")
for x in [-3, -1, 0, 1, 3]:
    s = sigmoid(x)
    sensitivity = s * (1 - s)
    print(f"  x={x:+d}: sigmoid={s:.3f}, sensitivity={sensitivity:.4f}")`}
          />
        </div>
      </section>

      {/* Section 4.4 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 4.4: Partial Derivatives—Many Knobs at Once</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          When Functions Have Multiple Inputs
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Real neural networks don&apos;t have just one input—they have millions of weights.
            Each weight is a &quot;knob.&quot; How do we measure sensitivity to each one?
          </p>

          <p>
            <strong>Partial derivatives:</strong> Measure sensitivity to ONE input while
            holding all others fixed. It&apos;s like asking: &quot;If I turn just the bass knob,
            how much does the output change?&quot;
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6">
            <p className="font-mono text-center text-lg">
              f(x, y) = x² + 2xy + y²
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="font-bold">∂f/∂x = 2x + 2y</p>
                <p className="text-sm text-[var(--foreground)]/60">
                  Sensitivity to x (holding y fixed)
                </p>
              </div>
              <div className="text-center">
                <p className="font-bold">∂f/∂y = 2x + 2y</p>
                <p className="text-sm text-[var(--foreground)]/60">
                  Sensitivity to y (holding x fixed)
                </p>
              </div>
            </div>
          </div>

          <p>
            The collection of all partial derivatives is called the <strong>gradient</strong>.
            It&apos;s a vector that points in the direction of steepest increase.
          </p>
        </div>

        <Callout type="insight">
          The gradient is the heart of neural network training. It tells us: &quot;To reduce
          the error, adjust each weight in the opposite direction of its partial derivative.&quot;
          This is gradient descent—the topic of the next chapter!
        </Callout>

        {/* Code Playground for Gradients */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Try it: Computing Gradients</h4>
          <CodePlayground
            language="python"
            title="Partial Derivatives and Gradients"
            description="Compute partial derivatives for a function with multiple inputs."
            initialCode={`import numpy as np

# Function with two inputs
def f(x, y):
    return x**2 + 2*x*y + y**2

# Partial derivatives (numerical)
def partial_x(x, y, h=0.0001):
    """Derivative with respect to x, holding y fixed"""
    return (f(x + h, y) - f(x, y)) / h

def partial_y(x, y, h=0.0001):
    """Derivative with respect to y, holding x fixed"""
    return (f(x, y + h) - f(x, y)) / h

def gradient(x, y):
    """The gradient: vector of all partial derivatives"""
    return np.array([partial_x(x, y), partial_y(x, y)])

# Test at a specific point
x, y = 1.0, 2.0

print(f"f(x, y) = x² + 2xy + y²")
print(f"At point ({x}, {y}):")
print(f"  f({x}, {y}) = {f(x, y)}")
print()
print(f"Partial derivatives:")
print(f"  ∂f/∂x = {partial_x(x, y):.4f}  (exact: 2x + 2y = {2*x + 2*y})")
print(f"  ∂f/∂y = {partial_y(x, y):.4f}  (exact: 2x + 2y = {2*x + 2*y})")
print()

grad = gradient(x, y)
print(f"Gradient vector: [{grad[0]:.2f}, {grad[1]:.2f}]")
print(f"Gradient magnitude: {np.linalg.norm(grad):.2f}")
print()
print("The gradient points in the direction of steepest increase!")
print("To MINIMIZE the function, go in the OPPOSITE direction.")`}
          />
        </div>
      </section>

      {/* Section 4.5 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 4.5: The Jacobian—When Outputs Have Outputs</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Factory Control Room&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The gradient handles functions with <strong>many inputs → one output</strong>.
            But what if your function has <strong>many inputs → many outputs</strong>?
          </p>

          <p>
            Imagine you&apos;re running a factory with multiple control levers:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Lever 1:</strong> Temperature</li>
            <li><strong>Lever 2:</strong> Pressure</li>
          </ul>

          <p>
            And you&apos;re monitoring multiple gauges:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Gauge A:</strong> Product Quality</li>
            <li><strong>Gauge B:</strong> Energy Usage</li>
          </ul>

          <p>
            Now the question is: <em>Which lever affects which gauge, and by how much?</em>
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6 text-center">
            <p className="text-2xl font-bold text-[var(--primary)]">
              Jacobian = The Complete Sensitivity Map
            </p>
            <p className="text-lg mt-2 text-[var(--foreground)]/70">
              A matrix where each entry tells you: &quot;How much does output i change when I nudge input j?&quot;
            </p>
          </div>

          <p>
            The <strong>Jacobian matrix</strong> is a grid of all partial derivatives. For a function
            with 2 inputs (x, y) and 2 outputs (u, v), it looks like:
          </p>

          <div className="bg-[var(--surface)] p-4 rounded-lg font-mono text-center my-4">
            <div className="text-sm text-[var(--foreground)]/60 mb-2">Jacobian J =</div>
            <div className="text-lg">
              [ ∂u/∂x &nbsp;&nbsp; ∂u/∂y ]<br />
              [ ∂v/∂x &nbsp;&nbsp; ∂v/∂y ]
            </div>
          </div>

          <ul className="list-disc list-inside space-y-2 ml-4 text-[var(--foreground)]/80">
            <li>
              <strong>First row:</strong> How does output u respond to changes in x and y?
            </li>
            <li>
              <strong>Second row:</strong> How does output v respond to changes in x and y?
            </li>
            <li>
              <strong>First column:</strong> How do both outputs respond to changes in x alone?
            </li>
            <li>
              <strong>Second column:</strong> How do both outputs respond to changes in y alone?
            </li>
          </ul>
        </div>

        <Callout type="insight">
          In neural networks, each layer transforms many inputs into many outputs. The Jacobian
          captures ALL the sensitivities at once. When we backpropagate, we&apos;re essentially
          multiplying Jacobian matrices together—this is the chain rule for vector functions!
        </Callout>

        {/* Interactive Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: Watch Space Transform</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            The blue circle shows a &quot;neighborhood&quot; around your input point. Watch how different
            transformations warp this circle into an ellipse (or other shape). The Jacobian matrix
            describes exactly HOW the space is being stretched, rotated, or squished at that point.
          </p>

          <JacobianVisualizer
            id="jacobian-explorer"
            interactive={true}
            showJacobianMatrix={true}
            showTransformedCircle={true}
            showGridLines={true}
            initialTransform="scaling"
            className="mx-auto"
          />
        </div>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)] mt-8">
          The Robot Arm Analogy
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Here&apos;s another way to think about it. Imagine a robot arm with two joints:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Joint 1:</strong> Shoulder angle (θ₁)</li>
            <li><strong>Joint 2:</strong> Elbow angle (θ₂)</li>
          </ul>

          <p>
            The hand position is determined by both joints: <code className="text-sm bg-[var(--surface)] px-2 py-1 rounded">(x, y) = f(θ₁, θ₂)</code>
          </p>

          <p>
            The Jacobian answers: <em>&quot;If I rotate the shoulder by 1°, how does the hand move in x and y?
            And if I rotate the elbow by 1°?&quot;</em>
          </p>

          <div className="bg-[var(--surface-elevated)] p-4 rounded-lg my-4">
            <p className="text-sm text-[var(--foreground)]/70 mb-2">The Jacobian tells you:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[var(--surface)] p-3 rounded">
                <p className="font-bold text-[var(--viz-vector-primary)]">∂x/∂θ₁, ∂y/∂θ₁</p>
                <p className="text-sm text-[var(--foreground)]/60">
                  How hand position changes when shoulder rotates
                </p>
              </div>
              <div className="bg-[var(--surface)] p-3 rounded">
                <p className="font-bold text-[var(--viz-vector-secondary)]">∂x/∂θ₂, ∂y/∂θ₂</p>
                <p className="text-sm text-[var(--foreground)]/60">
                  How hand position changes when elbow rotates
                </p>
              </div>
            </div>
          </div>

          <p>
            This is crucial for robotics (inverse kinematics) and, in AI, for understanding
            how a layer of neurons transforms its inputs.
          </p>
        </div>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)] mt-8">
          The Determinant: Area Change
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Remember the determinant from matrices? The <strong>determinant of the Jacobian</strong>
            tells you how much the transformation scales areas (or volumes in higher dimensions):
          </p>

          <div className="grid md:grid-cols-3 gap-4 my-6">
            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-[var(--success)]">|det| &gt; 1</p>
              <p className="text-sm text-[var(--foreground)]/60 mt-2">Area expands</p>
            </div>
            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-[var(--warning)]">|det| &lt; 1</p>
              <p className="text-sm text-[var(--foreground)]/60 mt-2">Area shrinks</p>
            </div>
            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-[var(--error)]">det = 0</p>
              <p className="text-sm text-[var(--foreground)]/60 mt-2">Area collapses!</p>
            </div>
          </div>

          <p>
            When the determinant is zero, the transformation squishes space down to a lower
            dimension—<strong>information is lost</strong>. In neural networks, this is bad!
            It means gradients can&apos;t flow back properly (the vanishing gradient problem again).
          </p>
        </div>

        <Callout type="aha" title="The Big Picture">
          The Jacobian is the &quot;matrix of derivatives&quot; for vector-valued functions. Just as
          the derivative tells you sensitivity for scalar functions, the Jacobian tells you
          the complete sensitivity picture for functions with multiple inputs AND outputs.
          In deep learning, every layer has a Jacobian, and backpropagation multiplies them
          all together using the chain rule.
        </Callout>

        {/* Code Playground for Jacobian */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Try it: Computing the Jacobian</h4>
          <CodePlayground
            language="python"
            title="Jacobian Matrix in Python"
            description="Compute the Jacobian for a vector-valued function."
            initialCode={`import numpy as np

# A function with 2 inputs and 2 outputs
# f(x, y) = [x² + y, xy]
# Output u = x² + y
# Output v = x * y

def f(x, y):
    u = x**2 + y
    v = x * y
    return np.array([u, v])

# Compute Jacobian numerically
def jacobian(func, x, y, h=0.0001):
    """
    Jacobian matrix:
    [ ∂u/∂x  ∂u/∂y ]
    [ ∂v/∂x  ∂v/∂y ]
    """
    f0 = func(x, y)
    fx = func(x + h, y)
    fy = func(x, y + h)

    # Each column: how outputs change w.r.t. that input
    dudx = (fx[0] - f0[0]) / h
    dudy = (fy[0] - f0[0]) / h
    dvdx = (fx[1] - f0[1]) / h
    dvdy = (fy[1] - f0[1]) / h

    return np.array([[dudx, dudy],
                     [dvdx, dvdy]])

# Test at point (2, 3)
x, y = 2.0, 3.0

print(f"Function: f(x, y) = [x² + y, xy]")
print(f"At point ({x}, {y}):")
print(f"  f({x}, {y}) = {f(x, y)}")
print()

J = jacobian(f, x, y)
print("Jacobian matrix:")
print(f"  [ {J[0,0]:.2f}  {J[0,1]:.2f} ]")
print(f"  [ {J[1,0]:.2f}  {J[1,1]:.2f} ]")
print()

# Analytical Jacobian for comparison:
# ∂u/∂x = 2x = 4,  ∂u/∂y = 1
# ∂v/∂x = y = 3,   ∂v/∂y = x = 2
print("Exact Jacobian (analytical):")
print(f"  [ {2*x:.2f}  {1:.2f} ]")
print(f"  [ {y:.2f}  {x:.2f} ]")
print()

# Determinant
det = np.linalg.det(J)
print(f"Determinant: {det:.2f}")
if abs(det) > 1:
    print("  → Areas EXPAND by factor of", abs(det))
elif abs(det) < 1 and abs(det) > 0:
    print("  → Areas SHRINK to", abs(det)*100, "% of original")
else:
    print("  → DANGER: Areas collapse! (det ≈ 0)")

# How to use: predict output change from input change
print("\\n--- Prediction using Jacobian ---")
dx, dy = 0.1, 0.05  # Small changes to inputs
predicted_change = J @ np.array([dx, dy])  # Matrix multiplication
actual_change = f(x + dx, y + dy) - f(x, y)

print(f"If we change x by {dx} and y by {dy}:")
print(f"  Predicted Δ[u,v] ≈ {predicted_change}")
print(f"  Actual Δ[u,v]    = {actual_change}")
print(f"  (Close for small changes!)")`}
          />
        </div>
      </section>

      {/* Interactive Lab */}
      <section className="bg-[var(--surface-elevated)] rounded-xl p-6 mt-12">
        <h2 className="text-2xl font-bold mb-4">Interactive Lab: Exploring Activation Functions</h2>

        <div className="bg-[var(--surface)] rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-2">Challenge: Find the Special Points</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Use the visualization below to explore. For each function, find:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-[var(--foreground)]/80">
            <li>Where is sensitivity highest? (largest |derivative|)</li>
            <li>Where is sensitivity lowest or zero? (smallest |derivative|)</li>
            <li>Where does the derivative change sign? (function switches from increasing to decreasing)</li>
          </ol>
        </div>

        <DerivativeSensitivity
          id="activation-explorer"
          interactive={true}
          showTangentLine={true}
          showSensitivityMeter={true}
          showNudgeAnimation={true}
          initialFunction="sigmoid"
          className="mx-auto"
        />

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-[var(--surface)] p-4 rounded-lg">
            <h4 className="font-medium mb-2">Sigmoid Insights</h4>
            <details className="text-sm">
              <summary className="cursor-pointer text-[var(--primary)] hover:underline">Show answer</summary>
              <ul className="mt-2 space-y-1 text-[var(--foreground)]/70">
                <li>• Max sensitivity: at x = 0 (derivative = 0.25)</li>
                <li>• Min sensitivity: at large |x| (derivative → 0)</li>
                <li>• Never changes sign—always increasing</li>
              </ul>
            </details>
          </div>
          <div className="bg-[var(--surface)] p-4 rounded-lg">
            <h4 className="font-medium mb-2">Quadratic Insights</h4>
            <details className="text-sm">
              <summary className="cursor-pointer text-[var(--primary)] hover:underline">Show answer</summary>
              <ul className="mt-2 space-y-1 text-[var(--foreground)]/70">
                <li>• Max sensitivity: at large |x| (derivative = 2x)</li>
                <li>• Zero sensitivity: at x = 0 (minimum point)</li>
                <li>• Changes sign at x = 0 (decreasing → increasing)</li>
              </ul>
            </details>
          </div>
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Key Takeaways</h2>

        <div className="grid gap-4">
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
            <p>
              <strong>Derivatives measure sensitivity.</strong> How much does the output
              change when you nudge the input? That&apos;s the derivative.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
            <p>
              <strong>High derivative = high impact.</strong> These are the knobs worth
              turning. Low derivative = the output doesn&apos;t care.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
            <p>
              <strong>Zero derivative = special points.</strong> Local minima, maxima,
              or saddle points. The function is flat here—temporarily insensitive.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
            <p>
              <strong>Gradients point uphill.</strong> The gradient is the vector of all
              partial derivatives. To minimize a function, walk opposite to the gradient.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">5</span>
            <p>
              <strong>The Jacobian is the complete sensitivity map.</strong> For functions with
              multiple outputs, the Jacobian matrix captures how every output responds to every
              input. Its determinant tells you if information is being lost (collapsed) or preserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Chapter 5 content component
function Chapter5GradientDescent() {
  return (
    <div className="space-y-8">
      {/* Section 5.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 5.1: Learning as Falling</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Blind Hiker&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Imagine you&apos;re dropped onto a mountain range in <strong>complete darkness</strong>.
            Your goal: find the lowest valley. You can&apos;t see anything. You can&apos;t use GPS.
            All you can do is <em>feel the slope under your feet</em>.
          </p>

          <p>
            What&apos;s your strategy?
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6">
            <p className="text-xl font-bold text-center text-[var(--primary)] mb-2">
              Feel the slope. Step downhill. Repeat.
            </p>
            <p className="text-center text-[var(--foreground)]/70">
              This is gradient descent—the algorithm that trains every neural network.
            </p>
          </div>

          <p>
            The &quot;slope under your feet&quot; is the <strong>gradient</strong> we learned about
            in Chapter 4. It tells you which direction is uphill. To go downhill (reduce error),
            you walk in the <em>opposite</em> direction.
          </p>
        </div>

        <Callout type="insight">
          Every neural network learns by gradient descent. It starts with random weights (dropped
          on a random mountain), then repeatedly adjusts weights to reduce the loss (walks downhill).
          Training is just &quot;falling&quot; through a very high-dimensional landscape.
        </Callout>
      </section>

      {/* Section 5.2 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 5.2: The Loss Landscape</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          What Is the &quot;Mountain&quot;?
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The &quot;mountain&quot; is the <strong>loss landscape</strong>—a surface where:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Each point</strong> represents a specific configuration of weights
            </li>
            <li>
              <strong>The height</strong> at that point is the loss (error) for those weights
            </li>
            <li>
              <strong>Valleys</strong> are weight configurations that work well (low error)
            </li>
            <li>
              <strong>Peaks</strong> are weight configurations that work poorly (high error)
            </li>
          </ul>

          <p>
            For a neural network with millions of weights, this is a landscape in
            millions of dimensions. We can&apos;t visualize it, but the math works the same
            as our 2D example below.
          </p>
        </div>

        {/* Interactive Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: Descend the Mountain</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Watch the hiker descend the loss landscape. The colors show loss values (yellow = high,
            red = low). The green arrow shows the direction of steepest descent. Try different
            landscapes and learning rates to see what can go wrong!
          </p>

          <LossLandscape
            id="gradient-descent-explorer"
            interactive={true}
            showContours={true}
            showGradientArrow={true}
            showPath={true}
            showHiker={true}
            initialLandscape="bowl"
            className="mx-auto"
          />
        </div>

        <Callout type="aha" title="The Core Algorithm">
          <div className="font-mono text-sm bg-[var(--surface)] p-3 rounded-lg mt-2">
            <p>weights = weights - learning_rate × gradient</p>
          </div>
          <p className="mt-2 text-sm">
            That&apos;s it. Subtract a fraction of the gradient from the weights. The gradient points
            uphill, so subtracting it moves you downhill. Repeat until the gradient is near zero
            (you&apos;ve found a valley).
          </p>
        </Callout>
      </section>

      {/* Section 5.3 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 5.3: The Learning Rate—Step Size Matters</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          How Big Should Your Steps Be?
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The <strong>learning rate</strong> controls how far you step with each update.
            It&apos;s one of the most important hyperparameters in machine learning.
          </p>

          <div className="grid md:grid-cols-3 gap-4 my-6">
            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <p className="text-2xl font-bold text-[var(--success)] text-center mb-2">Too Small</p>
              <p className="text-sm text-[var(--foreground)]/70">
                Baby steps. You&apos;ll eventually get there, but training takes forever.
                The hiker inches down the mountain, one tiny step at a time.
              </p>
            </div>
            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <p className="text-2xl font-bold text-[var(--warning)] text-center mb-2">Just Right</p>
              <p className="text-sm text-[var(--foreground)]/70">
                Goldilocks zone. Fast enough to make progress, small enough to not overshoot.
                This is what we tune for in practice.
              </p>
            </div>
            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <p className="text-2xl font-bold text-[var(--error)] text-center mb-2">Too Large</p>
              <p className="text-sm text-[var(--foreground)]/70">
                Giant leaps. You overshoot the valley, bounce up the other side, and the loss
                explodes. Training becomes unstable or diverges entirely.
              </p>
            </div>
          </div>

          <p>
            <strong>Try it above:</strong> Set the learning rate to 0.8+ on the &quot;Elongated Valley&quot;
            landscape and watch the hiker bounce chaotically instead of converging!
          </p>
        </div>

        <Callout type="insight">
          In practice, researchers use learning rate &quot;schedules&quot; that start large (for fast
          initial progress) and decrease over time (for fine-tuning near the minimum). Adam,
          the most popular optimizer, automatically adapts the learning rate per-parameter.
        </Callout>
      </section>

      {/* Section 5.4 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 5.4: Traps in the Landscape</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Why Learning Can Get Stuck
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Real loss landscapes aren&apos;t simple bowls. They&apos;re more like the
            Swiss Alps—full of traps that can fool our blind hiker:
          </p>

          <div className="space-y-4 my-6">
            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <h4 className="font-bold text-[var(--warning)] mb-2">Local Minima</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                A small valley that&apos;s not the deepest point. The gradient is zero, so the hiker
                stops, thinking they&apos;ve found the bottom. Try the &quot;Multiple Minima&quot; landscape
                above—depending on where you start, you&apos;ll find different valleys!
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <h4 className="font-bold text-[var(--error)] mb-2">Saddle Points</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                A point that&apos;s a minimum in one direction but a maximum in another—like a
                mountain pass. The gradient can be very small here, slowing training dramatically.
                Try the &quot;Saddle Point&quot; landscape!
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <h4 className="font-bold text-[var(--viz-vector-secondary)] mb-2">Ravines & Valleys</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                Long, narrow valleys where the gradient points across the valley instead of along it.
                The hiker zig-zags back and forth instead of going straight to the minimum.
                Try the &quot;Elongated Valley&quot; or &quot;Rosenbrock Ravine&quot; landscapes!
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <h4 className="font-bold text-[var(--foreground)]/50 mb-2">Plateaus</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                Flat regions where the gradient is nearly zero. The hiker barely moves, even though
                they haven&apos;t found a minimum. This is related to the vanishing gradient problem.
              </p>
            </div>
          </div>
        </div>

        <Callout type="aha" title="The Good News">
          In very high dimensions (like neural networks with millions of parameters), local minima
          are less of a problem than you might think. Most critical points turn out to be saddle
          points, and there are usually many paths downward. The loss landscape is more like a
          &quot;sponge&quot; than a mountain range.
        </Callout>
      </section>

      {/* Section 5.5 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 5.5: Variants of Gradient Descent</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Smarter Ways to Descend
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Basic gradient descent has limitations. Over the years, researchers have developed
            smarter variants:
          </p>

          <div className="space-y-4 my-6">
            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <h4 className="font-bold text-[var(--primary)] mb-2">Momentum</h4>
              <p className="text-sm text-[var(--foreground)]/70 mb-2">
                <em>Analogy: A ball rolling downhill builds up speed.</em>
              </p>
              <p className="text-sm text-[var(--foreground)]/80">
                Instead of just using the current gradient, we accumulate a &quot;velocity&quot; that
                builds up over time. This helps us power through flat regions and reduces
                zig-zagging in ravines.
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <h4 className="font-bold text-[var(--primary)] mb-2">RMSprop</h4>
              <p className="text-sm text-[var(--foreground)]/70 mb-2">
                <em>Analogy: Different shoes for different terrain.</em>
              </p>
              <p className="text-sm text-[var(--foreground)]/80">
                Adapts the learning rate per-parameter based on recent gradient history.
                Parameters with large gradients get smaller steps; parameters with small
                gradients get larger steps.
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg">
              <h4 className="font-bold text-[var(--primary)] mb-2">Adam (Most Popular)</h4>
              <p className="text-sm text-[var(--foreground)]/70 mb-2">
                <em>Analogy: A smart ball with adjustable shoes.</em>
              </p>
              <p className="text-sm text-[var(--foreground)]/80">
                Combines momentum and RMSprop. Tracks both the average gradient (direction)
                and the average squared gradient (for per-parameter learning rates).
                The default choice for most deep learning today.
              </p>
            </div>
          </div>
        </div>

        {/* Code Playground */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Try it: Gradient Descent in Python</h4>
          <CodePlayground
            language="python"
            title="Implementing Gradient Descent"
            description="See gradient descent find the minimum of a simple function."
            initialCode={`import numpy as np

# A simple loss function: f(x, y) = x² + y²
# Minimum is at (0, 0)

def loss(x, y):
    return x**2 + y**2

def gradient(x, y):
    """Returns [∂f/∂x, ∂f/∂y]"""
    return np.array([2*x, 2*y])

def gradient_descent(start, learning_rate=0.1, steps=20):
    """
    Basic gradient descent algorithm.

    At each step:
    1. Compute gradient (which way is uphill?)
    2. Move opposite to gradient (go downhill)
    3. Repeat until gradient ≈ 0
    """
    pos = np.array(start, dtype=float)
    history = [pos.copy()]

    print(f"Starting at {pos}, loss = {loss(*pos):.4f}")
    print("-" * 50)

    for i in range(steps):
        grad = gradient(*pos)
        pos = pos - learning_rate * grad  # THE KEY LINE!
        history.append(pos.copy())

        if i < 5 or i >= steps - 3:  # Print first and last few steps
            print(f"Step {i+1}: pos = [{pos[0]:.4f}, {pos[1]:.4f}], "
                  f"loss = {loss(*pos):.4f}, |grad| = {np.linalg.norm(grad):.4f}")
        elif i == 5:
            print("...")

    print("-" * 50)
    print(f"Final position: [{pos[0]:.4f}, {pos[1]:.4f}]")
    print(f"Final loss: {loss(*pos):.6f}")

    return history

# Run it!
print("=== Basic Gradient Descent ===\\n")
history = gradient_descent([2.0, 3.0], learning_rate=0.1, steps=20)

# Try different learning rates
print("\\n=== Effect of Learning Rate ===\\n")
for lr in [0.01, 0.1, 0.5, 0.9]:
    pos = np.array([2.0, 3.0])
    for _ in range(20):
        pos = pos - lr * gradient(*pos)
    print(f"lr={lr}: final pos = [{pos[0]:.4f}, {pos[1]:.4f}], loss = {loss(*pos):.6f}")

# What happens with lr > 1?
print("\\n=== Danger: lr too high! ===\\n")
pos = np.array([2.0, 3.0])
print(f"Start: pos = {pos}, loss = {loss(*pos):.4f}")
for i in range(5):
    pos = pos - 1.1 * gradient(*pos)  # lr = 1.1 (too high!)
    print(f"Step {i+1}: pos = [{pos[0]:.2f}, {pos[1]:.2f}], loss = {loss(*pos):.2f}")
print("Loss is EXPLODING! The algorithm diverged.")`}
          />
        </div>
      </section>

      {/* Section 5.6 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 5.6: Stochastic Gradient Descent (SGD)</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Why We Use Random Samples
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            In real neural networks, the loss is computed over millions of training examples.
            Computing the <em>exact</em> gradient would require processing all of them—slow!
          </p>

          <p>
            <strong>Stochastic Gradient Descent (SGD)</strong> estimates the gradient using
            a small random sample (&quot;mini-batch&quot;) of examples:
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6">
            <ol className="list-decimal list-inside space-y-2">
              <li>Randomly sample a mini-batch of 32-256 examples</li>
              <li>Compute the gradient using only these examples</li>
              <li>Update weights as usual</li>
              <li>Repeat with a new random sample</li>
            </ol>
          </div>

          <p>
            The gradient estimate is noisy (each batch gives a slightly different answer),
            but on average it points in the right direction. The noise can actually help
            escape local minima!
          </p>
        </div>

        <Callout type="insight">
          SGD is like our blind hiker asking random nearby hikers &quot;which way is downhill?&quot;
          Each answer is imperfect, but the average points roughly the right way. And the
          random wobble helps you avoid getting stuck in small depressions.
        </Callout>

        {/* Code Playground for SGD */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Try it: SGD vs Full Gradient Descent</h4>
          <CodePlayground
            language="python"
            title="Stochastic Gradient Descent"
            description="Compare exact gradient descent to SGD with mini-batches."
            initialCode={`import numpy as np
np.random.seed(42)

# Generate a simple dataset: y = 2x + 1 + noise
n_samples = 1000
X = np.random.randn(n_samples)
y = 2 * X + 1 + 0.1 * np.random.randn(n_samples)

# Linear model: y_pred = w*x + b
# Loss = mean squared error

def predict(X, w, b):
    return w * X + b

def loss(X, y, w, b):
    return np.mean((predict(X, w, b) - y) ** 2)

def full_gradient(X, y, w, b):
    """Gradient using ALL data points"""
    pred = predict(X, w, b)
    error = pred - y
    dw = 2 * np.mean(error * X)
    db = 2 * np.mean(error)
    return dw, db

def sgd_gradient(X, y, w, b, batch_size=32):
    """Gradient using a random mini-batch"""
    idx = np.random.choice(len(X), batch_size, replace=False)
    X_batch, y_batch = X[idx], y[idx]
    pred = predict(X_batch, w, b)
    error = pred - y_batch
    dw = 2 * np.mean(error * X_batch)
    db = 2 * np.mean(error)
    return dw, db

# Compare full GD vs SGD
print("=== Full Gradient Descent ===")
w, b = 0.0, 0.0
lr = 0.1
for i in range(50):
    dw, db = full_gradient(X, y, w, b)
    w -= lr * dw
    b -= lr * db
    if i < 3 or i >= 47:
        print(f"Step {i+1}: w={w:.4f}, b={b:.4f}, loss={loss(X,y,w,b):.6f}")
    elif i == 3:
        print("...")

print(f"\\nFull GD final: w={w:.4f} (true: 2.0), b={b:.4f} (true: 1.0)")

print("\\n=== Stochastic Gradient Descent ===")
w, b = 0.0, 0.0
lr = 0.1
for i in range(50):
    dw, db = sgd_gradient(X, y, w, b, batch_size=32)
    w -= lr * dw
    b -= lr * db
    if i < 3 or i >= 47:
        print(f"Step {i+1}: w={w:.4f}, b={b:.4f}, loss={loss(X,y,w,b):.6f}")
    elif i == 3:
        print("...")

print(f"\\nSGD final: w={w:.4f} (true: 2.0), b={b:.4f} (true: 1.0)")

print("\\n=== Key Insight ===")
print("Both methods converge to the same answer!")
print("But SGD processed only 32 samples per step (3% of data)")
print("instead of all 1000 - much faster in practice.")`}
          />
        </div>
      </section>

      {/* Interactive Lab */}
      <section className="bg-[var(--surface-elevated)] rounded-xl p-6 mt-12">
        <h2 className="text-2xl font-bold mb-4">Interactive Lab: Try It Out!</h2>

        <p className="text-[var(--foreground)]/70 mb-6">
          Each landscape teaches a different lesson about optimization. Follow these step-by-step
          experiments to see the concepts in action.
        </p>

        <div className="space-y-4 mb-6">
          {/* Experiment 1: Learning Rate Comparison */}
          <details className="bg-[var(--surface)] rounded-lg">
            <summary className="p-4 cursor-pointer font-medium text-[var(--primary)] hover:bg-[var(--viz-grid)]/30 rounded-lg">
              Experiment 1: Learning Rate Spectrum (Elongated Valley)
            </summary>
            <div className="px-4 pb-4 text-sm space-y-2">
              <p className="font-bold text-[var(--foreground)]">Goal: See how learning rate affects convergence</p>
              <p className="text-[var(--foreground)]/70 mb-2">Select <strong>&quot;Elongated Valley&quot;</strong> landscape, then try each learning rate:</p>

              <div className="space-y-3 ml-2">
                <div className="bg-[var(--success)]/10 p-3 rounded-lg border border-[var(--success)]/30">
                  <p className="font-semibold text-[var(--success)]">Rate = 0.001 (Very slow, very stable)</p>
                  <p className="text-[var(--foreground)]/70 text-xs">The hiker takes tiny steps. Smooth descent but painfully slow - watch the loss curve fall gradually with no bouncing at all.</p>
                </div>

                <div className="bg-[var(--primary)]/10 p-3 rounded-lg border border-[var(--primary)]/30">
                  <p className="font-semibold text-[var(--primary)]">Rate = 0.01 (Faster, some wobbling)</p>
                  <p className="text-[var(--foreground)]/70 text-xs">Better speed! You may see slight oscillation across the valley floor. A good practical balance.</p>
                </div>

                <div className="bg-[var(--warning)]/10 p-3 rounded-lg border border-[var(--warning)]/30">
                  <p className="font-semibold text-[var(--warning)]">Rate = 0.1 (Watch it struggle!)</p>
                  <p className="text-[var(--foreground)]/70 text-xs">The hiker bounces back and forth across the narrow valley. Loss chart shows red segments where loss INCREASED. Classic zig-zagging!</p>
                </div>

                <div className="bg-[var(--error)]/10 p-3 rounded-lg border border-[var(--error)]/30">
                  <p className="font-semibold text-[var(--error)]">Rate = 0.5+ (Chaos!)</p>
                  <p className="text-[var(--foreground)]/70 text-xs">Wild oscillations, possibly diverging entirely. The divergence warning may appear as loss explodes!</p>
                </div>
              </div>

              <p className="text-[var(--warning)] mt-3">
                💡 <strong>Key insight:</strong> The elongated valley has steep walls but a gentle slope along the floor.
                The gradient points mostly ACROSS the valley, causing zig-zagging when step size is too large.
              </p>
            </div>
          </details>

          {/* Experiment 2: Local Minima */}
          <details className="bg-[var(--surface)] rounded-lg">
            <summary className="p-4 cursor-pointer font-medium text-[var(--primary)] hover:bg-[var(--viz-grid)]/30 rounded-lg">
              Experiment 2: Getting Trapped (Multiple Minima)
            </summary>
            <div className="px-4 pb-4 text-sm space-y-2">
              <p className="font-bold text-[var(--foreground)]">Goal: Find different valleys from the same start</p>
              <ol className="list-decimal list-inside space-y-1 text-[var(--foreground)]/80 ml-2">
                <li>Select <strong>&quot;Multiple Minima&quot;</strong> landscape</li>
                <li>Set learning rate to <strong>0.1</strong></li>
                <li>Click &quot;Auto-Run&quot; and note which valley the hiker reaches</li>
                <li>Click &quot;Reset&quot; then try learning rate <strong>0.3</strong></li>
                <li>Run again - did the hiker reach the SAME valley?</li>
                <li>Try learning rate <strong>0.5</strong> - where does it end up now?</li>
              </ol>
              <p className="text-[var(--warning)] mt-2">
                💡 <strong>Key insight:</strong> Different learning rates can lead to different solutions!
                In real neural networks, this is why initialization and hyperparameters matter so much.
              </p>
            </div>
          </details>

          {/* Experiment 3: Saddle Point */}
          <details className="bg-[var(--surface)] rounded-lg">
            <summary className="p-4 cursor-pointer font-medium text-[var(--primary)] hover:bg-[var(--viz-grid)]/30 rounded-lg">
              Experiment 3: The Deceptive Flat Spot (Saddle Point)
            </summary>
            <div className="px-4 pb-4 text-sm space-y-2">
              <p className="font-bold text-[var(--foreground)]">Goal: See a point that looks like a minimum but isn&apos;t</p>
              <ol className="list-decimal list-inside space-y-1 text-[var(--foreground)]/80 ml-2">
                <li>Select <strong>&quot;Saddle Point&quot;</strong> landscape</li>
                <li>Set learning rate to <strong>0.1</strong></li>
                <li>Click &quot;Auto-Run&quot;</li>
                <li>Watch the gradient magnitude in the panel below</li>
                <li>Notice: it goes to ZERO at the center but there&apos;s no minimum there!</li>
                <li>The hiker slides down one side and keeps going - it escaped!</li>
              </ol>
              <p className="text-[var(--warning)] mt-2">
                💡 <strong>Key insight:</strong> Zero gradient doesn&apos;t mean minimum! Saddle points
                are very common in high-dimensional neural networks.
              </p>
            </div>
          </details>

          {/* Experiment 4: Perfect vs Chaotic */}
          <details className="bg-[var(--surface)] rounded-lg">
            <summary className="p-4 cursor-pointer font-medium text-[var(--primary)] hover:bg-[var(--viz-grid)]/30 rounded-lg">
              Experiment 4: Perfect Descent vs Chaos (Simple Bowl)
            </summary>
            <div className="px-4 pb-4 text-sm space-y-2">
              <p className="font-bold text-[var(--foreground)]">Goal: Compare stable vs unstable optimization</p>
              <ol className="list-decimal list-inside space-y-1 text-[var(--foreground)]/80 ml-2">
                <li>Select <strong>&quot;Simple Bowl&quot;</strong> landscape</li>
                <li>Set learning rate to <strong>0.1</strong></li>
                <li>Click &quot;Auto-Run&quot; - watch the smooth curve in the loss chart</li>
                <li>Click &quot;Reset&quot;</li>
                <li>Set learning rate to <strong>0.9</strong></li>
                <li>Click &quot;Auto-Run&quot; - the loss still decreases but with bouncing</li>
                <li>Click &quot;Reset&quot; and try <strong>1.0</strong> or higher</li>
                <li>Watch the loss EXPLODE! The divergence warning appears!</li>
              </ol>
              <p className="text-[var(--error)] mt-2">
                💡 <strong>Key insight:</strong> For f(x)=x², learning rate &gt; 1 causes divergence.
                Each step overshoots MORE than the last!
              </p>
            </div>
          </details>

          {/* Experiment 5: Rosenbrock */}
          <details className="bg-[var(--surface)] rounded-lg">
            <summary className="p-4 cursor-pointer font-medium text-[var(--primary)] hover:bg-[var(--viz-grid)]/30 rounded-lg">
              Experiment 5: The Classic Challenge (Rosenbrock Ravine)
            </summary>
            <div className="px-4 pb-4 text-sm space-y-2">
              <p className="font-bold text-[var(--foreground)]">Goal: Navigate the famous &quot;banana function&quot;</p>
              <ol className="list-decimal list-inside space-y-1 text-[var(--foreground)]/80 ml-2">
                <li>Select <strong>&quot;Rosenbrock Ravine&quot;</strong> landscape</li>
                <li>This is a famous test function used to benchmark optimizers!</li>
                <li>Try learning rate <strong>0.001</strong> - very slow but stable</li>
                <li>Try learning rate <strong>0.01</strong> - faster, some wobbling</li>
                <li>Try learning rate <strong>0.1</strong> - watch it struggle!</li>
                <li>The minimum is at (1, 1) - can you get there in under 200 steps?</li>
              </ol>
              <p className="text-[var(--warning)] mt-2">
                💡 <strong>Key insight:</strong> The ravine is easy to enter but hard to navigate.
                This is why advanced optimizers like Adam exist - they adapt the learning rate!
              </p>
            </div>
          </details>
        </div>

        <LossLandscape
          id="landscape-lab"
          interactive={true}
          showContours={true}
          showGradientArrow={true}
          showPath={true}
          showHiker={true}
          initialLandscape="valley"
          className="mx-auto"
        />
      </section>

      {/* Key Takeaways */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Key Takeaways</h2>

        <div className="grid gap-4">
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
            <p>
              <strong>Gradient descent is &quot;blind hiking.&quot;</strong> We can&apos;t see the full
              landscape—we can only feel the local slope (gradient) and step downhill.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
            <p>
              <strong>The update rule is simple:</strong> weights = weights - learning_rate × gradient.
              Subtract a fraction of the gradient to move downhill.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
            <p>
              <strong>Learning rate is critical.</strong> Too small = slow. Too large = unstable
              or divergent. Finding the right value (or schedule) is a key part of training.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
            <p>
              <strong>The landscape has traps.</strong> Local minima, saddle points, and ravines
              can slow or stop learning. Modern optimizers (Adam, momentum) help navigate these.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">5</span>
            <p>
              <strong>SGD uses noisy estimates.</strong> By computing gradients on random
              mini-batches instead of all data, we trade precision for speed—and the noise
              can actually help escape local minima.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Chapter 6: Backpropagation
function Chapter6Backpropagation() {
  return (
    <div className="space-y-8">
      {/* Section 6.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 6.1: The Chain of Blame</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Corporate Blame Game&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Imagine a company where something went wrong. The CEO is furious—profits are down.
            Who&apos;s responsible?
          </p>

          <p>
            The CEO doesn&apos;t fire everyone equally. Instead, <strong>blame flows downward
            through the hierarchy</strong>, with each level passing along responsibility
            proportional to their contribution to the failure.
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6">
            <p className="text-[var(--foreground)]/80 mb-4">
              <strong>The Blame Chain:</strong>
            </p>
            <div className="space-y-3 text-[var(--foreground)]/70">
              <p>🏢 <strong>CEO</strong> (Output): &quot;We got 0.7, but I wanted 1.0! Loss = 0.045&quot;</p>
              <p>↓ passes blame to...</p>
              <p>👔 <strong>Manager</strong> (Hidden layer 2): &quot;I receive 60% of the blame because I had high influence&quot;</p>
              <p>↓ passes blame to...</p>
              <p>👷 <strong>Workers</strong> (Hidden layer 1): &quot;We each get blame × our contribution weight&quot;</p>
              <p>↓ passes blame to...</p>
              <p>📦 <strong>Suppliers</strong> (Inputs): &quot;We adjust our deliveries based on the blame we receive&quot;</p>
            </div>
          </div>

          <p>
            This is <strong>backpropagation</strong>: the algorithm that makes neural networks
            learn by propagating error signals backward through the network, assigning
            &quot;blame&quot; (gradients) to each weight based on how much it contributed to the mistake.
          </p>
        </div>

        <Callout type="insight">
          Backpropagation isn&apos;t magic—it&apos;s just the chain rule from calculus applied
          systematically. Each layer asks: &quot;How much did I contribute to the error?&quot;
          and adjusts accordingly.
        </Callout>
      </section>

      {/* Section 6.2 - Interactive Visualization */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 6.2: Watching Blame Flow</h2>

        <p className="text-lg mb-4">
          This visualization shows a simple neural network learning. Watch how:
        </p>

        <ul className="list-disc list-inside space-y-2 text-lg mb-6 ml-4">
          <li><strong className="text-[var(--success)]">Forward pass</strong> (green): Data flows from inputs through hidden layers to output</li>
          <li><strong className="text-[var(--warning)]">Loss calculation</strong> (yellow): We measure how wrong our prediction was</li>
          <li><strong className="text-[var(--error)]">Backward pass</strong> (red): Gradients (blame) flow backward through the network</li>
          <li><strong className="text-[var(--primary)]">Weight update</strong>: Each weight adjusts proportional to its blame</li>
        </ul>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-6">
          <BackpropFlow id="main-backprop" />
        </div>

        <Callout type="tip">
          Try both view modes! &quot;Corporate Blame&quot; shows the intuition, while
          &quot;Mathematical&quot; shows the actual gradient values. They&apos;re the same thing—just
          different perspectives.
        </Callout>
      </section>

      {/* Section 6.3 - The Chain Rule */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 6.3: The Chain Rule—Why It Works</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The mathematical foundation of backpropagation is the <strong>chain rule</strong>
            from calculus. If you have a composition of functions:
          </p>

          <div className="bg-[var(--surface)] p-4 rounded-lg font-mono text-center my-4">
            y = f(g(h(x)))
          </div>

          <p>
            Then the derivative of y with respect to x is:
          </p>

          <div className="bg-[var(--surface)] p-4 rounded-lg font-mono text-center my-4">
            dy/dx = (df/dg) × (dg/dh) × (dh/dx)
          </div>

          <p>
            Each term in this product represents the &quot;sensitivity&quot; at each stage.
            <strong> The chain rule lets us decompose a complex derivative into a product
            of simpler derivatives.</strong>
          </p>
        </div>

        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-6 my-6">
          <h4 className="font-bold text-[var(--primary)] mb-3">
            The Key Insight: Computation Graphs
          </h4>
          <p className="text-[var(--foreground)]/80">
            A neural network is just a big composition of functions. Each layer is a function
            that takes the previous layer&apos;s output as input. The chain rule tells us
            exactly how to propagate gradients backward through this composition.
          </p>
          <div className="mt-4 font-mono text-sm bg-[var(--surface)] p-3 rounded">
            ∂Loss/∂w₁ = ∂Loss/∂output × ∂output/∂hidden × ∂hidden/∂w₁
          </div>
        </div>

        <Callout type="warning">
          This is why deep networks were hard to train for decades! When you multiply many
          small numbers (gradients), the product becomes tiny (&quot;vanishing gradients&quot;).
          Modern architectures like ResNets use skip connections to help gradients flow.
        </Callout>
      </section>

      {/* Section 6.4 - Step by Step Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 6.4: A Worked Example</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Let&apos;s trace through backpropagation step by step for a single neuron:
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl space-y-4">
            <div className="border-b border-[var(--viz-grid)] pb-4">
              <h4 className="font-bold text-[var(--success)] mb-2">Step 1: Forward Pass</h4>
              <div className="font-mono text-sm space-y-1">
                <p>Input: x = 2</p>
                <p>Weight: w = 0.5</p>
                <p>Bias: b = 0.1</p>
                <p>Output: y = wx + b = 0.5(2) + 0.1 = <strong>1.1</strong></p>
                <p>Target: t = 1.5</p>
                <p>Loss: L = ½(y - t)² = ½(1.1 - 1.5)² = <strong>0.08</strong></p>
              </div>
            </div>

            <div className="border-b border-[var(--viz-grid)] pb-4">
              <h4 className="font-bold text-[var(--error)] mb-2">Step 2: Backward Pass</h4>
              <div className="font-mono text-sm space-y-1">
                <p>∂L/∂y = y - t = 1.1 - 1.5 = <strong>-0.4</strong></p>
                <p>∂L/∂w = ∂L/∂y × ∂y/∂w = -0.4 × x = -0.4 × 2 = <strong>-0.8</strong></p>
                <p>∂L/∂b = ∂L/∂y × ∂y/∂b = -0.4 × 1 = <strong>-0.4</strong></p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[var(--primary)] mb-2">Step 3: Update Weights</h4>
              <div className="font-mono text-sm space-y-1">
                <p>Learning rate: η = 0.1</p>
                <p>w_new = w - η × ∂L/∂w = 0.5 - 0.1(-0.8) = <strong>0.58</strong></p>
                <p>b_new = b - η × ∂L/∂b = 0.1 - 0.1(-0.4) = <strong>0.14</strong></p>
              </div>
            </div>
          </div>

          <p className="mt-4">
            Notice the negative gradient means &quot;increase this weight&quot;—the output was
            too low, so we need bigger weights to push it up toward the target.
          </p>
        </div>
      </section>

      {/* Section 6.5 - Code */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 6.5: Backprop in Code</h2>

        <p className="text-lg mb-4">
          Here&apos;s a minimal implementation of backpropagation for a single layer:
        </p>

        <CodePlayground
          id="backprop-simple"
          initialCode={`import numpy as np

# Simple backpropagation example
x = np.array([2.0, 1.0])  # Input
w = np.array([0.5, 0.3])  # Weights
b = 0.1                    # Bias
target = 1.5               # What we want
lr = 0.1                   # Learning rate

# FORWARD PASS
y = np.dot(w, x) + b
print(f"Forward: y = {y:.3f}")

# LOSS
loss = 0.5 * (y - target)**2
print(f"Loss: {loss:.4f}")

# BACKWARD PASS (chain rule!)
dL_dy = y - target                    # ∂L/∂y
dL_dw = dL_dy * x                     # ∂L/∂w = ∂L/∂y × ∂y/∂w
dL_db = dL_dy * 1                     # ∂L/∂b = ∂L/∂y × 1
print(f"\\nGradients:")
print(f"  ∂L/∂y = {dL_dy:.3f}")
print(f"  ∂L/∂w = {dL_dw}")
print(f"  ∂L/∂b = {dL_db:.3f}")

# UPDATE WEIGHTS
w_new = w - lr * dL_dw
b_new = b - lr * dL_db
print(f"\\nUpdated weights: {w_new}")
print(f"Updated bias: {b_new:.3f}")

# Verify improvement
y_new = np.dot(w_new, x) + b_new
loss_new = 0.5 * (y_new - target)**2
print(f"\\nNew output: {y_new:.3f} (target: {target})")
print(f"New loss: {loss_new:.4f} (was: {loss:.4f})")`}
          language="python"
        />
      </section>

      {/* Section 6.6 - Common Pitfalls */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 6.6: When Backprop Goes Wrong</h2>

        <div className="space-y-6">
          <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-xl p-6">
            <h4 className="font-bold text-[var(--error)] mb-3">
              🌫️ Vanishing Gradients
            </h4>
            <p className="text-[var(--foreground)]/80 mb-3">
              When gradients pass through many layers, they get multiplied together.
              If each layer&apos;s gradient is &lt; 1, the product shrinks exponentially:
            </p>
            <div className="font-mono text-sm bg-[var(--surface)] p-2 rounded mb-3">
              0.5 × 0.5 × 0.5 × 0.5 × 0.5 = 0.03125
            </div>
            <p className="text-[var(--foreground)]/70 text-sm">
              <strong>Solution:</strong> Use ReLU activations (gradient = 1 for positive inputs),
              batch normalization, or skip connections (ResNets).
            </p>
          </div>

          <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-xl p-6">
            <h4 className="font-bold text-[var(--warning)] mb-3">
              💥 Exploding Gradients
            </h4>
            <p className="text-[var(--foreground)]/80 mb-3">
              The opposite problem: if gradients are &gt; 1, they grow exponentially:
            </p>
            <div className="font-mono text-sm bg-[var(--surface)] p-2 rounded mb-3">
              2 × 2 × 2 × 2 × 2 = 32 → weights explode to infinity!
            </div>
            <p className="text-[var(--foreground)]/70 text-sm">
              <strong>Solution:</strong> Gradient clipping (cap the maximum gradient value),
              proper weight initialization, or lower learning rates.
            </p>
          </div>

          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-6">
            <h4 className="font-bold text-[var(--primary)] mb-3">
              🧊 Dead Neurons (ReLU)
            </h4>
            <p className="text-[var(--foreground)]/80 mb-3">
              ReLU outputs 0 for negative inputs. If a neuron&apos;s output is always negative,
              its gradient is always 0—it never learns!
            </p>
            <p className="text-[var(--foreground)]/70 text-sm">
              <strong>Solution:</strong> Use Leaky ReLU (small gradient for negative values)
              or careful initialization to keep neurons in the active region.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6.7 - Key Takeaways */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 6.7: Key Takeaways</h2>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-6 space-y-4">
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
            <p>
              <strong>Backpropagation is the chain rule.</strong> It computes gradients
              by decomposing complex derivatives into products of simpler ones, working
              backward from output to input.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
            <p>
              <strong>Each weight gets blamed proportionally.</strong> The gradient tells
              us exactly how much each weight contributed to the error—and in which direction.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
            <p>
              <strong>Forward pass computes values, backward pass computes gradients.</strong>
              You need the forward pass values (cached) to compute the backward gradients efficiently.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
            <p>
              <strong>Modern frameworks do this automatically.</strong> PyTorch and TensorFlow
              use &quot;autograd&quot; to automatically compute gradients. You define the forward pass,
              and backprop happens for free!
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">5</span>
            <p>
              <strong>Depth creates challenges.</strong> Very deep networks suffer from
              vanishing/exploding gradients. Architectures like ResNets solve this with
              skip connections that let gradients flow directly.
            </p>
          </div>
        </div>

        <Callout type="insight">
          Backpropagation was independently discovered multiple times, but its application
          to neural networks by Rumelhart, Hinton, and Williams in 1986 sparked the modern
          deep learning revolution. It&apos;s arguably the most important algorithm in AI.
        </Callout>
      </section>
    </div>
  );
}

// Chapter 7: Probability as Logic
function Chapter7Probability() {
  return (
    <div className="space-y-8">
      {/* Section 7.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 7.1: The Shape of Belief</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Weather Forecaster&apos;s Honesty&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            When a weather forecaster says &quot;70% chance of rain,&quot; what does that <em>mean</em>?
          </p>

          <p>
            It&apos;s not that 70% of the city will get wet. It&apos;s that the forecaster has looked
            at all the data—humidity, pressure, historical patterns—and concluded: <strong>&quot;In
            situations like this, it rains 7 out of 10 times.&quot;</strong>
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6">
            <p className="text-[var(--foreground)]/80 mb-4">
              <strong>Probability is quantified uncertainty.</strong>
            </p>
            <div className="space-y-3 text-[var(--foreground)]/70">
              <p>📊 <strong>0%</strong> = &quot;I&apos;m certain this won&apos;t happen&quot;</p>
              <p>📊 <strong>50%</strong> = &quot;I have no idea—could go either way&quot;</p>
              <p>📊 <strong>100%</strong> = &quot;I&apos;m certain this will happen&quot;</p>
              <p>📊 <strong>70%</strong> = &quot;I lean toward yes, but I&apos;m not certain&quot;</p>
            </div>
          </div>

          <p>
            In AI, probability distributions don&apos;t just express uncertainty—they <em>are</em>
            the fundamental language of learning. Every prediction a neural network makes is
            secretly a probability distribution over possible answers.
          </p>
        </div>

        <Callout type="insight">
          A probability distribution is literally the <strong>shape of your belief</strong>.
          The tall peaks say &quot;I&apos;m confident it&apos;s around here.&quot; The wide tails say
          &quot;But I&apos;m not ruling out the extremes.&quot;
        </Callout>
      </section>

      {/* Section 7.2 - Interactive Visualization */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 7.2: Exploring Distributions</h2>

        <p className="text-lg mb-4">
          This interactive visualization lets you explore different probability distributions.
          Watch how sampling reveals the underlying shape:
        </p>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-6">
          <DistributionExplorer id="main-distribution" />
        </div>

        <Callout type="tip">
          Try this: Start with the Normal distribution, click &quot;+1 Sample&quot; a few times,
          then &quot;+100&quot;. Watch how the histogram converges to the theoretical curve.
          This is the Law of Large Numbers in action!
        </Callout>
      </section>

      {/* Section 7.3 - The Normal Distribution */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 7.3: The Bell Curve&apos;s Secret</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The normal distribution (the &quot;bell curve&quot;) appears <em>everywhere</em>. Heights,
            test scores, measurement errors, stock returns—why is nature so obsessed with
            this particular shape?
          </p>

          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-6 my-6">
            <h4 className="font-bold text-[var(--primary)] mb-3">
              The Central Limit Theorem
            </h4>
            <p className="text-[var(--foreground)]/80">
              When you <strong>add up many independent random things</strong>, the result is
              approximately normal—regardless of what the individual things look like!
            </p>
            <div className="mt-4 text-sm text-[var(--foreground)]/70">
              <p>Your height = genes + nutrition + sleep + exercise + random factors</p>
              <p>Test score = knowledge + focus + luck + mood + ...</p>
              <p>Measurement = true value + instrument error + observer error + ...</p>
            </div>
          </div>

          <p>
            This is why the normal distribution is the <strong>default assumption</strong> in
            statistics. If you don&apos;t know the shape of your uncertainty, assume it&apos;s normal—
            you&apos;ll often be close.
          </p>
        </div>

        <Callout type="aha">
          The universe doesn&apos;t &quot;prefer&quot; bell curves. It&apos;s that most real-world
          quantities are the sum of many small effects. The math guarantees the result
          will be bell-shaped. Nature is doing addition!
        </Callout>
      </section>

      {/* Section 7.4 - Probability as Area */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 7.4: Probability is Area Under the Curve</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Here&apos;s where many people get confused: the y-axis of a probability distribution
            is <strong>not probability</strong>. It&apos;s <em>probability density</em>.
          </p>

          <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-xl p-6 my-6">
            <h4 className="font-bold text-[var(--warning)] mb-3">
              The Key Insight
            </h4>
            <div className="space-y-2 text-[var(--foreground)]/80">
              <p><strong>Wrong:</strong> &quot;The probability of x = 1.5 is 0.3&quot;</p>
              <p><strong>Right:</strong> &quot;The probability of x being between 1 and 2 is the AREA under the curve from 1 to 2&quot;</p>
            </div>
          </div>

          <p>
            For continuous distributions, the probability of any <em>exact</em> value is zero!
            Think about it: what&apos;s the probability your height is <em>exactly</em> 5.7823847... feet?
            Infinitesimally small. But the probability of being <em>between</em> 5.5 and 6 feet? That&apos;s
            meaningful—and it&apos;s the area under the curve.
          </p>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-lg font-mono text-center my-4">
          P(a ≤ X ≤ b) = ∫ₐᵇ f(x) dx = Area under curve from a to b
        </div>

        <Callout type="tip">
          In the visualization above, use the &quot;Calculate P(a ≤ X ≤ b)&quot; section
          to see this in action. Set a range and watch the shaded area represent
          the probability!
        </Callout>
      </section>

      {/* Section 7.5 - Discrete vs Continuous */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 7.5: Discrete vs Continuous</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Not all probability distributions are smooth curves. Some deal with
            <strong> countable outcomes</strong>:
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div className="bg-[var(--surface-elevated)] p-6 rounded-xl">
              <h4 className="font-bold text-[var(--primary)] mb-3">Discrete</h4>
              <ul className="space-y-2 text-sm text-[var(--foreground)]/80">
                <li>• Coin flips (heads/tails)</li>
                <li>• Dice rolls (1, 2, 3, 4, 5, 6)</li>
                <li>• Word predictions (vocabulary)</li>
                <li>• Classification (cat/dog/bird)</li>
              </ul>
              <p className="mt-3 text-xs text-[var(--foreground)]/50">
                Probability = height of the bar for each outcome
              </p>
            </div>
            <div className="bg-[var(--surface-elevated)] p-6 rounded-xl">
              <h4 className="font-bold text-[var(--primary)] mb-3">Continuous</h4>
              <ul className="space-y-2 text-sm text-[var(--foreground)]/80">
                <li>• Temperature readings</li>
                <li>• Stock prices</li>
                <li>• Neural network weights</li>
                <li>• Image pixel values</li>
              </ul>
              <p className="mt-3 text-xs text-[var(--foreground)]/50">
                Probability = area under the curve for a range
              </p>
            </div>
          </div>

          <p>
            In AI, the most common discrete distribution is the <strong>softmax</strong>:
            it takes any vector of numbers and squashes them into probabilities that sum to 1.
            This is how language models assign probability to each possible next word.
          </p>
        </div>
      </section>

      {/* Section 7.6 - Code */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 7.6: Distributions in Code</h2>

        <p className="text-lg mb-4">
          Let&apos;s see how to work with probability distributions in Python:
        </p>

        <CodePlayground
          id="probability-code"
          initialCode={`import numpy as np

# Sampling from different distributions
np.random.seed(42)

# Normal distribution: mean=0, std=1
normal_samples = np.random.normal(0, 1, size=1000)
print(f"Normal: mean={normal_samples.mean():.3f}, std={normal_samples.std():.3f}")

# Uniform distribution: between 0 and 1
uniform_samples = np.random.uniform(0, 1, size=1000)
print(f"Uniform: mean={uniform_samples.mean():.3f}, std={uniform_samples.std():.3f}")

# Softmax: converting scores to probabilities
def softmax(x):
    exp_x = np.exp(x - np.max(x))  # Subtract max for numerical stability
    return exp_x / exp_x.sum()

# Example: language model scores for next word
word_scores = np.array([2.0, 1.0, 0.5, 0.1])
word_probs = softmax(word_scores)
words = ["the", "a", "cat", "dog"]

print("\\nSoftmax example (next word prediction):")
for word, prob in zip(words, word_probs):
    print(f"  P('{word}') = {prob:.3f}")
print(f"  Sum of probabilities: {word_probs.sum():.3f}")`}
          language="python"
        />
      </section>

      {/* Section 7.7 - Why AI Needs Probability */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 7.7: Why AI Lives in Probability Space</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Every modern AI system fundamentally operates on probability distributions.
            Here&apos;s why:
          </p>

          <div className="space-y-4">
            <div className="bg-[var(--surface-elevated)] p-4 rounded-xl">
              <h4 className="font-bold text-[var(--viz-highlight)] mb-2">
                1. The World is Uncertain
              </h4>
              <p className="text-sm text-[var(--foreground)]/80">
                Sensors are noisy. Data is incomplete. The future is unknown.
                Probability is the <em>only</em> mathematically consistent way to reason
                under uncertainty.
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] p-4 rounded-xl">
              <h4 className="font-bold text-[var(--viz-highlight)] mb-2">
                2. Learning is Inference
              </h4>
              <p className="text-sm text-[var(--foreground)]/80">
                &quot;Given this data, what parameters are most likely?&quot; Training a neural
                network is fundamentally a probability calculation—we&apos;re finding the
                weights that maximize P(correct | data).
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] p-4 rounded-xl">
              <h4 className="font-bold text-[var(--viz-highlight)] mb-2">
                3. Calibrated Confidence
              </h4>
              <p className="text-sm text-[var(--foreground)]/80">
                A good AI doesn&apos;t just give answers—it says how confident it is.
                &quot;90% cat, 10% dog&quot; is more useful than just &quot;cat.&quot; This requires
                probability.
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] p-4 rounded-xl">
              <h4 className="font-bold text-[var(--viz-highlight)] mb-2">
                4. Generative Models
              </h4>
              <p className="text-sm text-[var(--foreground)]/80">
                ChatGPT, DALL-E, Stable Diffusion—all generative models work by learning
                P(data) and then <em>sampling</em> from that distribution. Creativity is
                probabilistic sampling!
              </p>
            </div>
          </div>
        </div>

        <Callout type="insight">
          When ChatGPT generates text, it&apos;s literally sampling from a probability
          distribution over words. Each token is drawn according to P(next word | previous words).
          That&apos;s why you get different responses if you ask the same question twice!
        </Callout>
      </section>

      {/* Section 7.8 - Key Takeaways */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 7.8: Key Takeaways</h2>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-6 space-y-4">
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
            <p>
              <strong>Probability is quantified uncertainty.</strong> It&apos;s not about what
              &quot;will&quot; happen, but about what you should <em>believe</em> given your information.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
            <p>
              <strong>Distributions are shapes of belief.</strong> The height shows where
              you think values are likely; the width shows your uncertainty.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
            <p>
              <strong>The normal distribution emerges from sums.</strong> The Central Limit
              Theorem explains why bell curves are everywhere: most things result from
              adding many small effects.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
            <p>
              <strong>Probability is area, not height.</strong> For continuous distributions,
              probability means &quot;area under the curve&quot; for a range of values.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">5</span>
            <p>
              <strong>AI is fundamentally probabilistic.</strong> From training to inference
              to generation, modern AI systems think in terms of probability distributions.
            </p>
          </div>
        </div>

        <Callout type="insight">
          Understanding probability transforms you from &quot;using AI tools&quot; to
          &quot;understanding how they think.&quot; Every time a model makes a prediction,
          it&apos;s really outputting a probability distribution—and understanding that
          distribution is the key to using AI wisely.
        </Callout>
      </section>
    </div>
  );
}

// Chapter 8: Bayesian Reasoning
function Chapter8Bayes() {
  return (
    <div className="space-y-8">
      {/* Section 8.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 8.1: The Art of Changing Your Mind</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Detective&apos;s Method&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Imagine you&apos;re a detective. Before any evidence, you have a <strong>prior belief</strong>
            about who might be guilty—maybe based on statistics, intuition, or experience.
          </p>

          <p>
            Then evidence comes in: fingerprints, alibis, motives. Each piece of evidence
            <strong> updates your belief</strong>. Some evidence makes a suspect more likely guilty;
            some makes them less likely.
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6">
            <p className="text-[var(--foreground)]/80 mb-4">
              <strong>The Bayesian Detective:</strong>
            </p>
            <div className="space-y-3 text-[var(--foreground)]/70">
              <p>📋 <strong>Prior:</strong> &quot;Based on general patterns, there&apos;s a 5% chance this suspect is guilty&quot;</p>
              <p>🔍 <strong>Evidence:</strong> Fingerprints match at the scene</p>
              <p>🧮 <strong>Update:</strong> How much more likely is guilt given matching fingerprints?</p>
              <p>📊 <strong>Posterior:</strong> &quot;Given the evidence, now 78% likely guilty&quot;</p>
            </div>
          </div>

          <p>
            This is <strong>Bayesian reasoning</strong>: the mathematically correct way to update
            beliefs when new evidence arrives. It&apos;s not about being certain—it&apos;s about being
            <em>rationally uncertain</em>.
          </p>
        </div>

        <Callout type="insight">
          Bayes&apos; theorem isn&apos;t just math—it&apos;s a philosophy of knowledge. Your beliefs should
          always be probabilities, and evidence should move those probabilities up or down
          in a precise, calculable way.
        </Callout>
      </section>

      {/* Section 8.2 - Interactive Visualization */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 8.2: Watching Beliefs Update</h2>

        <p className="text-lg mb-4">
          This visualization shows how evidence transforms prior beliefs into posterior beliefs.
          Try different scenarios and adjust the parameters:
        </p>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-6">
          <BayesUpdater id="main-bayes" />
        </div>

        <Callout type="tip">
          Try the Medical Test scenario with default settings. Notice how even with a
          &quot;95% accurate&quot; test, a positive result only gives ~9% probability of disease!
          This is the famous &quot;base rate fallacy.&quot;
        </Callout>
      </section>

      {/* Section 8.3 - The Formula */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 8.3: The Formula That Rules Rational Thought</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Bayes&apos; theorem looks simple, but it&apos;s one of the most important equations
            in all of science:
          </p>

          <div className="bg-[var(--surface)] p-6 rounded-xl my-6 text-center">
            <p className="text-2xl font-mono mb-4">
              P(H|E) = <span className="text-[var(--success)]">P(E|H)</span> × <span className="text-[var(--viz-vector-secondary)]">P(H)</span> / P(E)
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-left max-w-lg mx-auto">
              <div>
                <span className="text-[var(--primary)] font-bold">P(H|E)</span>
                <p className="text-[var(--foreground)]/70">Posterior: Belief after evidence</p>
              </div>
              <div>
                <span className="text-[var(--viz-vector-secondary)] font-bold">P(H)</span>
                <p className="text-[var(--foreground)]/70">Prior: Belief before evidence</p>
              </div>
              <div>
                <span className="text-[var(--success)] font-bold">P(E|H)</span>
                <p className="text-[var(--foreground)]/70">Likelihood: How expected is this evidence if H is true?</p>
              </div>
              <div>
                <span className="font-bold">P(E)</span>
                <p className="text-[var(--foreground)]/70">Evidence probability: How common is this evidence overall?</p>
              </div>
            </div>
          </div>

          <p>
            The key insight is the <strong>likelihood ratio</strong>: P(E|H) / P(E|¬H).
            This tells you how much more likely the evidence is if your hypothesis is true
            versus false. Strong evidence has a high likelihood ratio.
          </p>
        </div>

        <Callout type="aha">
          Think of it this way: Evidence is &quot;strong&quot; if it would be surprising under one
          hypothesis but expected under another. A wet sidewalk is weak evidence for rain
          (sprinklers exist), but a wet sidewalk during a thunderstorm is stronger evidence.
        </Callout>
      </section>

      {/* Section 8.4 - The Base Rate Fallacy */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 8.4: The Base Rate Fallacy</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Here&apos;s a puzzle that most people get wrong:
          </p>

          <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-xl p-6 my-6">
            <h4 className="font-bold text-[var(--warning)] mb-3">
              The Medical Test Paradox
            </h4>
            <div className="space-y-2 text-[var(--foreground)]/80">
              <p>• A disease affects 1% of the population</p>
              <p>• A test is 95% accurate (95% sensitivity, 90% specificity)</p>
              <p>• You test positive</p>
              <p className="font-bold mt-3">What&apos;s the probability you have the disease?</p>
            </div>
          </div>

          <p>
            Most people say &quot;95%!&quot; or &quot;90%!&quot; But the real answer is only about <strong>9%</strong>.
          </p>

          <p>
            Why? Because the disease is <em>rare</em>. Out of 1000 people:
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-bold text-[var(--error)] mb-2">Have disease (10 people)</p>
                <p>• 9.5 test positive (true positives)</p>
                <p>• 0.5 test negative (false negatives)</p>
              </div>
              <div>
                <p className="font-bold text-[var(--success)] mb-2">Don&apos;t have disease (990 people)</p>
                <p>• 99 test positive (false positives!)</p>
                <p>• 891 test negative (true negatives)</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--viz-grid)]">
              <p className="text-center">
                Total positive tests: 9.5 + 99 = <strong>108.5</strong>
              </p>
              <p className="text-center mt-2">
                Probability of disease given positive test: 9.5 / 108.5 = <strong>~9%</strong>
              </p>
            </div>
          </div>

          <p>
            The <strong>base rate</strong> (1% disease prevalence) dominates! Most positive tests
            are false positives from the large healthy population.
          </p>
        </div>

        <Callout type="warning">
          This is why doctors don&apos;t panic over single positive tests for rare diseases.
          They understand Bayes&apos; theorem—even if they don&apos;t call it that.
        </Callout>
      </section>

      {/* Section 8.5 - Multiple Updates */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 8.5: Stacking Evidence</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The beautiful thing about Bayesian reasoning is that <strong>updates chain together</strong>.
            Today&apos;s posterior becomes tomorrow&apos;s prior:
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl my-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-24 text-sm text-[var(--foreground)]/60">Prior:</span>
                <div className="flex-1 h-4 bg-[var(--viz-grid)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--viz-vector-secondary)]" style={{ width: '10%' }}></div>
                </div>
                <span className="text-sm font-mono">10%</span>
              </div>
              <div className="text-center text-sm text-[var(--foreground)]/50">↓ Evidence 1: Fingerprints</div>
              <div className="flex items-center gap-4">
                <span className="w-24 text-sm text-[var(--foreground)]/60">Update 1:</span>
                <div className="flex-1 h-4 bg-[var(--viz-grid)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--primary)]" style={{ width: '45%' }}></div>
                </div>
                <span className="text-sm font-mono">45%</span>
              </div>
              <div className="text-center text-sm text-[var(--foreground)]/50">↓ Evidence 2: Witness testimony</div>
              <div className="flex items-center gap-4">
                <span className="w-24 text-sm text-[var(--foreground)]/60">Update 2:</span>
                <div className="flex-1 h-4 bg-[var(--viz-grid)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--primary)]" style={{ width: '72%' }}></div>
                </div>
                <span className="text-sm font-mono">72%</span>
              </div>
              <div className="text-center text-sm text-[var(--foreground)]/50">↓ Evidence 3: Alibi falls apart</div>
              <div className="flex items-center gap-4">
                <span className="w-24 text-sm text-[var(--foreground)]/60">Update 3:</span>
                <div className="flex-1 h-4 bg-[var(--viz-grid)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--error)]" style={{ width: '94%' }}></div>
                </div>
                <span className="text-sm font-mono">94%</span>
              </div>
            </div>
          </div>

          <p>
            Each piece of evidence contributes independently. This is exactly how spam filters,
            recommendation systems, and many AI systems work—they accumulate evidence!
          </p>
        </div>
      </section>

      {/* Section 8.6 - Code */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 8.6: Bayes in Code</h2>

        <p className="text-lg mb-4">
          Let&apos;s implement Bayesian updating in Python:
        </p>

        <CodePlayground
          id="bayes-code"
          initialCode={`import numpy as np

def bayes_update(prior, likelihood_if_true, likelihood_if_false):
    """
    Update belief using Bayes' theorem.

    Args:
        prior: P(H) - probability of hypothesis before evidence
        likelihood_if_true: P(E|H) - probability of evidence if hypothesis is true
        likelihood_if_false: P(E|¬H) - probability of evidence if hypothesis is false

    Returns:
        posterior: P(H|E) - probability of hypothesis after evidence
    """
    # P(E) = P(E|H)P(H) + P(E|¬H)P(¬H)
    p_evidence = likelihood_if_true * prior + likelihood_if_false * (1 - prior)

    # P(H|E) = P(E|H)P(H) / P(E)
    posterior = (likelihood_if_true * prior) / p_evidence

    return posterior

# Medical test example
print("=== Medical Test Scenario ===")
prior = 0.01  # 1% have disease
sensitivity = 0.95  # P(positive | disease)
false_positive_rate = 0.10  # P(positive | no disease)

posterior = bayes_update(prior, sensitivity, false_positive_rate)
print(f"Prior (disease prevalence): {prior:.1%}")
print(f"Test sensitivity: {sensitivity:.1%}")
print(f"False positive rate: {false_positive_rate:.1%}")
print(f"P(disease | positive test): {posterior:.1%}")

# Chain multiple pieces of evidence
print("\\n=== Chained Evidence ===")
belief = 0.10  # Start with 10% belief

evidence = [
    ("Fingerprints match", 0.9, 0.01),
    ("Witness testimony", 0.8, 0.3),
    ("No alibi", 0.95, 0.5),
]

for name, p_if_true, p_if_false in evidence:
    belief = bayes_update(belief, p_if_true, p_if_false)
    print(f"After '{name}': {belief:.1%}")`}
          language="python"
        />
      </section>

      {/* Section 8.7 - Bayes in AI */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 8.7: Bayes Everywhere in AI</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Bayesian thinking is the foundation of intelligent reasoning under uncertainty:
          </p>

          <div className="space-y-4">
            <div className="bg-[var(--surface-elevated)] p-4 rounded-xl">
              <h4 className="font-bold text-[var(--viz-highlight)] mb-2">
                🔤 Naive Bayes Classifiers
              </h4>
              <p className="text-sm text-[var(--foreground)]/80">
                Spam filters use Bayes&apos; theorem with word probabilities. &quot;Given the words
                in this email, what&apos;s the probability it&apos;s spam?&quot; Each word updates the belief.
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] p-4 rounded-xl">
              <h4 className="font-bold text-[var(--viz-highlight)] mb-2">
                🤖 Bayesian Neural Networks
              </h4>
              <p className="text-sm text-[var(--foreground)]/80">
                Instead of learning single weight values, learn <em>distributions</em> over
                weights. This gives uncertainty estimates: &quot;I&apos;m 90% confident, ±10%&quot;
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] p-4 rounded-xl">
              <h4 className="font-bold text-[var(--viz-highlight)] mb-2">
                📊 Probabilistic Programming
              </h4>
              <p className="text-sm text-[var(--foreground)]/80">
                Languages like PyMC and Stan let you define models probabilistically,
                then automatically compute posteriors. Science runs on Bayesian inference!
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] p-4 rounded-xl">
              <h4 className="font-bold text-[var(--viz-highlight)] mb-2">
                🎯 Active Learning
              </h4>
              <p className="text-sm text-[var(--foreground)]/80">
                Which data points should we label next? Bayesian reasoning helps identify
                where the model is most uncertain—those are the most valuable to label.
              </p>
            </div>
          </div>
        </div>

        <Callout type="insight">
          Even non-Bayesian methods like deep learning are implicitly Bayesian!
          Cross-entropy loss corresponds to maximum likelihood estimation.
          Regularization corresponds to putting priors on weights.
          The math is Bayes all the way down.
        </Callout>
      </section>

      {/* Section 8.8 - Key Takeaways */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 8.8: Key Takeaways</h2>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-6 space-y-4">
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
            <p>
              <strong>Bayes&apos; theorem is the math of belief update.</strong> It tells you
              exactly how much to change your mind when you see new evidence.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
            <p>
              <strong>Base rates matter enormously.</strong> A rare event with positive evidence
              is often still unlikely. Don&apos;t ignore prior probabilities!
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
            <p>
              <strong>Evidence strength = likelihood ratio.</strong> Strong evidence is evidence
              that would be very likely if true and very unlikely if false.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
            <p>
              <strong>Updates chain together.</strong> Today&apos;s posterior is tomorrow&apos;s prior.
              This is how AI systems accumulate knowledge over time.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">5</span>
            <p>
              <strong>AI is fundamentally Bayesian.</strong> From spam filters to neural networks,
              the reasoning framework is always about updating beliefs with evidence.
            </p>
          </div>
        </div>

        <Callout type="insight">
          The Bayesian perspective changes how you see intelligence itself. An intelligent
          system doesn&apos;t &quot;know&quot; things—it maintains probability distributions over
          possible worlds and updates them rationally as evidence arrives.
          <strong> Learning is belief update. Prediction is inference. Intelligence is Bayes.</strong>
        </Callout>
      </section>
    </div>
  );
}

// Chapter 9: Neurons - The Weighted Voting System
function Chapter9Neurons() {
  return (
    <div className="space-y-8">
      {/* Section 9.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 9.1: The Building Block of Intelligence</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Restaurant Decision&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            <strong>Traditional View:</strong> A neuron is a mathematical function that
            computes a weighted sum of inputs and applies a nonlinear activation.
          </p>

          <p>
            <strong>The Intuitive View:</strong> A neuron is a <em>decision maker</em>.
            It weighs evidence and decides whether to &quot;fire&quot; or stay quiet.
          </p>

          <p>
            Imagine deciding whether to go to a restaurant. You consider several factors:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Price</strong> (expensive = bad, so negative weight)</li>
            <li><strong>Reviews</strong> (good reviews = good, so positive weight)</li>
            <li><strong>Distance</strong> (far away = bad, so negative weight)</li>
          </ul>

          <p>
            Each factor has a different <em>importance</em> (weight). A 5-star review
            matters more than saving a few dollars. You multiply each factor by its
            importance, add them up, and if the total exceeds your hunger threshold
            (bias), you GO!
          </p>
        </div>

        <Callout type="insight">
          A neuron is democracy in miniature. Multiple inputs &quot;vote,&quot; but their votes are
          weighted differently. The bias is like a quorum—you need enough positive votes
          to trigger action.
        </Callout>
      </section>

      {/* Section 9.2 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 9.2: Building Your First Neuron</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Let&apos;s build a neuron from scratch. The formula is beautifully simple:
          </p>

          <div className="bg-[var(--surface-elevated)] p-6 rounded-xl text-center">
            <p className="text-xl font-mono text-[var(--primary)]">
              output = activation(w₁×x₁ + w₂×x₂ + w₃×x₃ + bias)
            </p>
          </div>

          <p>Where:</p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><code className="bg-[var(--surface-elevated)] px-2 py-0.5 rounded">x₁, x₂, x₃</code> = inputs (your features)</li>
            <li><code className="bg-[var(--surface-elevated)] px-2 py-0.5 rounded">w₁, w₂, w₃</code> = weights (importance of each input)</li>
            <li><code className="bg-[var(--surface-elevated)] px-2 py-0.5 rounded">bias</code> = threshold (how &quot;hungry&quot; you need to be)</li>
            <li><code className="bg-[var(--surface-elevated)] px-2 py-0.5 rounded">activation</code> = the &quot;fire or not&quot; decision function</li>
          </ul>
        </div>

        {/* Interactive Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Interactive: The Restaurant Decision Neuron</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Adjust the inputs (Price, Reviews, Distance) and their weights. Watch how the
            neuron computes its decision. Try making the neuron &quot;fire&quot; (output GO!) or
            stay quiet.
          </p>

          <NeuronBuilder
            id="restaurant-neuron"
            interactive={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Section 9.3 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 9.3: The Role of Weights</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Weights Are Importance Scores
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            <strong>Positive weights</strong> mean &quot;this input supports firing.&quot;
            A high positive weight on Reviews means good reviews strongly encourage a &quot;yes.&quot;
          </p>

          <p>
            <strong>Negative weights</strong> mean &quot;this input discourages firing.&quot;
            A negative weight on Price means expensive restaurants get penalized.
          </p>

          <p>
            <strong>Zero weight</strong> means &quot;this input doesn&apos;t matter at all.&quot;
            The neuron ignores it completely.
          </p>

          <p>
            <strong>Large magnitude</strong> means strong influence. A weight of 10 has
            much more impact than a weight of 0.1.
          </p>
        </div>

        <Callout type="aha">
          <strong>The magic of learning:</strong> During training, we don&apos;t manually set
          weights—the network <em>discovers</em> them by trial and error! The backpropagation
          algorithm (Chapter 6) adjusts weights to minimize errors.
        </Callout>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-xl p-4">
            <h4 className="font-bold text-[var(--success)] mb-2">Positive Weight</h4>
            <p className="text-sm">
              More input → More output<br/>
              &quot;Yes, consider this!&quot;
            </p>
          </div>
          <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-xl p-4">
            <h4 className="font-bold text-[var(--error)] mb-2">Negative Weight</h4>
            <p className="text-sm">
              More input → Less output<br/>
              &quot;No, this is a red flag!&quot;
            </p>
          </div>
          <div className="bg-[var(--foreground)]/10 border border-[var(--foreground)]/30 rounded-xl p-4">
            <h4 className="font-bold text-[var(--foreground)]/70 mb-2">Zero Weight</h4>
            <p className="text-sm">
              Input ignored completely<br/>
              &quot;Doesn&apos;t matter to me.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Section 9.4 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 9.4: The Bias (Your Hunger Level)</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The <strong>bias</strong> acts like a threshold. It shifts the decision boundary.
          </p>

          <p>
            Think of it as your &quot;hunger level&quot;:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>High negative bias:</strong> You&apos;re not hungry. It takes a LOT
              of positive evidence to convince you to go out.</li>
            <li><strong>Zero bias:</strong> You&apos;re neutral. The evidence alone decides.</li>
            <li><strong>High positive bias:</strong> You&apos;re starving! Even mediocre
              restaurants seem appealing.</li>
          </ul>
        </div>

        <Callout type="tip">
          Without bias, a neuron with all positive weights would always fire (any positive
          input produces positive output). The bias lets us set a &quot;minimum bar&quot; that
          inputs must collectively exceed.
        </Callout>
      </section>

      {/* Section 9.5 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 9.5: Activation Functions—The Decision Style</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          How Does the Neuron &quot;Decide&quot;?
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            After computing the weighted sum + bias, we need a <strong>decision rule</strong>.
            This is the <em>activation function</em>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <h4 className="font-bold text-[var(--primary)] mb-2">Linear</h4>
              <p className="text-sm mb-2">Output = Input (no change)</p>
              <p className="text-xs text-[var(--foreground)]/60">
                Use case: When you want raw weighted sums, like in regression output layers.
              </p>
            </div>
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <h4 className="font-bold text-[var(--primary)] mb-2">ReLU (Rectified Linear Unit)</h4>
              <p className="text-sm mb-2">If negative → 0, else pass through</p>
              <p className="text-xs text-[var(--foreground)]/60">
                Use case: Hidden layers. Simple, fast, and works surprisingly well!
              </p>
            </div>
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <h4 className="font-bold text-[var(--primary)] mb-2">Sigmoid</h4>
              <p className="text-sm mb-2">Squashes everything to (0, 1)</p>
              <p className="text-xs text-[var(--foreground)]/60">
                Use case: Binary classification output. &quot;What&apos;s the probability this is spam?&quot;
              </p>
            </div>
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <h4 className="font-bold text-[var(--primary)] mb-2">Tanh</h4>
              <p className="text-sm mb-2">Squashes everything to (-1, 1)</p>
              <p className="text-xs text-[var(--foreground)]/60">
                Use case: When you need outputs centered around zero. Common in RNNs.
              </p>
            </div>
          </div>
        </div>

        <Callout type="insight">
          <strong>Why nonlinearity matters:</strong> If every neuron was linear, stacking them
          would just give you another linear function. Nonlinear activations let networks
          learn curves, corners, and complex patterns. They&apos;re the secret to deep learning&apos;s power.
        </Callout>
      </section>

      {/* Section 9.6 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 9.6: The Decision Boundary</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          One Neuron = One Line
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Here&apos;s a profound geometric truth: <strong>a single neuron can only draw a
            straight line</strong> to separate data.
          </p>

          <p>
            The equation <code className="bg-[var(--surface-elevated)] px-2 py-0.5 rounded">w₁x₁ + w₂x₂ + bias = 0</code> is
            the equation of a line! Points on one side get classified as &quot;yes,&quot; points on
            the other side as &quot;no.&quot;
          </p>

          <p>
            This is called a <strong>linear decision boundary</strong>. It&apos;s powerful for
            simple problems but limited for complex ones.
          </p>
        </div>

        {/* Interactive Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Interactive: Drawing the Decision Line</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Adjust the weights and bias to separate the two classes. Can you achieve
            100% accuracy? Notice how the boundary is always a straight line.
          </p>

          <DecisionBoundary
            id="single-neuron-boundary"
            interactive={true}
            className="mx-auto"
          />
        </div>

        <Callout type="warning">
          <strong>The XOR Problem:</strong> Some patterns can&apos;t be separated by a single
          line. For example, XOR (where [0,0]=0, [1,1]=0, [0,1]=1, [1,0]=1) requires
          a non-linear boundary. This limitation drove the invention of <em>multi-layer networks</em>.
        </Callout>
      </section>

      {/* Section 9.7 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 9.7: From One Neuron to Networks</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            A single neuron is limited—it can only draw straight lines. But what if we
            combine many neurons?
          </p>

          <p>
            <strong>Layer 1:</strong> Many neurons, each drawing a different line
          </p>
          <p>
            <strong>Layer 2:</strong> Neurons that combine those lines into regions
          </p>
          <p>
            <strong>Layer N:</strong> Neurons that combine regions into complex shapes
          </p>

          <p>
            This is the <strong>Universal Approximation Theorem</strong>: with enough
            neurons in enough layers, a network can approximate <em>any</em> continuous
            function. Any shape. Any pattern. Any decision boundary.
          </p>
        </div>

        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-6 my-6">
          <h4 className="font-bold text-[var(--primary)] mb-3">The Lego Principle</h4>
          <p className="text-[var(--foreground)]/80">
            Just as you can build any shape from enough Lego bricks, you can approximate
            any function from enough neurons. Each neuron is a simple building block.
            The magic emerges from <em>composition</em>—layers upon layers of simple
            transformations creating complex behavior.
          </p>
        </div>
      </section>

      {/* Section 9.8 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 9.8: Code Lab—Implementing a Neuron</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Let&apos;s implement a neuron from scratch. It&apos;s surprisingly simple—just
            multiply, add, and apply an activation!
          </p>
        </div>

        <CodePlayground
          id="neuron-implementation"
          initialCode={`import numpy as np

def relu(x):
    """ReLU activation: max(0, x)"""
    return np.maximum(0, x)

def sigmoid(x):
    """Sigmoid activation: 1 / (1 + e^-x)"""
    return 1 / (1 + np.exp(-x))

def neuron(inputs, weights, bias, activation='relu'):
    """
    A single neuron computation.

    inputs: array of input values
    weights: array of weights (same length as inputs)
    bias: scalar threshold
    activation: 'relu' or 'sigmoid'
    """
    # Step 1: Weighted sum
    weighted_sum = np.dot(inputs, weights)

    # Step 2: Add bias
    pre_activation = weighted_sum + bias

    # Step 3: Apply activation
    if activation == 'relu':
        output = relu(pre_activation)
    else:
        output = sigmoid(pre_activation)

    return output

# Restaurant decision example
inputs = np.array([3.0, 4.5, 2.0])  # Price, Reviews, Distance
weights = np.array([-2.0, 3.0, -1.0])  # Weights
bias = -5.0  # Threshold (hunger level)

result = neuron(inputs, weights, bias, activation='relu')
print(f"Inputs: {inputs}")
print(f"Weights: {weights}")
print(f"Bias: {bias}")
print(f"Weighted sum: {np.dot(inputs, weights)}")
print(f"Pre-activation: {np.dot(inputs, weights) + bias}")
print(f"Output (ReLU): {result}")
print(f"Decision: {'GO!' if result > 0 else 'Stay home'}")`}
          language="python"
        />
      </section>

      {/* Section 9.9 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 9.9: Key Takeaways</h2>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
              <p>
                <strong>A neuron is a weighted voter.</strong> It takes multiple inputs,
                weighs them by importance, adds a bias threshold, and makes a decision.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
              <p>
                <strong>Weights encode importance.</strong> Positive = supportive,
                negative = discouraging, zero = irrelevant. Large magnitude = strong influence.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
              <p>
                <strong>Bias sets the threshold.</strong> It determines how much positive
                evidence is needed before the neuron &quot;fires.&quot;
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
              <p>
                <strong>Activation functions add nonlinearity.</strong> Without them,
                networks couldn&apos;t learn complex patterns. ReLU is simple but powerful.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">5</span>
              <p>
                <strong>One neuron = one line.</strong> A single neuron creates a linear
                decision boundary. Complex patterns require multiple neurons in multiple layers.
              </p>
            </div>
          </div>
        </div>

        <Callout type="insight">
          The neuron is deceptively simple—just multiply, add, and squash. But this
          simplicity is its power. When you stack billions of these simple units and
          train them with gradient descent, <strong>intelligence emerges</strong>.
          Not from complexity of the individual parts, but from the <em>arrangement</em> and <em>learning</em> of many simple parts working together.
        </Callout>
      </section>
    </div>
  );
}

// Chapter 10: Manifolds - The Crumpled Paper
function Chapter10Manifolds() {
  return (
    <div className="space-y-8">
      {/* Section 10.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 10.1: The Hidden Structure of Data</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Crumpled Paper&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            <strong>Traditional View:</strong> High-dimensional data is just points scattered
            in a vast space.
          </p>

          <p>
            <strong>The Intuitive View:</strong> Real-world data doesn&apos;t fill space randomly.
            It lives on <em>thin surfaces</em> called <strong>manifolds</strong>—like a crumpled
            piece of paper in a large room.
          </p>

          <p>
            Imagine a sheet of paper with drawings on it. Now crumple it into a ball
            and throw it into a gymnasium. The paper exists in that 3D space, but
            the drawings only exist <em>on the paper</em>—a 2D surface embedded in 3D.
          </p>

          <p>
            Most of the gymnasium is empty air. The meaningful information (the drawings)
            lives on a much lower-dimensional surface.
          </p>
        </div>

        <Callout type="insight">
          An image is 1,000,000 pixels = 1,000,000 dimensions. But the space of
          &quot;meaningful images&quot; (faces, cats, landscapes) is a tiny, thin surface
          in that million-dimensional space. Most random pixel combinations are just noise.
        </Callout>
      </section>

      {/* Section 10.2 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 10.2: The Swiss Roll—A Classic Manifold</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The <strong>Swiss Roll</strong> is a famous example in machine learning. Imagine
            a 2D rectangle rolled up like a cinnamon roll in 3D space.
          </p>

          <p>
            The data points live on this rolled surface. In 3D, the structure looks
            complex and tangled. But if you could &quot;unroll&quot; it, you&apos;d see a simple
            2D rectangle with clear patterns.
          </p>
        </div>

        {/* Interactive Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Interactive: Unfolding the Swiss Roll</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Watch data that looks tangled in 3D become simple when &quot;unfolded.&quot;
            Use the slider to see the manifold transform. Colors represent position
            along the true surface.
          </p>

          <ManifoldExplorer
            id="swiss-roll-explorer"
            interactive={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Section 10.3 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 10.3: The Distance Paradox</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Close in Space, Far on the Manifold
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Here&apos;s where manifolds get tricky. Two points can be:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Close in Euclidean distance</strong> (straight-line through space)</li>
            <li><strong>Far in geodesic distance</strong> (along the manifold surface)</li>
          </ul>

          <p>
            Think of two ants on the crumpled paper. If they could fly, they might be
            close. But if they have to walk <em>on the paper</em>, they might need to
            traverse the entire crumpled surface!
          </p>
        </div>

        <Callout type="warning">
          <strong>This is why k-nearest neighbors can fail!</strong> If you use Euclidean
          distance, you might connect points that are &quot;close&quot; but actually far apart
          in terms of meaningful similarity. They&apos;re on opposite sides of a fold.
        </Callout>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-xl p-4">
            <h4 className="font-bold text-[var(--error)] mb-2">Euclidean Distance</h4>
            <p className="text-sm">
              &quot;As the crow flies&quot;<br/>
              Ignores the manifold structure<br/>
              Can connect unrelated points
            </p>
          </div>
          <div className="bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-xl p-4">
            <h4 className="font-bold text-[var(--success)] mb-2">Geodesic Distance</h4>
            <p className="text-sm">
              &quot;Walking on the surface&quot;<br/>
              Respects manifold structure<br/>
              Connects truly similar points
            </p>
          </div>
        </div>
      </section>

      {/* Section 10.4 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 10.4: What Neural Networks Really Do</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Unfolding the Crumpled Paper
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Here&apos;s the profound insight: <strong>neural networks learn to unfold manifolds</strong>.
          </p>

          <p>
            Each layer of a network applies a transformation. Layer by layer, the tangled
            data gets straightened out until the final layer has a simple, clean representation
            where classification is easy.
          </p>

          <p>
            Think of it this way:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Input layer:</strong> Data is crumpled and tangled</li>
            <li><strong>Hidden layers:</strong> Gradually unfold and straighten</li>
            <li><strong>Output layer:</strong> Data is laid out flat, easy to separate</li>
          </ul>
        </div>

        <Callout type="aha">
          This is why <strong>depth matters</strong> in neural networks! Each layer can only
          &quot;stretch&quot; the data a bit. You need many layers to completely unfold a
          highly crumpled manifold. This is the geometric intuition behind &quot;deep&quot; learning.
        </Callout>
      </section>

      {/* Section 10.5 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 10.5: The Universal Approximation Theorem</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Enough Lego Bricks Can Build Anything
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Remember from Chapter 9: a single neuron can only draw a straight line.
            But what happens when we combine many neurons?
          </p>

          <p>
            The <strong>Universal Approximation Theorem</strong> states: A neural network
            with just one hidden layer (but enough neurons) can approximate <em>any</em>
            continuous function to arbitrary precision.
          </p>

          <p>
            It&apos;s like approximating a circle with straight lines:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>3 lines → Triangle (rough)</li>
            <li>8 lines → Octagon (better)</li>
            <li>100 lines → Nearly perfect circle</li>
            <li>∞ lines → Actual circle</li>
          </ul>

          <p>
            Each neuron contributes a &quot;kink&quot; or &quot;bend.&quot; Enough kinks
            can approximate any smooth curve.
          </p>
        </div>

        {/* Interactive Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Interactive: Building Functions from Neurons</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Add more neurons and watch the approximation improve. Each neuron adds
            a piece to the puzzle. With enough pieces, we can match any pattern.
          </p>

          <UniversalApproximator
            id="universal-approx"
            interactive={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Section 10.6 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 10.6: The Manifold Hypothesis</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The <strong>Manifold Hypothesis</strong> is a foundational belief in deep learning:
          </p>

          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-6 my-6">
            <p className="text-lg text-center font-medium text-[var(--primary)]">
              &quot;Real-world high-dimensional data lies on low-dimensional manifolds
              embedded within the high-dimensional space.&quot;
            </p>
          </div>

          <p>
            Why does this matter?
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Curse of dimensionality:</strong> Without manifolds, learning in
              1,000,000 dimensions would be impossible—we&apos;d need infinite data.</li>
            <li><strong>Generalization:</strong> If data lies on a manifold, we only need
              to learn the manifold structure, not fill all of space.</li>
            <li><strong>Meaningful interpolation:</strong> Walking along a manifold produces
              meaningful variations (slightly different faces), not random noise.</li>
          </ul>
        </div>

        <Callout type="insight">
          This is why neural networks can learn from &quot;only&quot; millions of images.
          If images were truly random points in million-dimensional space, no amount
          of data would be enough. But images live on a much smaller manifold, making
          learning tractable.
        </Callout>
      </section>

      {/* Section 10.7 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 10.7: Visualizing High-Dimensional Manifolds</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            We can&apos;t directly see 1000-dimensional space. But we can use techniques
            like <strong>t-SNE</strong> and <strong>UMAP</strong> to project high-dimensional
            data down to 2D while preserving neighborhood relationships.
          </p>

          <p>
            These visualizations reveal:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Clusters:</strong> Groups of similar items huddle together</li>
            <li><strong>Bridges:</strong> Some clusters connect via thin paths</li>
            <li><strong>Voids:</strong> Empty regions represent impossible/meaningless data</li>
          </ul>
        </div>

        {/* Interactive Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Interactive: The MNIST Digit Manifold</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Explore how 784-dimensional digit images cluster in 2D. Hover over points
            to see the actual digit. Notice how similar digits form neighboring clusters.
          </p>

          <MNISTExplorer
            id="mnist-manifold"
            interactive={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Section 10.8 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 10.8: Code Lab—Exploring Manifolds</h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Let&apos;s generate and visualize a simple manifold in Python.
          </p>
        </div>

        <CodePlayground
          id="manifold-code"
          initialCode={`import numpy as np

def generate_swiss_roll(n_samples=500):
    """Generate Swiss Roll data - a 2D manifold in 3D space."""
    # Parameter along the roll
    t = 1.5 * np.pi * (1 + 2 * np.random.rand(n_samples))
    # Height along the roll
    height = 21 * np.random.rand(n_samples)

    # Swiss Roll coordinates
    x = t * np.cos(t)
    y = height
    z = t * np.sin(t)

    return np.column_stack([x, y, z]), t

# Generate data
points, color = generate_swiss_roll(200)

print("Swiss Roll Statistics:")
print(f"Shape: {points.shape}")
print(f"X range: [{points[:,0].min():.1f}, {points[:,0].max():.1f}]")
print(f"Y range: [{points[:,1].min():.1f}, {points[:,1].max():.1f}]")
print(f"Z range: [{points[:,2].min():.1f}, {points[:,2].max():.1f}]")

# The key insight: intrinsic dimensionality
print(f"\\nIntrinsic dimensionality: 2 (t and height)")
print(f"Embedding dimensionality: 3 (x, y, z)")
print(f"\\nThe manifold is a 2D surface living in 3D space!")`}
          language="python"
        />
      </section>

      {/* Section 10.9 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 10.9: Key Takeaways</h2>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
              <p>
                <strong>Data lives on manifolds.</strong> High-dimensional data typically
                occupies thin, curved surfaces, not the entire space.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
              <p>
                <strong>Euclidean distance can lie.</strong> Points close in space may be
                far on the manifold. The true distance is along the surface.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
              <p>
                <strong>Neural networks unfold manifolds.</strong> Layer by layer, they
                straighten tangled data until classification becomes simple.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
              <p>
                <strong>Universal approximation.</strong> With enough neurons, any continuous
                function can be approximated—like building curves from straight lines.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">5</span>
              <p>
                <strong>The manifold hypothesis enables learning.</strong> If data filled
                all dimensions uniformly, learning would be impossible. Manifolds make
                generalization possible.
              </p>
            </div>
          </div>
        </div>

        <Callout type="insight">
          When you look at a neural network&apos;s hidden layers, you&apos;re watching a
          geometric transformation unfold. The network is learning to <strong>straighten
          the crumpled paper</strong>, revealing the simple structure hidden beneath
          the complexity. This geometric view is one of the most beautiful insights
          in all of machine learning.
        </Callout>
      </section>
    </div>
  );
}

// Chapter 11: Generative Models - The Slider Control Room
function Chapter11Generative() {
  return (
    <div className="space-y-8">
      {/* Section 11.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 11.1: The Dream of Creation</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Art Museum&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            So far, we&apos;ve taught neural networks to <em>recognize</em> patterns.
            Show them a cat, and they say &quot;cat.&quot; But what if we wanted the
            opposite? What if we wanted a network that <strong>creates</strong> cats
            that never existed?
          </p>

          <p>
            Imagine an art museum where every painting hangs in a specific location.
            Similar paintings are near each other—all the sunsets in one corner,
            all the portraits in another. Now imagine you could <strong>walk
            through this museum</strong> and see the painting at any position,
            even positions between the actual paintings.
          </p>

          <p>
            At position (0.3, 0.7), you might see a painting that&apos;s 30% sunset
            and 70% portrait—a beautiful hybrid that was never painted by a human.
            <strong> This is generative AI.</strong>
          </p>
        </div>

        <Callout type="insight">
          Generative models don&apos;t memorize images—they learn the <strong>space
          of possible images</strong>. Creativity becomes navigation: walking
          through concept space to visit new combinations.
        </Callout>
      </section>

      {/* Section 11.2 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 11.2: The Encoder-Decoder Dance</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Compression as Understanding
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The key insight: to generate new data, first learn to <strong>compress</strong> existing data.
          </p>

          <p>
            A <strong>Variational Autoencoder (VAE)</strong> works in two stages:
          </p>

          <div className="grid md:grid-cols-2 gap-4 my-4">
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <h4 className="font-bold text-red-400 mb-2">Encoder (Compression)</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                Takes a 784-pixel image and compresses it to just 2 numbers.
                These 2 numbers must capture the <em>essence</em> of the image—
                enough to reconstruct it later.
              </p>
            </div>
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <h4 className="font-bold text-green-400 mb-2">Decoder (Expansion)</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                Takes 2 numbers and expands them back to 784 pixels.
                If the compression was good, the reconstruction looks like the original.
              </p>
            </div>
          </div>

          <p>
            Why is this useful? Because once trained, we can <strong>throw away the
            encoder</strong> and just use the decoder. Feed it any 2 numbers, and
            it generates an image!
          </p>
        </div>

        {/* VAE Pipeline Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: The VAE Pipeline</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Watch how an image gets compressed through a bottleneck, then reconstructed.
            The magic is in the middle—the tiny latent space that captures meaning.
          </p>

          <VAEPipeline
            id="vae-pipeline"
            interactive={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Section 11.3 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 11.3: The Latent Space</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Control Room&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Imagine a control room with <strong>two sliders</strong>.
          </p>

          <p>
            One slider controls &quot;face width.&quot; Push it left for narrow faces,
            right for wide faces. The other slider controls &quot;expression.&quot;
            Push it up for happy, down for sad.
          </p>

          <p>
            Now here&apos;s the magic: the network <strong>discovered these sliders
            itself</strong>. We never told it about face width or expressions.
            We just forced it to compress faces through 2 numbers, and it figured
            out the most useful dimensions to track.
          </p>

          <p>
            This is the <strong>latent space</strong>: a compressed representation
            where each axis corresponds to a meaningful feature.
          </p>
        </div>

        {/* Latent Space Explorer */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: The Control Room</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Drag your position in the 2D latent space and watch the output change.
            Each point generates a unique output. Notice how nearby points produce
            similar outputs—the space is <em>organized by meaning</em>.
          </p>

          <LatentSpaceExplorer
            id="latent-space-explorer"
            interactive={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Section 11.4 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 11.4: Walking Through Concept Space</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Interpolation: The Path Between Ideas
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            One of the most stunning properties of latent space: you can
            <strong> walk between any two points</strong> and see smooth transitions.
          </p>

          <p>
            Consider two faces: one smiling, one frowning. In pixel space, there&apos;s
            no natural path between them—just random noise. But in latent space,
            there&apos;s a straight line connecting them, and every point on that line
            is a valid face!
          </p>

          <p>
            This is called <strong>interpolation</strong>. Set t=0 for the start,
            t=1 for the end, and t=0.5 gives you something perfectly in between.
            The network &quot;imagines&quot; the intermediate states.
          </p>
        </div>

        {/* Interpolation Demo */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: Interpolation</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Watch shapes and digits smoothly morph from one form to another.
            There&apos;s no discontinuity—every point along the path is a valid output.
          </p>

          <InterpolationDemo
            id="interpolation-demo"
            interactive={true}
            className="mx-auto"
          />
        </div>

        <Callout type="math">
          Interpolation is just weighted averaging in latent space:
          <br />
          <code className="text-lg">z_middle = (1-t) × z_start + t × z_end</code>
          <br /><br />
          For t=0.5: z_middle is exactly halfway between the two points.
        </Callout>
      </section>

      {/* Section 11.5 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 11.5: Vector Arithmetic on Concepts</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Famous Equation: King - Man + Woman = Queen
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Perhaps the most mind-bending property of good latent spaces:
            <strong> concepts can be added and subtracted like vectors</strong>.
          </p>

          <p>
            In word embedding spaces (like Word2Vec), researchers discovered:
          </p>

          <div className="bg-[var(--surface-elevated)] rounded-xl p-6 my-4 text-center">
            <code className="text-xl font-bold text-[var(--primary)]">
              vector(&quot;King&quot;) - vector(&quot;Man&quot;) + vector(&quot;Woman&quot;) ≈ vector(&quot;Queen&quot;)
            </code>
          </div>

          <p>
            What does this mean? The vector from &quot;Man&quot; to &quot;King&quot; represents
            some abstract concept—call it &quot;royalty.&quot; Adding this same vector
            to &quot;Woman&quot; gives &quot;Queen&quot;—the female equivalent of royalty.
          </p>

          <p>
            For images, similar arithmetic works:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Smiling woman</strong> - <strong>neutral woman</strong> + <strong>neutral man</strong> = <strong>smiling man</strong></li>
            <li><strong>Face with glasses</strong> - <strong>glasses</strong> = <strong>face without glasses</strong></li>
            <li><strong>Old face</strong> - <strong>young face</strong> + <strong>your face</strong> = <strong>aged you</strong></li>
          </ul>
        </div>

        <Callout type="insight">
          Vector arithmetic works because good latent spaces are <strong>disentangled</strong>—
          each dimension captures an independent feature. &quot;Glasses&quot; isn&apos;t mixed
          with &quot;smile&quot;; they&apos;re separate directions you can add or remove.
        </Callout>
      </section>

      {/* Section 11.6 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 11.6: Why Compression Forces Understanding</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Bottleneck Principle
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Why does forcing data through a tiny bottleneck create meaningful representations?
          </p>

          <p>
            Imagine you need to describe a face to someone using only <strong>2 numbers</strong>.
            You can&apos;t transmit every pixel. You have to choose the most important features.
          </p>

          <p>
            What would you choose? Probably high-level concepts: &quot;how wide is the face?&quot;
            and &quot;is it smiling?&quot; These are more useful than &quot;what color is pixel 342?&quot;
          </p>

          <p>
            <strong>The bottleneck forces abstraction.</strong> With only 2 numbers,
            the network must learn the essence—the most compressed, meaningful representation
            that still allows reconstruction.
          </p>
        </div>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-6 my-6">
          <h4 className="font-bold mb-4 text-[var(--primary)]">The Information Hierarchy</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-4">
              <span className="font-mono bg-[var(--surface)] px-3 py-1 rounded">784 dims</span>
              <span className="flex-1 text-[var(--foreground)]/70">Raw pixels—every tiny detail</span>
            </div>
            <div className="flex justify-center text-[var(--foreground)]/50">↓ compress ↓</div>
            <div className="flex items-center gap-4">
              <span className="font-mono bg-[var(--surface)] px-3 py-1 rounded">128 dims</span>
              <span className="flex-1 text-[var(--foreground)]/70">Edges, textures, local patterns</span>
            </div>
            <div className="flex justify-center text-[var(--foreground)]/50">↓ compress ↓</div>
            <div className="flex items-center gap-4">
              <span className="font-mono bg-[var(--surface)] px-3 py-1 rounded">32 dims</span>
              <span className="flex-1 text-[var(--foreground)]/70">Parts: eyes, nose, mouth shapes</span>
            </div>
            <div className="flex justify-center text-[var(--foreground)]/50">↓ compress ↓</div>
            <div className="flex items-center gap-4">
              <span className="font-mono bg-[var(--primary)] text-white px-3 py-1 rounded font-bold">2 dims</span>
              <span className="flex-1 text-[var(--foreground)]/70">Pure concepts: width, expression</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 11.7 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 11.7: The Variational Trick</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Why &quot;Variational&quot; in VAE?
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            A regular autoencoder maps each image to a <strong>single point</strong> in latent space.
            This creates problems: the space has &quot;holes&quot; where no training images landed,
            and decoding from these holes produces garbage.
          </p>

          <p>
            A <strong>Variational</strong> Autoencoder fixes this by mapping each image
            to a <strong>fuzzy cloud</strong> instead of a point. Each image becomes a
            small Gaussian distribution in latent space.
          </p>

          <p>
            Why does this help? The clouds <strong>overlap</strong>! There are no empty
            holes. Every point in latent space is covered by some training image&apos;s cloud,
            so the decoder always has guidance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <h4 className="font-bold text-red-400 mb-2">Regular Autoencoder</h4>
            <p className="text-sm text-[var(--foreground)]/70 mb-2">
              Images → Points → Holes between points
            </p>
            <div className="text-center text-2xl">📍 · · · 📍 · · · 📍</div>
            <p className="text-xs text-red-400 mt-2 text-center">
              Decoding from &quot;·&quot; produces nonsense
            </p>
          </div>
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <h4 className="font-bold text-green-400 mb-2">Variational Autoencoder</h4>
            <p className="text-sm text-[var(--foreground)]/70 mb-2">
              Images → Overlapping clouds → No holes
            </p>
            <div className="text-center text-2xl">☁️☁️☁️</div>
            <p className="text-xs text-green-400 mt-2 text-center">
              Every point is meaningful
            </p>
          </div>
        </div>

        <Callout type="math">
          Technically, the encoder outputs μ (mean) and σ (standard deviation),
          and we sample: z = μ + σ × ε, where ε ~ N(0,1).
          <br /><br />
          This &quot;reparameterization trick&quot; allows gradients to flow through the sampling.
        </Callout>
      </section>

      {/* Section 11.8 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 11.8: From VAEs to Modern Generative AI</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Evolution of Generative Models
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            VAEs were a breakthrough, but they have limitations—reconstructions are often blurry.
            The field has evolved:
          </p>

          <div className="space-y-4 my-6">
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4 border-l-4 border-blue-500">
              <h4 className="font-bold text-blue-400">GANs (Generative Adversarial Networks)</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                Two networks compete: a generator tries to fool a discriminator.
                Produces sharper images but harder to train. The latent space
                is less interpretable.
              </p>
            </div>
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4 border-l-4 border-purple-500">
              <h4 className="font-bold text-purple-400">Diffusion Models (DALL-E, Stable Diffusion)</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                Learn to gradually denoise images. Start from pure noise,
                iteratively refine toward a target. Currently state-of-the-art
                for image generation.
              </p>
            </div>
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4 border-l-4 border-green-500">
              <h4 className="font-bold text-green-400">Large Language Models (GPT, Claude)</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                Generate text token by token. The &quot;latent space&quot; is implicit
                in the model&apos;s weights. Each layer refines the representation
                of meaning.
              </p>
            </div>
          </div>

          <p>
            The core insight remains the same: <strong>learn a compressed representation
            where nearby points have similar meanings</strong>, then navigate that space
            to generate new content.
          </p>
        </div>
      </section>

      {/* Section 11.9 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 11.9: Key Takeaways</h2>

        <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-xl p-6 my-6">
          <h4 className="font-bold text-[var(--primary)] mb-4 text-lg">
            The Big Ideas of Generative Models
          </h4>
          <div className="space-y-4 text-[var(--foreground)]/80">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
              <p>
                <strong>Compression creates understanding.</strong> Force data through
                a bottleneck, and the network must learn abstract, meaningful features.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
              <p>
                <strong>Latent space is concept space.</strong> Each dimension captures
                a meaningful feature. Similar things are nearby.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
              <p>
                <strong>Generation is navigation.</strong> Walking through latent space
                produces smooth interpolations. Creativity = exploring the space.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
              <p>
                <strong>Vector arithmetic on concepts.</strong> In good latent spaces,
                you can add and subtract features like &quot;smiling&quot; or &quot;glasses.&quot;
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">5</span>
              <p>
                <strong>The variational trick fills holes.</strong> Mapping to distributions
                instead of points ensures the decoder has coverage everywhere.
              </p>
            </div>
          </div>
        </div>

        <Callout type="insight">
          Generative AI isn&apos;t magic—it&apos;s geometry. The network learns a map where
          &quot;cats&quot; live in one region, &quot;dogs&quot; in another, and the space between
          contains creatures that are part cat, part dog. Creativity is just knowing
          where to look.
        </Callout>
      </section>
    </div>
  );
}

// Chapter 12: Attention & Transformers
function Chapter12Attention() {
  return (
    <div className="space-y-8">
      {/* Section 12.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 12.1: The Attention Revolution</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Intuitive Analogy: &quot;The Library Search&quot;
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            In 2017, a paper called <em>&quot;Attention Is All You Need&quot;</em> changed
            everything. It introduced the <strong>Transformer</strong>—the architecture
            behind GPT, BERT, and virtually every modern language model.
          </p>

          <p>
            The key insight? <strong>Attention</strong>—a mechanism that lets each word
            &quot;look at&quot; every other word and decide what&apos;s relevant.
          </p>

          <p>
            Think of it like searching a library. You have a <strong>question</strong> (Query).
            Each book has a <strong>label</strong> (Key) describing its contents. You compare
            your question to all labels, find the relevant books, and read their
            <strong> contents</strong> (Values).
          </p>
        </div>

        <Callout type="insight">
          Before attention, models processed text sequentially—word by word, left to right.
          Attention allows <strong>parallel processing</strong> where every word can
          directly interact with every other word, regardless of distance.
        </Callout>
      </section>

      {/* Section 12.2 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 12.2: Self-Attention in Action</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          How Tokens &quot;Look At&quot; Each Other
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Consider the sentence: <em>&quot;The cat sat on the mat because it was tired.&quot;</em>
          </p>

          <p>
            What does <strong>&quot;it&quot;</strong> refer to? A human instantly knows it&apos;s the cat.
            But how does a neural network figure this out?
          </p>

          <p>
            With self-attention, the token &quot;it&quot; can <strong>look at all other tokens</strong>
            and learn to pay attention to &quot;cat&quot;. The model learns: &quot;When I see &apos;tired&apos;,
            I should connect &apos;it&apos; to the entity that can BE tired—the cat, not the mat.&quot;
          </p>
        </div>

        {/* Attention Visualizer */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: Self-Attention</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            See how each token attends to other tokens. Click on any word to see
            its attention pattern—where it &quot;looks&quot; for context.
          </p>

          <AttentionVisualizer
            id="attention-visualizer"
            interactive={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Section 12.3 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 12.3: Query, Key, Value</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Three Projections
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Each token is transformed into <strong>three different vectors</strong>:
          </p>

          <div className="grid md:grid-cols-3 gap-4 my-4">
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
              <h4 className="font-bold text-pink-400 mb-2">Query (Q)</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                &quot;What am I looking for?&quot;<br />
                The question this token asks of others.
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h4 className="font-bold text-blue-400 mb-2">Key (K)</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                &quot;What do I contain?&quot;<br />
                A label describing this token&apos;s content.
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h4 className="font-bold text-green-400 mb-2">Value (V)</h4>
              <p className="text-sm text-[var(--foreground)]/70">
                &quot;What information to pass?&quot;<br />
                The actual content to be transferred.
              </p>
            </div>
          </div>

          <p>
            The attention score between tokens is the <strong>dot product of Query and Key</strong>.
            High score = &quot;this Key matches my Query well.&quot;
          </p>
        </div>

        {/* Query Key Value Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: The Q-K-V Mechanism</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Step through the attention computation to see how Queries find matching Keys
            and retrieve weighted Values.
          </p>

          <QueryKeyValue
            id="query-key-value"
            interactive={true}
            className="mx-auto"
          />
        </div>

        <Callout type="math">
          The attention formula:
          <br />
          <code className="text-lg">Attention(Q, K, V) = softmax(Q·K / √d) × V</code>
          <br /><br />
          The √d scaling prevents dot products from getting too large in high dimensions.
        </Callout>
      </section>

      {/* Section 12.4 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 12.4: Multi-Head Attention</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Different Heads, Different Patterns
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            One attention mechanism learns one type of relationship. But language has
            <strong> many types of relationships</strong>:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Syntactic:</strong> Subject-verb agreement (&quot;The cats... run&quot;)</li>
            <li><strong>Semantic:</strong> Meaning relationships (&quot;bank&quot; → &quot;money&quot; vs &quot;river&quot;)</li>
            <li><strong>Coreference:</strong> Pronoun resolution (&quot;it&quot; → &quot;cat&quot;)</li>
            <li><strong>Positional:</strong> Nearby words matter for context</li>
          </ul>

          <p>
            <strong>Multi-head attention</strong> runs several attention mechanisms in parallel,
            each learning different patterns. It&apos;s like having multiple librarians, each
            specialized in a different topic.
          </p>
        </div>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-6 my-6">
          <h4 className="font-bold mb-4 text-[var(--primary)]">GPT-3 Example</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-[var(--foreground)]/60">Attention Heads:</span>
              <span className="font-bold text-lg ml-2">96</span>
            </div>
            <div>
              <span className="text-[var(--foreground)]/60">Per Head Dimension:</span>
              <span className="font-bold text-lg ml-2">128</span>
            </div>
            <div>
              <span className="text-[var(--foreground)]/60">Total:</span>
              <span className="font-bold text-lg ml-2">12,288</span>
            </div>
          </div>
          <p className="text-xs text-[var(--foreground)]/60 mt-3">
            96 different &quot;perspectives&quot; on how tokens should attend to each other.
          </p>
        </div>
      </section>

      {/* Section 12.5 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 12.5: The Transformer Architecture</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          Building Blocks of Modern AI
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            A Transformer isn&apos;t just attention—it&apos;s a <strong>carefully designed
            architecture</strong> that stacks multiple components:
          </p>

          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li><strong>Token Embedding:</strong> Convert words to vectors</li>
            <li><strong>Positional Encoding:</strong> Add position information</li>
            <li><strong>Multi-Head Self-Attention:</strong> Tokens communicate</li>
            <li><strong>Add & Normalize:</strong> Residual connections</li>
            <li><strong>Feed-Forward Network:</strong> Process each token</li>
            <li><strong>Add & Normalize:</strong> Another residual</li>
          </ol>

          <p>
            This block is then <strong>stacked many times</strong>. GPT-3 has 96 layers,
            each refining the understanding of the text.
          </p>
        </div>

        {/* Transformer Block Visualization */}
        <div className="my-8">
          <h4 className="text-lg font-medium mb-4">Visualization: Transformer Block</h4>
          <p className="text-[var(--foreground)]/70 mb-4">
            Explore the components of a transformer block. Click on each component
            to learn what it does.
          </p>

          <TransformerBlock
            id="transformer-block"
            interactive={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Section 12.6 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 12.6: Positional Encoding</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          How Transformers Know Word Order
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Here&apos;s a problem: attention treats all positions equally. Without extra
            information, <em>&quot;Dog bites man&quot;</em> and <em>&quot;Man bites dog&quot;</em> would
            look identical!
          </p>

          <p>
            <strong>Positional encoding</strong> solves this by adding unique &quot;timestamps&quot;
            to each position. The original paper used sine and cosine waves:
          </p>

          <div className="bg-[var(--surface-elevated)] rounded-xl p-4 my-4 font-mono text-sm">
            PE(pos, 2i) = sin(pos / 10000^(2i/d))<br />
            PE(pos, 2i+1) = cos(pos / 10000^(2i/d))
          </div>

          <p>
            Why waves? Each position gets a unique pattern, and the model can learn
            to extract <strong>relative positions</strong> from these patterns.
            Position 5 and 7 have a consistent relationship regardless of where
            they appear.
          </p>
        </div>

        <Callout type="insight">
          Modern models (like GPT) often use <strong>learned positional embeddings</strong>
          instead of sinusoidal ones. The model learns the best way to represent
          position from data.
        </Callout>
      </section>

      {/* Section 12.7 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 12.7: Residual Connections</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Secret to Deep Networks
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            The &quot;Add & Normalize&quot; layers are crucial. They implement
            <strong> residual connections</strong>: instead of computing output directly,
            we compute <em>what to add</em> to the input.
          </p>

          <div className="bg-[var(--surface-elevated)] rounded-xl p-6 my-4">
            <div className="flex items-center justify-center gap-4 text-center">
              <div className="p-3 bg-[var(--surface)] rounded-lg">
                <span className="font-mono">x</span>
                <p className="text-xs text-[var(--foreground)]/60">Input</p>
              </div>
              <span className="text-2xl">→</span>
              <div className="p-3 bg-[var(--primary)]/20 rounded-lg">
                <span className="font-mono">f(x)</span>
                <p className="text-xs text-[var(--foreground)]/60">Layer</p>
              </div>
              <span className="text-2xl">→</span>
              <div className="p-3 bg-[var(--surface)] rounded-lg">
                <span className="font-mono font-bold">x + f(x)</span>
                <p className="text-xs text-[var(--foreground)]/60">Output</p>
              </div>
            </div>
          </div>

          <p>
            Why does this help?
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Gradient flow:</strong> Gradients can skip layers via the &quot;+&quot; operation</li>
            <li><strong>Easy learning:</strong> The layer only needs to learn &quot;what to change&quot;</li>
            <li><strong>Default behavior:</strong> If f(x)=0, output equals input (identity)</li>
          </ul>
        </div>
      </section>

      {/* Section 12.8 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 12.8: Why Attention Works So Well</h2>

        <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
          The Advantages Over RNNs
        </h3>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Before transformers, <strong>Recurrent Neural Networks (RNNs)</strong> dominated
            language tasks. But they had fundamental limitations:
          </p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <h4 className="font-bold text-red-400 mb-2">RNNs: Sequential</h4>
              <ul className="text-sm text-[var(--foreground)]/70 space-y-1">
                <li>• Process one word at a time</li>
                <li>• Can&apos;t parallelize training</li>
                <li>• Long-range dependencies are hard</li>
                <li>• Information bottleneck in hidden state</li>
              </ul>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h4 className="font-bold text-green-400 mb-2">Transformers: Parallel</h4>
              <ul className="text-sm text-[var(--foreground)]/70 space-y-1">
                <li>• All words processed simultaneously</li>
                <li>• Massively parallel training</li>
                <li>• Direct connections at any distance</li>
                <li>• Scales to much larger models</li>
              </ul>
            </div>
          </div>

          <p>
            This parallelism is why we can train models with <strong>billions of parameters</strong>.
            GPT-3 would have been impossible with RNNs.
          </p>
        </div>
      </section>

      {/* Section 12.9 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 12.9: Key Takeaways</h2>

        <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-xl p-6 my-6">
          <h4 className="font-bold text-[var(--primary)] mb-4 text-lg">
            The Big Ideas of Attention & Transformers
          </h4>
          <div className="space-y-4 text-[var(--foreground)]/80">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
              <p>
                <strong>Attention enables direct communication.</strong> Any token can
                look at any other token, regardless of distance in the sequence.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
              <p>
                <strong>Query-Key-Value is like a search.</strong> Query asks a question,
                Keys are labels, Values are content. Attention weights decide relevance.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
              <p>
                <strong>Multi-head attention captures different relationships.</strong>
                Syntax, semantics, coreference—each head can specialize.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
              <p>
                <strong>Parallelism enables scale.</strong> Unlike RNNs, transformers
                process all tokens at once, enabling massive models and datasets.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">5</span>
              <p>
                <strong>Residual connections are essential.</strong> They help gradients
                flow and let layers learn &quot;what to add&quot; rather than &quot;what to output.&quot;
              </p>
            </div>
          </div>
        </div>

        <Callout type="insight">
          The transformer architecture is the foundation of modern AI—from language models
          (GPT, Claude) to image generators (DALL-E) to protein folders (AlphaFold).
          Understanding attention is understanding the engine of the AI revolution.
        </Callout>
      </section>
    </div>
  );
}

// Chapter 13: Conclusion - The Big Picture
function Chapter13Conclusion() {
  return (
    <div className="space-y-8">
      {/* Section 13.1 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 13.1: The View From the Summit</h2>

        <p className="text-lg mb-4">
          You&apos;ve climbed a mathematical mountain. From the first steps with vectors to the
          peaks of attention mechanisms, you&apos;ve built something remarkable: an intuitive
          understanding of how intelligence can emerge from mathematics.
        </p>

        <JourneyRecap
          id="journey-recap"
          interactive={true}
          className="mx-auto"
        />

        <Callout type="insight">
          This wasn&apos;t a collection of 12 separate topics. It was one continuous story—the
          story of how we teach machines to find patterns in chaos.
        </Callout>
      </section>

      {/* Section 13.2 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 13.2: The Three Pillars</h2>

        <p className="text-lg mb-4">
          Everything in AI rests on three fundamental ideas. Every chapter you studied
          contributed to one (or more) of these pillars:
        </p>

        <ThreePillars
          id="three-pillars"
          interactive={true}
          className="mx-auto"
        />

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
            <h3 className="font-bold text-indigo-400 mb-2">Representation</h3>
            <p className="text-sm text-[var(--foreground)]/70">
              Turn the messy world into clean geometry. Words become vectors, images become
              points, relationships become distances. Without good representations, learning
              is impossible.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <h3 className="font-bold text-green-400 mb-2">Optimization</h3>
            <p className="text-sm text-[var(--foreground)]/70">
              Find the best settings by following gradients downhill. Every AI system is
              searching for the bottom of some mathematical valley. The terrain is the loss;
              the path is learning.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <h3 className="font-bold text-amber-400 mb-2">Generalization</h3>
            <p className="text-sm text-[var(--foreground)]/70">
              Learn patterns, not examples. The magic isn&apos;t memorizing training data—it&apos;s
              extracting the underlying structure that applies to new situations.
            </p>
          </div>
        </div>

        <Callout type="aha">
          These three pillars aren&apos;t independent—they&apos;re three views of the same phenomenon.
          Good representations make optimization easier. Optimization finds patterns that
          generalize. Generalization validates the representation.
        </Callout>
      </section>

      {/* Section 13.3 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 13.3: The Emergence of Intelligence</h2>

        <p className="text-lg mb-4">
          Here&apos;s the deepest mystery: nothing we&apos;ve built is &quot;intelligent&quot; in itself.
          A neuron is just a weighted sum and a bend. A gradient step is just subtraction.
          Attention is just weighted averaging. So where does intelligence come from?
        </p>

        <EmergenceSimulator
          id="emergence-simulator"
          interactive={true}
          className="mx-auto"
        />

        <p className="text-lg mt-4 mb-4">
          This simulation shows <strong>emergence</strong>: complex behavior arising from
          simple rules. Each agent follows three dumb rules—pick up isolated particles,
          drop them near clusters, wander randomly. Yet clusters form!
        </p>

        <Callout type="insight">
          Intelligence isn&apos;t a single brilliant component. It&apos;s what happens when enough
          simple components interact following simple rules. A single neuron is useless.
          A billion neurons, connected right and trained together? That&apos;s ChatGPT.
        </Callout>
      </section>

      {/* Section 13.4 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 13.4: The Unreasonable Effectiveness</h2>

        <p className="text-lg mb-4">
          Why does this work? Why can mathematics—abstract symbol manipulation—capture
          something as messy and human as language, creativity, and reasoning?
        </p>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-4 text-center">The Deep Conjecture</h3>
          <blockquote className="text-center italic text-[var(--foreground)]/70 border-l-4 border-[var(--primary)] pl-4">
            &quot;Intelligence is the compression of experience into reusable patterns.
            Mathematics is the study of patterns. Therefore, mathematics is the
            natural language of intelligence.&quot;
          </blockquote>
        </div>

        <p className="text-lg mb-4">
          Every concept you learned serves this compression:
        </p>

        <ul className="list-disc list-inside space-y-2 ml-4 text-[var(--foreground)]/80">
          <li><strong>Vectors</strong> compress meaning into coordinates</li>
          <li><strong>Matrices</strong> compress transformations into grids</li>
          <li><strong>Gradients</strong> compress &quot;how to improve&quot; into a direction</li>
          <li><strong>Probability</strong> compresses uncertainty into numbers</li>
          <li><strong>Neural networks</strong> compress patterns into weights</li>
          <li><strong>Attention</strong> compresses relevance into routing</li>
        </ul>

        <Callout type="math">
          The Universal Approximation Theorem isn&apos;t just a technical result—it&apos;s a
          philosophical statement: any pattern that exists can be captured by enough
          simple functions combined. Intelligence is approximation.
        </Callout>
      </section>

      {/* Section 13.5 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 13.5: The Chinese Room, Revisited</h2>

        <p className="text-lg mb-4">
          Philosopher John Searle imagined a person in a room with a book of rules for
          manipulating Chinese symbols. Following the rules, they produce valid responses
          to Chinese questions—without understanding Chinese. Does the system understand?
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[var(--surface-elevated)] rounded-xl p-6">
            <h3 className="font-bold text-red-400 mb-3">The Skeptic Says:</h3>
            <p className="text-sm text-[var(--foreground)]/70">
              GPT is just the Chinese Room at scale. It manipulates symbols (tokens)
              according to learned rules (weights). There&apos;s no understanding—just very
              sophisticated pattern matching. We&apos;ve built a mirror, not a mind.
            </p>
          </div>
          <div className="bg-[var(--surface-elevated)] rounded-xl p-6">
            <h3 className="font-bold text-green-400 mb-3">The Believer Says:</h3>
            <p className="text-sm text-[var(--foreground)]/70">
              Your brain is also &quot;just&quot; neurons following electrochemical rules. If
              enough simple parts, following simple rules, can produce understanding
              in us—why not in silicon? The Room might actually understand.
            </p>
          </div>
        </div>

        <Callout type="warning">
          This isn&apos;t a question with a known answer. The math can&apos;t tell you whether
          GPT &quot;understands.&quot; What it can tell you: whatever GPT does, it emerges from
          the mathematics you now understand.
        </Callout>
      </section>

      {/* Section 13.6 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 13.6: What You Can Now See</h2>

        <p className="text-lg mb-4">
          Before this course, AI was a black box—mysterious, magical, maybe threatening.
          Now you can see inside. When someone says:
        </p>

        <div className="space-y-3 mb-6">
          <div className="bg-[var(--surface-elevated)] rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl">💬</span>
            <div>
              <p className="font-medium">&quot;GPT generates text by predicting the next token&quot;</p>
              <p className="text-sm text-[var(--foreground)]/60">
                You see: attention patterns routing information, softmax producing
                probability distributions, embeddings capturing semantic relationships.
              </p>
            </div>
          </div>
          <div className="bg-[var(--surface-elevated)] rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl">🖼️</span>
            <div>
              <p className="font-medium">&quot;DALL-E generates images from text&quot;</p>
              <p className="text-sm text-[var(--foreground)]/60">
                You see: latent space navigation, decoders transforming points into
                pixels, text embeddings guiding the generation path.
              </p>
            </div>
          </div>
          <div className="bg-[var(--surface-elevated)] rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl">🧬</span>
            <div>
              <p className="font-medium">&quot;AlphaFold predicts protein structures&quot;</p>
              <p className="text-sm text-[var(--foreground)]/60">
                You see: attention mechanisms finding which amino acids should be
                near each other, gradient descent minimizing structural energy.
              </p>
            </div>
          </div>
        </div>

        <Callout type="insight">
          The vocabulary has become yours: embeddings, gradients, loss functions,
          attention weights, latent spaces. You don&apos;t just use AI—you can reason
          about it, debug it, maybe even improve it.
        </Callout>
      </section>

      {/* Section 13.7 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 13.7: The Limits of What We Built</h2>

        <p className="text-lg mb-4">
          Honesty demands acknowledging what we don&apos;t know:
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <h3 className="font-bold text-red-400 mb-2">We don&apos;t know why depth helps</h3>
            <p className="text-sm text-[var(--foreground)]/70">
              Deep networks work better than shallow ones, but the theoretical understanding
              is incomplete. We have intuitions (hierarchical features, manifold untangling)
              but not proofs.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <h3 className="font-bold text-red-400 mb-2">We don&apos;t know what&apos;s inside</h3>
            <p className="text-sm text-[var(--foreground)]/70">
              Interpretability is an open problem. We can visualize attention patterns,
              but understanding what a trained network &quot;knows&quot; remains largely mysterious.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <h3 className="font-bold text-red-400 mb-2">We don&apos;t know the limits</h3>
            <p className="text-sm text-[var(--foreground)]/70">
              Can scaling continue forever? Is there a ceiling to what pattern matching
              can achieve? These are empirical questions we&apos;re still exploring.
            </p>
          </div>
        </div>

        <Callout type="warning">
          The field is moving fast, and some of what you learned may become outdated.
          But the foundations—linear algebra, calculus, probability—are eternal.
          New architectures will still use vectors, still follow gradients, still
          model uncertainty.
        </Callout>
      </section>

      {/* Section 13.8 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 13.8: Where To Go From Here</h2>

        <p className="text-lg mb-4">
          This course gave you the intuition. If you want to go deeper:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <h3 className="font-bold text-[var(--primary)] mb-2">📚 Deeper Theory</h3>
            <ul className="text-sm text-[var(--foreground)]/70 space-y-1">
              <li>• Linear Algebra Done Right (Axler)</li>
              <li>• Deep Learning (Goodfellow et al.)</li>
              <li>• Information Theory (Cover & Thomas)</li>
              <li>• Pattern Recognition (Bishop)</li>
            </ul>
          </div>
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <h3 className="font-bold text-[var(--primary)] mb-2">💻 Hands-On Practice</h3>
            <ul className="text-sm text-[var(--foreground)]/70 space-y-1">
              <li>• Build a neural network from scratch in NumPy</li>
              <li>• Train a small transformer on your own data</li>
              <li>• Fine-tune an open model for a specific task</li>
              <li>• Contribute to an open-source ML project</li>
            </ul>
          </div>
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <h3 className="font-bold text-[var(--primary)] mb-2">🔬 Research Frontiers</h3>
            <ul className="text-sm text-[var(--foreground)]/70 space-y-1">
              <li>• Mechanistic interpretability</li>
              <li>• Efficient training methods</li>
              <li>• Multi-modal learning</li>
              <li>• AI safety and alignment</li>
            </ul>
          </div>
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <h3 className="font-bold text-[var(--primary)] mb-2">🌍 Real Applications</h3>
            <ul className="text-sm text-[var(--foreground)]/70 space-y-1">
              <li>• ML in healthcare, climate, science</li>
              <li>• Building products with AI APIs</li>
              <li>• AI policy and governance</li>
              <li>• Education and democratization</li>
            </ul>
          </div>
        </div>

        <Callout type="tip">
          The best way to learn is to build. Pick a project that excites you and
          try to make it work. You&apos;ll discover gaps in your understanding—and
          filling those gaps is where real learning happens.
        </Callout>
      </section>

      {/* Section 13.9 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section 13.9: The Final Insight</h2>

        <p className="text-lg mb-4">
          Here&apos;s the secret that took me years to understand:
        </p>

        <div className="bg-gradient-to-r from-[var(--primary)]/20 to-purple-500/20 border border-[var(--primary)]/30 rounded-xl p-6 mb-6">
          <blockquote className="text-lg text-center italic">
            &quot;Understanding AI isn&apos;t about memorizing architectures or equations.
            It&apos;s about developing geometric intuition for high-dimensional spaces—
            learning to see shapes where others see numbers.&quot;
          </blockquote>
        </div>

        <p className="text-lg mb-4">
          You&apos;ve developed that intuition. You can now visualize:
        </p>

        <ul className="list-disc list-inside space-y-2 ml-4 text-[var(--foreground)]/80 mb-6">
          <li>Words as arrows in meaning-space, where similarity is closeness</li>
          <li>Learning as rolling downhill in a landscape of error</li>
          <li>Neural networks as manifold untanglers, flattening crumpled paper</li>
          <li>Attention as spotlight beams, routing information dynamically</li>
          <li>Intelligence as emergence from simple parts following simple rules</li>
        </ul>

        <div className="text-center py-8">
          <h3 className="text-2xl font-bold text-[var(--primary)] mb-4">
            Congratulations! 🎉
          </h3>
          <p className="text-lg text-[var(--foreground)]/70 max-w-2xl mx-auto">
            You&apos;ve completed the journey from vectors to transformers.
            The mathematics of AI is no longer a mystery—it&apos;s a toolkit you can
            use, explore, and build upon. Welcome to the frontier.
          </p>
        </div>

        <Callout type="aha">
          The best part? This is just the beginning. The field is young, the
          problems are fascinating, and the impact is enormous. Whatever you
          build next—you now have the mathematical intuition to understand it.
        </Callout>
      </section>
    </div>
  );
}

// Placeholder for other chapters
function ChapterPlaceholder({ title }: { title: string }) {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-[var(--foreground)]/60 mb-8">
        This chapter is coming soon. We&apos;re working hard to bring you the best
        interactive learning experience.
      </p>
      <div className="inline-flex items-center gap-2 text-[var(--primary)]">
        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Building visualization...
      </div>
    </div>
  );
}

export default function ChapterPage() {
  const params = useParams();
  const partId = params.partId as string;
  const chapterId = params.chapterId as string;

  const meta = getChapterMeta(partId, chapterId);
  const { prev, next } = getAdjacentChapters(partId, chapterId);

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chapter not found</p>
      </div>
    );
  }

  // Render chapter content based on slug
  const renderChapterContent = () => {
    switch (chapterId) {
      case 'chapter-1-vectors':
        return <Chapter1Vectors />;
      case 'chapter-2-matrices':
        return <Chapter2Matrices />;
      case 'chapter-3-dimensionality':
        return <Chapter3Dimensionality />;
      case 'chapter-4-derivatives':
        return <Chapter4Derivatives />;
      case 'chapter-5-gradient-descent':
        return <Chapter5GradientDescent />;
      case 'chapter-6-backpropagation':
        return <Chapter6Backpropagation />;
      case 'chapter-7-probability':
        return <Chapter7Probability />;
      case 'chapter-8-bayes':
        return <Chapter8Bayes />;
      case 'chapter-9-neurons':
        return <Chapter9Neurons />;
      case 'chapter-10-manifolds':
        return <Chapter10Manifolds />;
      case 'chapter-11-generative':
        return <Chapter11Generative />;
      case 'chapter-12-attention':
        return <Chapter12Attention />;
      case 'chapter-13-conclusion':
        return <Chapter13Conclusion />;
      default:
        return <ChapterPlaceholder title={meta.title} />;
    }
  };

  return (
    <ChapterLayout
      meta={meta}
      prevChapter={prev ? { ...prev, partSlug: `part-${prev.part}` } : null}
      nextChapter={next ? { ...next, partSlug: `part-${next.part}` } : null}
    >
      {renderChapterContent()}
    </ChapterLayout>
  );
}
