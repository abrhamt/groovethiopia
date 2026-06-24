// Google reCAPTCHA v3 verification
export async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("[recaptcha] Not configured — accepting all");
    return { success: true, score: 1.0 };
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await res.json();
    return { success: data.success === true, score: data.score || 0 };
  } catch (e) {
    console.error("[recaptcha] verification failed", e);
    return { success: false, score: 0 };
  }
}