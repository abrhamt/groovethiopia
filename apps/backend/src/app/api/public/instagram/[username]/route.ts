// GET /api/public/instagram/[username] — proxy Instagram Basic Display API
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@groovethiopia/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  // Admin auth check (don't expose Instagram tokens publicly)
  const session = await auth();
  if (!session) return NextResponse.json({ posts: [] });

  try {
    const { username } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      // Return cached/fallback empty if no token configured
      return NextResponse.json({ posts: [] });
    }

    // Fetch from Instagram Basic Display API
    const igRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,media_type,thumbnail_url,timestamp&access_token=${accessToken}&limit=${limit}`
    );

    if (!igRes.ok) {
      console.error("[instagram] API error", await igRes.text());
      return NextResponse.json({ posts: [] });
    }

    const data = await igRes.json();
    return NextResponse.json({ posts: data.data || [] });
  } catch (e) {
    console.error("[instagram] error", e);
    return NextResponse.json({ posts: [] });
  }
}