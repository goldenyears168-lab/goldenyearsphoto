// === 1. Node.js 核心模組 ===
const path = require("path");
const sass = require("sass");
const fs = require("fs");
require("dotenv").config();

// === 2. Eleventy 插件 ===
const Image = require("@11ty/eleventy-img");
// （現在不使用任何 sitemap 外掛，由 sitemap.xml.njk 自己產出）

// === 3. 圖片處理 Shortcode（保留給非 R2 的情境用，例如 UI logo 等） ===
async function imageShortcode(src, alt, sizes, cssClass) {
  // 確保路徑沒有多餘的前導斜線
  const cleanSrc = src.startsWith("/") ? src.substring(1) : src;

  // 沒有傳 sizes 就給一個安全預設值，避免 Missing `sizes` 錯誤
  const resolvedSizes = sizes || "100vw";

  try {
    const metadata = await Image(cleanSrc, {
      widths: [400, 800, 1200],
      formats: ["webp", "auto"],
      outputDir: "./_site/assets/img-processed/",
      urlPath: "/assets/img-processed/",
      filenameFormat(id, src, width, format) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w-${id}.${format}`;
      },
    });

    const imageAttributes = {
      class: cssClass,
      alt: alt || "",
      sizes: resolvedSizes,
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

// === 4. Eleventy 主設定（唯一的 module.exports） ===
module.exports = function (eleventyConfig) {
  const rawR2Base = process.env.R2_PUBLIC_BASE_URL || "";
  // 移除尾端多餘的 `/`，避免之後變成 //portfolio/...
  const r2Base = rawR2Base.replace(/\/+$/, "");

  // 4.1 圖片 URL Filter：把相對路徑轉成 R2 / 或本機 assets
  //
  // 使用方式（在 Nunjucks 模板裡）：
  //   <img src="{{ 'portfolio/korean-id/korean-id-1.jpg' | r2img }}" ...>
  //
  eleventyConfig.addNunjucksFilter("r2img", function (relativePath) {
    if (!relativePath) return "";

    // 允許傳入：
    // - "portfolio/xxx.jpg"
    // - "/portfolio/xxx.jpg"
    // - "/assets/images/portfolio/xxx.jpg"
    let cleanPath = String(relativePath);

    // 如果帶了 /assets/images/，先砍掉這一段
    cleanPath = cleanPath.replace(/^\/?assets\/images\//, "");
    // 再把開頭多餘的 / 拿掉
    cleanPath = cleanPath.replace(/^\/+/, "");

    if (!r2Base) {
      // 沒設定 R2_PUBLIC_BASE_URL 時，回退到本機 assets/images
      return "/assets/images/" + cleanPath;
    }

    // 正常情況：用 R2 公開網址
    return `${r2Base}/${cleanPath}`;
  });

  // 4.2 圖片 shortcode（目前給非 R2 圖用，或之後想做 local responsive 用）
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  // 4.3 ✅ 只給 Sitemap 用的 Page 集合
  eleventyConfig.addCollection("pagesForSitemap", (collectionApi) => {
    return collectionApi.getAll().filter((item) => {
      const url = item.url;
      if (!url) return false;

      // 排除靜態資產與報告
      if (url.startsWith("/assets/")) return false; // CSS, JS, images…
      if (url.startsWith("/127.0.0.1_")) return false; // lighthouse / report
      if (url.includes(".report/")) return false;

      // 排除明確是檔案副檔名的東西 (Sitemap 只需要頁面)
      if (url.endsWith(".css")) return false;
      if (url.endsWith(".js")) return false;
      if (url.endsWith(".json")) return false;
      if (url.endsWith(".xml")) return false;

      // 排除 sitemap.xml 本身
      if (url === "/sitemap.xml") return false;

      // 其餘視為正常頁面
      return true;
    });
  });

  // 4.4 Sass 編譯（Eleventy v2 的 addExtension 寫法）
  const scssInputPath = "assets/css";
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    async compile(inputContent, inputPath) {
      const parsed = path.parse(inputPath);
      // 以 _ 開頭的 partial 不輸出獨立檔案
      if (parsed.name.startsWith("_")) return;

      const result = sass.compileString(inputContent, {
        loadPaths: [scssInputPath],
        style: "expanded",
      });

      return async () => result.css;
    },
  });

  // 4.5 靜態檔案複製
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("assets/images/ui");
  eleventyConfig.addPassthroughCopy("assets/js");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // 4.6 監聽 SCSS 變更
  eleventyConfig.addWatchTarget("assets/css/");

  // 4.7 提供給 sitemap.xml.njk 使用的日期 Filter
  eleventyConfig.addFilter("dateToISO", function (value) {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString();
  });

  // 4.8 Eleventy 輸出設定
  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_includes",
      data: "_data",
      output: "_site",
    },
    passthroughFileCopy: true,
    // 要讓 sitemap.xml.njk 正確輸出 XML，一定要包含 'xml'
    templateFormats: ["njk", "md", "html", "scss", "xml"],
  };
};
