// Base email layout — Groovethiopia branded wrapper
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

type BrandProps = {
  preview: string;
  children: React.ReactNode;
};

const COLORS = {
  background: "#0a0a0a",
  ink: "#1a1a1a",
  inkBorder: "#2d2d2d",
  foreground: "#f5f5f5",
  inkText: "#a3a3a3",
  gold: "#d49520",
  goldLight: "#e8b240",
};

export function EmailLayout({ preview, children }: BrandProps) {
  return (
    <Html>
      <Head>
        <title>Groovethiopia</title>
      </Head>
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body
          style={{
            backgroundColor: COLORS.background,
            color: COLORS.foreground,
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            margin: 0,
            padding: 0,
          }}
        >
          <Container
            style={{
              maxWidth: 560,
              margin: "0 auto",
              padding: "40px 20px",
            }}
          >
            {/* Brand header */}
            <Section style={{ marginBottom: 32, textAlign: "center" }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  margin: 0,
                  fontFamily: "Georgia, serif",
                  letterSpacing: "-0.02em",
                }}
              >
                <span style={{ color: COLORS.gold }}>Groove</span>
                <span style={{ color: COLORS.foreground }}>thiopia</span>
              </Text>
            </Section>

            {/* Main content card */}
            <Section
              style={{
                backgroundColor: COLORS.ink,
                border: `1px solid ${COLORS.inkBorder}`,
                borderRadius: 12,
                padding: "40px 32px",
              }}
            >
              {children}
            </Section>

            {/* Footer */}
            <Section style={{ marginTop: 32, textAlign: "center" }}>
              <Text
                style={{
                  fontSize: 11,
                  color: "#525252",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Curating the New Horizon
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#525252",
                  marginTop: 8,
                }}
              >
                Addis Ababa, Ethiopia · hello@groovethiopia.com
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Reusable building blocks
export function EmailKicker({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 11,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: COLORS.gold,
        margin: 0,
        marginBottom: 12,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 28,
        fontWeight: 500,
        color: COLORS.foreground,
        margin: 0,
        marginBottom: 16,
        fontFamily: "Georgia, serif",
        letterSpacing: "-0.01em",
        lineHeight: 1.3,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailParagraph({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 15,
        lineHeight: 1.6,
        color: COLORS.foreground,
        margin: 0,
        marginBottom: 16,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailMuted({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 13,
        color: COLORS.inkText,
        margin: 0,
        marginBottom: 12,
        lineHeight: 1.5,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailDivider() {
  return (
    <Section>
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, #404040, transparent)",
          margin: "24px 0",
        }}
      />
    </Section>
  );
}

export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Section style={{ textAlign: "center", margin: "24px 0" }}>
      <a
        href={href}
        style={{
          backgroundColor: COLORS.gold,
          color: COLORS.background,
          padding: "12px 32px",
          borderRadius: 999,
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 14,
          display: "inline-block",
          letterSpacing: "0.02em",
        }}
      >
        {children}
      </a>
    </Section>
  );
}

export function EmailCode({ code }: { code: string }) {
  return (
    <Section
      style={{
        backgroundColor: COLORS.background,
        border: `1px solid ${COLORS.inkBorder}`,
        borderRadius: 8,
        padding: "24px",
        textAlign: "center",
        margin: "20px 0",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          color: "#737373",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          margin: 0,
          marginBottom: 12,
        }}
      >
        Your code
      </Text>
      <Text
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: COLORS.gold,
          letterSpacing: "0.4em",
          margin: 0,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {code}
      </Text>
    </Section>
  );
}

export function EmailInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <table
      cellPadding={0}
      cellSpacing={0}
      style={{
        width: "100%",
        marginBottom: 8,
      }}
    >
      <tbody>
        <tr>
          <td
            style={{
              fontSize: 11,
              color: COLORS.inkText,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              paddingRight: 16,
              width: 120,
              verticalAlign: "top",
            }}
          >
            {label}
          </td>
          <td
            style={{
              fontSize: 14,
              color: COLORS.foreground,
              verticalAlign: "top",
            }}
          >
            {value}
          </td>
        </tr>
      </tbody>
    </table>
  );
}