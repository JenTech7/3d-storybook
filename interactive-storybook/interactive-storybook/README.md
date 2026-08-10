# The Girl Beyond the Window — Interactive 3D Storybook

A cinematic, book-like reading experience built with **Three.js, HTML, CSS, and vanilla JavaScript**. No React, no build step, no backend — open `index.html` (or host it) and read.

> "This isn't a website. This feels like a real book."

---

## Reading the book

- **Open Book** on the cover to begin.
- **Click** the right half of the screen (or press the **Next** control / **→**) to turn forward, the left half (or **Previous** / **←**) to turn back.
- **Drag or swipe** left/right on desktop or mobile.
- **Keyboard:** `→` next page · `←` previous page · `Home` first page · `End` last page · `Esc` close book.
- **Contents** jumps straight to any chapter.
- **Bookmark** saves your place (persists after refresh via `localStorage`); **Go to bookmark** returns to it.
- **Settings** control font size, Day/Sepia/Night reading mode, full/reduced page animation, and optional ambient sound (off by default — nothing plays until you choose it).

## Project structure

```text
interactive-storybook/
│
├── index.html            Page shell, controls, panels
├── style.css              Design system + themes + responsive layout
├── script.js               3D book engine (Three.js scene, page-turn physics, UI wiring)
├── story.js                 ALL story content — edit this file to change the book
├── manifest.json          PWA manifest
├── service-worker.js  Offline app-shell caching
├── README.md
│
├── assets/
│   ├── cover/cover-art.svg           Front cover illustration
│   ├── illustrations/*.svg            One illustration per chapter
│   └── audio/                                (reserved — ambient sound is currently generated, no files needed)
│
└── icons/                 PWA icons (SVG placeholders — swap for PNG/WebP any time)
```

## Editing the story

Everything narrative lives in **`story.js`**: title, author, and a `chapters` array. Each chapter has a `quote` (its "A Thought to Keep" reflection) and a `pages` array built from these page types:

| type            | what it renders                                   |
|-----------------|----------------------------------------------------|
| `chapter`       | Chapter-opening title page                          |
| `text`          | A page of story prose                               |
| `split`         | Prose + a supporting illustration                   |
| `illustration`  | A large single illustration with a caption          |
| `spread`        | One illustration across the full two-page spread    |
| `quote`         | Auto-generated from the chapter's `quote` field     |
| `ending`         | Closing reflection (used on the final chapter)     |

Add, remove, or reorder page objects freely — the book engine repaginates automatically, including the reading-progress indicator and table of contents.

## Replacing the artwork

The illustrations in `assets/illustrations/` and `assets/cover/` are original SVG placeholders in a consistent flat, warm, editorial style. To upgrade to painted/PNG/WebP artwork:

1. Add your image file anywhere under `assets/`.
2. Update the matching `illustration:` path in `story.js` (or `assets/cover/cover-art.svg` for the cover).
3. No other code changes are required — the texture loader accepts any browser-supported image format.

## Deploying to GitHub Pages

The project uses **relative paths throughout** (no leading `/`), so it works whether it's hosted at the domain root or at `username.github.io/repo-name/`. To deploy:

1. Push this folder to a GitHub repository.
2. In the repo settings, enable **GitHub Pages** for the branch/folder containing these files.
3. Visit the published URL — the book, its icons, and the offline service worker will all resolve correctly relative to that URL.

## Technology & constraints

- **Three.js** (loaded from cdnjs) renders the physical book: hardcover, spine, page-block thickness, and a hinge-rotated, curl-deformed page for every turn.
- Page **content textures** are generated on an offscreen `<canvas>` per page (typography + composited illustration), so text stays crisp and easy to re-theme (Day/Sepia/Night) without pre-baking images.
- **No React, no Node build step, no backend, no database, no login** — static files only.
- Respects `prefers-reduced-motion`: page turns become a quick fade/slide instead of a physical animation.
- Works fully offline once cached by the service worker.

## Browser support

Any modern desktop or mobile browser with WebGL. If WebGL is unavailable, the page shows a plain-text fallback message instead of a blank screen.
