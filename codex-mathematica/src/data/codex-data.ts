// ─────────────────────────────────────────────────────────────────────────────
// Codex Mathematica — Data Module
// All fragment problem banks, chapter definitions, and volume manifest.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Fragment {
  id: number;
  problem_latex: string;
  solution_latex: string;
  problem_raw: string;
  solution_raw: string;
}

export interface Chapter {
  theme: string;
  fragments: Fragment[];
}

export interface Volume {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly subtitle: string;
  /** Hex colour for the book's leather grain */
  readonly leather: string;
  /** Hex colour for accent / gold elements */
  readonly accent: string;
  /** Text colour on book cover */
  readonly bookText: string;
  readonly chapters: Chapter[];
}

// ── Internal helpers ──────────────────────────────────────────────────────────

type RawFrag = [
  problem_latex: string,
  solution_latex: string,
  problem_raw: string,
  solution_raw: string,
];

/** Expand a bank of ≤50 problems to exactly 50 fragments, cycling as needed. */
function makeFragments(bank: RawFrag[]): Fragment[] {
  return Array.from({ length: 50 }, (_, i) => {
    const [pl, sl, pr, sr] = bank[i % bank.length];
    return { id: i + 1, problem_latex: pl, solution_latex: sl, problem_raw: pr, solution_raw: sr };
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// ALPHA — The Volume of Limits
// ═════════════════════════════════════════════════════════════════════════════

const ALPHA_CH1: RawFrag[] = [
  ["\\lim_{x\\to 2}(x^2+3x-1)", "9", "limit(x**2+3*x-1, x, 2)", "9"],
  ["\\lim_{x\\to -1}(x^3-2x)", "1", "limit(x**3-2*x, x, -1)", "1"],
  ["\\lim_{x\\to 3}\\frac{x^2-9}{x-3}", "6", "limit((x**2-9)/(x-3), x, 3)", "6"],
  ["\\lim_{x\\to 0}\\frac{x^2+2x}{x}", "2", "limit((x**2+2*x)/x, x, 0)", "2"],
  ["\\lim_{x\\to 1}\\frac{x^3-1}{x-1}", "3", "limit((x**3-1)/(x-1), x, 1)", "3"],
  ["\\lim_{x\\to 4}\\frac{\\sqrt{x}-2}{x-4}", "\\dfrac{1}{4}", "limit((sqrt(x)-2)/(x-4), x, 4)", "1/4"],
  ["\\lim_{x\\to\\infty}\\frac{3x^2+1}{x^2-5}", "3", "limit((3*x**2+1)/(x**2-5), x, oo)", "3"],
  ["\\lim_{x\\to\\infty}\\frac{2x+1}{x+3}", "2", "limit((2*x+1)/(x+3), x, oo)", "2"],
  ["\\lim_{x\\to 2}\\frac{x^2-4}{x^2-3x+2}", "4", "limit((x**2-4)/(x**2-3*x+2), x, 2)", "4"],
  ["\\lim_{x\\to 0}(1+x)^{1/x}", "e", "limit((1+x)**(1/x), x, 0)", "E"],
  ["\\lim_{x\\to\\infty}\\left(1+\\frac{1}{x}\\right)^x", "e", "limit((1+1/x)**x, x, oo)", "E"],
  ["\\lim_{x\\to 0}\\frac{\\tan x}{x}", "1", "limit(tan(x)/x, x, 0)", "1"],
  ["\\lim_{x\\to\\infty}\\frac{\\ln x}{x}", "0", "limit(log(x)/x, x, oo)", "0"],
  ["\\lim_{x\\to 0^+}x\\ln x", "0", "limit(x*log(x), x, 0, '+')", "0"],
  ["\\lim_{x\\to 0}\\frac{e^x-1}{x}", "1", "limit((exp(x)-1)/x, x, 0)", "1"],
  ["\\lim_{x\\to 0}\\frac{\\arctan x}{x}", "1", "limit(atan(x)/x, x, 0)", "1"],
  ["\\lim_{x\\to 9}\\frac{\\sqrt{x}-3}{x-9}", "\\dfrac{1}{6}", "limit((sqrt(x)-3)/(x-9), x, 9)", "1/6"],
  ["\\lim_{x\\to 1}\\frac{\\ln x}{x-1}", "1", "limit(log(x)/(x-1), x, 1)", "1"],
  ["\\lim_{x\\to 0}\\frac{\\sin 3x}{\\sin 2x}", "\\dfrac{3}{2}", "limit(sin(3*x)/sin(2*x), x, 0)", "3/2"],
  ["\\lim_{x\\to\\infty}\\frac{5x^3}{x^3+x}", "5", "limit(5*x**3/(x**3+x), x, oo)", "5"],
  ["\\lim_{x\\to 0}\\frac{1-\\cos x}{x^2}", "\\dfrac{1}{2}", "limit((1-cos(x))/x**2, x, 0)", "1/2"],
  ["\\lim_{x\\to 0}\\frac{1-e^{-x}}{x}", "1", "limit((1-exp(-x))/x, x, 0)", "1"],
  ["\\lim_{x\\to\\infty}x^{1/x}", "1", "limit(x**(1/x), x, oo)", "1"],
  ["\\lim_{x\\to 0^+}(-\\ln x)^x", "1", "limit((-log(x))**x, x, 0, '+')", "1"],
  ["\\lim_{x\\to a}\\frac{x^n-a^n}{x-a}", "na^{n-1}", "limit((x**n-a**n)/(x-a), x, a)", "n*a**(n-1)"],
];

const ALPHA_CH2: RawFrag[] = [
  ["\\lim_{x\\to 0}\\frac{\\sin x}{x}", "1", "limit(sin(x)/x, x, 0)", "1"],
  ["\\lim_{x\\to 0}\\frac{1-\\cos x}{x}", "0", "limit((1-cos(x))/x, x, 0)", "0"],
  ["\\lim_{x\\to 0}\\frac{\\sin^2 x}{x^2}", "1", "limit(sin(x)**2/x**2, x, 0)", "1"],
  ["\\lim_{x\\to 0}\\frac{\\sin(ax)}{\\sin(bx)}", "\\dfrac{a}{b}", "limit(sin(a*x)/sin(b*x), x, 0)", "a/b"],
  ["\\lim_{x\\to 0}\\frac{x}{\\tan x}", "1", "limit(x/tan(x), x, 0)", "1"],
  ["\\lim_{x\\to 0}\\frac{\\arcsin x}{x}", "1", "limit(asin(x)/x, x, 0)", "1"],
  ["\\lim_{x\\to 0}\\frac{\\sin x-x}{x^3}", "-\\dfrac{1}{6}", "limit((sin(x)-x)/x**3, x, 0)", "-1/6"],
  ["\\lim_{x\\to 0}\\frac{\\tan x-x}{x^3}", "\\dfrac{1}{3}", "limit((tan(x)-x)/x**3, x, 0)", "1/3"],
  ["\\lim_{x\\to 0}\\frac{\\sin(x^2)}{x^2}", "1", "limit(sin(x**2)/x**2, x, 0)", "1"],
  ["\\lim_{x\\to\\infty}x\\sin\\!\\left(\\frac{1}{x}\\right)", "1", "limit(x*sin(1/x), x, oo)", "1"],
  ["\\lim_{n\\to\\infty}n\\sin\\!\\left(\\frac{\\pi}{n}\\right)", "\\pi", "limit(n*sin(pi/n), n, oo)", "pi"],
  ["\\lim_{x\\to 0}\\frac{2\\sin x-\\sin 2x}{x^3}", "1", "limit((2*sin(x)-sin(2*x))/x**3, x, 0)", "1"],
  ["\\lim_{x\\to 0}\\frac{\\cos(ax)-\\cos(bx)}{x^2}", "\\dfrac{b^2-a^2}{2}", "limit((cos(a*x)-cos(b*x))/x**2, x, 0)", "(b**2-a**2)/2"],
  ["\\lim_{x\\to 0}\\frac{\\sin(3x)+\\sin(5x)}{x}", "8", "limit((sin(3*x)+sin(5*x))/x, x, 0)", "8"],
  ["\\lim_{x\\to 0}\\frac{1-\\cos(2x)}{x\\sin x}", "2", "limit((1-cos(2*x))/(x*sin(x)), x, 0)", "2"],
  ["\\lim_{x\\to 0}\\frac{\\sin x\\cdot\\ln(1+x)}{x^2}", "1", "limit(sin(x)*log(1+x)/x**2, x, 0)", "1"],
  ["\\lim_{x\\to 0}\\frac{e^{\\sin x}-1}{x}", "1", "limit((exp(sin(x))-1)/x, x, 0)", "1"],
  ["\\lim_{x\\to 0^+}\\sqrt{x}\\cos\\!\\left(\\frac{1}{x}\\right)", "0", "limit(sqrt(x)*cos(1/x), x, 0, '+')", "0"],
  ["\\lim_{\\theta\\to 0}\\frac{\\theta}{\\sin\\theta}", "1", "limit(t/sin(t), t, 0)", "1"],
  ["\\lim_{x\\to 0}\\left(\\frac{\\sin x}{x}\\right)^{1/x^2}", "e^{-1/6}", "limit((sin(x)/x)**(1/x**2), x, 0)", "exp(-1/6)"],
  ["\\lim_{x\\to 0}\\frac{\\tan^2 x}{x^2}", "1", "limit(tan(x)**2/x**2, x, 0)", "1"],
  ["\\lim_{x\\to\\pi/2}\\cos x\\cdot\\tan x", "1", "limit(cos(x)*tan(x), x, pi/2)", "1"],
  ["\\lim_{x\\to 0}\\frac{\\sinh x}{x}", "1", "limit(sinh(x)/x, x, 0)", "1"],
  ["\\lim_{x\\to 0}\\frac{\\sin x\\cos x}{x}", "1", "limit(sin(x)*cos(x)/x, x, 0)", "1"],
  ["\\lim_{x\\to 0}\\frac{\\arctan x-x}{x^3}", "-\\dfrac{1}{3}", "limit((atan(x)-x)/x**3, x, 0)", "-1/3"],
];

const ALPHA_CH3: RawFrag[] = [
  ["\\lim_{x\\to 0}\\frac{e^x-1-x}{x^2}", "\\dfrac{1}{2}", "limit((exp(x)-1-x)/x**2, x, 0)", "1/2"],
  ["\\lim_{x\\to 0}\\frac{\\ln(1+x)}{x}", "1", "limit(log(1+x)/x, x, 0)", "1"],
  ["\\lim_{x\\to 0}\\frac{\\ln(1+x)-x}{x^2}", "-\\dfrac{1}{2}", "limit((log(1+x)-x)/x**2, x, 0)", "-1/2"],
  ["\\lim_{x\\to 0}(1+ax)^{1/x}", "e^a", "limit((1+a*x)**(1/x), x, 0)", "exp(a)"],
  ["\\lim_{x\\to\\infty}\\left(1+\\frac{a}{x}\\right)^x", "e^a", "limit((1+a/x)**x, x, oo)", "exp(a)"],
  ["\\lim_{x\\to 0^+}x^x", "1", "limit(x**x, x, 0, '+')", "1"],
  ["\\lim_{x\\to 0}(1+x)^{1/x}-e", "-\\dfrac{e}{2}", "limit((1+x)**(1/x)-E, x, 0)", "-E/2"],
  ["\\lim_{x\\to 0}\\frac{x-\\ln(1+x)}{x^2}", "\\dfrac{1}{2}", "limit((x-log(1+x))/x**2, x, 0)", "1/2"],
  ["\\lim_{x\\to 0}\\left(\\frac{1}{x}-\\frac{1}{e^x-1}\\right)", "\\dfrac{1}{2}", "limit(1/x-1/(exp(x)-1), x, 0)", "1/2"],
  ["\\lim_{x\\to 0}\\frac{(1+x)^n-nx-1}{x^2}", "\\dfrac{n(n-1)}{2}", "limit(((1+x)**n-n*x-1)/x**2, x, 0)", "n*(n-1)/2"],
  ["\\lim_{x\\to\\infty}\\left(\\frac{x+1}{x-1}\\right)^x", "e^2", "limit(((x+1)/(x-1))**x, x, oo)", "exp(2)"],
  ["\\lim_{x\\to 0}\\frac{a^x-1}{x}", "\\ln a", "limit((a**x-1)/x, x, 0)", "log(a)"],
  ["\\lim_{x\\to 1}\\frac{x-1-\\ln x}{(x-1)^2}", "\\dfrac{1}{2}", "limit((x-1-log(x))/(x-1)**2, x, 1)", "1/2"],
  ["\\lim_{x\\to 0}\\frac{e^{x^2}-\\cos x}{x^2}", "\\dfrac{3}{2}", "limit((exp(x**2)-cos(x))/x**2, x, 0)", "3/2"],
  ["\\lim_{x\\to 0}\\frac{\\sqrt{1+x}-1-x/2}{x^2}", "-\\dfrac{1}{8}", "limit((sqrt(1+x)-1-x/2)/x**2, x, 0)", "-1/8"],
  ["\\lim_{x\\to\\infty}(x+1)^{1/\\ln x}", "e", "limit((x+1)**(1/log(x)), x, oo)", "E"],
  ["\\lim_{x\\to\\infty}x(e^{1/x}-1)", "1", "limit(x*(exp(1/x)-1), x, oo)", "1"],
  ["\\lim_{x\\to 0}\\frac{\\sinh x-\\sin x}{x^3}", "\\dfrac{1}{3}", "limit((sinh(x)-sin(x))/x**3, x, 0)", "1/3"],
  ["\\lim_{x\\to 1}\\frac{x^a-1}{x^b-1}", "\\dfrac{a}{b}", "limit((x**a-1)/(x**b-1), x, 1)", "a/b"],
  ["\\lim_{x\\to 0}\\frac{\\tanh x}{x}", "1", "limit(tanh(x)/x, x, 0)", "1"],
  ["\\lim_{n\\to\\infty}\\left(1+\\frac{1}{n^2}\\right)^n", "1", "limit((1+1/n**2)**n, n, oo)", "1"],
  ["\\lim_{x\\to\\infty}\\frac{\\ln x}{x^\\alpha}", "0", "limit(log(x)/x**a, x, oo)", "0"],
  ["\\lim_{x\\to 0}\\frac{e^x-e^{-x}-2x}{x^3}", "\\dfrac{2}{3}", "limit((exp(x)-exp(-x)-2*x)/x**3, x, 0)", "2/3"],
  ["\\lim_{x\\to 0}\\frac{\\ln\\cos x}{x^2}", "-\\dfrac{1}{2}", "limit(log(cos(x))/x**2, x, 0)", "-1/2"],
  ["\\lim_{x\\to\\infty}\\frac{n!\\,e^n}{n^n\\sqrt{n}}", "\\sqrt{2\\pi}", "limit(factorial(n)*E**n/(n**n*sqrt(n)), n, oo)", "sqrt(2*pi)"],
];

// ═════════════════════════════════════════════════════════════════════════════
// DELTA — The Volume of Derivatives
// ═════════════════════════════════════════════════════════════════════════════

const DELTA_CH1: RawFrag[] = [
  ["\\frac{d}{dx}[x^n]", "nx^{n-1}", "diff(x**n, x)", "n*x**(n-1)"],
  ["\\frac{d}{dx}[x^3+2x^2-5x+1]", "3x^2+4x-5", "diff(x**3+2*x**2-5*x+1, x)", "3*x**2+4*x-5"],
  ["\\frac{d}{dx}\\left[\\sqrt{x}\\right]", "\\dfrac{1}{2\\sqrt{x}}", "diff(sqrt(x), x)", "1/(2*sqrt(x))"],
  ["\\frac{d}{dx}\\left[\\frac{1}{x}\\right]", "-\\dfrac{1}{x^2}", "diff(1/x, x)", "-1/x**2"],
  ["\\frac{d}{dx}[e^x]", "e^x", "diff(exp(x), x)", "exp(x)"],
  ["\\frac{d}{dx}[a^x]", "a^x\\ln a", "diff(a**x, x)", "a**x*log(a)"],
  ["\\frac{d}{dx}[\\ln x]", "\\dfrac{1}{x}", "diff(log(x), x)", "1/x"],
  ["\\frac{d}{dx}[\\log_a x]", "\\dfrac{1}{x\\ln a}", "diff(log(x,a), x)", "1/(x*log(a))"],
  ["\\frac{d}{dx}[\\sin x]", "\\cos x", "diff(sin(x), x)", "cos(x)"],
  ["\\frac{d}{dx}[\\cos x]", "-\\sin x", "diff(cos(x), x)", "-sin(x)"],
  ["\\frac{d}{dx}[\\tan x]", "\\sec^2 x", "diff(tan(x), x)", "sec(x)**2"],
  ["\\frac{d}{dx}[\\cot x]", "-\\csc^2 x", "diff(cot(x), x)", "-csc(x)**2"],
  ["\\frac{d}{dx}[\\sec x]", "\\sec x\\tan x", "diff(sec(x), x)", "sec(x)*tan(x)"],
  ["\\frac{d}{dx}[\\csc x]", "-\\csc x\\cot x", "diff(csc(x), x)", "-csc(x)*cot(x)"],
  ["\\frac{d}{dx}[\\arcsin x]", "\\dfrac{1}{\\sqrt{1-x^2}}", "diff(asin(x), x)", "1/sqrt(1-x**2)"],
  ["\\frac{d}{dx}[\\arccos x]", "-\\dfrac{1}{\\sqrt{1-x^2}}", "diff(acos(x), x)", "-1/sqrt(1-x**2)"],
  ["\\frac{d}{dx}[\\arctan x]", "\\dfrac{1}{1+x^2}", "diff(atan(x), x)", "1/(1+x**2)"],
  ["\\frac{d}{dx}[\\sinh x]", "\\cosh x", "diff(sinh(x), x)", "cosh(x)"],
  ["\\frac{d}{dx}[\\cosh x]", "\\sinh x", "diff(cosh(x), x)", "sinh(x)"],
  ["\\frac{d}{dx}[\\tanh x]", "\\operatorname{sech}^2 x", "diff(tanh(x), x)", "sech(x)**2"],
  ["\\frac{d}{dx}[x\\sin x]", "\\sin x+x\\cos x", "diff(x*sin(x), x)", "sin(x)+x*cos(x)"],
  ["\\frac{d}{dx}[x^2 e^x]", "e^x(x^2+2x)", "diff(x**2*exp(x), x)", "exp(x)*(x**2+2*x)"],
  ["\\frac{d}{dx}[x\\ln x]", "\\ln x+1", "diff(x*log(x), x)", "log(x)+1"],
  ["\\frac{d}{dx}[x^{3/2}]", "\\dfrac{3}{2}\\sqrt{x}", "diff(x**(3/2), x)", "3*sqrt(x)/2"],
  ["\\frac{d}{dx}\\left[\\frac{x}{e^x}\\right]", "\\dfrac{1-x}{e^x}", "diff(x/exp(x), x)", "(1-x)*exp(-x)"],
];

const DELTA_CH2: RawFrag[] = [
  ["\\frac{d}{dx}\\left[\\frac{\\sin x}{x}\\right]", "\\dfrac{x\\cos x-\\sin x}{x^2}", "diff(sin(x)/x, x)", "(x*cos(x)-sin(x))/x**2"],
  ["\\frac{d}{dx}[\\sin(x^2)]", "2x\\cos(x^2)", "diff(sin(x**2), x)", "2*x*cos(x**2)"],
  ["\\frac{d}{dx}[e^{\\sin x}]", "e^{\\sin x}\\cos x", "diff(exp(sin(x)), x)", "exp(sin(x))*cos(x)"],
  ["\\frac{d}{dx}[\\ln(\\cos x)]", "-\\tan x", "diff(log(cos(x)), x)", "-tan(x)"],
  ["\\frac{d}{dx}[(x^2+1)^5]", "10x(x^2+1)^4", "diff((x**2+1)**5, x)", "10*x*(x**2+1)**4"],
  ["\\frac{d}{dx}\\left[\\sqrt{x^2+1}\\right]", "\\dfrac{x}{\\sqrt{x^2+1}}", "diff(sqrt(x**2+1), x)", "x/sqrt(x**2+1)"],
  ["\\frac{d}{dx}\\left[\\frac{x+1}{x-1}\\right]", "-\\dfrac{2}{(x-1)^2}", "diff((x+1)/(x-1), x)", "-2/(x-1)**2"],
  ["\\frac{d}{dx}[\\arctan(x^2)]", "\\dfrac{2x}{1+x^4}", "diff(atan(x**2), x)", "2*x/(1+x**4)"],
  ["\\frac{d}{dx}[x^x]", "x^x(\\ln x+1)", "diff(x**x, x)", "x**x*(log(x)+1)"],
  ["\\frac{d}{dx}[(\\ln x)^2]", "\\dfrac{2\\ln x}{x}", "diff(log(x)**2, x)", "2*log(x)/x"],
  ["\\frac{d}{dx}[e^{x^2}]", "2xe^{x^2}", "diff(exp(x**2), x)", "2*x*exp(x**2)"],
  ["\\frac{d}{dx}\\left[\\frac{e^x}{x^2}\\right]", "\\dfrac{e^x(x-2)}{x^3}", "diff(exp(x)/x**2, x)", "exp(x)*(x-2)/x**3"],
  ["\\frac{d}{dx}[\\ln|\\sin x|]", "\\cot x", "diff(log(Abs(sin(x))), x)", "cot(x)"],
  ["\\frac{d}{dx}\\left[\\arcsin\\!\\left(\\frac{x}{a}\\right)\\right]", "\\dfrac{1}{\\sqrt{a^2-x^2}}", "diff(asin(x/a), x)", "1/sqrt(a**2-x**2)"],
  ["\\frac{d}{dx}[\\ln(x+\\sqrt{x^2+1})]", "\\dfrac{1}{\\sqrt{x^2+1}}", "diff(log(x+sqrt(x**2+1)), x)", "1/sqrt(x**2+1)"],
  ["\\frac{d}{dx}[\\sin x\\cos x]", "\\cos 2x", "diff(sin(x)*cos(x), x)", "cos(2*x)"],
  ["\\frac{d}{dx}[e^{ax}\\sin(bx)]", "e^{ax}(a\\sin bx+b\\cos bx)", "diff(exp(a*x)*sin(b*x), x)", "exp(a*x)*(a*sin(b*x)+b*cos(b*x))"],
  ["\\frac{d}{dx}[\\ln(\\sec x+\\tan x)]", "\\sec x", "diff(log(sec(x)+tan(x)), x)", "sec(x)"],
  ["\\frac{d}{dx}[x^{\\sin x}]", "x^{\\sin x}\\!\\left(\\cos x\\ln x+\\frac{\\sin x}{x}\\right)", "diff(x**sin(x), x)", "x**sin(x)*(cos(x)*log(x)+sin(x)/x)"],
  ["\\frac{d}{dx}[(1+x^2)\\arctan x]", "2x\\arctan x+1", "diff((1+x**2)*atan(x), x)", "2*x*atan(x)+1"],
  ["\\frac{d}{dx}\\left[\\frac{x}{\\sqrt{1-x^2}}\\right]", "\\dfrac{1}{(1-x^2)^{3/2}}", "diff(x/sqrt(1-x**2), x)", "1/(1-x**2)**(3/2)"],
  ["\\frac{d}{dx}[x^2\\arctan x]", "2x\\arctan x+\\dfrac{x^2}{1+x^2}", "diff(x**2*atan(x), x)", "2*x*atan(x)+x**2/(1+x**2)"],
  ["\\frac{d}{dx}[\\tan^2 x]", "2\\tan x\\sec^2 x", "diff(tan(x)**2, x)", "2*tan(x)*sec(x)**2"],
  ["\\frac{d}{dx}[\\ln(x^2+1)]", "\\dfrac{2x}{x^2+1}", "diff(log(x**2+1), x)", "2*x/(x**2+1)"],
  ["\\frac{d}{dx}\\left[\\frac{\\tan x}{1+\\tan x}\\right]", "\\dfrac{\\sec^2 x}{(1+\\tan x)^2}", "diff(tan(x)/(1+tan(x)), x)", "sec(x)**2/(1+tan(x))**2"],
];

const DELTA_CH3: RawFrag[] = [
  ["\\frac{d^2}{dx^2}[\\sin x]", "-\\sin x", "diff(sin(x), x, 2)", "-sin(x)"],
  ["\\frac{d^2}{dx^2}[e^{ax}]", "a^2 e^{ax}", "diff(exp(a*x), x, 2)", "a**2*exp(a*x)"],
  ["\\frac{d^2}{dx^2}[x\\ln x]", "\\dfrac{1}{x}", "diff(x*log(x), x, 2)", "1/x"],
  ["\\frac{d^n}{dx^n}[e^x]", "e^x", "diff(exp(x), x, n)", "exp(x)"],
  ["\\frac{d^n}{dx^n}[\\sin x]", "\\sin\\!\\left(x+\\tfrac{n\\pi}{2}\\right)", "diff(sin(x), x, n)", "sin(x+n*pi/2)"],
  ["\\frac{d^2}{dx^2}[(x^2+1)^3]", "30x^4+12x^2+6", "diff((x**2+1)**3, x, 2)", "30*x**4+12*x**2+6"],
  ["\\frac{d^2}{dx^2}[\\ln x]", "-\\dfrac{1}{x^2}", "diff(log(x), x, 2)", "-1/x**2"],
  ["\\frac{d^3}{dx^3}[x^4]", "24x", "diff(x**4, x, 3)", "24*x"],
  ["\\frac{d^2}{dx^2}[\\arctan x]", "-\\dfrac{2x}{(1+x^2)^2}", "diff(atan(x), x, 2)", "-2*x/(1+x**2)**2"],
  ["\\frac{d^2}{dx^2}[xe^x]", "(x+2)e^x", "diff(x*exp(x), x, 2)", "(x+2)*exp(x)"],
  ["\\text{Find }\\tfrac{dy}{dx}:\\;x^2+y^2=r^2", "-\\dfrac{x}{y}", "idiff(x**2+y**2-r**2, y, x)", "-x/y"],
  ["\\text{Find }\\tfrac{dy}{dx}:\\;xy=c", "-\\dfrac{y}{x}", "idiff(x*y-c, y, x)", "-y/x"],
  ["\\text{Find }\\tfrac{dy}{dx}:\\;\\sin y=x", "\\dfrac{1}{\\cos y}", "idiff(sin(y)-x, y, x)", "1/cos(y)"],
  ["\\text{Find }\\tfrac{dy}{dx}:\\;e^y=xy", "\\dfrac{y}{x(y-1)}", "idiff(exp(y)-x*y, y, x)", "y/(x*(y-1))"],
  ["\\text{Find }\\tfrac{dy}{dx}:\\;x^3+y^3=3xy", "\\dfrac{y-x^2}{y^2-x}", "idiff(x**3+y**3-3*x*y, y, x)", "(y-x**2)/(y**2-x)"],
  ["x=t^2,\\,y=t^3\\Rightarrow\\tfrac{dy}{dx}=", "\\dfrac{3t}{2}", "parametric(t**3, t**2)", "3*t/2"],
  ["x=\\cos t,\\,y=\\sin t\\Rightarrow\\tfrac{dy}{dx}=", "-\\cot t", "parametric(sin(t), cos(t))", "-cot(t)"],
  ["\\frac{d}{dx}[|x|]", "\\dfrac{x}{|x|}\\;(x\\neq 0)", "diff(Abs(x), x)", "sign(x)"],
  ["\\frac{d}{dx}[\\cosh^{-1}x]", "\\dfrac{1}{\\sqrt{x^2-1}}", "diff(acosh(x), x)", "1/sqrt(x**2-1)"],
  ["\\frac{d}{dx}[\\tanh^{-1}x]", "\\dfrac{1}{1-x^2}", "diff(atanh(x), x)", "1/(1-x**2)"],
  ["\\text{Find }y':\\;y=x^{1/x}", "\\dfrac{x^{1/x}(1-\\ln x)}{x^2}", "diff(x**(1/x), x)", "x**(1/x)*(1-log(x))/x**2"],
  ["\\frac{d}{dx}\\left[\\int_0^x e^{-t^2}dt\\right]", "e^{-x^2}", "diff(erf(x)*sqrt(pi)/2, x)", "exp(-x**2)"],
  ["\\frac{d^2y}{dx^2}\\text{ for }y=\\arctan x", "-\\dfrac{2x}{(1+x^2)^2}", "diff(atan(x), x, 2)", "-2*x/(1+x**2)**2"],
  ["\\text{Find }\\tfrac{dy}{dx}:\\;\\ln(xy)=x+y", "\\dfrac{y(1-x)}{x(y-1)}", "idiff(log(x*y)-x-y, y, x)", "y*(1-x)/(x*(y-1))"],
  ["\\frac{d^4}{dx^4}[\\sin x]", "\\sin x", "diff(sin(x), x, 4)", "sin(x)"],
];

// ═════════════════════════════════════════════════════════════════════════════
// SIGMA — The Volume of Summations
// ═════════════════════════════════════════════════════════════════════════════

const SIGMA_CH1: RawFrag[] = [
  ["\\sum_{k=1}^{n}k", "\\dfrac{n(n+1)}{2}", "Sum(k,(k,1,n))", "n*(n+1)/2"],
  ["\\sum_{k=1}^{n}k^2", "\\dfrac{n(n+1)(2n+1)}{6}", "Sum(k**2,(k,1,n))", "n*(n+1)*(2*n+1)/6"],
  ["\\sum_{k=1}^{n}k^3", "\\left[\\dfrac{n(n+1)}{2}\\right]^{\\!2}", "Sum(k**3,(k,1,n))", "(n*(n+1)/2)**2"],
  ["\\sum_{k=0}^{n}r^k", "\\dfrac{1-r^{n+1}}{1-r}", "Sum(r**k,(k,0,n))", "(1-r**(n+1))/(1-r)"],
  ["\\sum_{k=0}^{n}\\binom{n}{k}", "2^n", "Sum(binomial(n,k),(k,0,n))", "2**n"],
  ["\\sum_{k=1}^{n}(2k-1)", "n^2", "Sum(2*k-1,(k,1,n))", "n**2"],
  ["\\sum_{k=1}^{n}\\frac{1}{k(k+1)}", "\\dfrac{n}{n+1}", "Sum(1/(k*(k+1)),(k,1,n))", "n/(n+1)"],
  ["\\sum_{k=1}^{n}(a+(k-1)d)", "\\dfrac{n}{2}(2a+(n-1)d)", "Sum(a+(k-1)*d,(k,1,n))", "n*(2*a+(n-1)*d)/2"],
  ["\\sum_{k=0}^{n}(-1)^k\\binom{n}{k}", "0", "Sum((-1)**k*binomial(n,k),(k,0,n))", "0"],
  ["\\sum_{k=1}^{n}k\\cdot r^{k-1}", "\\dfrac{1-(n+1)r^n+nr^{n+1}}{(1-r)^2}", "Sum(k*r**(k-1),(k,1,n))", "(1-(n+1)*r**n+n*r**(n+1))/(1-r)**2"],
  ["\\sum_{k=1}^{n}\\frac{1}{\\sqrt{k}+\\sqrt{k+1}}", "\\sqrt{n+1}-1", "Sum(1/(sqrt(k)+sqrt(k+1)),(k,1,n))", "sqrt(n+1)-1"],
  ["\\sum_{k=1}^{n}k\\cdot k!", "(n+1)!-1", "Sum(k*factorial(k),(k,1,n))", "factorial(n+1)-1"],
  ["\\sum_{k=0}^{n}\\binom{n}{k}x^k", "(1+x)^n", "Sum(binomial(n,k)*x**k,(k,0,n))", "(1+x)**n"],
  ["\\sum_{k=1}^{n}\\ln k", "\\ln(n!)", "Sum(log(k),(k,1,n))", "log(factorial(n))"],
  ["\\sum_{k=1}^{n}\\frac{k}{2^k}", "2-\\dfrac{n+2}{2^n}", "Sum(k/2**k,(k,1,n))", "2-(n+2)/2**n"],
  ["\\sum_{k=1}^{\\infty}\\frac{1}{k(k+1)}", "1", "Sum(1/(k*(k+1)),(k,1,oo))", "1"],
  ["\\sum_{k=0}^{\\infty}(k+1)x^k\\;(|x|<1)", "\\dfrac{1}{(1-x)^2}", "Sum((k+1)*x**k,(k,0,oo))", "1/(1-x)**2"],
  ["\\sum_{k=2}^{n}\\frac{1}{k^2-1}", "\\dfrac{3}{4}-\\dfrac{2n+1}{2n(n+1)}", "Sum(1/(k**2-1),(k,2,n))", "3/4-(2*n+1)/(2*n*(n+1))"],
  ["\\sum_{k=1}^{n}\\frac{1}{k(k+2)}", "\\dfrac{3}{4}-\\dfrac{2n+3}{2(n+1)(n+2)}", "Sum(1/(k*(k+2)),(k,1,n))", "3/4-(2*n+3)/(2*(n+1)*(n+2))"],
  ["\\sum_{k=1}^{n}k^2\\cdot 2^k", "(n^2-2n+3)\\cdot 2^{n+1}-6", "Sum(k**2*2**k,(k,1,n))", "(n**2-2*n+3)*2**(n+1)-6"],
  ["\\sum_{k=1}^{n}\\frac{(-1)^{k+1}}{k}", "H_n^{\\mathrm{alt}}", "Sum((-1)**(k+1)/k,(k,1,n))", "alternating_harmonic(n)"],
  ["\\sum_{k=1}^{n}\\frac{1}{k(k+1)(k+2)}", "\\dfrac{n(n+3)}{4(n+1)(n+2)}", "Sum(1/(k*(k+1)*(k+2)),(k,1,n))", "n*(n+3)/(4*(n+1)*(n+2))"],
  ["\\sum_{k=0}^{\\infty}x^k\\;(|x|<1)", "\\dfrac{1}{1-x}", "Sum(x**k,(k,0,oo))", "1/(1-x)"],
  ["\\sum_{k=1}^{n}(k^3-k)", "\\dfrac{n^2(n^2-1)}{4}", "Sum(k**3-k,(k,1,n))", "n**2*(n**2-1)/4"],
  ["\\sum_{k=0}^{n}2^k", "2^{n+1}-1", "Sum(2**k,(k,0,n))", "2**(n+1)-1"],
];

const SIGMA_CH2: RawFrag[] = [
  ["\\sum_{n=1}^{\\infty}\\frac{1}{n^2}", "\\dfrac{\\pi^2}{6}", "Sum(1/n**2,(n,1,oo))", "pi**2/6"],
  ["\\sum_{n=1}^{\\infty}\\frac{1}{n^4}", "\\dfrac{\\pi^4}{90}", "Sum(1/n**4,(n,1,oo))", "pi**4/90"],
  ["\\sum_{n=0}^{\\infty}\\frac{1}{n!}", "e", "Sum(1/factorial(n),(n,0,oo))", "E"],
  ["\\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n}", "\\ln 2", "Sum((-1)**(n+1)/n,(n,1,oo))", "log(2)"],
  ["\\sum_{n=1}^{\\infty}\\frac{1}{n(n+1)}", "1", "Sum(1/(n*(n+1)),(n,1,oo))", "1"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n}{2n+1}", "\\dfrac{\\pi}{4}", "Sum((-1)**n/(2*n+1),(n,0,oo))", "pi/4"],
  ["\\sum_{n=1}^{\\infty}\\frac{1}{n^s}\\;(\\mathrm{Re}\\,s>1)", "\\zeta(s)", "Sum(1/n**s,(n,1,oo))", "zeta(s)"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n}{(2n)!}", "\\cos 1", "Sum((-1)**n/factorial(2*n),(n,0,oo))", "cos(1)"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n}{(2n+1)!}", "\\sin 1", "Sum((-1)**n/factorial(2*n+1),(n,0,oo))", "sin(1)"],
  ["\\sum_{n=1}^{\\infty}\\frac{1}{n^p}\\;(p>1)", "\\zeta(p)", "Sum(1/n**p,(n,1,oo))", "zeta(p)"],
  ["\\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n^2}", "\\dfrac{\\pi^2}{12}", "Sum((-1)**(n+1)/n**2,(n,1,oo))", "pi**2/12"],
  ["\\sum_{n=0}^{\\infty}\\frac{1}{2^n}", "2", "Sum(1/2**n,(n,0,oo))", "2"],
  ["\\sum_{n=1}^{\\infty}\\frac{n}{2^n}", "2", "Sum(n/2**n,(n,1,oo))", "2"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n}{n!}", "e^{-1}", "Sum((-1)**n/factorial(n),(n,0,oo))", "exp(-1)"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n}{(2n+1)^3}", "\\dfrac{\\pi^3}{32}", "Sum((-1)**n/(2*n+1)**3,(n,0,oo))", "pi**3/32"],
  ["\\sum_{n=1}^{\\infty}\\frac{1}{n(n+1)(n+2)}", "\\dfrac{1}{4}", "Sum(1/(n*(n+1)*(n+2)),(n,1,oo))", "1/4"],
  ["\\sum_{n=1}^{\\infty}\\frac{z^n}{n}\\;(|z|<1)", "-\\ln(1-z)", "Sum(z**n/n,(n,1,oo))", "-log(1-z)"],
  ["\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^3}", "-\\dfrac{3\\zeta(3)}{4}", "Sum((-1)**n/n**3,(n,1,oo))", "-3*zeta(3)/4"],
  ["\\sum_{n=2}^{\\infty}\\frac{1}{n\\ln n}\\;(\\text{diverges})", "\\infty", "Sum(1/(n*log(n)),(n,2,oo))", "oo"],
  ["\\sum_{n=1}^{\\infty}\\frac{\\sin n}{n}", "\\dfrac{\\pi-1}{2}", "Sum(sin(n)/n,(n,1,oo))", "(pi-1)/2"],
  ["\\sum_{n=1}^{\\infty}\\frac{1}{n^2+a^2}", "\\dfrac{\\pi\\coth(\\pi a)}{2a}-\\dfrac{1}{2a^2}", "Sum(1/(n**2+a**2),(n,1,oo))", "pi*coth(pi*a)/(2*a)-1/(2*a**2)"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n}{4^n}\\binom{2n}{n}", "\\dfrac{1}{\\sqrt{2}}", "Sum((-1)**n/4**n*C(2*n,n),(n,0,oo))", "1/sqrt(2)"],
  ["\\sum_{n=1}^{\\infty}\\frac{H_n}{n^2}", "2\\zeta(3)", "Sum(harmonic(n)/n**2,(n,1,oo))", "2*zeta(3)"],
  ["\\sum_{n=1}^{\\infty}\\frac{1}{4n^2-1}", "\\dfrac{1}{2}", "Sum(1/(4*n**2-1),(n,1,oo))", "1/2"],
  ["\\sum_{n=0}^{\\infty}(2n+1)^{-2}", "\\dfrac{\\pi^2}{8}", "Sum(1/(2*n+1)**2,(n,0,oo))", "pi**2/8"],
];

const SIGMA_CH3: RawFrag[] = [
  ["\\sum_{n=0}^{\\infty}\\frac{x^n}{n!}", "e^x", "Sum(x**n/factorial(n),(n,0,oo))", "exp(x)"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n}}{(2n)!}", "\\cos x", "Sum((-1)**n*x**(2*n)/factorial(2*n),(n,0,oo))", "cos(x)"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n+1}}{(2n+1)!}", "\\sin x", "Sum((-1)**n*x**(2*n+1)/factorial(2*n+1),(n,0,oo))", "sin(x)"],
  ["\\sum_{n=0}^{\\infty}(-1)^n x^n\\;(|x|<1)", "\\dfrac{1}{1+x}", "Sum((-1)**n*x**n,(n,0,oo))", "1/(1+x)"],
  ["\\sum_{n=1}^{\\infty}(-1)^{n+1}\\frac{x^n}{n}", "\\ln(1+x)", "Sum((-1)**(n+1)*x**n/n,(n,1,oo))", "log(1+x)"],
  ["\\sum_{n=0}^{\\infty}\\frac{x^{2n}}{(2n)!}", "\\cosh x", "Sum(x**(2*n)/factorial(2*n),(n,0,oo))", "cosh(x)"],
  ["\\sum_{n=0}^{\\infty}\\frac{x^{2n+1}}{(2n+1)!}", "\\sinh x", "Sum(x**(2*n+1)/factorial(2*n+1),(n,0,oo))", "sinh(x)"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n+1}}{2n+1}", "\\arctan x", "Sum((-1)**n*x**(2*n+1)/(2*n+1),(n,0,oo))", "atan(x)"],
  ["\\sum_{n=0}^{\\infty}\\binom{\\alpha}{n}x^n", "(1+x)^\\alpha", "Sum(binomial(a,n)*x**n,(n,0,oo))", "(1+x)**a"],
  ["\\sum_{n=1}^{\\infty}\\frac{x^n}{n}", "-\\ln(1-x)", "Sum(x**n/n,(n,1,oo))", "-log(1-x)"],
  ["\\sum_{n=0}^{\\infty}(n+1)x^n\\;(|x|<1)", "\\dfrac{1}{(1-x)^2}", "Sum((n+1)*x**n,(n,0,oo))", "1/(1-x)**2"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n}}{2n+1}", "\\dfrac{\\arctan x}{x}", "Sum((-1)**n*x**(2*n)/(2*n+1),(n,0,oo))", "atan(x)/x"],
  ["\\sum_{n=1}^{\\infty}\\frac{x^n}{n^2}", "\\operatorname{Li}_2(x)", "Sum(x**n/n**2,(n,1,oo))", "polylog(2,x)"],
  ["\\sum_{n=0}^{\\infty}\\frac{(ix)^n}{n!}", "e^{ix}=\\cos x+i\\sin x", "Sum((I*x)**n/factorial(n),(n,0,oo))", "exp(I*x)"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-x^2)^n}{n!}", "e^{-x^2}", "Sum((-x**2)**n/factorial(n),(n,0,oo))", "exp(-x**2)"],
  ["\\sum_{n=0}^{\\infty}\\frac{(2x)^n}{n!}", "e^{2x}", "Sum((2*x)**n/factorial(n),(n,0,oo))", "exp(2*x)"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n+2}}{2(n+1)}", "\\ln\\sqrt{1+x^2}", "Sum((-1)**n*x**(2*n+2)/(2*(n+1)),(n,0,oo))", "log(1+x**2)/2"],
  ["\\sum_{n=0}^{\\infty}\\frac{(2n)!}{4^n(n!)^2}x^n", "\\dfrac{1}{\\sqrt{1-x}}", "Sum(factorial(2*n)/(4**n*factorial(n)**2)*x**n,(n,0,oo))", "1/sqrt(1-x)"],
  ["\\sum_{n=2}^{\\infty}\\frac{(-1)^n x^n}{n(n-1)}", "(1+x)\\ln(1+x)-x", "Sum((-1)**n*x**n/(n*(n-1)),(n,2,oo))", "(1+x)*log(1+x)-x"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n}{(2n)!}x^{2n}", "\\cos x", "Sum((-1)**n*x**(2*n)/factorial(2*n),(n,0,oo))", "cos(x)"],
  ["\\sum_{n=0}^{\\infty}(-1)^n(2n+1)x^{2n}", "\\dfrac{1}{(1+x^2)^2}", "Sum((-1)**n*(2*n+1)*x**(2*n),(n,0,oo))", "1/(1+x**2)**2"],
  ["\\sum_{n=0}^{\\infty}\\frac{(-1)^n}{(2n+1)3^{2n+1}}", "\\dfrac{\\pi}{6\\sqrt{3}}", "Sum((-1)**n/((2*n+1)*3**(2*n+1)),(n,0,oo))", "pi/(6*sqrt(3))"],
  ["\\sum_{n=0}^{\\infty}\\frac{n\\,x^{n-1}}{n!}", "e^x", "Sum(n*x**(n-1)/factorial(n),(n,0,oo))", "exp(x)"],
  ["\\sum_{n=0}^{\\infty}\\frac{x^{4n}}{(2n)!}", "\\dfrac{\\cosh x+\\cos x}{2}", "Sum(x**(4*n)/factorial(2*n),(n,0,oo))", "(cosh(x)+cos(x))/2"],
  ["\\sum_{n=0}^{\\infty}\\frac{H_n}{n!}x^n", "e^x(\\gamma+\\ln x)\\text{ rel.}", "Sum(harmonic(n)/factorial(n)*x**n,(n,0,oo))", "exp(x)*(EulerGamma+log(x))"],
];

// ═════════════════════════════════════════════════════════════════════════════
// GAMMA — The Volume of Integrals
// ═════════════════════════════════════════════════════════════════════════════

const GAMMA_CH1: RawFrag[] = [
  ["\\int x^n\\,dx\\;(n\\neq -1)", "\\dfrac{x^{n+1}}{n+1}+C", "integrate(x**n,x)", "x**(n+1)/(n+1)"],
  ["\\int e^x\\,dx", "e^x+C", "integrate(exp(x),x)", "exp(x)"],
  ["\\int a^x\\,dx", "\\dfrac{a^x}{\\ln a}+C", "integrate(a**x,x)", "a**x/log(a)"],
  ["\\int\\frac{1}{x}\\,dx", "\\ln|x|+C", "integrate(1/x,x)", "log(Abs(x))"],
  ["\\int\\sin x\\,dx", "-\\cos x+C", "integrate(sin(x),x)", "-cos(x)"],
  ["\\int\\cos x\\,dx", "\\sin x+C", "integrate(cos(x),x)", "sin(x)"],
  ["\\int\\tan x\\,dx", "\\ln|\\sec x|+C", "integrate(tan(x),x)", "log(Abs(sec(x)))"],
  ["\\int\\sec^2 x\\,dx", "\\tan x+C", "integrate(sec(x)**2,x)", "tan(x)"],
  ["\\int\\csc^2 x\\,dx", "-\\cot x+C", "integrate(csc(x)**2,x)", "-cot(x)"],
  ["\\int\\sec x\\tan x\\,dx", "\\sec x+C", "integrate(sec(x)*tan(x),x)", "sec(x)"],
  ["\\int\\csc x\\cot x\\,dx", "-\\csc x+C", "integrate(csc(x)*cot(x),x)", "-csc(x)"],
  ["\\int\\frac{1}{\\sqrt{1-x^2}}\\,dx", "\\arcsin x+C", "integrate(1/sqrt(1-x**2),x)", "asin(x)"],
  ["\\int\\frac{1}{1+x^2}\\,dx", "\\arctan x+C", "integrate(1/(1+x**2),x)", "atan(x)"],
  ["\\int\\sinh x\\,dx", "\\cosh x+C", "integrate(sinh(x),x)", "cosh(x)"],
  ["\\int\\cosh x\\,dx", "\\sinh x+C", "integrate(cosh(x),x)", "sinh(x)"],
  ["\\int\\frac{1}{\\sqrt{x^2+1}}\\,dx", "\\ln\\!\\left(x+\\sqrt{x^2+1}\\right)+C", "integrate(1/sqrt(x**2+1),x)", "log(x+sqrt(x**2+1))"],
  ["\\int\\frac{1}{a^2+x^2}\\,dx", "\\dfrac{1}{a}\\arctan\\dfrac{x}{a}+C", "integrate(1/(a**2+x**2),x)", "atan(x/a)/a"],
  ["\\int xe^x\\,dx", "(x-1)e^x+C", "integrate(x*exp(x),x)", "(x-1)*exp(x)"],
  ["\\int x\\sin x\\,dx", "\\sin x-x\\cos x+C", "integrate(x*sin(x),x)", "sin(x)-x*cos(x)"],
  ["\\int x\\cos x\\,dx", "\\cos x+x\\sin x+C", "integrate(x*cos(x),x)", "cos(x)+x*sin(x)"],
  ["\\int\\ln x\\,dx", "x\\ln x-x+C", "integrate(log(x),x)", "x*log(x)-x"],
  ["\\int xe^{x^2}\\,dx", "\\tfrac{1}{2}e^{x^2}+C", "integrate(x*exp(x**2),x)", "exp(x**2)/2"],
  ["\\int e^{ax}\\sin(bx)\\,dx", "\\dfrac{e^{ax}(a\\sin bx-b\\cos bx)}{a^2+b^2}+C", "integrate(exp(a*x)*sin(b*x),x)", "exp(a*x)*(a*sin(b*x)-b*cos(b*x))/(a**2+b**2)"],
  ["\\int\\frac{1}{\\sqrt{x^2-a^2}}\\,dx", "\\ln\\!\\left|x+\\sqrt{x^2-a^2}\\right|+C", "integrate(1/sqrt(x**2-a**2),x)", "log(Abs(x+sqrt(x**2-a**2)))"],
  ["\\int x^2 e^x\\,dx", "(x^2-2x+2)e^x+C", "integrate(x**2*exp(x),x)", "(x**2-2*x+2)*exp(x)"],
];

const GAMMA_CH2: RawFrag[] = [
  ["\\int\\ln^2 x\\,dx", "x(\\ln^2 x-2\\ln x+2)+C", "integrate(log(x)**2,x)", "x*(log(x)**2-2*log(x)+2)"],
  ["\\int\\frac{x}{(x+1)^2}\\,dx", "\\ln|x+1|+\\dfrac{1}{x+1}+C", "integrate(x/(x+1)**2,x)", "log(Abs(x+1))+1/(x+1)"],
  ["\\int\\sin^2 x\\,dx", "\\dfrac{x}{2}-\\dfrac{\\sin 2x}{4}+C", "integrate(sin(x)**2,x)", "x/2-sin(2*x)/4"],
  ["\\int\\cos^2 x\\,dx", "\\dfrac{x}{2}+\\dfrac{\\sin 2x}{4}+C", "integrate(cos(x)**2,x)", "x/2+sin(2*x)/4"],
  ["\\int\\sin^3 x\\,dx", "-\\cos x+\\dfrac{\\cos^3 x}{3}+C", "integrate(sin(x)**3,x)", "-cos(x)+cos(x)**3/3"],
  ["\\int\\tan^2 x\\,dx", "\\tan x-x+C", "integrate(tan(x)**2,x)", "tan(x)-x"],
  ["\\int\\sec^3 x\\,dx", "\\dfrac{\\sec x\\tan x+\\ln|\\sec x+\\tan x|}{2}+C", "integrate(sec(x)**3,x)", "(sec(x)*tan(x)+log(Abs(sec(x)+tan(x))))/2"],
  ["\\int\\frac{1}{x^2-a^2}\\,dx", "\\dfrac{1}{2a}\\ln\\left|\\dfrac{x-a}{x+a}\\right|+C", "integrate(1/(x**2-a**2),x)", "log(Abs((x-a)/(x+a)))/(2*a)"],
  ["\\int\\sqrt{a^2-x^2}\\,dx", "\\dfrac{x\\sqrt{a^2-x^2}}{2}+\\dfrac{a^2}{2}\\arcsin\\dfrac{x}{a}+C", "integrate(sqrt(a**2-x**2),x)", "x*sqrt(a**2-x**2)/2+a**2*asin(x/a)/2"],
  ["\\int\\frac{x}{x^2+1}\\,dx", "\\dfrac{1}{2}\\ln(x^2+1)+C", "integrate(x/(x**2+1),x)", "log(x**2+1)/2"],
  ["\\int\\frac{1}{x(x^2+1)}\\,dx", "\\ln|x|-\\dfrac{1}{2}\\ln(x^2+1)+C", "integrate(1/(x*(x**2+1)),x)", "log(Abs(x))-log(x**2+1)/2"],
  ["\\int e^x\\cos x\\,dx", "\\dfrac{e^x(\\sin x+\\cos x)}{2}+C", "integrate(exp(x)*cos(x),x)", "exp(x)*(sin(x)+cos(x))/2"],
  ["\\int\\arctan x\\,dx", "x\\arctan x-\\dfrac{1}{2}\\ln(1+x^2)+C", "integrate(atan(x),x)", "x*atan(x)-log(1+x**2)/2"],
  ["\\int\\arcsin x\\,dx", "x\\arcsin x+\\sqrt{1-x^2}+C", "integrate(asin(x),x)", "x*asin(x)+sqrt(1-x**2)"],
  ["\\int\\frac{\\ln x}{x^2}\\,dx", "-\\dfrac{\\ln x+1}{x}+C", "integrate(log(x)/x**2,x)", "-(log(x)+1)/x"],
  ["\\int\\sin x\\cos x\\,dx", "\\dfrac{\\sin^2 x}{2}+C", "integrate(sin(x)*cos(x),x)", "sin(x)**2/2"],
  ["\\int\\frac{x}{\\sqrt{1-x^2}}\\,dx", "-\\sqrt{1-x^2}+C", "integrate(x/sqrt(1-x**2),x)", "-sqrt(1-x**2)"],
  ["\\int x\\arctan x\\,dx", "\\dfrac{x^2+1}{2}\\arctan x-\\dfrac{x}{2}+C", "integrate(x*atan(x),x)", "(x**2+1)*atan(x)/2-x/2"],
  ["\\int\\frac{dx}{x^2+2x+5}", "\\dfrac{1}{2}\\arctan\\dfrac{x+1}{2}+C", "integrate(1/(x**2+2*x+5),x)", "atan((x+1)/2)/2"],
  ["\\int x^n\\ln x\\,dx", "\\dfrac{x^{n+1}}{n+1}\\!\\left(\\ln x-\\dfrac{1}{n+1}\\right)+C", "integrate(x**n*log(x),x)", "x**(n+1)*(log(x)/(n+1)-1/(n+1)**2)"],
  ["\\int\\frac{e^x-e^{-x}}{e^x+e^{-x}}\\,dx", "\\ln(e^x+e^{-x})+C", "integrate((exp(x)-exp(-x))/(exp(x)+exp(-x)),x)", "log(exp(x)+exp(-x))"],
  ["\\int\\frac{1}{\\sqrt{a^2-x^2}}\\,dx", "\\arcsin\\dfrac{x}{a}+C", "integrate(1/sqrt(a**2-x**2),x)", "asin(x/a)"],
  ["\\int\\frac{x^2+1}{x^2-1}\\,dx", "x+\\ln\\left|\\dfrac{x-1}{x+1}\\right|+C", "integrate((x**2+1)/(x**2-1),x)", "x+log(Abs((x-1)/(x+1)))"],
  ["\\int\\frac{1}{\\cos x}\\cdot\\frac{1}{\\sin x}\\,dx", "\\ln|\\tan x|+C", "integrate(1/(cos(x)*sin(x)),x)", "log(Abs(tan(x)))"],
  ["\\int x^2\\arctan x\\,dx", "\\dfrac{x^3-1}{3}\\arctan x-\\dfrac{x^2}{6}+\\dfrac{\\ln(1+x^2)}{6}+C\\!\\!", "integrate(x**2*atan(x),x)", "(x**3-1)*atan(x)/3-x**2/6+log(1+x**2)/6"],
];

const GAMMA_CH3: RawFrag[] = [
  ["\\int_0^1 x^n\\,dx", "\\dfrac{1}{n+1}", "integrate(x**n,(x,0,1))", "1/(n+1)"],
  ["\\int_0^{\\infty}e^{-x}\\,dx", "1", "integrate(exp(-x),(x,0,oo))", "1"],
  ["\\int_0^{\\infty}e^{-x^2}\\,dx", "\\dfrac{\\sqrt{\\pi}}{2}", "integrate(exp(-x**2),(x,0,oo))", "sqrt(pi)/2"],
  ["\\int_{-\\infty}^{\\infty}e^{-x^2}\\,dx", "\\sqrt{\\pi}", "integrate(exp(-x**2),(x,-oo,oo))", "sqrt(pi)"],
  ["\\int_0^{\\pi}\\sin x\\,dx", "2", "integrate(sin(x),(x,0,pi))", "2"],
  ["\\int_0^{2\\pi}\\sin^2 x\\,dx", "\\pi", "integrate(sin(x)**2,(x,0,2*pi))", "pi"],
  ["\\int_0^1\\frac{1}{\\sqrt{1-x^2}}\\,dx", "\\dfrac{\\pi}{2}", "integrate(1/sqrt(1-x**2),(x,0,1))", "pi/2"],
  ["\\int_0^{\\infty}\\frac{\\sin x}{x}\\,dx", "\\dfrac{\\pi}{2}", "integrate(sin(x)/x,(x,0,oo))", "pi/2"],
  ["\\int_0^1 x^{a-1}(1-x)^{b-1}\\,dx", "\\mathrm{B}(a,b)=\\dfrac{\\Gamma(a)\\Gamma(b)}{\\Gamma(a+b)}", "integrate(x**(a-1)*(1-x)**(b-1),(x,0,1))", "beta(a,b)"],
  ["\\int_0^{\\infty}t^{n-1}e^{-t}\\,dt", "\\Gamma(n)", "integrate(t**(n-1)*exp(-t),(t,0,oo))", "gamma(n)"],
  ["\\int_0^1\\frac{\\ln x}{1-x}\\,dx", "-\\dfrac{\\pi^2}{6}", "integrate(log(x)/(1-x),(x,0,1))", "-pi**2/6"],
  ["\\int_0^{\\infty}\\frac{x}{e^x-1}\\,dx", "\\dfrac{\\pi^2}{6}", "integrate(x/(exp(x)-1),(x,0,oo))", "pi**2/6"],
  ["\\int_0^{\\pi/2}\\ln(\\sin x)\\,dx", "-\\dfrac{\\pi\\ln 2}{2}", "integrate(log(sin(x)),(x,0,pi/2))", "-pi*log(2)/2"],
  ["\\int_0^1\\frac{\\ln(1+x)}{x}\\,dx", "\\dfrac{\\pi^2}{12}", "integrate(log(1+x)/x,(x,0,1))", "pi**2/12"],
  ["\\int_0^{\\infty}\\frac{\\cos(ax)}{1+x^2}\\,dx", "\\dfrac{\\pi}{2}e^{-a}\\;(a>0)", "integrate(cos(a*x)/(1+x**2),(x,0,oo))", "pi*exp(-a)/2"],
  ["\\int_0^{\\pi}x\\sin x\\,dx", "\\pi", "integrate(x*sin(x),(x,0,pi))", "pi"],
  ["\\int_0^{\\infty}e^{-ax}\\sin(bx)\\,dx", "\\dfrac{b}{a^2+b^2}", "integrate(exp(-a*x)*sin(b*x),(x,0,oo))", "b/(a**2+b**2)"],
  ["\\int_0^{\\infty}e^{-ax}\\cos(bx)\\,dx", "\\dfrac{a}{a^2+b^2}", "integrate(exp(-a*x)*cos(b*x),(x,0,oo))", "a/(a**2+b**2)"],
  ["\\int_0^1\\sqrt{x(1-x)}\\,dx", "\\dfrac{\\pi}{8}", "integrate(sqrt(x*(1-x)),(x,0,1))", "pi/8"],
  ["\\int_0^{\\infty}\\frac{\\ln x}{1+x^2}\\,dx", "0", "integrate(log(x)/(1+x**2),(x,0,oo))", "0"],
  ["\\int_0^{\\infty}x^n e^{-x^2}\\,dx", "\\dfrac{1}{2}\\Gamma\\!\\left(\\frac{n+1}{2}\\right)", "integrate(x**n*exp(-x**2),(x,0,oo))", "gamma((n+1)/2)/2"],
  ["\\int_0^{\\infty}\\frac{e^{-x}-e^{-ax}}{x}\\,dx", "\\ln a", "integrate((exp(-x)-exp(-a*x))/x,(x,0,oo))", "log(a)"],
  ["\\int_0^{\\pi/2}\\sin^m x\\cos^n x\\,dx", "\\dfrac{\\Gamma(\\frac{m+1}{2})\\Gamma(\\frac{n+1}{2})}{2\\,\\Gamma(\\frac{m+n+2}{2})}", "integrate(sin(x)**m*cos(x)**n,(x,0,pi/2))", "gamma((m+1)/2)*gamma((n+1)/2)/(2*gamma((m+n+2)/2))"],
  ["\\int_0^{\\infty}\\frac{x^{s-1}}{e^x-1}\\,dx", "\\Gamma(s)\\zeta(s)", "integrate(x**(s-1)/(exp(x)-1),(x,0,oo))", "gamma(s)*zeta(s)"],
  ["\\int_0^{2\\pi}e^{\\cos\\theta}\\cos(n\\theta)\\,d\\theta", "\\dfrac{2\\pi}{n!}", "integrate(exp(cos(t))*cos(n*t),(t,0,2*pi))", "2*pi/factorial(n)"],
];

// ═════════════════════════════════════════════════════════════════════════════
// Volume manifest
// ═════════════════════════════════════════════════════════════════════════════

export const VOLUMES: Volume[] = [
  {
    id: "alpha",
    symbol: "α",
    name: "Alpha",
    subtitle: "The Volume of Limits",
    leather: "#2d1008",
    accent: "#c8922a",
    bookText: "#f4d260",
    chapters: [
      { theme: "Algebraic & Rational Limits",    fragments: makeFragments(ALPHA_CH1) },
      { theme: "Trigonometric Limits",            fragments: makeFragments(ALPHA_CH2) },
      { theme: "Indeterminate Forms & L'Hôpital", fragments: makeFragments(ALPHA_CH3) },
    ],
  },
  {
    id: "delta",
    symbol: "Δ",
    name: "Delta",
    subtitle: "The Volume of Derivatives",
    leather: "#0b1e0e",
    accent: "#4aaa6c",
    bookText: "#a8e6c0",
    chapters: [
      { theme: "Fundamental Rules",                       fragments: makeFragments(DELTA_CH1) },
      { theme: "Product, Quotient & Chain Rules",         fragments: makeFragments(DELTA_CH2) },
      { theme: "Higher Order & Implicit Differentiation", fragments: makeFragments(DELTA_CH3) },
    ],
  },
  {
    id: "sigma",
    symbol: "Σ",
    name: "Sigma",
    subtitle: "The Volume of Summations",
    leather: "#0e0e26",
    accent: "#7a6ad8",
    bookText: "#c8c0f8",
    chapters: [
      { theme: "Finite Series & Closed Forms",     fragments: makeFragments(SIGMA_CH1) },
      { theme: "Infinite Series & Convergence",    fragments: makeFragments(SIGMA_CH2) },
      { theme: "Power Series & Taylor Expansions", fragments: makeFragments(SIGMA_CH3) },
    ],
  },
  {
    id: "gamma",
    symbol: "Γ",
    name: "Gamma",
    subtitle: "The Volume of Integrals",
    leather: "#18082a",
    accent: "#9a6ac8",
    bookText: "#d8b8f8",
    chapters: [
      { theme: "Basic Antiderivatives",              fragments: makeFragments(GAMMA_CH1) },
      { theme: "Integration Techniques",             fragments: makeFragments(GAMMA_CH2) },
      { theme: "Definite Forms & Special Integrals", fragments: makeFragments(GAMMA_CH3) },
    ],
  },
];
