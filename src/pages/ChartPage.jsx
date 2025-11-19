import React from "react";
import Header from "../components/Header";
import Card from "../components/Card";
import ChartSection from "../components/ChartSection";

function ChartPage() {
  return (
    <div>
      <Header />
      <div className="cards">
        <Card title="ผู้ใช้ทั้งหมด" value="5,800" icon="👥" />
        <Card title="ผู้ใช้ในวันนี้" value="1,245" icon="⚡" />
        <Card title="เวลาการใช้งานเฉลี่ยต่อวัน" value="42 min" icon="⏱" />
        <Card title="ผู้ใช้ใหม่เดือนนี้" value="+1,200" icon="📈" />
      </div>
      <ChartSection />
    </div>
  );
}

export default ChartPage;
