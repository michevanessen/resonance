import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default function (eleventyConfig) {
  // Static assets copied through untouched. Images are handled by the image
  // transform plugin below, but the originals still ship so that CMS-authored
  // references and social-card URLs resolve.
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  // Sveltia CMS is vendored from node_modules rather than a CDN: the admin
  // page then needs no third-party script origin in its CSP, and the CMS
  // version is pinned by package-lock.
  eleventyConfig.addPassthroughCopy({
    "node_modules/@sveltia/cms/dist/sveltia-cms.js": "admin/sveltia-cms.js",
  });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  // The CMS shell is copied verbatim; Eleventy must not treat it as a template.
  eleventyConfig.ignores.add("src/admin/**");

  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  // Every <img> in the output HTML gets responsive variants, explicit
  // width/height (no layout shift) and AVIF/WebP sources.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["avif", "webp"],
    widths: [400, 800, 1200, "auto"],
    outputDir: "./_site/assets/optimized/",
    urlPath: "/assets/optimized/",
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "(max-width: 768px) 100vw, 50vw",
    },
  });

  // Ordered collections so the CMS can reorder without touching templates.
  const byOrder = (a, b) => (a.data.order ?? 99) - (b.data.order ?? 99);
  eleventyConfig.addCollection("team", (api) =>
    api.getFilteredByGlob("src/content/team/*.md").sort(byOrder)
  );
  eleventyConfig.addCollection("services", (api) =>
    api.getFilteredByGlob("src/content/services/*.md").sort(byOrder)
  );

  eleventyConfig.addFilter("absoluteUrl", (path, base) =>
    new URL(path, base).href
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
