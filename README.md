# TechSavvi Group website

Static multi-page site: plain HTML + Tailwind CSS (compiled, not the CDN) + a small JS file.

## Run locally
```bash
npm install
npm run build        # outputs to dist/
npx serve dist       # preview at http://localhost:3000
```

## Deploy on Vercel
Push this folder to GitHub and import it in Vercel. `vercel.json` already sets
build command `npm run build` and output directory `dist`.

## Where things live
| What | File |
|---|---|
| Phone, WhatsApp, address, site URL, form endpoints | `site.config.json` |
| Pages | `src/pages/*.html` (front matter at the top sets title, description, URL) |
| Header / footer / `<head>` | `src/partials/` |
| Styles | `src/css/input.css` + `tailwind.config.js` |
| Scripts (menu, forms) | `src/js/main.js` |
| Images, favicon, social preview | `public/assets/` |

Use `{{phone}}`, `{{whatsapp}}`, `{{address}}` etc. in any page to insert values from `site.config.json`.

## Before launch: search for `TODO`
- Business email (footer + contact page)
- Course duration, format, fee (₦) and start dates (academy page)
- Team members and photos (about page)
- CAC number, social links, opening hours
- Confirm clients are happy to be named on the Work page
- When you get a custom domain, change `url` in `site.config.json` and rebuild
