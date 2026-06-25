# ReviewFlo Landing Page

ReviewFlo is a landing page built for custom, serverless customer review and feedback systems tailored for local businesses.

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
- **`/templates/`**: Storefront feedback system layouts ready to edit and deploy for clients.
  - **`/templates/hotel/`**: High-end luxury guest review template (champagne gold theme).
    - `index.html`: Fully interactive guest review portal structured in 3 stages (rating, choice options/redirection, private feedback).
    - `style.css`: Obsidian-themed style layout featuring ambient radial gradients, glassmorphism card panels, and custom star animations.
    - `app.js`: Logic script routing ratings, custom event handlers, and data webhook dispatcher.

## Customizing Templates

To configure templates for a storefront, modify the settings in the header of the template's Javascript logic (e.g. `app.js`):

1. **Redirection URL**: Provide the custom Google Places / TripAdvisor links for positive ratings ($\ge 4$ stars).
2. **Webhook Endpoint**: Insert the target URL of the Google Sheets Apps Script Webhook. When a grievance ($\le 3$ stars) is filled out, the template automatically posts review metadata to the sheet.
