// === 1. 導入 Node.js 核心模組 ===
const path = require("path");
const sass = require("sass");
const fs = require("fs");

// === 2. 導入 Eleventy 插件 ===
const Image = require("@11ty/eleventy-img");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");

// === 3. 圖片處理異步 Shortcode ===
async function imageShortcode(src, alt, sizes, cssClass) {
  const cleanSrc = src.startsWith("/") ? src.substring(1) : src;
  const resolvedSizes = sizes || "100vw";

  try {
    const metadata = await Image(cleanSrc, {
      widths: [400, 800, 1200],
      formats: ["webp", "auto"],
      outputDir: "./_site/assets/img-processed/",
      urlPath: "/assets/img-processed/",
      filenameFormat(id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w-${id}.${format}`;
      },
    });

    const imageAttributes = {
      class: cssClass,
      alt,
      sizes: resolvedSizes, // ✅ 用我們剛剛的 resolvedSizes
      loading: "lazy",
      decoding: "async",
    };

    return Image.generateHTML(metadata, imageAttributes, {
      whitespaceMode: "inline",
    });
  } catch (e) {
    console.error(`[Eleventy-Img-Error] 處理圖片失敗： ${src}`);
    console.error(`[Eleventy-Img-Error] 原始錯誤： ${e.message}`);
    throw new Error(
      `[Eleventy-Img] 處理圖片時出錯，來源: [${src}]. \n原始錯誤: ${e.message}`
    );
  }
}

// === 4. Eleventy 主設定 (唯一的 module.exports) ===
module.exports = function (eleventyConfig) {
  // 插件：sitemap
  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: "https://www.goldenyearsphoto.com",
    },
  });

  // Shortcode：image
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  // Sass 編譯
  const scssInputPath = "assets/css";
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    async compile(inputContent, inputPath) {
      const parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) return; // partial 不輸出

      const result = sass.compileString(inputContent, {
        loadPaths: [scssInputPath],
        style: "expanded",
      });
      return async () => result.css;
    },
  });

  // 靜態檔案複製
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("assets/images/ui");
  eleventyConfig.addPassthroughCopy("assets/js");
  eleventyConfig.addPassthroughCopy("robots.txt");
  // ❌ 不再複製 sitemap.xml，讓 plugin 產生
  // eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // 監聽（依你的實際路徑調整，若 SCSS 在 assets/css，建議用這個）
  eleventyConfig.addWatchTarget("assets/css/");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_includes",
      data: "_data",
      output: "_site",
    },
    passthroughFileCopy: true,
    templateFormats: ["njk", "md", "html", "scss"],
  };
};
