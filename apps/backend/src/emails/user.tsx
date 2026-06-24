// User approval notification — sent to new admins when they need to approve accounts
import * as React from "react";
import {
  EmailLayout,
  EmailKicker,
  EmailHeading,
  EmailParagraph,
  EmailInfoRow,
  EmailButton,
  EmailMuted,
} from "./layout";

export function NewUserRegistrationEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const adminUrl = `${process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.groovethiopia.com"}/users`;
  return (
    <EmailLayout preview={`New admin request: ${name}`}>
      <EmailKicker>Admin access requested</EmailKicker>
      <EmailHeading>A new user is awaiting approval</EmailHeading>
      <EmailParagraph>
        A new user has requested admin access to the Groovethiopia panel.
      </EmailParagraph>
      <EmailInfoRow label="Name" value={name} />
      <EmailInfoRow label="Email" value={email} />
      <EmailButton href={adminUrl}>Review user</EmailButton>
      <EmailMuted>
        Approval is required before this user can log in.
      </EmailMuted>
    </EmailLayout>
  );
}

export function UserApprovedEmail({ name }: { name: string }) {
  return (
    <EmailLayout preview="Your Groovethiopia admin access is active">
      <EmailKicker>Welcome</EmailKicker>
      <EmailHeading>You're approved</EmailHeading>
      <EmailParagraph>
        Hi {name}, your Groovethiopia admin access has been approved. You can now log in to the admin panel.
      </EmailParagraph>
      <EmailButton href={process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.groovethiopia.com/login"}>
        Open admin panel
      </EmailButton>
      <EmailMuted>
        If you didn't request this, please contact us immediately.
      </EmailMuted>
    </EmailLayout>
  );
}