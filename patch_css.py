import re

with open("src/app/globals.css", "r") as f:
    content = f.read()

# Remove codex-fade-in
content = re.sub(r'/\* ── View transition ──.*?.codex-view \{\s*animation: codex-fade-in.*?\n\}\n', '', content, flags=re.DOTALL)

# Replace Book Page Curl
curl_regex = re.compile(r'/\* ── Book Page Curl ──.*?/\* ── Sunlit Scriptorium \(Light Mode\) ──', re.DOTALL)

new_curl = """/* ── True 3D Book Page Curl ───────────────────────────────────────── */
.book-spine {
  perspective: 2500px;
  perspective-origin: center center;
}

.book-page-flipper {
  transform-style: preserve-3d;
  will-change: transform;
}

.book-page-flipper.left {
  transform-origin: right center;
}

.book-page-flipper.right {
  transform-origin: left center;
}

.book-page-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}

.book-page-face.back {
  transform: rotateY(180deg);
}

@keyframes turn-page-right-to-left {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(-180deg); }
}

@keyframes turn-page-left-to-right {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(180deg); }
}

.anim-flip-next {
  animation: turn-page-right-to-left 0.6s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
}

.anim-flip-prev {
  animation: turn-page-left-to-right 0.6s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
}

/* ── Sunlit Scriptorium (Light Mode) ──"""

content = curl_regex.sub(new_curl, content)

with open("src/app/globals.css", "w") as f:
    f.write(content)
