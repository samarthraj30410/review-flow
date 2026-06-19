# ReviewFlow Landing Page

ReviewFlow is a landing page built for custom, serverless customer review and feedback systems tailored for local businesses.

## Tech Stack & Architecture

- **Static Pages:** Vanilla HTML5, CSS3, and JavaScript.
- **Routing & Proxying:** Cloudflare nameservers map traffic to serverless edge workers.
- **Data Logging:** Webhooks route incoming review payloads in real-time straight to private Google Sheets via Apps Script webhooks (no server or database overhead).
- **Hosting:** Globals CDN and Vercel edge network.

## Brand Logo & Favicons Configuration

The brand logo assets are located in the `/assets/` directory:
- `favicon.svg`: The primary SVG brand logo (transparent background).
- `apple-touch-icon.png`: Apple touch icon for mobile shortcuts.
- `favicon-96x96.png` & `favicon.ico`: Desktop and browser tab icons.
- `site.webmanifest`: Web manifest file with icon configurations for progressive web app installations.

All pages (`index.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html`) have the favicon header links configured and reference the main logo in both the navigation bar and footer.

## Directory Structure & Subpages

- **`index.html`**: The main product landing page, features, workflows, and interactive mockup spreadsheet.
- **`about.html`**: The About Us page, detailing Greenwood Cafe's background, why serverless, and core design values.
- **`contact.html`**: Direct support inquiry and templates ordering form page.
- **`privacy.html`** & **`terms.html`**: Legal policies and zero-maintenance serverless data privacy terms.
