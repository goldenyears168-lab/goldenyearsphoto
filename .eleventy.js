// 導入 Node.js 的核心模組
const path = require("path");
const sass = require("sass");
const fs = require("fs");

// === 導入 P2 核心工具 ===
const Image = require("@11ty/eleventy-img");

// === P2 圖片處理異步 Shortcode (v3 - 帶有錯誤日誌) ===
async function imageShortcode(src, alt, sizes, cssClass) {
  
  // (v2 的修復行)
  let cleanSrc = src.startsWith('/') ? src.substring(1) : src;

  // 【 ⬇️ 這是新增的 try...catch 錯誤處理 ⬇️ 】
  try {
    // 1. 取得圖片元數據
    let metadata = await Image(cleanSrc, { // <== 確保這裡使用的是 cleanSrc
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

    // 2. 設定 <img> 標籤的屬性
    let imageAttributes = {
      class: cssClass,
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    // 3. 回傳 Eleventy 自動生成的 <picture> 標籤 HTML
    return Image.generateHTML(metadata, imageAttributes, {
      whitespaceMode: "inline" 
    });

  } catch (e) {
    // 【 ⬇️ 新的錯誤日誌 ⬇️ 】
    console.error(`[Eleventy-Img-Error] 處理圖片失敗： ${src}`);
    console.error(`[Eleventy-Img-Error] 原始錯誤： ${e.message}`);
    // 拋出一個更清晰的錯誤，Eleventy 會捕獲它
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
  
  // 僅複製 UI 相關圖片
  eleventyConfig.addPassthroughCopy("assets/images/ui"); 
  eleventyConfig.addPassthroughCopy("assets/js");

  // === 【重要】從第二個區塊合併過來的 Passthrough ===
  // 確保這兩個檔案確實存在於您的專案根目錄
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