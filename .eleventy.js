// === 1. Node.js 核心模組 ===
const path = require("path");
const fs = require("fs");
const postcss = require("postcss");
const tailwindcss = require("@tailwindcss/postcss");
const autoprefixer = require("autoprefixer");
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
  
  // 4.0 添加全局數據變量：R2 公開基礎 URL（用於模板中直接訪問）
  // 如果環境變量不存在，回退到本地路徑（用於本地開發）
  eleventyConfig.addGlobalData("r2PublicBaseUrl", r2Base || "/assets/images");

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

  // 4.4 Tailwind CSS 編譯（Eleventy v2 的 addExtension 寫法）
  eleventyConfig.addTemplateFormats("css");
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    async compile(inputContent, inputPath) {
      const parsed = path.parse(inputPath);
      // 以 _ 開頭的 partial 不輸出獨立檔案
      if (parsed.name.startsWith("_")) return;

      // 使用 PostCSS 處理所有 CSS 檔案（包含 Tailwind CSS）
      try {
        const outputPath = path.join("_site", path.relative("src", inputPath));
        const result = await postcss([
          tailwindcss({
            config: path.join(__dirname, 'tailwind.config.js'),
          }),
          autoprefixer,
        ]).process(inputContent, {
          from: inputPath,
          to: outputPath,
        });

        // 確保輸出目錄存在
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // 立即寫入 CSS 文件，確保 inlineCSS filter 可以讀取
        fs.writeFileSync(outputPath, result.css, "utf8");

        return async () => result.css;
      } catch (error) {
        console.error(`[PostCSS] Error processing CSS: ${error.message}`);
        throw error;
      }
    },
  });

  // 4.5 靜態檔案複製
  // Note: Passthrough paths are relative to project root, not input directory
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("src/_headers");
  eleventyConfig.addPassthroughCopy("src/assets/images/ui");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  // 知識庫已遷移到獨立 Chatbot 服務
  // eleventyConfig.addPassthroughCopy("knowledge");

  // 4.6 監聽 CSS 和 Tailwind 配置變更
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("tailwind.config.js");

  // 4.7 提供給 sitemap.xml.njk 使用的日期 Filter
  eleventyConfig.addFilter("dateToISO", function (value) {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString();
  });

  // 4.7.0 將資料轉換為 JSON 字串的 Filter
  eleventyConfig.addNunjucksFilter("tojson", function (value) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error('[tojson] Error stringifying value:', error);
      return 'null';
    }
  });

  // 4.7.1 讀取 JSON 文件內容的 Filter（用於身份測驗）
  // 直接從 _data 目錄讀取 JSON 文件，避免變數名訪問問題
  eleventyConfig.addNunjucksFilter("readJSON", function (filePath) {
    try {
      const fullPath = path.join('src', '_data', filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(content);
      }
      console.warn(`[readJSON] File not found: ${fullPath}`);
      return null;
    } catch (error) {
      console.error(`[readJSON] Error reading JSON file ${filePath}:`, error);
      return null;
    }
  });

  // 4.9 CSS Inlining Filter: Reads compiled CSS for inlining
  // This eliminates render-blocking resources by inlining CSS in <style> tags
  // Strategy: Read compiled CSS from _site directory (processed by PostCSS/Tailwind)
  // Note: This filter runs during template rendering, so CSS files should already be compiled
  eleventyConfig.addNunjucksFilter("inlineCSS", function (cssPath) {
    if (!cssPath) return "";

    // Remove leading slash and normalize path
    let cleanPath = String(cssPath).replace(/^\//, "");
    
    // If path doesn't start with assets/css, assume it's relative to assets/css
    if (!cleanPath.startsWith("assets/css/")) {
      cleanPath = `assets/css/${cleanPath}`;
    }

    // Map CSS path to source file (now in src/)
    // e.g., /assets/css/main.css -> src/assets/css/main.css
    const cssSourcePath = path.join("src", cleanPath);
    const outputPath = path.join("_site", cleanPath);
    
    // Also try relative to process.cwd() in case we're in a different directory
    const outputPathAbsolute = path.join(process.cwd(), "_site", cleanPath);
    const cssSourcePathAbsolute = path.join(process.cwd(), "src", cleanPath);

    try {
      // Primary strategy: Read compiled CSS from _site (processed by PostCSS/Tailwind)
      // Try multiple paths to handle different build environments
      let cssContent = null;
      if (fs.existsSync(outputPath)) {
        cssContent = fs.readFileSync(outputPath, "utf8");
      } else if (fs.existsSync(outputPathAbsolute)) {
        cssContent = fs.readFileSync(outputPathAbsolute, "utf8");
      } else if (fs.existsSync(cssSourcePath)) {
        // Fallback: Try reading source CSS (for non-Tailwind CSS files)
        cssContent = fs.readFileSync(cssSourcePath, "utf8");
      } else if (fs.existsSync(cssSourcePathAbsolute)) {
        cssContent = fs.readFileSync(cssSourcePathAbsolute, "utf8");
      }

      if (cssContent) {
        // Strip BOM (Byte Order Mark) character that can break CSS @layer rules
        return cssContent.replace(/^\uFEFF/, '');
      }

      console.warn(`[inlineCSS] CSS file not found: ${cssPath}`);
      console.warn(`[inlineCSS] Tried paths: ${outputPath}, ${outputPathAbsolute}, ${cssSourcePath}, ${cssSourcePathAbsolute}`);
      return "";
    } catch (error) {
      console.error(`[inlineCSS] Error reading CSS from ${cssPath}:`, error.message);
      console.error(`[inlineCSS] Stack:`, error.stack);
      return "";
    }
  });

  // 4.10 Extract CSS paths from pageStyles front matter
  // Parses HTML string containing <link> tags and returns array of CSS file paths
  eleventyConfig.addNunjucksFilter("extractCSSPaths", function (pageStylesContent) {
    if (!pageStylesContent) return [];
    
    const cssPaths = [];
    const lines = String(pageStylesContent).split("\n");
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match <link rel="stylesheet" href="/path/to/file.css">
      const hrefMatch = trimmed.match(/href=["']([^"']+\.css)["']/);
      if (hrefMatch && hrefMatch[1]) {
        cssPaths.push(hrefMatch[1]);
      }
    }
    
    return cssPaths;
  });

  // 4.8 Eleventy 輸出設定
  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_includes",
      data: "_data",
      output: "_site",
    },
    passthroughFileCopy: true,
    // 要讓 sitemap.xml.njk 正確輸出 XML，一定要包含 'xml'
    templateFormats: ["njk", "md", "html", "css", "xml"],
  };
};
