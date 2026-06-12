# 🏛️ Codex Mathematica: The Grand Archive

*A digital sanctuary for mathematical preservation and study.*

**Codex Mathematica** is a high-performance, serverless Next.js web application designed for scholars to solve, document, and archive over 600 calculus problems. Built with a deeply atmospheric "dark academia" aesthetic, the platform combines a distraction-free writing environment with real-time mathematical typesetting and cloud persistence.

---

## 📜 Core Features

* **The Interactive Grimoire:** A custom markdown editor that parses live mathematical notation. Write complex proofs in standard LaTeX, and watch them render instantly into beautiful, centered equations using KaTeX.
* **The Cloud Vault (Firebase):** Never lose a calculation. Secure authentication (Google, GitHub, and Email) paired with Firestore ensures that every "Conquered" fragment is permanently synced to the cloud.
* **Dual-Environment Scriptorium:** Study in the default "Candlelit" dark oak theme, or flip the toggle in your profile to switch to the "Sunlit Scriptorium"—a high-contrast, parchment-cream light mode.
* **Academic Manuscript Export:** Generate and download your completed proofs. Export raw Markdown for data backup, or generate a beautifully typeset, Cambridge-style Academic PDF (complete with a title page, volume watermarks, and table of contents).
* **Deep Archive Mode (PWA):** Install the Archive directly to your desktop or mobile device. Cache the 600-fragment registry and work entirely offline when deep in the stacks; your proofs will sync automatically upon your return to Wi-Fi.
* **Frictionless Mobile Layout:** A responsive architecture that gracefully transitions the side-by-side desktop ledger into a fluid, stacked mobile experience with sliding overlay cards.

---

## 🛠️ Architecture & Stack

This project is built on a modern, edge-ready React stack:

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & Auth:** [Firebase / Firestore](https://firebase.google.com/)
* **Math Rendering:** [KaTeX](https://katex.org/) via `react-markdown`, `remark-math`, and `rehype-katex`
* **Offline Support:** `next-pwa`

---

## 🗝️ Unlocking the Archive (Local Setup)

To run the Grand Archive locally on your own machine, follow these steps:

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/codex-mathematica.git](https://github.com/your-username/codex-mathematica.git)
cd codex-mathematica

2. Install Dependencies
Bash

npm install

3. Forge the Environment Vault

Create a .env.local file in the root directory and populate it with your Firebase project credentials:
Code snippet

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

4. Ignite the Server
Bash

npm run dev

Navigate to http://localhost:3000 in your browser. The library doors are now open.  
📚 The Curriculum Structure

The Archive is divided into four main volumes, pulling from a structured JSON registry:

    Volume Alpha (α): Limits and Continuity

    Volume Delta (Δ): Differential Calculus

    Volume Sigma (Σ): Integral Calculus & Summations

    Volume Gamma (Γ): Advanced Techniques & Series

Each volume contains indexed chapters, and each chapter contains specific fragments (problems) for the scholar to conquer.
🖋️ LaTeX Scribing Rules

When writing in the Grimoire, use standard Markdown for prose and bullet points. For mathematics:

    Inline Math: Wrap your equations in single dollar signs: $e^{i\pi} + 1 = 0$

    Display Math: Ensure double dollar signs are on their own lines for large, centered blocks:

Markdown

$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

    "Differentiating a constant gives you 0, so the antiderivative must of course give you the constant." — Fragment 451