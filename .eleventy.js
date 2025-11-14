// === 1. 導入 Node.js 核心模組 ===
const path = require("path");
const sass = require("sass");
const fs = require("fs");

// === 2. 導入 Eleventy 插件 ===
const Image = require("@11ty/eleventy-img");
const sitemap = require("@11ty/eleventy-plugin-sitemap"); // <-- 修正：移至頂部

// === 3. P2 圖片處理異步 Shortcode (v3 - 帶有錯誤日誌) ===
async function imageShortcode(src, alt, sizes, cssClass) {
  
  let cleanSrc = src.startsWith('/') ? src.substring(1) : src;

  try {
    let metadata = await Image(cleanSrc, {
      widths: [400, 800, 1200], 
      formats: ["webp", "auto"], 
      outputDir: "./_site/assets/img-processed/",
      urlPath: "/assets/img-processed/",
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w-${id}.${format}`;
      }
    });

    let imageAttributes = {
      class: cssClass,
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    return Image.generateHTML(metadata, imageAttributes, {
      whitespaceMode: "inline" 
    });

  } catch (e) {
    console.error(`[Eleventy-Img-Error] 處理圖片失敗： ${src}`);
    console.error(`[Eleventy-Img-Error] 原始錯誤： ${e.message}`);
    throw new Error(`[Eleventy-Img] 處理圖片時出錯，來源: [${src}]. \n原始錯誤: ${e.message}`);
  }
}

// === 4. Eleventy 主設定 (唯一的 module.exports) ===
module.exports = function(eleventyConfig) {

  // === 註冊插件 (Plugins) ===
  eleventyConfig.addPlugin(sitemap, { // <-- 修正：合併於此
    sitemap: {
      hostname: "https://www.goldenyearsphoto.com", // <-- 修正：加入 https://
    }
  });

  // === 註冊 Shortcodes ===
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  // === 自動編譯 Sass 的核心邏輯 ===
  const scssInputPath = "assets/css";
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    compile: async function(inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) {
        return;
      }
      let result = sass.compileString(inputContent, {
        loadPaths: [scssInputPath],
        style: "expanded" 
      });
      return async (data) => {
        return result.css;
      };
    }
  });

  // === 檔案複製 (Passthrough Copy) ===
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("assets/images/ui"); 
  eleventyConfig.addPassthroughCopy("assets/js");
  eleventyConfig.addPassthroughCopy("robots.txt");
  // eleventyConfig.addPassthroughCopy("sitemap.xml"); // <-- 修正：此行已刪除
  eleventyConfig.addPassthroughCopy("favicon.ico");
  
  // === 監聽 (Watch) ===
  eleventyConfig.addWatchTarget("assets/css/");


  // === Eleventy 設定 (Return 必須是最後) ===
  return {
    dir: {
      input: ".", 
      includes: "_includes", 
      layouts: "_includes",
      data: "_data", 
      output: "_site" 
    },
    passthroughFileCopy: true,
    templateFormats: ["njk", "md", "html", "scss"], 
  };
};