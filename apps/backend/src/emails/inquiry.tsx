// Inquiry notification — admins receive when someone submits a contact form
import * as React from "react";
import {
  EmailLayout,
  EmailKicker,
  EmailHeading,
  EmailParagraph,
  EmailInfoRow,
  EmailDivider,
  EmailButton,
  EmailMuted,
} from "./layout";

type Inquiry = {
  id: string;
  division: string;
  name: string;
  organization?: string | null;
  email: string;
  phone?: string | null;
  message: string;
};

export function InquiryNotification({ inquiry }: { inquiry: Inquiry }) {
  const adminUrl = `${process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.groovethiopia.com"}/inquiries/${inquiry.id}`;

  return (
    <EmailLayout preview={`New ${inquiry.division.toLowerCase()} inquiry from ${inquiry.name}`}>
      <EmailKicker>New {inquiry.division.toLowerCase()} inquiry</EmailKicker>
      <EmailHeading>You've received a new inquiry</EmailHeading>

      <EmailParagraph>
        <strong style={{ color: "#f5f5f5" }}>{inquiry.name}</strong>{" "}
        {inquiry.organization && (
          <span style={{ color: "#a3a3a3" }}>· {inquiry.organization}</span>
        )}{" "}
        has reached out via the {inquiry.division.toLowerCase()} inquiry form.
      </EmailParagraph>

      <EmailDivider />

      <EmailInfoRow label="From" value={inquiry.name} />
      <EmailInfoRow label="Email" value={inquiry.email} />
      {inquiry.phone && <EmailInfoRow label="Phone" value={inquiry.phone} />}
      <EmailInfoRow label="Division" value={inquiry.division} />

      <EmailDivider />

      <EmailParagraph>
        <em style={{ color: "#a3a3a3" }}>Message:</em>
      </EmailParagraph>
      <div
        style={{
          backgroundColor: "#0a0a0a",
          border: "1px solid #2d2d2d",
          borderRadius: 8,
          padding: "16px 20px",
          color: "#f5f5f5",
          fontSize: 14,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          marginBottom: 20,
        }}
      >
        {inquiry.message}
      </div>

      <EmailButton href={adminUrl}>View inquiry in admin</EmailButton>

      <EmailMuted>
        Reply directly to this email to respond to {inquiry.name}.
      </EmailMuted>
    </EmailLayout>
  );
}