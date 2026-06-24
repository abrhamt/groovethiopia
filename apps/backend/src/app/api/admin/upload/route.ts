// POST /api/admin/upload — upload media to R2 with auto-processing
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const altText = (formData.get("altText") as string) || "";
    const contentId = (formData.get("contentId") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images supported" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to R2 with processing
    const result = await uploadImage(buffer, file.name);

    // Save to DB
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        mimeType: "image/webp",
        type: "IMAGE",
        size: buffer.length,
        width: result.width,
        height: result.height,
        r2Key: result.key,
        publicUrl: result.url,
        thumbnailUrl: result.thumbnailUrl,
        blurhash: result.blurhash,
        altText,
        contentId,
        uploadedById: session.user.id,
      },
    });

    return NextResponse.json({ success: true, media });
  } catch (e) {
    console.error("[admin/upload] error", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}