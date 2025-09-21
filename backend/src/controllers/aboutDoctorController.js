const { getModels } = require('../models');

// Get all doctors for Services page
const getAllDoctors = async (req, res) => {
  try {
    const { Doctor } = getModels();
    
    console.log("Fetching all doctors for Services page");

    // Get all doctors from database
    const doctors = await Doctor.findAll({
      attributes: [
        "id",
        "name",
        "specializations",
        "experience",
        "consultationFee",
        "profilePicture",
        "rating",
        "isAvailable",
        "isVerified",
        "practiceName",
        "address",
        "city",
        "state",
        "qualifications",
      ],
    });

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No doctors found",
      });
    }

    console.log(`Found ${doctors.length} doctors`);

    // Transform data to match frontend structure
    const transformedDoctors = doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      specialization:
        doctor.specializations && doctor.specializations.length > 0
          ? doctor.specializations[0]
          : "General Practice",
      experience: `${doctor.experience} years`,
      languages: "English / Hindi",
      fee: doctor.consultationFee?.toString() || "1000",
      image:
        doctor.profilePicture ||
        "https://img.freepik.com/free-photo/young-doctor-man-with-stethoscope-isolated-purple-background-has-realized-something-has-intentional-error_1368-162767.jpg",
      rating: doctor.rating || 4.5,
      isAvailable: doctor.isAvailable,
      isVerified: doctor.isVerified,
      practiceName: doctor.practiceName || "General Clinic",
      address: doctor.address || "Medical Center",
      city: doctor.city || "City",
      state: doctor.state || "State",
      qualifications: doctor.qualifications || "MBBS",
    }));

    res.json({
      success: true,
      data: transformedDoctors,
    });
  } catch (error) {
    console.error("Error fetching all doctors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

// Get detailed doctor information for about doctor page
const getDoctorDetails = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const { Doctor } = getModels();

    const doctor = await Doctor.findByPk(doctorId, {
      attributes: [
        "id",
        "name",
        "specializations",
        "experience",
        "consultationFee",
        "profilePicture",
        "rating",
        "isAvailable",
        "isVerified",
        "practiceName",
        "address",
        "city",
        "state",
        "qualifications",
        "totalPatients",
        "totalAppointments",
        "bio", // ✅ Added bio column
      ],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Transform data to match frontend structure exactly
    const transformedDoctor = {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specializations[0] || "General Practice",
      experience: `${doctor.experience} years`,
      languages: "English / Hindi",
      fee: `₹${doctor.consultationFee}`,
      image:
        doctor.profilePicture ||
        "https://img.freepik.com/free-photo/young-doctor-man-with-stethoscope-isolated-purple-background-has-realized-something-has-intentional-error_1368-162767.jpg",
      rating: doctor.rating || 4.5,
      isAvailable: doctor.isAvailable,
      isVerified: doctor.isVerified,
      practiceName: doctor.practiceName || "General Clinic",
      address: doctor.address || "Medical Center",
      city: doctor.city || "City",
      state: doctor.state || "State",
      qualifications: doctor.qualifications || "MBBS",
      totalPatients: doctor.totalPatients || 100,
      totalAppointments: doctor.totalAppointments || 500,
      bio: doctor.bio || "", // ✅ Add bio here
    };

    res.json({
      success: true,
      data: transformedDoctor,
    });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor details",
      error: error.message,
    });
  }
};

// Get doctor availability for the next 7 days
const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Generate availability for next 7 days
    const availability = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const dayName = currentDate
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();
      const dayNumber = currentDate.getDate();

      availability.push({
        date: currentDate.toISOString().split("T")[0],
        day: `${dayName} ${dayNumber}`,
        isSelected: i === 0, // First day is selected by default
        timeSlots: [
          "05:00 pm",
          "06:00 pm",
          "06:30 pm",
          "07:00 pm",
          "07:30 pm",
          "08:00 pm",
          "08:30 pm",
        ],
      });
    }

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error fetching doctor availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor availability",
      error: error.message,
    });
  }
};

// Book appointment with doctor
const bookAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, time, patientId, reason } = req.body;

    // Create appointment
    const { Appointment } = getModels();

    const appointment = await Appointment.create({
      doctorId: parseInt(doctorId),
      patientId: patientId || 1, // Default patient ID for testing
      appointmentDate: date,
      appointmentTime: time,
      reason: reason || "General consultation",
      status: "pending",
      consultationFee: 1000,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        appointmentId: appointment.id,
        doctorId: doctorId,
        date: date,
        time: time,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorDetails,
  getDoctorAvailability,
  bookAppointment,
};
