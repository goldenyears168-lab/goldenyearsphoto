// scripts/upload-portfolio-to-r2.mjs
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

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

async function uploadFile(localPath, key) {
  const fileContent = fs.readFileSync(localPath);

  const contentType = (() => {
    if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
    if (key.endsWith(".png")) return "image/png";
    if (key.endsWith(".webp")) return "image/webp";
    return "application/octet-stream";
  })();

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  });

  await s3.send(command);
  console.log(`✅ Uploaded: ${key}`);
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
