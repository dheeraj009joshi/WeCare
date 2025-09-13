const { Op } = require('sequelize');

// Helper function to get models only when needed
const getModels = () => {
  const { Doctor, Service } = require('../models');
  return { Doctor, Service };
};

// Get all doctors for services page
const getAllDoctors = async (req, res) => {
  try {
    const { Doctor } = getModels();
    const { specialization } = req.query;
    
    let whereClause = {
      isAvailable: true
    };
    
    // Filter by specialization if provided
    if (specialization && specialization !== '') {
      whereClause.specializations = {
        [Op.contains]: [specialization]
      };
    }

    const doctors = await Doctor.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'specializations',
        'experience',
        'consultationFee',
        'profilePicture',
        'rating',
        'isAvailable',
        'bio', 'qualifications', 'certificates'
      ],
      order: [['name', 'ASC']]
    });

    // Transform data to match frontend structure
    const transformedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specializations[0] || 'General Practice', // Use first specialization
      experience: `${doctor.experience} years`,
      languages: "English / Hindi", // Default language
      fee: `Rs.${doctor.consultationFee}/session`,
      image: doctor.profilePicture || '/api/uploads/default-doctor.jpg', // Default image
      rating: doctor.rating,
      isAvailable: doctor.isAvailable
    }));

    res.json({
      success: true,
      data: transformedDoctors,
      count: transformedDoctors.length
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
};

// Get all specializations
const getAllSpecializations = async (req, res) => {
  try {
    const specializations = [
      "General Practice",
      "Family Medicine",
      "Internal Medicine",
      "Pediatrics",
      "Cardiology",
      "Endocrinology",
      "Gastroenterology",
      "Nephrology",
      "Pulmonology",
      "Rheumatology",
      "Infectious Disease",
      "Hematology",
      "Oncology",
      "Allergy and Immunology",
      "Geriatrics",
      "Dermatology",
      "Psychiatry",
      "General Surgery",
      "Neurosurgery",
      "Orthopedic Surgery",
      "Cardiothoracic Surgery",
      "Plastic Surgery",
      "Urology",
      "Otolaryngology (ENT)",
      "Ophthalmology",
      "Vascular Surgery",
      "Pediatric Surgery",
      "Colorectal Surgery",
      "Radiology",
      "Pathology",
      "Nuclear Medicine",
      "Laboratory Medicine",
      "Obstetrics and Gynecology (OB/GYN)",
      "Neonatology",
      "Anesthesiology",
      "Critical Care Medicine",
      "Interventional Cardiology",
      "Pediatric Cardiology",
      "Neurocritical Care",
      "Reproductive Endocrinology",
      "Pain Medicine",
      "Sports Medicine",
      "Sleep Medicine",
      "Medical Genetics",
      "Gastrointestinal Surgery",
      "Public Health",
      "Preventive Medicine",
      "Hospital Administration",
      "Healthcare Management",
      "Medical Informatics",
      "Medical Education",
      "Medical Research",
      "Legal Medicine",
      "Forensic Medicine"
    ];

    res.json({
      success: true,
      data: specializations
    });

  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specializations',
      error: error.message
    });
  }
};

// Get doctor by ID for detailed view
const getDoctorById = async (req, res) => {
  try {
    const { Doctor } = getModels();
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id, {
      attributes: [
        'id',
        'name',
        'specializations',
        'experience',
        'consultationFee',
        'profilePicture',
        'rating',
        'isAvailable',
        'practiceName',
        'address',
        'city',
        'state',
        'qualifications',
        'totalPatients',
        'totalAppointments',
        'bio', 'qualifications', 'certificates'
      ]
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Transform data to match frontend structure
    const transformedDoctor = {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specializations[0] || 'General Practice',
      experience: `${doctor.experience} years`,
      languages: "English / Hindi",
      fee: `Rs.${doctor.consultationFee}/session`,
      image: doctor.profilePicture || '/api/uploads/default-doctor.jpg',
      rating: doctor.rating,
      isAvailable: doctor.isAvailable,
      practiceName: doctor.practiceName,
      address: doctor.address,
      city: doctor.city,
      state: doctor.state,
      qualifications: doctor.qualifications,
      totalPatients: doctor.totalPatients,
      totalAppointments: doctor.totalAppointments
    };

    res.json({
      success: true,
      data: transformedDoctor
    });

  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor details',
      error: error.message
    });
  }
};

// Search doctors by name or specialization
const searchDoctors = async (req, res) => {
  try {
    const { Doctor } = getModels();
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const doctors = await Doctor.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${query}%`
            }
          },
          {
            specializations: {
              [Op.contains]: [query]
            }
          }
        ]
      },
      attributes: [
        'id',
        'name',
        'specializations',
        'experience',
        'consultationFee',
        'profilePicture',
        'rating',
        'isAvailable',
        'bio', 'qualifications', 'certificates'
      ],
      order: [['name', 'ASC']]
    });

    // Transform data to match frontend structure
    const transformedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specializations[0] || 'General Practice',
      experience: `${doctor.experience} years`,
      languages: "English / Hindi",
      fee: `Rs.${doctor.consultationFee}/session`,
      image: doctor.profilePicture || '/api/uploads/default-doctor.jpg',
      rating: doctor.rating,
      isAvailable: doctor.isAvailable
    }));

    res.json({
      success: true,
      data: transformedDoctors,
      count: transformedDoctors.length
    });

  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search doctors',
      error: error.message
    });
  }
};

module.exports = {
  getAllDoctors,
  getAllSpecializations,
  getDoctorById,
  searchDoctors
};