import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

/* ─────────────── DARK THEME PALETTE ─────────────── */
const C = {
  bg:        "#0d1117",
  surface:   "#161b22",
  surface2:  "#1c2331",
  border:    "#30363d",
  accent:    "#58a6ff",
  accent2:   "#3fb950",
  accent3:   "#f78166",
  accent4:   "#d2a8ff",
  text:      "#e6edf3",
  muted:     "#8b949e",
  warning:   "#e3b341",
};

const STATUS_COLORS = {
  Applied:   { bg: "rgba(88, 166, 255, 0.15)", color: "#58a6ff", dot: "#58a6ff" },
  Interview: { bg: "rgba(227, 179, 65, 0.15)", color: "#e3b341", dot: "#e3b341" },
  Offer:     { bg: "rgba(63, 185, 80, 0.15)",  color: "#3fb950", dot: "#3fb950" },
  Rejected:  { bg: "rgba(247, 129, 102, 0.15)", color: "#f78166", dot: "#f78166" },
};

const chartDefaults = {
  plugins: {
    legend: {
      labels: { color: C.muted, font: { family: "'Sora', sans-serif", size: 12 } },
    },
    tooltip: {
      backgroundColor: C.surface2,
      borderColor: C.border,
      borderWidth: 1,
      titleColor: C.text,
      bodyColor: C.muted,
      padding: 12,
    },
  },
  scales: {
    x: {
      ticks: { color: C.muted, font: { family: "'Sora', sans-serif" } },
      grid: { color: "rgba(48,54,61,0.5)" },
    },
    y: {
      ticks: { color: C.muted, font: { family: "'Sora', sans-serif" } },
      grid: { color: "rgba(48,54,61,0.5)" },
    },
  },
};

/* ─────────────── STAT CARD ─────────────── */
function StatCard({ title, value, icon, color, loading }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      transition: "border-color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color}
    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: `${color}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 4, fontFamily: "'Sora', sans-serif" }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif", letterSpacing: "-0.5px" }}>
          {loading ? <span style={{ opacity: 0.3 }}>—</span> : value}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── SECTION HEADER ─────────────── */
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text, fontFamily: "'Sora', sans-serif" }}>{title}</h2>
      {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted, fontFamily: "'Sora', sans-serif" }}>{subtitle}</p>}
    </div>
  );
}

/* ─────────────── CHART CARD ─────────────── */
function ChartCard({ title, subtitle, children, style = {} }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 24,
      ...style,
    }}>
      <SectionHeader title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}

/* ─────────────── MAIN COMPONENT ─────────────── */
function ChartPage() {
  const [summary, setSummary] = useState({
    totalUsers: 0,
    todayUsers: 0,
    averageUsageMins: 0,
    newUsersMonth: 0,
    activeUsersToday: 0,
    applications30Days: 0,
    conversionRate: 0,
    averageAppsPerUser: 0,
  });
  const [monthlyUsers, setMonthlyUsers] = useState(null);
  const [totalUsers, setTotalUsers]     = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topJobs, setTopJobs]           = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const API = "http://localhost:3000/api/dashboard";

    Promise.all([
      axios.get(`${API}/summary`),
      axios.get(`${API}/users/monthly`),
      axios.get(`${API}/users/total`),
      axios.get(`${API}/activities/recent`),
      axios.get(`${API}/jobs/top`),
    ])
      .then(([sumRes, monthRes, totalRes, actRes, jobRes]) => {
        setSummary(prev => ({ ...prev, ...sumRes.data }));

        setMonthlyUsers({
          labels: monthRes.data.labels,
          datasets: [{
            label: "New Users",
            data: monthRes.data.data,
            backgroundColor: `${C.accent}33`,
            borderColor: C.accent,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: C.accent,
            pointRadius: 4,
          }],
        });

        setTotalUsers({
          labels: ["Current", "New (30d)", "Returning"],
          datasets: [{
            data: [totalRes.data.current, totalRes.data.new, totalRes.data.returning],
            backgroundColor: [C.accent, C.accent2, C.accent4],
            borderColor: C.surface,
            borderWidth: 3,
            hoverOffset: 6,
          }],
        });

        setRecentActivities(actRes.data || []);
        setTopJobs(jobRes.data || []);
      })
      .catch(err => console.error("Dashboard error:", err))
      .finally(() => setLoading(false));
  }, []);

  /* Activity bar chart */
  const activityChartData = (() => {
    if (!recentActivities.length) return null;
    const statusCounts = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
    recentActivities.forEach(a => {
      if (statusCounts[a.status] !== undefined) statusCounts[a.status]++;
    });
    return {
      labels: Object.keys(statusCounts),
      datasets: [{
        label: "Applications",
        data: Object.values(statusCounts),
        backgroundColor: [
          `${C.accent}bb`,
          `${C.warning}bb`,
          `${C.accent2}bb`,
          `${C.accent3}bb`,
        ],
        borderColor: [C.accent, C.warning, C.accent2, C.accent3],
        borderWidth: 2,
        borderRadius: 6,
      }],
    };
  })();

  /* Styles */
  const pageStyle = {
    background: C.bg,
    minHeight: "100vh",
    fontFamily: "'Sora', sans-serif",
    paddingBottom: 48,
  };

  const gridStyle = {
    display: "grid",
    gap: 20,
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "—";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div style={pageStyle}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "16px 0" }}>
        <Header />
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>

        {/* Page Title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: "-0.5px" }}>
            Analytics Dashboard
          </h1>
          <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 14 }}>
            Platform performance overview
          </p>
        </div>

        {/* Stat Cards */}
        {(() => {
          const n = (v) => (Number(v) || 0).toLocaleString();
          return (
            <div style={{ ...gridStyle, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 28 }}>
              <StatCard title="Total Users"    value={n(summary.totalUsers)}        icon="👥" color={C.accent}  loading={loading} />
              <StatCard title="Users Today"    value={n(summary.todayUsers)}        icon="⚡" color={C.accent2} loading={loading} />
              <StatCard title="New This Month" value={`+${n(summary.newUsersMonth)}`} icon="📈" color={C.warning} loading={loading} />
              <StatCard title="Avg Daily Apps" value={n(summary.averageUsageMins)}  icon="📋" color={C.accent4} loading={loading} />
            </div>
          );
        })()}

        {/* Charts Row 1 */}
        <div style={{ ...gridStyle, gridTemplateColumns: "2fr 1fr", marginBottom: 20 }}>
          <ChartCard title="User Growth" subtitle="Monthly new user registrations">
            <div style={{ position: "relative", height: 220 }}>
              {monthlyUsers
                ? <Line data={monthlyUsers} options={{ ...chartDefaults, responsive: true, maintainAspectRatio: false }} />
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Loading…</div>
              }
            </div>
          </ChartCard>

          <ChartCard title="User Segments" subtitle="Current · New · Returning">
            <div style={{ position: "relative", height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {totalUsers
                ? <Doughnut data={totalUsers} options={{
                    ...chartDefaults,
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "65%",
                    scales: {},
                  }} />
                : <div style={{ color: C.muted }}>Loading…</div>
              }
            </div>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div style={{ ...gridStyle, gridTemplateColumns: "1fr 1fr", marginBottom: 20 }}>

          {/* Recent Activities Chart */}
          <ChartCard title="Application Status Breakdown" subtitle="From recent 7 activities">
            <div style={{ position: "relative", height: 220 }}>
              {activityChartData
                ? <Bar data={activityChartData} options={{
                    ...chartDefaults,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartDefaults.plugins,
                      legend: { display: false },
                    },
                  }} />
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>
                    {loading ? "Loading…" : "No data"}
                  </div>
              }
            </div>
          </ChartCard>

          {/* Recent Activity Feed */}
          <ChartCard title="Recent Activities" subtitle="Latest application events">
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ height: 40, background: `${C.surface2}`, borderRadius: 8, marginBottom: 6, opacity: 0.5 }} />
                  ))
                : recentActivities.slice(0, 7).map((act, i) => {
                    const sc = STATUS_COLORS[act.status] || STATUS_COLORS.Applied;
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "9px 12px", borderRadius: 8,
                        background: i % 2 === 0 ? "transparent" : `${C.surface2}60`,
                        transition: "background 0.15s",
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: sc.dot, flexShrink: 0,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: C.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {act.profileName || `User #${act.userId}`}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {act.jobTitle}
                          </div>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                          background: sc.bg, color: sc.color, whiteSpace: "nowrap",
                        }}>{act.status}</span>
                        <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", minWidth: 54, textAlign: "right" }}>
                          {timeAgo(act.appliedAt)}
                        </span>
                      </div>
                    );
                  })
              }
              {!loading && recentActivities.length === 0 && (
                <div style={{ textAlign: "center", color: C.muted, padding: "32px 0", fontSize: 13 }}>No recent activities</div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Top 5 Jobs Table */}
        <ChartCard title="Top 5 Jobs by Applications" subtitle="Most popular job listings on the platform">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Sora', sans-serif" }}>
              <thead>
                <tr>
                  {["Rank", "Job Title", "Company", "Applications", "Share"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: "left",
                      fontSize: 11, fontWeight: 600, color: C.muted,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      borderBottom: `1px solid ${C.border}`,
                      background: `${C.surface2}80`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ height: 14, background: C.border, borderRadius: 4, opacity: 0.5, width: j === 0 ? 24 : j === 3 ? 40 : "70%" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : (() => {
                      const maxApps = topJobs.length > 0 ? Math.max(...topJobs.map(j => j.applications ?? 0)) : 1;
                      const totalApps = topJobs.reduce((s, j) => s + (j.applications ?? 0), 0);
                      const rankIcons = ["🥇", "🥈", "🥉", "4th", "5th"];
                      const barColors = [C.accent, C.accent2, C.warning, C.accent4, C.accent3];
                      return topJobs.map((job, i) => (
                        <tr key={job.id || i}
                          onMouseEnter={e => e.currentTarget.style.background = `${C.surface2}80`}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          style={{ transition: "background 0.15s", cursor: "default" }}
                        >
                          <td style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 16 }}>
                            {rankIcons[i]}
                          </td>
                          <td style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{job.title}</span>
                          </td>
                          <td style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ fontSize: 13, color: C.muted }}>{job.company}</span>
                          </td>
                          <td style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: barColors[i] }}>
                              {(job.applications ?? 0).toLocaleString()}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, minWidth: 160 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                flex: 1, height: 6, background: C.border, borderRadius: 99, overflow: "hidden",
                              }}>
                                <div style={{
                                  height: "100%",
                                  width: `${((job.applications ?? 0) / maxApps) * 100}%`,
                                  background: barColors[i],
                                  borderRadius: 99,
                                  transition: "width 0.6s ease",
                                }} />
                              </div>
                              <span style={{ fontSize: 12, color: C.muted, minWidth: 36, textAlign: "right" }}>
                                {totalApps > 0 ? `${Math.round((job.applications / totalApps) * 100)}%` : "—"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()
                }
                {!loading && topJobs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "32px 16px", textAlign: "center", color: C.muted, fontSize: 13, borderBottom: `1px solid ${C.border}` }}>
                      No job data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>

      </div>
    </div>
  );
}

export default ChartPage;