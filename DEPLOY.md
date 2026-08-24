# Deploying to Cloudflare Pages

Three things get set up, once each:

1. The Pages project that builds and serves the site
2. `jointheresonance.com` pointed at it
3. A tiny Cloudflare Worker that lets the CMS sign you in with GitHub

---

## 1. The Pages project — done

Already created and building from `michevanessen/resonance`, production branch
`main`. Live at **https://resonance-161.pages.dev**.

Settings in use:

| Field                  | Value           |
| ---------------------- | --------------- |
| Build command          | `npm run build` |
| Build output directory | `_site`         |
| Production branch      | `main`          |
| `NODE_VERSION`         | `22`            |

Every push to `main` triggers a rebuild — roughly two minutes, most of it
Eleventy Image processing the photos.

`_headers` and `_redirects` in the output are picked up automatically — that's
where the security headers, cache rules, and the redirects from the old
`/about.html`-style URLs live.

### A note on the two CSP headers

Cloudflare Pages sends **every** matching `_headers` rule, so `/admin/` gets
both the `/*` policy and the `/admin/*` one. Browsers enforce each policy
separately, meaning the effective policy is their *intersection*. If you edit
`src/static/_headers`, anything the CMS needs (`https://api.github.com`,
`blob:`, `frame-src 'self'`) must be present in **both** rules or the CMS
breaks.

## 2. Point the domain at it

The zone `jointheresonance.com` is added to Cloudflare on the Free plan, and
all six DNS records were imported and checked against Hover:

| Type  | Name                | Value                                                   | Proxy    |
| ----- | ------------------- | ------------------------------------------------------- | -------- |
| MX 10 | `@`                 | `mx01.mail.icloud.com`                                   | DNS only |
| MX 10 | `@`                 | `mx02.mail.icloud.com`                                   | DNS only |
| TXT   | `@`                 | `v=spf1 include:icloud.com ~all`                         | DNS only |
| TXT   | `@`                 | `apple-domain=JMbg8MdDCl20a6R6`                          | DNS only |
| CNAME | `sig1._domainkey`   | `sig1.dkim.jointheresonance.com.at.icloudmailadmin.com`  | DNS only |
| CNAME | `www`               | `michevanessen.github.io` *(replaced by Pages)*          | Proxied  |

The first five are what keep `@jointheresonance.com` email working — four of
them are iCloud Mail's, and the DKIM CNAME **must stay DNS only**. Proxying it
would make Cloudflare answer with its own IPs instead of resolving to iCloud,
and outbound mail would stop being signed.

**Step you do at Hover:** replace the nameservers with

```
chloe.ns.cloudflare.com
porter.ns.cloudflare.com
```

removing `ns1.hover.com` and `ns2.hover.com`. Activation takes anywhere from a
few minutes to a few hours.

**After activation**, in the Pages project → **Custom domains**, add both
`jointheresonance.com` and `www.jointheresonance.com`. Cloudflare rewrites the
`www` record and adds the apex itself.

Then in the GitHub repo, **Settings → Pages** → source **None**, so GitHub
Pages stops serving a stale copy.

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

### Editing before the Worker exists

The CMS also offers **Sign In Using Access Token**. Create a GitHub personal
access token with `repo` scope (**Settings → Developer settings → Personal
access tokens**) and paste it in — that works today, no Worker required. The
Worker is the nicer long-term option because editors never handle a token.

## Adding an editor

Give them write access to the GitHub repo (**Settings → Collaborators**). They
sign in at `/admin/` with their own GitHub account — no separate CMS accounts.

## Rollback

Pages keeps every deployment. Project → **Deployments** → pick a previous one →
**Rollback**. Content changes are git commits, so `git revert` works too.
