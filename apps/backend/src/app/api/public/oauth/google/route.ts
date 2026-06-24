// Public Google OAuth for end users (inquiry/booking/ticket/on-demand)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

export async function POST(req: NextRequest) {
  try {
    const { code, redirectUri } = await req.json();

    if (!code || !redirectUri) {
      return NextResponse.json({ error: "Missing code or redirectUri" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 });
    }

    // Exchange code for token
    const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("[google oauth] token exchange failed", err);
      return NextResponse.json({ error: "Token exchange failed" }, { status: 400 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch user info
    const userRes = await fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: "Failed to fetch user info" }, { status: 400 });
    }

    const userData = await userRes.json();

    // Upsert public user
    const user = await prisma.publicUser.upsert({
      where: { googleId: userData.sub },
      update: {
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.picture,
        lastLoginAt: new Date(),
      },
      create: {
        googleId: userData.sub,
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.picture,
        lastLoginAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (e) {
    console.error("[google oauth] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}