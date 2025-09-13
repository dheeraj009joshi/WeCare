const { Op } = require('sequelize');
const { getModels } = require('../models');

// Get all services
const getAllServices = async (req, res) => {
  try {
    const { Service } = getModels();
    
    const services = await Service.findAll({
      order: [['name', 'ASC']]
    });

    res.json(services);
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ error: 'Failed to get services' });
  }
};

// Get doctors by service
const getDoctorsByService = async (req, res) => {
  try {
    const { Doctor } = getModels();
    const { serviceId } = req.params;

    const doctors = await Doctor.findAll({
      where: {
        specializations: {
          [Op.contains]: [serviceId]
        },
        isAvailable: true
      },
      attributes: [
        'id', 'name', 'email', 'phone', 'specializations', 
        'experience', 'consultationFee', 'rating', 'bio', 'profileImage'
      ],
      order: [['rating', 'DESC'], ['experience', 'DESC']]
    });

    res.json(doctors);
  } catch (error) {
    console.error('Error getting doctors by service:', error);
    res.status(500).json({ error: 'Failed to get doctors by service' });
  }
};

// Get all specializations
const getAllSpecializations = async (req, res) => {
  try {
    const { Doctor } = getModels();
    
    const specializations = [
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Dermatology',
      'Pediatrics',
      'Gynecology',
      'Oncology',
      'Psychiatry',
      'General Medicine',
      'Surgery',
      'Dentistry',
      'Ophthalmology',
      'ENT',
      'Urology',
      'Gastroenterology',
      'Endocrinology',
      'Rheumatology',
      'Pulmonology',
      'Nephrology',
      'Hematology'
    ];

    res.json(specializations);
  } catch (error) {
    console.error('Error getting specializations:', error);
    res.status(500).json({ error: 'Failed to get specializations' });
  }
};

// Get doctors by specialization
const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { Doctor } = getModels();
    const { specialization } = req.params;

    const doctors = await Doctor.findAll({
      where: {
        specializations: {
          [Op.contains]: [specialization]
        },
        isAvailable: true
      },
      attributes: [
        'id', 'name', 'email', 'phone', 'specializations', 
        'experience', 'consultationFee', 'rating', 'bio', 'profileImage'
      ],
      order: [['rating', 'DESC'], ['experience', 'DESC']]
    });

    res.json(doctors);
  } catch (error) {
    console.error('Error getting doctors by specialization:', error);
    res.status(500).json({ error: 'Failed to get doctors by specialization' });
  }
};

// Search doctors
const searchDoctors = async (req, res) => {
  try {
    const { Doctor } = getModels();
    const { query, specialization, city } = req.query;

    let whereClause = {
      isAvailable: true
    };

    if (specialization) {
      whereClause.specializations = {
        [Op.contains]: [specialization]
      };
    }

    if (city) {
      whereClause.city = {
        [Op.iLike]: `%${city}%`
      };
    }

    if (query) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } },
        { specializations: { [Op.contains]: [query] } },
        { bio: { [Op.iLike]: `%${query}%` } }
      ];
    }

    const doctors = await Doctor.findAll({
      where: whereClause,
      attributes: [
        'id', 'name', 'email', 'phone', 'specializations', 
        'experience', 'consultationFee', 'rating', 'bio', 'profileImage'
      ],
      order: [['rating', 'DESC'], ['experience', 'DESC']]
    });

    res.json(doctors);
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ error: 'Failed to search doctors' });
  }
};

module.exports = {
  getAllServices,
  getDoctorsByService,
  getAllSpecializations,
  getDoctorsBySpecialization,
  searchDoctors
}; 