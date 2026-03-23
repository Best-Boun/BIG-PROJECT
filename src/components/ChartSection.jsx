import React, { useEffect, useState } from "react";
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
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "./ChartSection.css";

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
  const [monthlyUsers, setMonthlyUsers] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [monthlyRes, totalRes, summaryRes] = await Promise.all([
          axios.get("http://localhost:3000/api/dashboard/users/monthly"),
          axios.get("http://localhost:3000/api/dashboard/users/total"),
          axios.get("http://localhost:3000/api/dashboard/summary"),
        ]);

        // 📊 Monthly Users
        setMonthlyUsers({
          labels: monthlyRes.data.labels,
          datasets: [
            {
              label: "Active Users",
              data: monthlyRes.data.data,
              backgroundColor: "#7c3aed",
              borderRadius: 6,
            },
          ],
        });


        // 🔢 Total Users
        setTotalUsers({
          labels: ["Current", "New", "Monthly"],
          datasets: [
            {
              data: [
                totalRes.data.current,
                totalRes.data.new,
                summaryRes.data.newUsersMonth,
              ],
              backgroundColor: ["#7c3aed", "#10b981", "#facc15"],
            },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <h2>Loading dashboard...</h2>;

  return (
    <div className="charts">
      <div className="chart-box wide">
        <h3>Users by Month</h3>
        {monthlyUsers && <Bar data={monthlyUsers} />}
      </div>

      <div className="chart-box">
        <h3>Total Users Overview</h3>
        {totalUsers && <Doughnut data={totalUsers} />}
      </div>

      
    </div>
  );
}

export default ChartSection;