import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import log from "../assets/log.png";
import femaledr from "../assets/doctormobile.png";
import {
  doctorAuthService,
  doctorDashboardService,
  doctorUtils,
} from "../services/doctorService";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
);

const Card = ({ children }) => (
  <div className="bg-white shadow-md rounded-xl">{children}</div>
);

const CardContent = ({ children }) => <div>{children}</div>;

const Button = ({ children, ...props }) => (
  <button
    className="px-4 py-2 bg-[#5b21b6] text-white rounded hover:bg-[#3e8e41]"
    {...props}
  >
    {children}
  </button>
);

// Skeleton Loading Components
const SkeletonCard = () => (
  <div className="bg-white shadow-md rounded-xl p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white shadow-md rounded-xl p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-48 bg-gray-200 rounded mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
  </div>
);

const SkeletonProfile = () => (
  <div className="bg-white shadow-md rounded-xl p-6 animate-pulse">
    <div className="flex items-center mb-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const SkeletonReview = () => (
  <div className="bg-white shadow-md rounded-xl p-4 animate-pulse">
    <div className="flex items-center mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
  </div>
);

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    unreadMessages: 0,
    totalPatients: 0,
    totalEarnings: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check if doctor is logged in
        if (!doctorAuthService.isLoggedIn()) {
          navigate("/doctors/login");
          return;
        }

        // Get doctor profile
        try {
          const profileData = await doctorAuthService.getProfile();
          setDoctor(profileData.doctor);
        } catch (profileError) {
          console.error("Profile fetch error:", profileError);
          // If profile fetch fails, try to get doctor data from localStorage
          const storedDoctor = doctorAuthService.getCurrentDoctor();
          if (storedDoctor) {
            setDoctor(storedDoctor);
          } else {
            throw profileError; // Re-throw if no stored data
          }
        }

        // Get dashboard stats
        try {
          const statsData = await doctorDashboardService.getStats();
          console.log('Received stats data:', statsData);
          
          // Update stats with real data from API
          setStats({
            todayAppointments: statsData.todayAppointments || 0,
            totalAppointments: statsData.totalAppointments || 0,
            pendingAppointments: statsData.pendingAppointments || 0,
            completedAppointments: statsData.completedAppointments || 0,
            upcomingAppointments: statsData.upcomingAppointments || 0,
            totalPatients: statsData.totalPatients || 0,
            totalEarnings: statsData.totalEarnings || 0,
            unreadMessages: 0 // This would come from a messages API later
          });
          
          // For now, set empty appointments array - this could be fetched separately
          setRecentAppointments([]);
        } catch (statsError) {
          console.error("Stats fetch error:", statsError);
          // Set default stats if fetch fails
          setStats({
            todayAppointments: 0,
            totalAppointments: 0,
            pendingAppointments: 0,
            completedAppointments: 0,
            upcomingAppointments: 0,
            totalPatients: 0,
            totalEarnings: 0,
            unreadMessages: 0
          });
          setRecentAppointments([]);
        }

        // Load dynamic reviews and awards
        loadReviewsAndAwards();

        setLoading(false);
      } catch (error) {
        console.error("Dashboard initialization error:", error);
        setError(error.message || "Failed to load dashboard");
        setLoading(false);
      }
    };

    const loadReviewsAndAwards = async () => {
      try {
        // TODO: Fetch real reviews from API when available
        // For now, initialize empty arrays to show no dummy data
        setReviews([]);
        setAwards([]);
        
        // Could be implemented later with:
        // const reviewsData = await doctorDashboardService.getReviews();
        // const awardsData = await doctorDashboardService.getAwards();
        // setReviews(reviewsData || []);
        // setAwards(awardsData || []);
      } catch (error) {
        console.error("Error loading reviews and awards:", error);
        setReviews([]);
        setAwards([]);
      }
    };

    initializeDashboard();
  }, [navigate]);

  const handleLogout = () => {
    doctorAuthService.logout(); // session clear
    localStorage.removeItem("doctorName"); // doctor name clear
    navigate("/doctors"); // doctors page render
  };

  // Helper function to render star ratings
  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  // Chart data with real backend data
  const patientChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Total Patients",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, stats.totalPatients || 0],
        borderColor: "#083567",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const appointmentChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Appointments",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, stats.pendingAppointments || 0],
        backgroundColor: "#083567",
      },
    ],
  };

  const patientTypeData = {
    labels: ["Male", "Female", "Kids"],
    datasets: [
      {
        data: [
          Math.floor((stats.totalPatients || 0) * 0.3), // 30% male
          Math.floor((stats.totalPatients || 0) * 0.4), // 40% female
          Math.floor((stats.totalPatients || 0) * 0.3), // 30% kids
        ],
        backgroundColor: ["#3B82F6", "#F87171", "#FBBF24"],
      },
    ],
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center h-[100px] shadow-md shadow-cyan-800 rounded-md px-3">
          <img src={log} alt="We Cure Consultancy Logo" className="w-20" />
          <h2 className="sm:text-3xl md:text-4xl font-extrabold text-[#083567] flex items-center">
            <Stethoscope className="sm:w-6 md:w-10 sm:h-6 md:h-10" />
            &nbsp; Your Dashboard
          </h2>
          <div className="flex gap-2">
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:justify-end md:items-center">
            <div className="overflow-x-auto py-2 md:py-0 ">
              <div className="flex gap-2 w-max md:w-auto">
                {["Today", "7d", "2w", "1m", "3m", "6m", "1y"].map((label) => (
                  <Button
                    key={label}
                    variant={label === "Today" ? "default" : "outline"}
                    size="sm"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkeletonChart />
            <SkeletonChart />
          </div>

          {/* Profile and Reviews Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SkeletonProfile />
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonReview key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center h-[100px] shadow-md shadow-cyan-800 rounded-md px-3 bg-[#f8f9fa]">
        <img src={log} alt="We Cure Consultancy Logo" className="w-20" />
        <h2 className="sm:text-3xl md:text-4xl font-extrabold text-[#5b21b6] flex items-center ">
          {/* <Stethoscope className="sm:w-6 md:w-10 sm:h-6 md:h-10" /> */}
          👨🏾‍⚕️ Your Dashboard
        </h2>
        <div className="flex gap-2 px-4 py-2 bg-[#5b21b6] text-white rounded hover:bg-red-700">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-end md:items-center">
          <div className="overflow-x-auto py-2 md:py-0">
            <div className="flex gap-2 w-max md:w-auto">
              {["Today", "7d", "2w", "1m", "3m", "6m", "1y"].map((label) => (
                <Button
                  key={label}
                  variant={label === "Today" ? "default" : "outline"}
                  size="sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-2 ">
            <CardContent>
              <div className="flex items-center gap-4 p-2">
                {doctor?.profilePicture ? (
                  <img
                    src={doctor.profilePicture}
                    alt={`Dr. ${doctor.name}`}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#083567]"
                    onError={(e) => {
                      e.target.src = femaledr;
                      e.target.onerror = null;
                    }}
                  />
                ) : (
                  <img
                    src={femaledr}
                    alt="doctor"
                    className="w-20 h-20 rounded-full"
                  />
                )}
                <div>
                  <h2 className="text-lg font-bold">Hello,</h2>
                  <h1 className="text-2xl font-bold">
                    Dr. {doctor?.name || "Doctor"}
                  </h1>
                  <p>{doctor?.specializations?.join(", ") || "Specialist"}</p>
                  <p>
                    You have total{" "}
                    <span className=" text-red-600 rounded font-bold">
                      {stats.todayAppointments} appointments
                    </span>{" "}
                    today.
                  </p>
                  <p className="text-yellow-300 mt-1">★★★★★</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="bg-white shadow-md rounded-xl p-4 flex flex-col justify-center ">
            <div className="text-4xl text-[#083567] font-bold">
              {stats.totalPatients}
            </div>
            <div className="text-2xl text-gray-700">Patients</div>
            <div className="text-green-500 text-md">40% High</div>
          </div>
          <div className="bg-white shadow-md rounded-xl p-4 flex flex-col justify-center ">
            <div className="text-4xl text-[#083567] font-bold">
              {stats.pendingAppointments}
            </div>
            <div className="text-2xl text-gray-700">Pending</div>
            <div className="text-orange-500 text-md">26% High</div>
          </div>
          <div className="bg-white shadow-md rounded-xl p-4 flex flex-col justify-center ">
            <div className="text-4xl text-[#083567] font-bold">
              {doctorUtils.formatCurrency(stats.totalEarnings)}
            </div>
            <div className="text-2xl text-gray-700">Earnings</div>
            <div className="text-green-500 text-md">30% High</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <CardContent>
            <h3 className="font-semibold mb-4 text-[#083567]">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/doctor/emergency-video-chat")}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 text-lg font-medium"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Emergency Video Call</span>
              </button>
            </div>
          </CardContent>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mt-4 ml-4 text-[#083567]">
                Patients{" "}
                <span className="text-sm text-gray-500">
                  {stats.totalPatients || 0} total patients
                </span>
              </h3>
              <Line data={patientChartData} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mt-4 ml-4  text-[#083567]">
                Appointments{" "}
                <span className="text-sm text-gray-500">
                  {stats.pendingAppointments || 0} pending appointments
                </span>
              </h3>
              <Bar data={appointmentChartData} />
            </CardContent>
          </Card>
        </div>

        {/* Add second row: Reviews, Patient Type, Awards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent>
              <h3 className="font-semibold mt-4 ml-4  text-[#083567]">
                Patient Reviews
              </h3>
              <div className="space-y-2">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <p className="font-bold">{review.patientName}</p>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {review.comment}
                    </p>
                    <p className="text-yellow-500 text-sm mt-1">
                      {renderStars(review.rating)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="font-semibold mt-4 ml-4  text-[#083567]">
                Patients Type
              </h3>
              <Doughnut data={patientTypeData} />
              <p className="text-sm text-gray-500 mt-2">
                {stats.totalPatients || 0} total patients:{" "}
                {Math.floor((stats.totalPatients || 0) * 0.3)} male,{" "}
                {Math.floor((stats.totalPatients || 0) * 0.4)} female,{" "}
                {Math.floor((stats.totalPatients || 0) * 0.3)} kids
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="font-semibold mt-4 ml-4 text-[#083567]">Awards</h3>
              <div className="space-y-2">
                {awards.map((award) => (
                  <div key={award.id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-bold">{award.name}</p>
                    <p className="text-sm text-gray-600">{award.description}</p>
                    <p className="text-2xl font-bold">{award.icon}</p>
                    <p className="text-sm text-gray-500 mt-1">{award.year}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        {recentAppointments.length > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-[#083567]">
                Recent Appointments
              </h3>
              <div className="space-y-3">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {appointment.patient?.name || "Patient"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {doctorUtils.formatDate(appointment.appointmentDate)} at{" "}
                        {appointment.appointmentTime}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${doctorUtils.getStatusBadge(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        )}
      </div>
    </div>
  );
}
