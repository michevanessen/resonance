# Deploying to Cloudflare Pages

Three things get set up, once each:

1. The Pages project that builds and serves the site
2. `jointheresonance.com` pointed at it
3. A tiny Cloudflare Worker that lets the CMS sign you in with GitHub

---

## 1. Create the Pages project

Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
**Connect to Git** → pick `michevanessen/resonance`.

Build settings:

| Field                  | Value           |
| ---------------------- | --------------- |
| Framework preset       | Eleventy        |
| Build command          | `npm run build` |
| Build output directory | `_site`         |
| Root directory         | *(leave blank)* |

Add one environment variable so Cloudflare uses a current Node:

| Variable       | Value |
| -------------- | ----- |
| `NODE_VERSION` | `22`  |

Save and deploy. First build takes 2–3 minutes (Eleventy Image processes every
photo); later builds are faster. The result lands on `resonance.pages.dev`.

`_headers` and `_redirects` in the output are picked up automatically — that's
where the security headers, cache rules, and the redirects from the old
`/about.html`-style URLs live.

## 2. Point the domain at it

In the Pages project → **Custom domains** → **Set up a custom domain**.

Add **both**:

- `jointheresonance.com`
- `www.jointheresonance.com`

If the domain's DNS is already on Cloudflare, records are created for you.
If it is registered elsewhere, Cloudflare shows the CNAME to add at the
registrar.

**Before switching DNS**, check where the domain currently points — the repo
previously served from GitHub Pages, and email for `@jointheresonance.com`
must keep working. Do not delete existing `MX` or `TXT` records.

Once the custom domain is live, in the GitHub repo go to
**Settings → Pages** and set the source to **None**, so GitHub Pages stops
serving a stale copy.

## 3. CMS sign-in (GitHub OAuth via a Worker)

Sveltia CMS commits to GitHub as you, so it needs an OAuth app plus a small
relay Worker. Cloudflare's own template does the relay.

**a. Deploy the auth Worker**

```bash
git clone https://github.com/sveltia/sveltia-cms-auth.git
cd sveltia-cms-auth
npx wrangler deploy
```

Give it a custom domain of `auth.jointheresonance.com` (Worker → Settings →
Domains & Routes → Add custom domain). That hostname is already what
`src/admin/config.yml` points at via `base_url`; change the file if you use a
different one.

**b. Create the GitHub OAuth app**

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**:

| Field                      | Value                                             |
| -------------------------- | ------------------------------------------------- |
| Application name           | The Resonance CMS                                 |
| Homepage URL               | `https://jointheresonance.com`                    |
| Authorization callback URL | `https://auth.jointheresonance.com/callback`      |

Generate a client secret.

**c. Give the Worker the credentials**

In the Worker → **Settings → Variables**, add as **encrypted** secrets:

| Name                   | Value                                        |
| ---------------------- | -------------------------------------------- |
| `GITHUB_CLIENT_ID`     | from the OAuth app                           |
| `GITHUB_CLIENT_SECRET` | from the OAuth app                           |
| `ALLOWED_DOMAINS`      | `jointheresonance.com`                       |

`ALLOWED_DOMAINS` is what stops anyone else's site from using your Worker to
mint tokens. Do not leave it unset.

Then open <https://jointheresonance.com/admin/> and sign in.

## Adding an editor

Give them write access to the GitHub repo (**Settings → Collaborators**). They
sign in at `/admin/` with their own GitHub account — no separate CMS accounts.

## Rollback

Pages keeps every deployment. Project → **Deployments** → pick a previous one →
**Rollback**. Content changes are git commits, so `git revert` works too.
