// OTP email — used for registration + password reset
import * as React from "react";
import {
  EmailLayout,
  EmailKicker,
  EmailHeading,
  EmailParagraph,
  EmailMuted,
  EmailCode,
} from "./layout";

export function OtpEmail({
  purpose,
  code,
}: {
  purpose: "REGISTRATION" | "PASSWORD_RESET";
  code: string;
}) {
  const isRegistration = purpose === "REGISTRATION";
  const subject = isRegistration
    ? "Verify your Groovethiopia account"
    : "Reset your Groovethiopia password";
  const heading = isRegistration
    ? "Verify your account"
    : "Reset your password";
  const body = isRegistration
    ? "Use the code below to verify your email and activate your admin account. The code expires in 10 minutes."
    : "Use the code below to reset your password. The code expires in 10 minutes.";

  return (
    <EmailLayout preview={subject}>
      <EmailKicker>{isRegistration ? "Account Verification" : "Password Reset"}</EmailKicker>
      <EmailHeading>{heading}</EmailHeading>
      <EmailParagraph>{body}</EmailParagraph>

      <EmailCode code={code} />

      <EmailMuted>
        If you didn't request this, you can safely ignore this email.
      </EmailMuted>
    </EmailLayout>
  );
}