// 導入 Node.js 的核心模組
const path = require("path");
const sass = require("sass");
const fs = require("fs");

// === 導入 P2 核心工具 ===
const Image = require("@11ty/eleventy-img");

// === P2 圖片處理異步 Shortcode (v3 - 帶有錯誤日誌) ===
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


// === Eleventy 主設定 (唯一的 module.exports) ===
module.exports = function(eleventyConfig) {

  // === P2 註冊圖片 Shortcode ===
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
  
  // 【 ⬇️ 這是修正後的位置 ⬇️ 】
  // 複製SOP轉址檔案
  eleventyConfig.addPassthroughCopy("_redirects");

  // 複製其他靜態資源
  eleventyConfig.addPassthroughCopy("assets/images/ui"); 
  eleventyConfig.addPassthroughCopy("assets/js");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  // ===============================================

  // === 監聽 (Watch) ===
  eleventyConfig.addWatchTarget("src/scss/");


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