import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
  Tailwind,
} from "@react-email/components";

type DigestStats = {
  newInquiries: number;
  newBookings: number;
  newTickets: number;
  newUsers: number;
  newContent: number;
  publishedContent: number;
  newMessages: number;
  revenue: number;
  pendingReviews: number;
  topEvents: { title: string; slug: string; revenue: number; tickets: number }[];
  periodStart: string;
  periodEnd: string;
};

export function WeeklyDigestEmail({
  adminName = "Admin",
  stats,
  baseUrl = "https://admin.groovethiopia.com",
}: {
  adminName?: string;
  stats: DigestStats;
  baseUrl?: string;
}) {
  const periodLabel = `${new Date(stats.periodStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(stats.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <Html>
      <Head />
      <Preview>Weekly digest · {periodLabel}</Preview>
      <Tailwind>
        <Body className="bg-black text-white font-sans">
          <Container className="mx-auto my-0 max-w-[600px] p-0">
            {/* Header */}
            <Section className="bg-black border-b border-gold-700/30 px-10 py-8">
              <Text className="m-0 text-[10px] tracking-[0.3em] uppercase text-gold-400">
                Groovethiopia · Weekly Digest
              </Text>
              <Heading as="h1" className="m-0 mt-3 font-serif text-3xl text-white">
                This week in numbers
              </Heading>
              <Text className="m-0 mt-2 text-sm text-amber-200/60">{periodLabel}</Text>
            </Section>

            {/* Greeting */}
            <Section className="px-10 py-6">
              <Text className="m-0 text-base text-amber-100/90">
                Hey {adminName},
              </Text>
              <Text className="m-0 mt-2 text-sm text-amber-200/70 leading-6">
                Here's the pulse of the past seven days across the platform.
              </Text>
            </Section>

            {/* Revenue hero */}
            <Section className="px-10 py-6">
              <div className="border border-gold-700/30 rounded-lg p-6 bg-gradient-to-br from-gold-900/10 to-transparent">
                <Text className="m-0 text-[10px] tracking-[0.3em] uppercase text-gold-400">
                  Ticket revenue
                </Text>
                <Text className="m-0 mt-2 font-serif text-5xl text-gold-300">
                  ${stats.revenue.toLocaleString()}
                </Text>
                <Text className="m-0 mt-2 text-xs text-amber-200/60">
                  from {stats.newTickets} confirmed ticket purchases
                </Text>
              </div>
            </Section>

            {/* Stats grid */}
            <Section className="px-10 py-2">
              <Row>
                <StatCard label="New inquiries" value={stats.newInquiries} />
                <StatCard label="Event bookings" value={stats.newBookings} />
              </Row>
              <Row className="mt-3">
                <StatCard label="New users" value={stats.newUsers} />
                <StatCard label="Contact messages" value={stats.newMessages} />
              </Row>
              <Row className="mt-3">
                <StatCard label="Content submitted" value={stats.newContent} />
                <StatCard label="Content published" value={stats.publishedContent} highlight />
              </Row>
            </Section>

            {/* Pending review alert */}
            {stats.pendingReviews > 0 && (
              <Section className="px-10 py-4">
                <div className="border border-amber-700/40 bg-amber-900/20 rounded-lg p-4">
                  <Text className="m-0 text-[10px] tracking-[0.3em] uppercase text-amber-400">
                    ⚠ Awaiting review
                  </Text>
                  <Text className="m-0 mt-2 text-sm text-amber-100">
                    <strong>{stats.pendingReviews}</strong> item{stats.pendingReviews === 1 ? "" : "s"} pending review in the queue.
                  </Text>
                  <Link href={`${baseUrl}/review`} className="inline-block mt-3 px-4 py-2 bg-amber-500 text-black text-xs font-semibold uppercase tracking-wider rounded-full no-underline">
                    Open review queue →
                  </Link>
                </div>
              </Section>
            )}

            {/* Top events */}
            {stats.topEvents.length > 0 && (
              <Section className="px-10 py-6">
                <Text className="m-0 text-[10px] tracking-[0.3em] uppercase text-gold-400">
                  Top events this week
                </Text>
                {stats.topEvents.map((e, i) => (
                  <div key={i} className="mt-4 pb-4" style={{ borderBottom: i < stats.topEvents.length - 1 ? "1px solid rgba(180, 83, 9, 0.3)" : "none" }}>
                    <Row>
                      <Column className="align-top">
                        <Text className="m-0 font-serif text-lg text-amber-100">
                          {e.title}
                        </Text>
                        <Text className="m-0 mt-1 text-xs text-amber-200/60">
                          {e.tickets} ticket{e.tickets === 1 ? "" : "s"} sold
                        </Text>
                      </Column>
                      <Column align="right" className="align-top">
                        <Text className="m-0 font-mono text-base text-gold-300">
                          ${e.revenue.toLocaleString()}
                        </Text>
                      </Column>
                    </Row>
                  </div>
                ))}
              </Section>
            )}

            <Hr className="border-amber-900/30 my-6" />

            {/* CTA */}
            <Section className="px-10 py-4 text-center">
              <Link href={`${baseUrl}/dashboard`} className="inline-block px-6 py-3 bg-gold-500 text-black text-sm font-semibold uppercase tracking-wider rounded-full no-underline">
                Open admin dashboard →
              </Link>
            </Section>

            {/* Footer */}
            <Section className="px-10 py-8 border-t border-amber-900/30">
              <Text className="m-0 text-[10px] tracking-[0.3em] uppercase text-amber-200/40">
                Groovethiopia Trading PLC
              </Text>
              <Text className="m-0 mt-2 text-xs text-amber-200/40">
                Addis Ababa · Curating the New Horizon
              </Text>
              <Text className="m-0 mt-4 text-[10px] text-amber-200/30">
                You're receiving this because you're an admin. Sent weekly every Monday 9 AM UTC.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Column className="w-1/2 align-top pr-1">
      <div className={`border rounded-lg p-4 ${highlight ? "border-gold-700/40 bg-gold-900/10" : "border-amber-900/30"}`}>
        <Text className="m-0 text-[9px] tracking-[0.25em] uppercase text-amber-200/60">
          {label}
        </Text>
        <Text className={`m-0 mt-2 font-serif text-3xl ${highlight ? "text-gold-300" : "text-amber-100"}`}>
          {value}
        </Text>
      </div>
    </Column>
  );
}

export default WeeklyDigestEmail;
