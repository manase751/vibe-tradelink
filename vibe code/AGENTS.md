# Trade Link Prototype

## Project Overview

Trade Link is a three-page, front-end-only website prototype for suppliers, wholesalers, and small businesses. It demonstrates a business directory, simulated conversations, free and Pro plan messaging, and launch-update signup. All businesses, conversation content, plans, contact details, and numbers are placeholders.

The project intentionally uses plain HTML, CSS, and vanilla JavaScript. There are no frameworks, package manager, build process, backend, or application API. Keep it deployable as a static folder and usable by opening `index.html` in a browser.

## Files

- `index.html`: Homepage, featured businesses, plan comparison, launch-update form, and the cargo-ship hero image.
- `discover.html`: Searchable directory page with category, business-type, and location filters; sorting; business detail dialogs; and message actions.
- `about.html`: Mission, values, principles, founder placeholder, trust and safety copy, FAQ accordion, and launch-update form.
- `styles.css`: Shared design tokens, responsive layout, components, focus states, and reduced-motion handling.
- `app.js`: Shared header/footer/overlay rendering and client-side interactions for forms, directory filtering, detail and pricing dialogs, and chat.
- `data.js`: Editable placeholder business directory used by the homepage and Discover page.

## Running And Deploying

- Local preview: open `index.html` directly in a browser. A simple static file server is also suitable for testing.
- Hosting: deploy the project root as a static site on Cloudflare Pages or Netlify. No build command or framework preset is required; the published directory is the project root.
- The Fontshare stylesheet and homepage Unsplash hero image are remote assets. They require internet access; the CSS font stacks include local fallbacks.

## Design And Accessibility

- Preserve the minimal, high-contrast black-and-white design with the single vivid red accent `#E10600`, defined by the `--accent` CSS variable.
- Use Trench Slab for display text and General Sans for body and controls, with sensible fallbacks. Each page loads the same Fontshare stylesheet in its document head.
- Keep square corners, strong borders, generous spacing, responsive layouts, and visible focus outlines. Do not introduce frameworks, decorative stock imagery, or extra accent colors.
- Use semantic elements, labelled inputs, keyboard-operable controls, accessible dialogs, `aria-live` status regions, and meaningful alternative text for informative images. The FAQ uses native `<details>` and `<summary>` elements.
- Keep all three pages consistent with the shared header, footer, floating chat launcher, and overlay system.

## Existing Prototype Behavior

- `data.js` assigns the placeholder business array to `window.TRADE_LINK_DATA`. Each record includes a stable ID, type, category, location, short description, product tags, verification flag, longer profile copy, products, minimum order, contact method, and sort order.
- `app.js` renders business cards from that data. Directory search matches names, descriptions, products, categories, business types, and locations. Category filters can be combined; type and location filters, result counts, clear controls, and Newest/A-Z sorting are client-side.
- Business detail and Pro pricing use the shared native `<dialog>` modal. FAQ disclosures use native HTML details/summary controls.
- The chat drawer is a front-end simulation. It starts with placeholder conversations, adds canned replies after a short typing indicator, and stores its state in `localStorage` under `trade-link-chat-v1`. Storage access is wrapped in `try/catch`.
- `FREE_MESSAGE_LIMIT` in `app.js` controls the prototype's five-message limit. The upgrade action opens a placeholder Pro modal; it does not charge or subscribe.
- Email forms validate addresses in the browser, reject a filled honeypot, and display a success/error message. `submitEmail` currently logs the email to the console; it does not submit to a service.
- Header, footer, email-form markup, chat drawer, and dialogs are inserted by `app.js`; avoid duplicating their interaction logic in page files.

## Editing Guidance

- Update placeholder directory content in `data.js`, not in rendered card markup. Keep each business `id` unique and stable because conversations reference those IDs.
- Edit plan messaging and the Pro price in the HTML and pricing modal renderer as needed. Keep the free-message threshold in the single `FREE_MESSAGE_LIMIT` constant.
- Replace the founder name, role, and bio in `about.html`; update the hero image URL and alternative text in `index.html` when replacing the cargo-ship image.
- Search for `TODO:` comments before adding integrations. Mark future backend connection points clearly. In particular, email submission is marked in `submitEmail`.
- When adding integrations, keep credentials out of client-side files. A production backend should own authentication, business profiles, verification/report workflows, message delivery and persistence, subscription/payment state, and email signup processing. Real-time chat can replace the local simulation behind the existing conversation UI.
- Since there is no build or test runner, validate by opening each HTML page in a browser and checking navigation, responsive layout, filters, dialogs, email validation, and chat keyboard behavior. JavaScript syntax can be checked with `node --check app.js` and `node --check data.js` when Node.js is available.