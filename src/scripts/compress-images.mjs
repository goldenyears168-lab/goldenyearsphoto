// scripts/compress-images.mjs
// 這三行是在「載入工具」：
// fs 用來讀寫檔案、path 處理路徑、sharp 用來壓縮圖片
import fs from "fs";
import path from "path";
import sharp from "sharp";

// 設定「輸入資料夾」跟「輸出資料夾」
// 從 images-original（原始圖片）讀取，壓縮後輸出到 images/（供網站使用）
const INPUT_DIR = path.join(process.cwd(), "src", "assets", "images-original");
const OUTPUT_DIR = path.join(process.cwd(), "src", "assets", "images");

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

  // 處理常見圖片格式
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    return;
  }

  const relPath = path.relative(INPUT_DIR, inputPath); // 相對路徑
  const outputPath = path.join(OUTPUT_DIR, relPath);

  // 如果輸出檔案已存在且較新，跳過（避免重複處理）
  if (fs.existsSync(outputPath)) {
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    if (outputStats.mtime >= inputStats.mtime) {
      console.log(`⏭️  Skipped (up to date): ${relPath}`);
      return;
    }
  }

  // 確保輸出資料夾存在（沒有就建立）
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  try {
    console.log(`📦 Compressing: ${relPath}`);

    let pipeline = sharp(inputPath);

    // 調整大小（若原圖比 MAX_WIDTH 小就不放大）
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });

    // 根據副檔名選擇格式和品質
    if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
    } else if (ext === ".png") {
      pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: QUALITY });
    }

    await pipeline.toFile(outputPath); // 寫出壓縮後檔案
    
    // 顯示檔案大小比較
    const inputSize = fs.statSync(inputPath).size;
    const outputSize = fs.statSync(outputPath).size;
    const reduction = ((inputSize - outputSize) / inputSize * 100).toFixed(1);
    console.log(`   ✅ ${relPath} | ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB (${reduction}% reduction)`);
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

