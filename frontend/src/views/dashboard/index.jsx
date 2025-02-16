import React from "react";
import "./index.less";
import PanelGroup from "./components/PanelGroup";
import { useState } from "react";

const lineChartDefaultData = {
  Pertanyaan: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145],
  },
  Messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130],
  },
  Purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130],
  },
  Shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130],
  },
};
const Dashboard = () => {
  const [lineChartData, setLineChartData] = useState(
    lineChartDefaultData["New Visits"]
  );

  const handleSetLineChartData = (type) =>
    setLineChartData(lineChartDefaultData[type]);
  return (
    <div className="app-container-1">
      <PanelGroup handleSetLineChartData={handleSetLineChartData} />
    </div>
  );
};

export default Dashboard;
