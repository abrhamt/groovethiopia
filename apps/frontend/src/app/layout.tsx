import type { Metadata } from "next";

// Minimal root layout - the [locale] layout is the real one
export const metadata: Metadata = {
  title: "Groovethiopia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}