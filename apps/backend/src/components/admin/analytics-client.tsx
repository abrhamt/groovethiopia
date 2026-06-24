"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, DollarSign, Users, Calendar, Mail, Ticket } from "lucide-react";

type Range = "7d" | "30d" | "90d";
type Data = {
  range: { label: string; days: number; start: string; end: string };
  headline: {
    revenue: number;
    inquiries: number;
    bookings: number;
    tickets: number;
    users: number;
    content: number;
    openEvents: number;
  };
  timeseries?: { date: string; inquiries: number; bookings: number; tickets: number; revenue: number; users: number }[];
  topContent: { id: string; title: string; slug: string; type: string; revenue: number; tickets: number }[];
  funnel?: { publishedItems: number; inquiries: number; bookings: number; tickets: number };
};

export function AnalyticsClient({ initial }: { initial: Data }) {
  const [data, setData] = useState<Data>(initial);
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (range === initial.range.label as any) return;
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d);
      })
      .finally(() => setLoading(false));
  }, [range, initial.range.label]);

  return (
    <div className="space-y-6">
      {/* Range switcher */}
      <div className="flex items-center gap-2">
        {(["7d", "30d", "90d"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
              range === r
                ? "bg-gold-500 text-black"
                : "border border-ink-700 text-ink-300 hover:border-gold-700/50"
            }`}
          >
            {r}
          </button>
        ))}
        {loading && <Loader2 size={14} className="text-gold-400 animate-spin ml-2" />}
      </div>

      {/* Headline cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <HeadlineCard label="Revenue" value={`$${data.headline.revenue.toLocaleString()}`} icon={<DollarSign size={14} />} accent="gold" />
        <HeadlineCard label="Tickets sold" value={data.headline.tickets.toString()} icon={<Ticket size={14} />} />
        <HeadlineCard label="Inquiries" value={data.headline.inquiries.toString()} icon={<Mail size={14} />} />
        <HeadlineCard label="New users" value={data.headline.users.toString()} icon={<Users size={14} />} />
        <HeadlineCard label="Bookings" value={data.headline.bookings.toString()} icon={<Calendar size={14} />} />
        <HeadlineCard label="Content live" value={data.headline.content.toString()} icon={<TrendingUp size={14} />} />
        <HeadlineCard label="Open events" value={data.headline.openEvents.toString()} icon={<Calendar size={14} />} />
        <HeadlineCard label="Period" value={data.range.label} icon={<TrendingUp size={14} />} muted />
      </div>

      {/* Time-series chart */}
      {data.timeseries && data.timeseries.length > 0 && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-1">Activity over time</h3>
          <p className="text-xs text-ink-400 mb-6">Inquiries, bookings, tickets, and users per day</p>
          <TimeSeriesChart data={data.timeseries} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top content */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4">Top content by revenue</h3>
          {data.topContent.length === 0 ? (
            <p className="text-sm text-ink-400">No ticket sales in this period.</p>
          ) : (
            <div className="space-y-3">
              {data.topContent.map((c, i) => {
                const max = Math.max(...data.topContent.map((x) => x.revenue), 1);
                const pct = (c.revenue / max) * 100;
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-[10px] font-mono text-ink-500 w-5">{i + 1}.</span>
                        <span className="truncate text-foreground">{c.title}</span>
                        <span className="text-[10px] font-mono uppercase text-ink-500 whitespace-nowrap">{c.type.toLowerCase()}</span>
                      </div>
                      <span className="text-gold-300 font-mono text-sm ml-2">${c.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-ink-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-ink-500 mt-1">{c.tickets} tickets sold</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Funnel */}
        {data.funnel && (
          <div className="admin-card">
            <h3 className="text-lg font-semibold mb-4">Conversion funnel</h3>
            <Funnel data={data.funnel} />
          </div>
        )}
      </div>
    </div>
  );
}

function HeadlineCard({ label, value, icon, accent, muted }: { label: string; value: string; icon: React.ReactNode; accent?: "gold"; muted?: boolean }) {
  return (
    <div className="admin-card">
      <div className="flex items-center gap-1.5 text-ink-400 text-[10px] font-mono uppercase tracking-widest mb-2">
        {icon}
        {label}
      </div>
      <p className={`text-2xl font-serif ${accent === "gold" ? "text-gradient-gold" : muted ? "text-ink-300" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

function TimeSeriesChart({ data }: { data: { date: string; inquiries: number; bookings: number; tickets: number; revenue: number; users: number }[] }) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((d) => [d.inquiries, d.bookings, d.tickets, d.users])
  );
  const w = 800;
  const h = 200;
  const padX = 40;
  const padY = 20;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;
  const stepX = chartW / Math.max(1, data.length - 1);

  function pathFor(key: keyof typeof data[0]) {
    return data.map((d, i) => {
      const x = padX + i * stepX;
      const y = padY + chartH - (d[key] as number / maxValue) * chartH;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  }

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({
    y: padY + chartH * (1 - p),
    label: Math.round(maxValue * p).toString(),
  }));

  // X-axis labels (sparse — show ~6)
  const xLabelEvery = Math.ceil(data.length / 6);
  const xLabels = data
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i % xLabelEvery === 0)
    .map(({ d, i }) => ({
      x: padX + i * stepX,
      label: d.date.slice(5), // MM-DD
    }));

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ minWidth: 500 }}>
        {/* Y grid */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padX} y1={t.y} x2={w - padX} y2={t.y} stroke="#1a1a1a" strokeWidth="1" />
            <text x={padX - 6} y={t.y + 3} fill="#525252" fontSize="9" textAnchor="end" fontFamily="monospace">{t.label}</text>
          </g>
        ))}

        {/* X labels */}
        {xLabels.map((l, i) => (
          <text key={i} x={l.x} y={h - 4} fill="#525252" fontSize="9" textAnchor="middle" fontFamily="monospace">{l.label}</text>
        ))}

        {/* Lines */}
        <path d={pathFor("inquiries")} fill="none" stroke="#d49520" strokeWidth="1.5" />
        <path d={pathFor("bookings")} fill="none" stroke="#10b981" strokeWidth="1.5" />
        <path d={pathFor("tickets")} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
        <path d={pathFor("users")} fill="none" stroke="#a855f7" strokeWidth="1.5" />

        {/* Legend */}
        <g transform={`translate(${w - padX - 240}, 4)`}>
          <Legend color="#d49520" label="Inquiries" x={0} />
          <Legend color="#10b981" label="Bookings" x={60} />
          <Legend color="#3b82f6" label="Tickets" x={130} />
          <Legend color="#a855f7" label="Users" x={190} />
        </g>
      </svg>
    </div>
  );
}

function Legend({ color, label, x }: { color: string; label: string; x: number }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <rect width="8" height="8" y="3" fill={color} rx="1" />
      <text x="12" y="11" fill="#a3a3a3" fontSize="10">{label}</text>
    </g>
  );
}

function Funnel({ data }: { data: { publishedItems: number; inquiries: number; bookings: number; tickets: number } }) {
  const stages = [
    { label: "Published items", value: data.publishedItems, color: "from-amber-700/40 to-amber-700/20" },
    { label: "Inquiries", value: data.inquiries, color: "from-gold-600/50 to-gold-600/20" },
    { label: "Bookings", value: data.bookings, color: "from-emerald-600/50 to-emerald-600/20" },
    { label: "Tickets sold", value: data.tickets, color: "from-blue-600/50 to-blue-600/20" },
  ];
  const max = Math.max(...stages.map((s) => s.value), 1);
  return (
    <div className="space-y-2">
      {stages.map((s) => {
        const pct = (s.value / max) * 100;
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-ink-300">{s.label}</span>
              <span className="font-mono text-foreground">{s.value}</span>
            </div>
            <div className="h-7 bg-ink-800/50 rounded-md overflow-hidden border border-ink-700">
              <div
                className={`h-full bg-gradient-to-r ${s.color} flex items-center justify-end pr-3`}
                style={{ width: `${Math.max(pct, 4)}%` }}
              >
                {pct > 15 && <span className="text-[10px] font-mono text-amber-100/70">{pct.toFixed(0)}%</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
