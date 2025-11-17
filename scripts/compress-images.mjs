// scripts/compress-images.mjs
// 這三行是在「載入工具」：
// fs 用來讀寫檔案、path 處理路徑、sharp 用來壓縮圖片
import fs from "fs";
import path from "path";
import sharp from "sharp";

// 設定「輸入資料夾」跟「輸出資料夾」
const INPUT_DIR = path.join(process.cwd(), "assets", "images");
const OUTPUT_DIR = path.join(process.cwd(), "assets", "images-optimized");

// 圖片壓縮參數：最大寬度 & JPEG 品質
const MAX_WIDTH = 1600;
const QUALITY = 70;

// 遞迴走訪資料夾裡所有檔案，對每個檔案執行 callback
function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

// 處理單一張圖片
async function processImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();

  // 目前只處理 .jpg / .jpeg，其它副檔名直接跳過
  if (![".jpg", ".jpeg"].includes(ext)) {
    return;
  }

  const relPath = path.relative(INPUT_DIR, inputPath); // 相對路徑
  const outputPath = path.join(OUTPUT_DIR, relPath);

  // 確保輸出資料夾存在（沒有就建立）
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  try {
    console.log(`Compressing: ${relPath}`);

    await sharp(inputPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true }) // 若原圖比 1600 小就不放大
      .jpeg({ quality: QUALITY })
      .toFile(outputPath); // 寫出壓縮後檔案
  } catch (err) {
    // 如果這張圖壞掉或格式怪怪，就印出警告，然後繼續下一張
    console.warn(`⚠️  Skipping ${relPath}: ${err.message}`);
  }
}

// 主程式：把上面全部串起來
async function main() {
  console.log("Input dir: ", INPUT_DIR);
  console.log("Output dir:", OUTPUT_DIR);

  const files = [];

  // 先把所有檔案路徑收集起來
  walkDir(INPUT_DIR, (filePath) => {
    files.push(filePath);
  });

  // 一張一張依序處理（避免一次全部爆掉）
  for (const file of files) {
    await processImage(file);
  }

  console.log("✅ All images processed (unsupported files were skipped).");
}

// 真的開始執行，如果主程式本身出錯，就印出錯誤
main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});

