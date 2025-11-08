import React from "react";
import Header from "../components/Header";
import Card from "../components/Card";
import ChartSection from "../components/ChartSection";

function ChartPage() {
  return (
    <div>
      <Header />
      <div className="cards">
        <Card title="Total Users" value="5,800" icon="👥" />
        <Card title="Active Today" value="1,245" icon="⚡" />
        <Card title="Avg Session Time" value="42 min" icon="⏱" />
        <Card title="New This Month" value="+1,200" icon="📈" />
      </div>
      <ChartSection />
    </div>
  );
}

export default ChartPage;
