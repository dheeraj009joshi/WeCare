import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doctorsAPI } from "../config/api";
import Select from "react-select";

const Services = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for doctors and specializations
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [selectedSpec, setSelectedSpec] = useState("");
  const [userBudget, setUserBudget] = useState("");
  const [minRequiredFee, setMinRequiredFee] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [wasDismissed, setWasDismissed] = useState(false);

  const options = [
    { value: "", label: "All Specializations" },
    ...specializations.map((spec) => ({ value: spec, label: spec })),
  ];

  // Fetch doctors and specializations
  useEffect(() => {
    fetchDoctorsAndSpecializations();
  }, []);

  useEffect(() => {
    if (location.state?.spec) {
      setSelectedSpec(location.state.spec);
    }
  }, [location.state]);

  const fetchDoctorsAndSpecializations = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all doctors
      const doctorsResponse = await doctorsAPI.getAllDoctors({
        is_verified: true,
        is_active: true,
      });

      // The API returns the data directly, not wrapped in a success object
      const doctorsData = doctorsResponse.data || [];
      setDoctors(doctorsData);

      // Extract unique specializations from doctors
      const uniqueSpecs = [...new Set(doctorsData.map(doc => doc.specialization))];
      setSpecializations(uniqueSpecs.filter(Boolean).sort());
      
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBySpec = selectedSpec
    ? doctors.filter((doctor) => doctor.specialization === selectedSpec)
    : doctors;

  const filteredDoctors =
    userBudget !== ""
      ? filteredBySpec.filter(
          (doc) => parseInt(userBudget) >= parseInt(doc.consultation_fee || 0)
        )
      : filteredBySpec;

  useEffect(() => {
    if (
      userBudget !== "" &&
      filteredDoctors.length === 0 &&
      filteredBySpec.length > 0 &&
      !wasDismissed
    ) {
      const minFee = Math.min(...filteredBySpec.map((d) => parseInt(d.consultation_fee || 0)));
      setMinRequiredFee(minFee);
      setShowDialog(true);
    } else {
      setShowDialog(false);
    }
  }, [userBudget, filteredDoctors, filteredBySpec, wasDismissed]);

  useEffect(() => {
    setWasDismissed(false);
  }, [userBudget]);

  const handleStartChat = () => {
    console.log("Start Chat button clicked!");
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("User not logged in, redirecting to login");
      // If not logged in, redirect to login page
      navigate("/login");
      return;
    }
    console.log("User logged in, redirecting to emergency video chat");
    // If logged in, go to emergency video chat form
    navigate("/emergency/video-chat");
  };

  return (
    <section className="min-h-screen py-16 md:py-20 px-4 md:px-8">
      <div className="flex flex-col w-full lg:px-12">
        {/* Doctors Section */}

        <div className="text-center mb-12 ">
          <h1 className="pt-[30px] text-4xl md:text-5xl font-bold text-[#4f7cac] mb-4">
            Meet the Doctors
          </h1>
          <p className="text-lg md:text-xl text-[#5a6d82] max-w-3xl mx-auto">
            We connect you with trusted doctors who offer personalized,
            compassionate care.
          </p>

          {/* Budget Input */}
          <div className="mt-6 flex flex-col relative items-center ">
            <div className="flex gap-4 flex-col md:flex-row ">
              <Select
                options={options}
                value={options.find((o) => o.value === selectedSpec)}
                onChange={(selected) => setSelectedSpec(selected.value)}
                menuPortalTarget={document.body}
                styles={{
                  control: (base) => ({
                    ...base,
                    width: "280px",
                    borderRadius: "0.5rem",
                    padding: "4px",
                    borderColor: "#7c3aed",
                    boxShadow: "none",
                    zIndex: 9999,
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    transition: "opacity 0.2s ease, transform 0.2s ease", // smooth open
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#7c3aed" // purple when selected
                      : state.isFocused
                      ? "#e9d5ff" // light purple on hover
                      : "white",
                    color: state.isSelected ? "white" : "#4f7cac",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  }),
                }}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: "#7c3aed", // focus border color purple
                    primary25: "#e9d5ff", // hover light purple
                    primary50: "#d8b4fe", // active light purple
                  },
                })}
              />

              <input
                type="number"
                value={userBudget}
                onChange={(e) => setUserBudget(e.target.value)}
                placeholder="Enter your offer amount(₹)"
                className="h-12 border border-[#a78bfa] rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] w-64 bg-white"
              />
              <button
                className="h-12 w-64 bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white py-2 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                onClick={handleStartChat}
              >
                Emergency Video Chat
              </button>
            </div>

            {/* Small pop-up below input */}
            {showDialog && minRequiredFee && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-red-300 text-red-700 text-sm rounded-lg shadow-md px-4 py-2 z-10">
                Please enter at least ₹{minRequiredFee}
                <button
                  className="ml-4 text-[#7c3aed] underline text-sm"
                  onClick={() => {
                    setShowDialog(false);
                    setWasDismissed(true);
                  }}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Grid */}
        <div className="h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchDoctorsAndSpecializations}
                className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg hover:bg-[#6d28d9] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
              {filteredDoctors.map((doctor, index) => (
                <div
                  key={doctor.id}
                  className="animated-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2 border border-transparent hover:border-[#a78bfa]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div
                      className="flex flex-col items-center text-center cursor-pointer"
                      onClick={() => navigate(`/about-doctor/${doctor._id || doctor.id}`)}
                    >
                      <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-purple-200 flex items-center justify-center">
                          <span className="text-2xl font-bold text-purple-600">
                            {doctor.full_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-[#4f7cac]">
                        {doctor.full_name}
                      </h3>
                      <p className="text-[#7c3aed] font-medium">
                        {doctor.specialization}
                      </p>
                      <div className="mt-4 space-y-2 w-full">
                        <p className="flex justify-between">
                          <span className="text-[#4f7cac] font-medium">
                            Experience:
                          </span>
                          <span>{doctor.experience_years} years</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#4f7cac] font-medium">
                            License:
                          </span>
                          <span className="text-sm">{doctor.license_number}</span>
                        </p>
                        <p className="flex justify-between font-bold">
                          <span className="text-[#4f7cac]">Fee:</span>
                          <span>₹{doctor.consultation_fee}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      className="mt-6 w-full bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white py-2 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                      onClick={() =>
                        navigate(`/about-doctor/${doctor._id || doctor.id}`)
                      }
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-[#4f7cac] mb-4">
                {userBudget !== "" && minRequiredFee
                  ? `No doctors found. Please offer at least ₹${minRequiredFee}`
                  : "No doctors found for this specialization"}
              </h3>
              <button
                className="mt-4 bg-[#a78bfa] text-white py-2 px-6 rounded-lg hover:bg-[#8b5cf6] transition-colors mx-auto"
                onClick={() => {
                  setSelectedSpec("");
                  setUserBudget("");
                }}
              >
                Show All Doctors
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Services;
