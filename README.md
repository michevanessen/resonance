# The Resonance

Marketing site for The Resonance, built with [Eleventy](https://www.11ty.dev/)
and edited through [Sveltia CMS](https://github.com/sveltia/sveltia-cms).
Hosted on Cloudflare Pages at <https://jointheresonance.com>.

## Quick start

```bash
npm install
npm start          # http://localhost:8080, live reload
npm run build      # static output in _site/
```

## How the content is organised

Nothing about the site is edited as raw HTML. Templates render content files:

| What                                  | Lives in                    | Edited in the CMS as |
| ------------------------------------- | --------------------------- | -------------------- |
| Home / About / Services / Contact copy | `src/content/pages/*.md`    | **Pages**            |
| The six team members                   | `src/content/team/*.md`     | **Team members**     |
| The seven service blocks               | `src/content/services/*.md` | **Services**         |
| Site name, URL, email, nav             | `src/_data/site.json`       | code only            |

Templates live in `src/_includes/` — `layouts/base.njk` holds the `<head>`,
header and footer; one layout per page type renders that page's fields.

## Editing content

Go to <https://jointheresonance.com/admin/> and sign in with GitHub. Saving
commits to `main`, and Cloudflare Pages rebuilds within about a minute.

To run the CMS against local files instead of GitHub:

```bash
npx @sveltia/cms-proxy-server   # terminal 1
npm start                       # terminal 2, then open /admin/
```

## Images

Drop originals in `src/assets/img/`. The Eleventy Image transform generates
AVIF and WebP at 400/800/1200/original widths and writes `width`/`height` onto
every `<img>`, so nothing needs doing by hand.

If a source image is very large, cap it once:

```bash
npm run optimize:src
```

## Deploying

See [DEPLOY.md](DEPLOY.md).
