import React, { useEffect, useMemo, useState } from "react";
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
const DARK_THEME = {
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

const LIGHT_THEME = {
  bg:        "#f5f7fb",
  surface:   "#ffffff",
  surface2:  "#f0f4f8",
  border:    "#d8e1ea",
  accent:    "#3865f4",
  accent2:   "#16a34a",
  accent3:   "#ef4444",
  accent4:   "#7c3aed",
  text:      "#111827",
  muted:     "#475569",
  warning:   "#b45309",
};

const createChartDefaults = (palette) => ({
  plugins: {
    legend: {
      labels: { color: palette.muted, font: { family: "'Sora', sans-serif", size: 12 } },
    },
    tooltip: {
      backgroundColor: palette.surface2,
      borderColor: palette.border,
      borderWidth: 1,
      titleColor: palette.text,
      bodyColor: palette.muted,
      padding: 12,
    },
  },
  scales: {
    x: {
      ticks: { color: palette.muted, font: { family: "'Sora', sans-serif" } },
      grid: { color: "rgba(48,54,61,0.2)" },
    },
    y: {
      ticks: { color: palette.muted, font: { family: "'Sora', sans-serif" } },
      grid: { color: "rgba(48,54,61,0.2)" },
    },
  },
});

/* ─────────────── STAT CARD ─────────────── */
function StatCard({ title, value, icon, color, loading, palette }) {
  return (
    <div style={{
      background: palette.surface,
      border: `1px solid ${palette.border}`,
      borderRadius: 12,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      transition: "border-color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color}
    onMouseLeave={e => e.currentTarget.style.borderColor = palette.border}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: `${color}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: palette.muted, marginBottom: 4, fontFamily: "'Sora', sans-serif" }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: palette.text, fontFamily: "'Sora', sans-serif", letterSpacing: "-0.5px" }}>
          {loading ? <span style={{ opacity: 0.3 }}>—</span> : value}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── SECTION HEADER ─────────────── */
function SectionHeader({ title, subtitle, palette }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: palette.text, fontFamily: "'Sora', sans-serif" }}>{title}</h2>
      {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: palette.muted, fontFamily: "'Sora', sans-serif" }}>{subtitle}</p>}
    </div>
  );
}

/* ─────────────── CHART CARD ─────────────── */
function ChartCard({ title, subtitle, children, style = {}, palette }) {
  return (
    <div style={{
      background: palette.surface,
      border: `1px solid ${palette.border}`,
      borderRadius: 12,
      padding: 24,
      ...style,
    }}>
      <SectionHeader title={title} subtitle={subtitle} palette={palette} />
      {children}
    </div>
  );
}

/* ─────────────── MAIN COMPONENT ─────────────── */
function ChartPage() {
  const [theme, setTheme] = useState(
    localStorage.getItem("dashboardTheme") || "dark",
  );
  const palette = theme === "dark" ? DARK_THEME : LIGHT_THEME;
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
  const [usersByRole, setUsersByRole]   = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topJobs, setTopJobs]           = useState([]);
  const [loading, setLoading]           = useState(true);

  const ROLE_COLORS = useMemo(() => [
    palette.accent,
    palette.accent2,
    palette.warning,
    palette.accent4,
    palette.accent3,
  ], [palette]);

  const STATUS_COLORS = useMemo(() => ({
    Applied:   { bg: `${palette.accent}22`, color: palette.accent, dot: palette.accent },
    Interview: { bg: `${palette.warning}22`, color: palette.warning, dot: palette.warning },
    Offer:     { bg: `${palette.accent2}22`, color: palette.accent2, dot: palette.accent2 },
    Rejected:  { bg: `${palette.accent3}22`, color: palette.accent3, dot: palette.accent3 },
  }), [palette]);

  const chartDefaults = useMemo(() => createChartDefaults(palette), [palette]);
  const themeButtonText = theme === "dark" ? "Light Mode" : "Dark Mode";
  const themeButtonStyle = {
    border: `1px solid ${palette.border}`,
    background: palette.surface2,
    color: palette.text,
    padding: "10px 16px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
  };

  useEffect(() => {
    localStorage.setItem("dashboardTheme", theme);
  }, [theme]);

  useEffect(() => {
    const API = "http://localhost:3000/api/dashboard";

    Promise.all([
      axios.get(`${API}/summary`),
      axios.get(`${API}/users/monthly`),
      axios.get(`${API}/users/by-role`),
      axios.get(`${API}/activities/recent`),
      axios.get(`${API}/jobs/top`),
    ])
      .then(([sumRes, monthRes, roleRes, actRes, jobRes]) => {
        setSummary(prev => ({ ...prev, ...sumRes.data }));

        setMonthlyUsers({
          labels: monthRes.data.labels,
          datasets: [{
            label: "New Users",
            data: monthRes.data.data,
            backgroundColor: `${palette.accent}33`,
            borderColor: palette.accent,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: palette.accent,
            pointRadius: 4,
          }],
        });

        const roles = roleRes.data || [];
        setUsersByRole({
          labels: roles.map(r => r.role.charAt(0).toUpperCase() + r.role.slice(1)),
          datasets: [{
            data: roles.map(r => r.count),
            backgroundColor: roles.map((_, i) => ROLE_COLORS[i % ROLE_COLORS.length]),
            borderColor: palette.surface,
            borderWidth: 3,
            hoverOffset: 6,
          }],
        });

        setRecentActivities(actRes.data || []);
        setTopJobs(jobRes.data || []);
      })
      .catch(err => console.error("Dashboard error:", err))
      .finally(() => setLoading(false));
  }, [palette, ROLE_COLORS]);

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
          `${palette.accent}bb`,
          `${palette.warning}bb`,
          `${palette.accent2}bb`,
          `${palette.accent3}bb`,
        ],
        borderColor: [palette.accent, palette.warning, palette.accent2, palette.accent3],
        borderWidth: 2,
        borderRadius: 6,
      }],
    };
  })();

  /* Styles */
  const pageStyle = {
    background: palette.bg,
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
      <div style={{ background: palette.surface, borderBottom: `1px solid ${palette.border}`, padding: "16px 0" }}>
        <Header />
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>

        {/* Page Title */}
        <div style={{
          marginBottom: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: palette.text, letterSpacing: "-0.5px" }}>
              Analytics Dashboard
            </h1>
            <p style={{ margin: "6px 0 0", color: palette.muted, fontSize: 14 }}>
              Platform performance overview
            </p>
          </div>
          <button
            style={{
              ...themeButtonStyle,
              minWidth: 140,
            }}
            onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
          >
            {themeButtonText}
          </button>
        </div>

        {/* Stat Cards */}
        {(() => {
          const n = (v) => (Number(v) || 0).toLocaleString();
          return (
            <div style={{ ...gridStyle, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 28 }}>
              <StatCard title="Total Users"    value={n(summary.totalUsers)} icon="👥" color={palette.accent}  loading={loading} palette={palette} />
              <StatCard title="Users Today"    value={n(summary.todayUsers)} icon="⚡" color={palette.accent2} loading={loading} palette={palette} />
              <StatCard title="New This Month" value={`+${n(summary.newUsersMonth)}`} icon="📈" color={palette.warning} loading={loading} palette={palette} />
            </div>
          );
        })()}

        {/* Charts Row 1 */}
        <div style={{ ...gridStyle, gridTemplateColumns: "2fr 1fr", marginBottom: 20 }}>
          <ChartCard title="User Growth" subtitle="Monthly new user registrations" palette={palette}>
            <div style={{ position: "relative", height: 220 }}>
              {monthlyUsers
                ? <Line data={monthlyUsers} options={{ ...chartDefaults, responsive: true, maintainAspectRatio: false }} />
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: palette.muted }}>Loading…</div>
              }
            </div>
          </ChartCard>

          <ChartCard title="Users by Role" subtitle="Breakdown of all users by role" palette={palette}>
            <div style={{ position: "relative", height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {usersByRole
                ? <Doughnut data={usersByRole} options={{
                    ...chartDefaults,
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "65%",
                    scales: {},
                  }} />
                : <div style={{ color: palette.muted }}>Loading…</div>
              }
            </div>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div style={{ ...gridStyle, gridTemplateColumns: "1fr 1fr", marginBottom: 20 }}>

          {/* Recent Activities Chart */}
          <ChartCard title="Application Status Breakdown" subtitle="From recent 7 activities" palette={palette}>
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
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: palette.muted }}>
                    {loading ? "Loading…" : "No data"}
                  </div>
              }
            </div>
          </ChartCard>

          {/* Recent Activity Feed */}
          <ChartCard title="Recent Activities" subtitle="Latest application events" palette={palette}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ height: 40, background: `${palette.surface2}`, borderRadius: 8, marginBottom: 6, opacity: 0.5 }} />
                  ))
                : recentActivities.slice(0, 7).map((act, i) => {
                    const sc = STATUS_COLORS[act.status] || STATUS_COLORS.Applied;
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "9px 12px", borderRadius: 8,
                        background: i % 2 === 0 ? "transparent" : `${palette.surface2}60`,
                        transition: "background 0.15s",
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: sc.dot, flexShrink: 0,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: palette.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {act.profileName || `User #${act.userId}`}
                          </div>
                          <div style={{ fontSize: 11, color: palette.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {act.jobTitle}
                          </div>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                          background: sc.bg, color: sc.color, whiteSpace: "nowrap",
                        }}>{act.status}</span>
                        <span style={{ fontSize: 11, color: palette.muted, whiteSpace: "nowrap", minWidth: 54, textAlign: "right" }}>
                          {timeAgo(act.appliedAt)}
                        </span>
                      </div>
                    );
                  })
              }
              {!loading && recentActivities.length === 0 && (
                <div style={{ textAlign: "center", color: palette.muted, padding: "32px 0", fontSize: 13 }}>No recent activities</div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Top 5 Jobs Table */}
        <ChartCard title="Top 5 Jobs by Applications" subtitle="Most popular job listings on the platform" palette={palette}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Sora', sans-serif" }}>
              <thead>
                <tr>
                  {["Rank", "Job Title", "Company", "Applications", "Share"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: "left",
                      fontSize: 11, fontWeight: 600, color: palette.muted,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      borderBottom: `1px solid ${palette.border}`,
                      background: `${palette.surface2}80`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} style={{ padding: "14px 16px", borderBottom: `1px solid ${palette.border}` }}>
                            <div style={{ height: 14, background: palette.border, borderRadius: 4, opacity: 0.5, width: j === 0 ? 24 : j === 3 ? 40 : "70%" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : (() => {
                      const maxApps = topJobs.length > 0 ? Math.max(...topJobs.map(j => j.applications ?? 0)) : 1;
                      const totalApps = topJobs.reduce((s, j) => s + (j.applications ?? 0), 0);
                      const rankIcons = ["🥇", "🥈", "🥉", "4th", "5th"];
                      const barColors = [palette.accent, palette.accent2, palette.warning, palette.accent4, palette.accent3];
                      return topJobs.map((job, i) => (
                        <tr key={job.id || i}
                          onMouseEnter={e => e.currentTarget.style.background = `${palette.surface2}80`}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          style={{ transition: "background 0.15s", cursor: "default" }}
                        >
                          <td style={{ padding: "14px 16px", borderBottom: `1px solid ${palette.border}`, fontSize: 16 }}>
                            {rankIcons[i]}
                          </td>
                          <td style={{ padding: "14px 16px", borderBottom: `1px solid ${palette.border}` }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: palette.text }}>{job.title}</span>
                          </td>
                          <td style={{ padding: "14px 16px", borderBottom: `1px solid ${palette.border}` }}>
                            <span style={{ fontSize: 13, color: palette.muted }}>{job.company}</span>
                          </td>
                          <td style={{ padding: "14px 16px", borderBottom: `1px solid ${palette.border}` }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: barColors[i] }}>
                              {(job.applications ?? 0).toLocaleString()}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", borderBottom: `1px solid ${palette.border}`, minWidth: 160 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                flex: 1, height: 6, background: palette.border, borderRadius: 99, overflow: "hidden",
                              }}>
                                <div style={{
                                  height: "100%",
                                  width: `${((job.applications ?? 0) / maxApps) * 100}%`,
                                  background: barColors[i],
                                  borderRadius: 99,
                                  transition: "width 0.6s ease",
                                }} />
                              </div>
                              <span style={{ fontSize: 12, color: palette.muted, minWidth: 36, textAlign: "right" }}>
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
                    <td colSpan={5} style={{ padding: "32px 16px", textAlign: "center", color: palette.muted, fontSize: 13, borderBottom: `1px solid ${palette.border}` }}>
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
