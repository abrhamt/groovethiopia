// Content submission / approval / rejection notifications
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

type ContentEventProps = {
  type: string;
  title: string;
  authorName: string;
};

export function ContentSubmittedEmail({ type, title, authorName }: ContentEventProps) {
  const adminUrl = `${process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.groovethiopia.com"}/review`;
  return (
    <EmailLayout preview={`${authorName} submitted ${type} for review`}>
      <EmailKicker>Content · Awaiting review</EmailKicker>
      <EmailHeading>New {type.toLowerCase().replace("_", " ")} pending approval</EmailHeading>
      <EmailParagraph>
        <strong style={{ color: "#f5f5f5" }}>{authorName}</strong> has submitted content for review:
      </EmailParagraph>
      <EmailInfoRow label="Title" value={title} />
      <EmailInfoRow label="Type" value={type} />
      <EmailButton href={adminUrl}>Review now</EmailButton>
      <EmailMuted>This notification goes to all admins.</EmailMuted>
    </EmailLayout>
  );
}

export function ContentApprovedEmail({
  type,
  title,
  isLive,
}: ContentEventProps & { isLive: boolean }) {
  return (
    <EmailLayout preview={`Your ${type} "${title}" is ${isLive ? "live" : "approved"}`}>
      <EmailKicker>Approved</EmailKicker>
      <EmailHeading>
        {isLive ? "Your content is now live" : "Your content was approved"}
      </EmailHeading>
      <EmailParagraph>
        <strong style={{ color: "#f5f5f5" }}>{title}</strong> has been approved
        {isLive ? " and is now published on the public site." : " and is scheduled for publishing."}
      </EmailParagraph>
      <EmailInfoRow label="Type" value={type} />
      <EmailMuted>Thank you for your contribution to Groovethiopia.</EmailMuted>
    </EmailLayout>
  );
}

export function ContentRejectedEmail({
  type,
  title,
  reason,
}: ContentEventProps & { reason: string }) {
  return (
    <EmailLayout preview={`Changes requested on "${title}"`}>
      <EmailKicker>Changes requested</EmailKicker>
      <EmailHeading>Your submission needs adjustments</EmailHeading>
      <EmailParagraph>
        An admin reviewed <strong style={{ color: "#f5f5f5" }}>{title}</strong> and requested changes.
      </EmailParagraph>
      <EmailInfoRow label="Type" value={type} />
      <div
        style={{
          backgroundColor: "#0a0a0a",
          border: "1px solid #2d2d2d",
          borderLeft: "3px solid #d49520",
          borderRadius: 8,
          padding: "16px 20px",
          color: "#f5f5f5",
          fontSize: 14,
          lineHeight: 1.6,
          marginTop: 12,
          marginBottom: 20,
        }}
      >
        <strong style={{ display: "block", color: "#d49520", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
          Reason
        </strong>
        {reason}
      </div>
      <EmailParagraph>
        Please make the requested changes and resubmit from the admin panel.
      </EmailParagraph>
    </EmailLayout>
  );
}