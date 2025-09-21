import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);
import log from "../assets/log.png";
import { Stethoscope } from "lucide-react";

const DoctorEarnings = () => {
  const [view, setView] = useState("weekly");

  const weeklyData = [
    { date: "Jul 01", earnings: 5000 },
    { date: "Jul 02", earnings: 7200 },
    { date: "Jul 03", earnings: 8800 },
    { date: "Jul 04", earnings: 4300 },
    { date: "Jul 05", earnings: 12000 },
    { date: "Jul 06", earnings: 9000 },
    { date: "Jul 07", earnings: 6500 },
  ];

  const monthlyData = [
    { date: "Jan", earnings: 45000 },
    { date: "Feb", earnings: 52000 },
    { date: "Mar", earnings: 61000 },
    { date: "Apr", earnings: 58000 },
    { date: "May", earnings: 73000 },
    { date: "Jun", earnings: 68000 },
    { date: "Jul", earnings: 77000 },
  ];

  const currentData = view === "weekly" ? weeklyData : monthlyData;

  const chartData = {
    labels: currentData.map((e) => e.date),
    datasets: [
      {
        type: "bar",
        label: "Earnings (₹)",
        data: currentData.map((e) => e.earnings),
        backgroundColor: "#5b21b6",
        borderRadius: 4,
      },
      {
        type: "line",
        label: "Trend",
        data: currentData.map((e) => e.earnings),
        borderColor: "#1e40af",
        backgroundColor: "#1e40af",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#000" },
      },
      tooltip: {
        callbacks: {
          label: (context) => `₹ ${context.formattedValue}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#000" },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#000",
          callback: (value) => `₹${value}`,
        },
        grid: {
          color: "#e5e7eb",
        },
      },
    },
  };

  return (
    <div className="flex  flex-col gap-6">
      <div className="flex items-center justify-between h-[100px] shadow-md shadow-cyan-800 rounded-md px-3 bg-white">
        <img src={log} alt="We Cure Consultancy Logo" className="w-20" />
        <h2 className="sm:text-3xl md:text-4xl font-extrabold text-[#083567] flex items-center">
          📈 Your Earnings
        </h2>
        <div className="w-26"></div>
      </div>

      <div className="w-full md:w-2/3 max-w-[900px] mx-auto p-4 bg-white shadow-md rounded-2xl">
        <div className="flex justify-between items-center mb-10">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="border border-[#5b21b6] text-[#5b21b6] font-medium px-3 py-2 rounded-md bg-white focus:outline-none"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <Chart data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default DoctorEarnings;
