// scripts/upload-portfolio-to-r2.mjs
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// ✅ 想同步哪些子資料夾就寫在這裡
// 注意：這些路徑是相對於 IMAGES_ROOT 的
const FOLDERS = [
  "portfolio",        // src/assets/images/portfolio/
  "content",          // src/assets/images/content/ (包含 about, blog, booking, guide, home, price-list 等)
  "ui",               // src/assets/images/ui/ (logo 等 UI 圖片)
];

// 🚀 Image Optimization Constants
// Dynamic sizing strategy based on original image size:
// - Large images (>2000px): compress to smaller size (800px) for file size optimization
// - Medium images (1000-2000px): compress to target size (1400px) for quality
// - Small images (<1000px): keep original or use larger size (no downscaling)
// This balances file size vs quality based on source material
const TARGET_WIDTH_LARGE = 800;   // For images > 2000px (compress more)
const TARGET_WIDTH_MEDIUM = 1400; // For images 1000-2000px (target size)
const TARGET_WIDTH_SMALL = null;  // For images < 1000px (keep original, no resize)
const LARGE_THRESHOLD = 2000;     // Images larger than this are considered "large"
const SMALL_THRESHOLD = 1000;     // Images smaller than this are considered "small"
const QUALITY = 85; // Higher quality for photography (was 75)

if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
  console.error("❌ .env 相關 R2 設定缺一個，請再確認 .env");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const IMAGES_ROOT = path.join("src", "assets", "images");
const LOCK_FILE = path.join(process.cwd(), ".upload-lock");

/**
 * Check if another upload process is running
 */
function isLocked() {
  if (!fs.existsSync(LOCK_FILE)) return false;
  
  try {
    const lockData = fs.readFileSync(LOCK_FILE, "utf8");
    const lockTime = parseInt(lockData, 10);
    const now = Date.now();
    // If lock is older than 5 minutes, consider it stale
    if (now - lockTime > 5 * 60 * 1000) {
      fs.unlinkSync(LOCK_FILE);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Create lock file
 */
function createLock() {
  fs.writeFileSync(LOCK_FILE, Date.now().toString());
}

/**
 * Remove lock file
 */
function removeLock() {
  if (fs.existsSync(LOCK_FILE)) {
    fs.unlinkSync(LOCK_FILE);
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Optimize image using Sharp before uploading to R2
 * Uses dynamic sizing based on original image dimensions:
 * - Large images (>2000px): compress more (smaller target)
 * - Medium images (1000-2000px): compress to target size
 * - Small images (<1000px): keep original size
 * @param {string} localPath - Path to local image file
 * @returns {Promise<Buffer>} - Optimized image buffer
 */
async function optimizeImage(localPath) {
  const originalBuffer = fs.readFileSync(localPath);
  const originalSize = originalBuffer.length;

  // Get image metadata to check dimensions
  const metadata = await sharp(originalBuffer).metadata();
  const originalWidth = metadata.width || 0;

  // Determine target width based on original image size
  let targetWidth = null;
  if (originalWidth > LARGE_THRESHOLD) {
    // Large images: compress more to reduce file size
    targetWidth = TARGET_WIDTH_LARGE;
  } else if (originalWidth >= SMALL_THRESHOLD) {
    // Medium images: compress to target size for quality
    targetWidth = TARGET_WIDTH_MEDIUM;
  } else {
    // Small images: keep original size (no downscaling)
    targetWidth = TARGET_WIDTH_SMALL;
  }

  // Build Sharp pipeline
  let pipeline = sharp(originalBuffer);
  const willResize = targetWidth !== null && originalWidth > targetWidth;

  if (willResize) {
    pipeline = pipeline.resize(targetWidth, null, {
      withoutEnlargement: true, // Don't upscale smaller images
      fit: "inside", // Maintain aspect ratio
    });
  }

  // Determine format based on file extension and apply compression
  const ext = path.extname(localPath).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ 
      quality: QUALITY, 
      mozjpeg: true
    });
  } else if (ext === ".png") {
    pipeline = pipeline.png({ 
      quality: QUALITY, 
      compressionLevel: 9 
    });
  } else if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: QUALITY });
  }

  // Note: Metadata (EXIF, IPTC, XMP) is automatically stripped by Sharp
  // when converting/processing images, so no explicit removal needed

  // Generate optimized buffer
  const optimizedBuffer = await pipeline.toBuffer();
  const optimizedSize = optimizedBuffer.length;

  // Log optimization results with size strategy info
  const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
  const sizeStrategy = originalWidth > LARGE_THRESHOLD ? 'large→small' 
    : originalWidth >= SMALL_THRESHOLD ? 'medium→target' 
    : 'small→keep';
  const resizeInfo = willResize 
    ? `${originalWidth}px → ${targetWidth}px (${sizeStrategy})`
    : `${originalWidth}px (保持原尺寸)`;
  console.log(
    `📊 ${path.basename(localPath)} | ` +
    `${resizeInfo} | ` +
    `Original: ${formatBytes(originalSize)} -> ` +
    `Optimized: ${formatBytes(optimizedSize)} ` +
    `(${reduction}% reduction)`
  );

  return optimizedBuffer;
}

/**
 * Check if file already exists in R2
 * @param {string} key - R2 object key
 * @returns {Promise<boolean>} - True if file exists, false otherwise
 */
async function fileExistsInR2(key) {
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3.send(headCommand);
    return true; // File exists (200 OK)
  } catch (error) {
    // 404 Not Found means file doesn't exist, which is fine
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

async function uploadFile(localPath, key) {
  // Always re-upload to ensure cache headers are applied
  // (R2 may not have cache headers on existing files)
  const exists = await fileExistsInR2(key);
  if (exists) {
    console.log(`🔄 Re-uploading to update cache headers: ${key}`);
  }

  // Get original file size for logging
  const originalStats = fs.statSync(localPath);
  const originalSize = originalStats.size;

  const optimizedBuffer = await optimizeImage(localPath);
  const optimizedSize = optimizedBuffer.length;

  const contentType = (() => {
    if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
    if (key.endsWith(".png")) return "image/png";
    if (key.endsWith(".webp")) return "image/webp";
    return "application/octet-stream";
  })();

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: optimizedBuffer, // Upload optimized buffer, not original file
    ContentType: contentType,
    // Add cache headers for better performance
    CacheControl: "public, max-age=31536000, immutable",
  });

  await s3.send(command);
  
  // Log upload success with size comparison
  const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
  console.log(
    `✅ Uploaded: ${key} | ` +
    `Original: ${formatBytes(originalSize)} -> ` +
    `Optimized: ${formatBytes(optimizedSize)} (${reduction}% reduction)`
  );
}

async function walkAndUpload(dir, prefix = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      await walkAndUpload(fullPath, relPath);
    } else {
      // 只處理圖片檔
      if (!/\.(jpe?g|png|webp)$/i.test(entry.name)) continue;
      const key = relPath.replace(/\\/g, "/"); // Windows 也安全
      await uploadFile(fullPath, key);
    }
  }
}

async function main() {
  // Check if another instance is running
  if (isLocked()) {
    console.log("⏸️  另一個上傳程序正在執行中，跳過此次執行...");
    return;
  }

  try {
    createLock();
    console.log("🚀 開始同步圖片到 R2 ...");
    for (const folder of FOLDERS) {
      const localDir = path.join(IMAGES_ROOT, folder);
      if (!fs.existsSync(localDir)) {
        console.warn(`⚠️ 資料夾不存在，略過：${localDir}`);
        continue;
      }
      console.log(`\n=== 同步資料夾：${folder} ===`);
      await walkAndUpload(localDir, folder);
    }
    console.log("\n🎉 全部指定資料夾同步完成！");
  } finally {
    removeLock();
  }
}

main().catch((err) => {
  console.error("❌ 發生錯誤：", err);
  removeLock();
  process.exit(1);
});
