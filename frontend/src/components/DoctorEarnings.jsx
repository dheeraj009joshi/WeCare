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
import { useState, useEffect } from "react";
import { doctorDashboardService } from "../services/doctorService";

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
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        // Fetch real earnings data from API
        const earningsData = await doctorDashboardService.getEarnings();
        
        // Process and set the data
        setWeeklyData(earningsData.weekly || []);
        setMonthlyData(earningsData.monthly || []);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching earnings data:", error);
        setError("Failed to load earnings data");
        // Set empty arrays instead of dummy data
        setWeeklyData([]);
        setMonthlyData([]);
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

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
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-500">Unable to load earnings data</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">📊 No earnings data available</p>
            <p className="text-sm text-gray-400">Start accepting appointments to see your earnings</p>
          </div>
        ) : (
          <Chart data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default DoctorEarnings;
