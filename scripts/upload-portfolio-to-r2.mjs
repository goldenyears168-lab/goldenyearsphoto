// scripts/upload-portfolio-to-r2.mjs
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// ✅ 想同步哪些子資料夾就寫在這裡
const FOLDERS = [
  "portfolio",
  "content",
  "booking",
  "home",
  "price-list",
];

// 🚀 Image Optimization Constants
const MAX_WIDTH = 1200; // Sufficient for retina displays, much smaller than raw 4000px photos
const QUALITY = 80; // Balanced for photography (80% quality)

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

const IMAGES_ROOT = path.join("assets", "images");

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
 * @param {string} localPath - Path to local image file
 * @returns {Promise<Buffer>} - Optimized image buffer
 */
async function optimizeImage(localPath) {
  const originalBuffer = fs.readFileSync(localPath);
  const originalSize = originalBuffer.length;

  // Get image metadata to check dimensions
  const metadata = await sharp(originalBuffer).metadata();
  const needsResize = metadata.width && metadata.width > MAX_WIDTH;

  // Build Sharp pipeline
  let pipeline = sharp(originalBuffer);

  // Resize only if image is wider than MAX_WIDTH (maintains aspect ratio)
  if (needsResize) {
    pipeline = pipeline.resize(MAX_WIDTH, null, {
      withoutEnlargement: true, // Don't upscale smaller images
      fit: "inside", // Maintain aspect ratio
    });
  }

  // Determine format based on file extension and apply compression
  const ext = path.extname(localPath).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
  } else if (ext === ".png") {
    pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
  } else if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: QUALITY });
  }

  // Strip metadata (EXIF, etc.) to save space
  // Note: Sharp strips metadata by default when processing, but we're being explicit
  pipeline = pipeline.withMetadata({}); // Empty metadata object removes all EXIF/IPTC/XMP data

  // Generate optimized buffer
  const optimizedBuffer = await pipeline.toBuffer();
  const optimizedSize = optimizedBuffer.length;

  // Log optimization results
  const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
  console.log(
    `📊 ${path.basename(localPath)} | ` +
    `Original: ${formatBytes(originalSize)} -> ` +
    `Optimized: ${formatBytes(optimizedSize)} ` +
    `(${reduction}% reduction)`
  );

  return optimizedBuffer;
}

async function uploadFile(localPath, key) {
  // Get original file size for logging
  const originalStats = fs.statSync(localPath);
  const originalSize = originalStats.size;

  // Optimize image before uploading (does NOT modify local file)
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
}

main().catch((err) => {
  console.error("❌ 發生錯誤：", err);
  process.exit(1);
});
