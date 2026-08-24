export default {
  // Absolute canonical + OG URLs for every page, derived once.
  canonical: (data) => new URL(data.page.url, data.site.url).href,
  ogImageUrl: (data) =>
    new URL(data.ogImage || data.site.ogImage, data.site.url).href,
};
