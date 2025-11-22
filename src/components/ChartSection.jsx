import React from "react";
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
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "./ChartSection.css";

// ลงทะเบียน chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function ChartSection() {
  // 📊 ผู้ใช้ในแต่ละเดือน
  const monthlyUsers = {
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Active Users",
        data: [3200, 4100, 3800, 4600, 5200, 5800, 6000, 6700 ],
        backgroundColor: "#7c3aed",
        borderRadius: 6,
      },
    ],
  };

  // ⏱ เวลาการใช้งานเฉลี่ยต่อวัน
  const usageTime = {
    labels: ["06 AM", "09 AM", "12 PM", "03 PM", "06 PM", "09 PM"],
    datasets: [
      {
        label: "Avg Usage Time (minutes)",
        data: [45, 70, 60, 90, 85, 55],
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // 👥 เพศของผู้ใช้
  const genderData = {
    labels: ["Female", "Male", "Other"],
    datasets: [
      {
        data: [48, 50, 2],
        backgroundColor: ["#ec4899", "#3b82f6", "#a855f7"],
      },
    ],
  };

  // 🔢 ผู้ใช้ทั้งหมด (รวม)
  const totalUsers = {
    labels: ["Current Users", "New This Week", "Returning"],
    datasets: [
      {
        data: [5800, 1200, 4600],
        backgroundColor: ["#7c3aed", "#10b981", "#facc15"],
      },
    ],
  };

  return (
    <div className="charts">
      <div className="chart-box wide">
        <h3>Users by Month</h3>
        <Bar key="monthly-users" data={monthlyUsers} />
      </div>

      <div className="chart-box">
        <h3>Total Users Overview</h3>
        <Doughnut key="total-users" data={totalUsers} />
      </div>

      

      <div className="chart-box wide">
        <h3>Average Usage Time</h3>
        <Line key="usage-time" data={usageTime} />
      </div>
    </div>
  );
}

export default ChartSection;
