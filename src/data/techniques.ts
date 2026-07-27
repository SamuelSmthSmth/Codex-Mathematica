// ─────────────────────────────────────────────────────────────────────────────
// src/data/techniques.ts
// Stub data for the Technique Library.
// Real articles and more rows will be populated in Phase 3.
// ─────────────────────────────────────────────────────────────────────────────

export interface MicroProblem {
  question_latex: string;
  answer_latex: string;
}

export interface Technique {
  id: string;
  name: string;
  /** Tagline shown on the carousel card. */
  tagline: string;
  /** Short body text shown in the article view (Markdown). */
  body_md: string;
  /** Category tag, e.g. "Integration", "Limits" */
  category: string;
  micro_problem?: MicroProblem;
}

export interface TechniqueRow {
  id: string;
  /** Row heading shown in the Library, e.g. "The Dark Arts of Integration" */
  title: string;
  techniques: Technique[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Stub technique data
// ─────────────────────────────────────────────────────────────────────────────

export const TECHNIQUE_ROWS: TechniqueRow[] = [
  {
    id: "dark-arts",
    title: "The Dark Arts of Integration",
    techniques: [
      {
        id: "kings-property",
        name: "King's Property",
        tagline: "Flip the limits, keep the integrand.",
        category: "Integration",
        body_md: `## King's Property

The **King's Property** is one of the most elegant tricks in definite integration. It states:

$$\\int_a^b f(x)\\, dx = \\int_a^b f(a+b-x)\\, dx$$

This works because the substitution $u = a + b - x$ maps the interval $[a,b]$ back onto itself (just reversed), and the Jacobian $|du/dx| = 1$.

### Why it's powerful

Adding the original integral to its "king's flip" often causes messy terms to cancel — leaving a trivial integrand.

### Classic example

$$\\int_0^\\pi \\frac{x \\sin x}{1 + \\cos^2 x}\\,dx$$

Let $I$ denote this integral. Applying King's Property with $a=0, b=\\pi$:

$$I = \\int_0^\\pi \\frac{(\\pi - x)\\sin x}{1 + \\cos^2 x}\\,dx$$

Adding both expressions for $I$:

$$2I = \\pi \\int_0^\\pi \\frac{\\sin x}{1 + \\cos^2 x}\\,dx = \\pi \\cdot \\pi = \\pi^2$$

Therefore $I = \\dfrac{\\pi^2}{2}$.`,
        micro_problem: {
          question_latex: "Using King's Property, evaluate $\\displaystyle\\int_0^{\\pi/2} \\frac{\\sin x}{\\sin x + \\cos x}\\,dx$.",
          answer_latex: "\\dfrac{\\pi}{4}",
        },
      },
      {
        id: "feynman-trick",
        name: "Feynman's Trick",
        tagline: "Differentiate under the integral sign.",
        category: "Integration",
        body_md: `## Feynman's Trick (Differentiation Under the Integral Sign)

Attributed to Richard Feynman, this technique introduces a **parameter** $t$ into an integral to make it easier to handle.

$$I(t) = \\int_a^b f(x, t)\\, dx$$

Differentiating with respect to $t$:

$$I'(t) = \\int_a^b \\frac{\\partial f}{\\partial t}(x, t)\\, dx$$

Often $I'(t)$ is much simpler. You then integrate $I'(t)$ to recover $I(t)$ and use an initial condition (e.g., $I(0)$ or $I(\\infty)$) to pin down the constant.

### Example

To evaluate $\\displaystyle\\int_0^\\infty \\frac{\\sin x}{x}\\,dx$, introduce $I(t) = \\int_0^\\infty \\frac{\\sin x}{x} e^{-tx}\\,dx$.

Then $I'(t) = -\\int_0^\\infty e^{-tx}\\sin x\\,dx = -\\dfrac{1}{1+t^2}$, giving $I(t) = -\\arctan t + C$.

Since $I(\\infty) = 0$, we get $C = \\pi/2$, and $I(0) = \\pi/2$.`,
        micro_problem: {
          question_latex: "Define $I(t) = \\int_0^1 \\frac{x^t - 1}{\\ln x}\\,dx$. Find $I'(t)$ by differentiating under the integral sign.",
          answer_latex: "I'(t) = \\dfrac{1}{t+1}",
        },
      },
      {
        id: "weierstrass",
        name: "Weierstrass Substitution",
        tagline: "Turn trig integrals into rational ones.",
        category: "Integration",
        body_md: `## Weierstrass Substitution

The substitution $t = \\tan(x/2)$ converts any rational function of $\\sin x$ and $\\cos x$ into a rational function of $t$:

$$\\sin x = \\frac{2t}{1+t^2}, \\quad \\cos x = \\frac{1-t^2}{1+t^2}, \\quad dx = \\frac{2\\,dt}{1+t^2}$$

This is a guaranteed last resort for trigonometric integrals.

### Caution

The substitution introduces a discontinuity at $x = \\pi$, so care is needed with definite integrals that cross this point.`,
        micro_problem: {
          question_latex: "Use the Weierstrass substitution to evaluate $\\displaystyle\\int_0^{\\pi/2} \\frac{dx}{2 + \\cos x}$.",
          answer_latex: "\\dfrac{\\pi}{3\\sqrt{3}} \\cdot 2 = \\dfrac{2\\pi}{3\\sqrt{3}}",
        },
      },
    ],
  },
  {
    id: "elegant-limits",
    title: "Elegant Limits You Should Know",
    techniques: [
      {
        id: "squeeze-theorem",
        name: "The Squeeze Theorem",
        tagline: "Trap the limit between two known friends.",
        category: "Limits",
        body_md: `## The Squeeze Theorem (Sandwich Theorem)

If $g(x) \\leq f(x) \\leq h(x)$ near $a$, and $\\lim_{x \\to a} g(x) = \\lim_{x \\to a} h(x) = L$, then:

$$\\lim_{x \\to a} f(x) = L$$

### Classic application

$$\\lim_{x \\to 0} x^2 \\sin\\left(\\frac{1}{x}\\right)$$

Since $-1 \\leq \\sin(1/x) \\leq 1$, we have $-x^2 \\leq x^2\\sin(1/x) \\leq x^2$. Both bounds $\\to 0$, so the limit is $0$.`,
        micro_problem: {
          question_latex: "Evaluate $\\displaystyle\\lim_{x \\to 0} x \\cos\\!\\left(\\frac{1}{x}\\right)$.",
          answer_latex: "0",
        },
      },
      {
        id: "lhopital",
        name: "L'Hôpital's Rule",
        tagline: "Resolve 0/0 and ∞/∞ with derivatives.",
        category: "Limits",
        body_md: `## L'Hôpital's Rule

If $\\lim_{x \\to a} f(x) = \\lim_{x \\to a} g(x) = 0$ (or both $\\pm\\infty$), then:

$$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)}$$

provided the right-hand limit exists.

### Pitfalls

- Only applies to **indeterminate forms** ($0/0$, $\\infty/\\infty$).
- Can loop if applied recklessly. Confirm the form before each application.
- For $0 \\cdot \\infty$, $0^0$, $1^\\infty$ etc., rewrite first.`,
        micro_problem: {
          question_latex: "Evaluate $\\displaystyle\\lim_{x \\to 0} \\frac{e^x - 1 - x}{x^2}$.",
          answer_latex: "\\dfrac{1}{2}",
        },
      },
    ],
  },
  {
    id: "series-secrets",
    title: "Series Secrets",
    techniques: [
      {
        id: "telescoping",
        name: "Telescoping Series",
        tagline: "Most terms cancel — find what remains.",
        category: "Summations",
        body_md: `## Telescoping Series

A series **telescopes** when consecutive partial sums cancel, leaving only a finite number of surviving terms.

### Recognising them

Look for partial fractions of the form $\\dfrac{1}{k(k+1)} = \\dfrac{1}{k} - \\dfrac{1}{k+1}$.

### Example

$$\\sum_{k=1}^{n} \\frac{1}{k(k+1)} = \\sum_{k=1}^n \\left(\\frac{1}{k} - \\frac{1}{k+1}\\right) = 1 - \\frac{1}{n+1} \\xrightarrow{n\\to\\infty} 1$$`,
        micro_problem: {
          question_latex: "Evaluate $\\displaystyle\\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)(2k+1)}$.",
          answer_latex: "\\dfrac{1}{2}",
        },
      },
    ],
  },
];
