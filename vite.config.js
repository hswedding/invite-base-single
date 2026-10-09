import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { site } from './src/data.js'

// Single-page wedding invitation. No router, no SSR — mirrors the Invifest reference.

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Writes the page title, description, link-preview tags, robots and the
 *  optional Cloudflare Web Analytics beacon into index.html from `site` in
 *  src/data.js, so a new couple only edits data.js. (Restart `npm run dev`
 *  after changing `site` — the dev server reads it once.) */
function siteMeta() {
  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      const tags = [
        `<meta name="theme-color" content="${esc(site.themeColor)}" />`,
        `<title>${esc(site.title)}</title>`,
        `<meta name="description" content="${esc(site.description)}" />`,
        site.noindex && `<meta name="robots" content="noindex, nofollow" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:title" content="${esc(site.shareTitle)}" />`,
        `<meta property="og:description" content="${esc(site.shareDescription)}" />`,
        `<meta property="og:image" content="${esc(site.shareImage)}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${esc(site.shareTitle)}" />`,
        `<meta name="twitter:description" content="${esc(site.shareDescription)}" />`,
        `<meta name="twitter:image" content="${esc(site.shareImage)}" />`,
        site.cloudflareAnalyticsToken &&
          `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: site.cloudflareAnalyticsToken })}'></script>`,
      ].filter(Boolean)
      return html.replace('<!--SITE_META-->', tags.join('\n    '))
    },
  }
}

export default defineConfig({
  plugins: [react(), siteMeta()],
  server: {
    host: true,
    port: 5173,
    // Ignore Visual Studio's .vs index (locks .vsidx files → EBUSY watcher crash) and VCS dirs.
    watch: { ignored: ['**/.vs/**', '**/.git/**', '**/.wrangler/**'] },
  },
  build: { target: 'es2020', cssCodeSplit: false },
})
