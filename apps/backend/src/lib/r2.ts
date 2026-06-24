// Cloudflare R2 storage helpers (S3-compatible)
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { encode as blurhashEncode } from "blurhash";

const r2 = process.env.R2_ACCOUNT_ID
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    })
  : null;

const BUCKET = process.env.R2_BUCKET_NAME || "groovethiopia-media";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://media.groovethiopia.com";

export async function uploadImage(
  buffer: Buffer,
  originalFilename: string
): Promise<{
  key: string;
  url: string;
  width: number;
  height: number;
  thumbnailUrl: string;
  blurhash: string;
}> {
  if (!r2) throw new Error("R2 not configured");

  const id = crypto.randomUUID();
  const ext = originalFilename.split(".").pop() || "jpg";
  const baseKey = `images/${id}`;

  // Process variants
  const main = await sharp(buffer)
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const thumb = await sharp(buffer)
    .resize({ width: 600, height: 600, fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();

  // Blurhash from tiny preview
  const { data: tinyData, info: tinyInfo } = await sharp(buffer)
    .resize({ width: 32, height: 32, fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const blurhash = blurhashEncode(
    new Uint8ClampedArray(tinyData),
    tinyInfo.width,
    tinyInfo.height,
    4,
    3
  );

  // Upload all three
  await Promise.all([
    r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${baseKey}.webp`,
      Body: main,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    })),
    r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${baseKey}.thumb.webp`,
      Body: thumb,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    })),
  ]);

  const metadata = await sharp(buffer).metadata();

  return {
    key: `${baseKey}.webp`,
    url: `${PUBLIC_URL}/${baseKey}.webp`,
    thumbnailUrl: `${PUBLIC_URL}/${baseKey}.thumb.webp`,
    width: metadata.width || 0,
    height: metadata.height || 0,
    blurhash,
  };
}

export async function deleteImage(key: string) {
  if (!r2) return;
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}