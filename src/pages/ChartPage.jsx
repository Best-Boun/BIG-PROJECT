import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Card from "../components/Card";
import ChartSection from "../components/ChartSection";
import axios from "axios";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const resp = await axios.get("http://localhost:3000/api/dashboard/summary");
        setSummary(resp.data);
      } catch (error) {
        console.error("Dashboard summary fetch error", error);
      } finally {
        setLoading(false);
      }
    };

    const getNextMidnightMs = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      return tomorrow.getTime() - now.getTime();
    };

    fetchSummary();

    const midnightTimer = setTimeout(() => {
      fetchSummary();
      // schedule next midnight refresh
      setInterval(fetchSummary, 24 * 60 * 60 * 1000);
    }, getNextMidnightMs());

    return () => {
      clearTimeout(midnightTimer);
    };
  }, []);

  return (
    <div>
      <Header />
      <div className="cards">
        <Card title="ผู้ใช้ทั้งหมด" value={loading ? "..." : `${summary.totalUsers.toLocaleString()}`} icon="👥" />
        <Card title="ผู้ใช้ในวันนี้" value={loading ? "..." : `${summary.todayUsers.toLocaleString()}`} icon="⚡" />
        <Card title="ผู้ใช้ใหม่เดือนนี้" value={loading ? "..." : `+${summary.newUsersMonth.toLocaleString()}`} icon="📈" />
      </div>
      <ChartSection />
    </div>
  );
}

export default ChartPage;
