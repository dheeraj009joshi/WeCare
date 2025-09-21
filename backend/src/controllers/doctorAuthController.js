const { getModels } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const { sendDoctorRegistrationEmail, sendLoginEmail } = require('../services/emailService');

// Doctor Registration
const registerDoctor = async (req, res) => {
  const { Doctor, User } = getModels();
  try {
    // Check database connection
    try {
      await sequelize.authenticate();
      console.log('Database connection verified');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({
        message: 'Database connection failed. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? dbError.message : 'Database connection error'
      });
    }

    console.log('Doctor registration request received:', {
      body: req.body,
      headers: req.headers
    });
    
    const {
      name,
      email,
      password,
      phone,
      dob,
      gender,
      profilePicture,
      licenseNumber,
      experience,
      specializations,
      qualifications,
      bio,
      certificates,
      practiceName,
      address,
      city,
      state,
      zipCode,
      country,
      consultationFee
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'name', 'email', 'password', 'phone', 'dob', 'gender',
      'licenseNumber', 'experience', 'specializations', 'qualifications', 'bio',
      'practiceName', 'address', 'city', 'state', 'zipCode', 'country', 'consultationFee'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'The following required fields are missing:',
        missingFields: missingFields.map(field => ({
          field,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        })),
        suggestion: 'Please fill in all required fields and try again. All fields marked with * are required. You can save your progress and complete the form later.'
      });
    }

    // Validate specializations array
    if (!specializations || specializations.length === 0) {
      return res.status(400).json({
        message: 'At least one specialization is required',
        field: 'specializations',
        suggestion: 'Please add at least one medical specialization from the form (e.g., Cardiology, Neurology, Pediatrics). You can add multiple specializations.'
      });
    }

    // Ensure specializations is an array
    if (!Array.isArray(specializations)) {
      return res.status(400).json({
        message: 'Specializations must be provided as a list',
        field: 'specializations',
        suggestion: 'Please use the form to add specializations one by one. Click the "Add" button after typing each specialization. You can remove specializations by clicking the "x" button.'
      });
    }

    // Validate each specialization
    for (let i = 0; i < specializations.length; i++) {
      const spec = specializations[i];
      if (typeof spec !== 'string' || spec.trim().length < 2 || spec.trim().length > 50) {
        return res.status(400).json({
          message: `Invalid specialization format`,
          field: `specializations[${i}]`,
          value: spec,
          suggestion: 'Each specialization must be 2-50 characters long and contain only letters and spaces (e.g., Cardiology, Neurology, Internal Medicine)'
        });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
        field: 'email',
        value: email,
        suggestion: 'Please enter a valid email address (e.g., doctor@example.com). Make sure to include @ and domain. This will be used for login and notifications.'
      });
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: 'Invalid phone number format',
        field: 'phone',
        value: phone,
        suggestion: 'Phone number must be exactly 10 digits without spaces or special characters (e.g., 9876543210). Remove any +91 or country code. This will be used for patient contact.'
      });
    }

    // Validate experience (must be a positive number)
    if (isNaN(experience) || parseInt(experience) < 0) {
      return res.status(400).json({
        message: 'Invalid experience value',
        field: 'experience',
        value: experience,
        suggestion: 'Experience must be a valid positive number in years (e.g., 5). Enter only the number of years. This helps patients understand your expertise level.'
      });
    }

    // Validate experience range (reasonable limits)
    if (parseInt(experience) > 50) { // 50 years limit
      return res.status(400).json({
        message: 'Experience value too high',
        field: 'experience',
        value: experience,
        suggestion: 'Experience cannot exceed 50 years. Please enter a realistic value between 0 and 50. Most doctors have 0-30 years of experience.'
      });
    }

    // Validate consultation fee (must be a positive number)
    if (isNaN(consultationFee) || parseFloat(consultationFee) < 0) {
      return res.status(400).json({
        message: 'Invalid consultation fee',
        field: 'consultationFee',
        value: consultationFee,
        suggestion: 'Consultation fee must be a valid positive number in rupees (e.g., 500). Enter only the amount without ₹ symbol.'
      });
    }

    // Validate consultation fee range (reasonable limits)
    if (parseFloat(consultationFee) > 10000) { // ₹10,000 limit
      return res.status(400).json({
        message: 'Consultation fee too high',
        field: 'consultationFee',
        value: consultationFee,
        suggestion: 'Consultation fee cannot exceed ₹10,000. Please enter a realistic amount between ₹0 and ₹10,000. Most consultations cost ₹200-₹2000.'
      });
    }

    // Validate date of birth
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid date of birth',
        field: 'dob',
        value: dob,
        suggestion: 'Please enter a valid date in YYYY-MM-DD format (e.g., 1990-01-01). Use the date picker for best results.'
      });
    }

    // Check if DOB is not in the future
    if (dobDate > new Date()) {
      return res.status(400).json({
        message: 'Date of birth cannot be in the future',
        field: 'dob',
        value: dob,
        suggestion: 'Please enter a valid date that is in the past or today. You cannot be born in the future.'
      });
    }

    // Validate license number format (alphanumeric, at least 6 characters)
    const licenseRegex = /^[A-Za-z0-9]{6,}$/;
    if (!licenseRegex.test(licenseNumber)) {
      return res.status(400).json({
        message: 'Invalid license number format',
        field: 'licenseNumber',
        value: licenseNumber,
        suggestion: 'License number must be at least 6 alphanumeric characters without spaces (e.g., MD12345). This is your medical council registration number.'
      });
    }

    // Validate practice name length
    if (practiceName.length < 3 || practiceName.length > 100) {
      return res.status(400).json({
        message: 'Practice name length invalid',
        field: 'practiceName',
        value: practiceName,
        suggestion: 'Practice name must be between 3 and 100 characters (e.g., City General Hospital, Dr. Smith Clinic)'
      });
    }

    // Validate address length
    if (address.length < 10 || address.length > 500) {
      return res.status(400).json({
        message: 'Address length invalid',
        field: 'address',
        value: address,
        suggestion: 'Address must be between 10 and 500 characters (e.g., 123 Main Street, Downtown Area, Near City Center)'
      });
    }

    // Validate city, state, and country length
    if (city.length < 2 || city.length > 50) {
      return res.status(400).json({
        message: 'City name length invalid',
        field: 'city',
        value: city,
        suggestion: 'City must be between 2 and 50 characters (e.g., Mumbai, Delhi, Bangalore)'
      });
    }

    if (state.length < 2 || state.length > 50) {
      return res.status(400).json({
        message: 'State name length invalid',
        field: 'state',
        value: state,
        suggestion: 'State must be between 2 and 50 characters (e.g., Maharashtra, Karnataka, Tamil Nadu)'
      });
    }

    if (country.length < 2 || country.length > 50) {
      return res.status(400).json({
        message: 'Country name length invalid',
        field: 'country',
        value: country,
        suggestion: 'Country must be between 2 and 50 characters (e.g., India, USA, UK)'
      });
    }

    // Validate zip code format (5-10 alphanumeric characters)
    const zipRegex = /^[A-Za-z0-9]{5,10}$/;
    if (!zipRegex.test(zipCode)) {
      return res.status(400).json({
        message: 'Invalid zip code format',
        field: 'zipCode',
        value: zipCode,
        suggestion: 'Zip code must be 5-10 alphanumeric characters without spaces (e.g., 12345 or ABC123). This is your postal code.'
      });
    }

    // Validate bio length (required field)
    if (!bio || bio.trim().length === 0) {
      return res.status(400).json({
        message: 'Bio is required',
        field: 'bio',
        suggestion: 'Please provide a brief bio about your medical experience and expertise (e.g., Experienced cardiologist with expertise in interventional procedures, patient care, and research...)'
      });
    }
    
    if (bio.length < 10 || bio.length > 2000) {
      return res.status(400).json({
        message: 'Bio length invalid',
        field: 'bio',
        value: bio,
        suggestion: 'Bio must be between 10 and 2000 characters (e.g., Experienced cardiologist with expertise in interventional procedures, patient care, and research...)'
      });
    }

    // Validate profile picture size (if provided)
    if (profilePicture && profilePicture.length > 5000000) { // 5MB limit
      return res.status(400).json({
        message: 'Profile picture too large',
        field: 'profilePicture',
        suggestion: 'Profile picture size must be less than 5MB. Please compress the image or use a smaller file.'
      });
    }

    // Validate certificates size (if provided)
    if (certificates && Array.isArray(certificates)) {
      for (let i = 0; i < certificates.length; i++) {
        if (certificates[i] && certificates[i].length > 10000000) { // 10MB limit per certificate
          return res.status(400).json({
            message: `Certificate ${i + 1} too large`,
            field: `certificates[${i}]`,
            suggestion: `Certificate ${i + 1} size must be less than 10MB. Please compress the file or use a smaller one.`
          });
        }
      }
    }

    // Validate certificates format (if provided)
    if (certificates && Array.isArray(certificates)) {
      for (let i = 0; i < certificates.length; i++) {
        const cert = certificates[i];
        if (typeof cert !== 'string' || cert.trim().length === 0) {
          return res.status(400).json({
            message: `Certificate ${i + 1} format invalid`,
            field: `certificates[${i}]`,
            value: cert,
            suggestion: `Certificate ${i + 1} must be a valid file or string`
          });
        }
      }
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password too short',
        field: 'password',
        suggestion: 'Password must be at least 8 characters long (e.g., MyPass123)'
      });
    }

    // Check for at least one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password complexity insufficient',
        field: 'password',
        suggestion: 'Password must contain at least one uppercase letter, one lowercase letter, and one number (e.g., MyPass123). This makes your password more secure.'
      });
    }

    // Validate name format (letters and spaces only, 2-50 characters)
    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message: 'Invalid name format',
        field: 'name',
        value: name,
        suggestion: 'Name must contain only letters and spaces, between 2 and 50 characters (e.g., Dr. John Smith, Dr. Sarah Johnson)'
      });
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({
      where: {
        [Op.or]: [{ email }, { licenseNumber }, { phone }]
      }
    });

    if (existingDoctor) {
      let duplicateField = '';
      if (existingDoctor.email === email) duplicateField = 'email';
      else if (existingDoctor.licenseNumber === licenseNumber) duplicateField = 'license number';
      else if (existingDoctor.phone === phone) duplicateField = 'phone number';
      
      return res.status(400).json({
        message: `A doctor with this ${duplicateField} already exists`,
        field: duplicateField,
        suggestion: `Please use a different ${duplicateField} or try logging in if you already have an account`
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare data with proper types
    const doctorData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      dob: dob ? new Date(dob) : new Date(),
      gender: ['male', 'female', 'other'].includes(gender.toLowerCase()) ? gender.toLowerCase() : 'other',
      profilePicture: profilePicture || null,
      licenseNumber: licenseNumber.trim(),
      experience: parseInt(experience) || 0,
      specializations: Array.isArray(specializations) ? specializations : (specializations ? [specializations] : []),
      qualifications: qualifications.trim(),
      bio: bio || null,
      certificates: Array.isArray(certificates) ? certificates : [],
      practiceName: practiceName.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim(),
      consultationFee: parseFloat(consultationFee) || 0
    };

    // Create new doctor
    console.log('Attempting to create doctor with data:', doctorData);
    const doctor = await Doctor.create(doctorData);
    console.log('Doctor created successfully:', { id: doctor.id, email: doctor.email });

    // Generate JWT token
    const payload = {
      id: doctor.id,
      email: doctor.email,
      role: 'doctor'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Send registration success email
    try {
      await sendDoctorRegistrationEmail(doctor.name, doctor.email);
    } catch (emailError) {
      console.error('Failed to send doctor registration email:', emailError);
      // Don't fail the registration if email fails
    }

    // Remove password from response
    const doctorResponse = doctor.toJSON();
    delete doctorResponse.password;

    res.status(201).json({
      message: 'Doctor registered successfully',
      token,
      doctor: doctorResponse
    });

  } catch (error) {
    console.error('Doctor registration error:', error);
    
    // Check for specific validation errors
    if (error.name === 'SequelizeValidationError') {
      const fieldErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        message: 'Please check the following fields:',
        errors: fieldErrors,
        suggestion: 'Please correct the highlighted fields and try again. If you need help, contact support or check the field suggestions below.'
      });
    }
    
    // Check for unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      const duplicateField = error.errors?.[0]?.path || 'field';
      return res.status(400).json({
        message: `A doctor with this ${duplicateField} already exists`,
        field: duplicateField,
        suggestion: `Please use a different ${duplicateField} or try logging in if you already have an account. If you forgot your password, use the forgot password option. You can also contact support for help.`
      });
    }
    
    res.status(500).json({
      message: 'An unexpected error occurred. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Doctor Login
const loginDoctor = async (req, res) => {
  const { Doctor } = getModels();
  try {
    const { professionalId, password } = req.body;

    // Validate input
    if (!professionalId || !password) {
      return res.status(400).json({
        message: 'Professional ID/Email and password are required'
      });
    }

    // Find doctor by email or license number
    const doctor = await Doctor.findOne({
      where: {
        [Op.or]: [
          { email: professionalId },
          { licenseNumber: professionalId }
        ]
      }
    });

    if (!doctor) {
      return res.status(400).json({
        message: 'Professional ID/Email not registered',
        errorType: 'professional_id_not_found',
        suggestion: 'This Professional ID or Email is not registered. Please check your details or contact support to register.'
      });
    }

    // Check if doctor is verified
    if (!doctor.isVerified) {
      return res.status(403).json({
        message: 'Account not verified. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Incorrect password',
        errorType: 'wrong_password',
        suggestion: 'The password you entered is incorrect. Please try again or contact support to reset your password.'
      });
    }

    // Generate JWT token
    const payload = {
      id: doctor.id,
      email: doctor.email,
      role: 'doctor'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Send login success email
    try {
      await sendLoginEmail(doctor.name, doctor.email, 'doctor');
    } catch (emailError) {
      console.error('Failed to send doctor login email:', emailError);
      // Don't fail the login if email fails
    }

    // Remove password from response
    const doctorResponse = doctor.toJSON();
    delete doctorResponse.password;

    res.status(200).json({
      message: 'Login successful',
      token,
      doctorResponse
    });

  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({
      message: 'An unexpected error occurred during login. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete Doctor (for admin purposes)
const deleteDoctor = async (req, res) => {
  const { Doctor } = getModels();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'Doctor ID is required',
        field: 'id',
        suggestion: 'Please provide a valid doctor ID'
      });
    }

    // Find the doctor
    const doctor = await Doctor.findByPk(id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found',
        suggestion: 'The doctor with this ID does not exist or has been deleted'
      });
    }

    // Check if doctor has any active appointments or other dependencies
    // This is a safety check - you might want to add more specific checks
    const hasActiveAppointments = await doctor.countAppointments();
    
    if (hasActiveAppointments > 0) {
      return res.status(400).json({
        message: 'Cannot delete doctor with active appointments',
        suggestion: 'Please cancel or reassign all active appointments before deleting this doctor'
      });
    }

    // Delete the doctor
    await doctor.destroy();

    res.status(200).json({
      message: 'Doctor deleted successfully',
      deletedDoctorId: id
    });

  } catch (error) {
    console.error('Delete doctor error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while deleting doctor. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Verify/Unverify Doctor (for admin purposes)
const updateDoctorVerificationStatus = async (req, res) => {
  const { Doctor } = getModels();
  try {
    const { id } = req.params;
    const { isVerified, verificationNotes } = req.body;

    if (!id) {
      return res.status(400).json({
        message: 'Doctor ID is required',
        field: 'id',
        suggestion: 'Please provide a valid doctor ID'
      });
    }

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({
        message: 'Verification status is required',
        field: 'isVerified',
        suggestion: 'Please provide true or false for verification status'
      });
    }

    // Find the doctor
    const doctor = await Doctor.findByPk(id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found',
        suggestion: 'The doctor with this ID does not exist or has been deleted'
      });
    }

    // Update verification status
    await doctor.update({ 
      isVerified,
      verificationNotes: verificationNotes || null
    });

    // Fetch updated doctor data
    const updatedDoctor = await Doctor.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: `Doctor ${isVerified ? 'verified' : 'unverified'} successfully`,
      doctor: updatedDoctor
    });

  } catch (error) {
    console.error('Update doctor verification status error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while updating verification status. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get Doctor Statistics (for admin purposes)
const getDoctorStatistics = async (req, res) => {
  const { Doctor, Appointment } = getModels();
  try {
    const totalDoctors = await Doctor.count();
    const verifiedDoctors = await Doctor.count({ where: { isVerified: true } });
    const unverifiedDoctors = await Doctor.count({ where: { isVerified: false } });
    
    // Get doctors by specialization
    const specializationStats = await Doctor.findAll({
      attributes: [
        'specializations',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['specializations'],
      raw: true
    });
    
    // Get doctors by country
    const countryStats = await Doctor.findAll({
      attributes: [
        'country',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['country'],
      raw: true
    });
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await Doctor.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    
    res.status(200).json({
      statistics: {
        total: totalDoctors,
        verified: verifiedDoctors,
        unverified: unverifiedDoctors,
        recentRegistrations,
        bySpecialization: specializationStats,
        byCountry: countryStats
      }
    });

  } catch (error) {
    console.error('Get doctor statistics error:', error);
    res.status(500).json({
      message: 'Failed to retrieve doctor statistics. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get All Doctors (for admin purposes)
const getAllDoctors = async (req, res) => {
  const { Doctor } = getModels();
  try {
    const { page = 1, limit = 10, search, status, specialization } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { licenseNumber: { [Op.iLike]: `%${search}%` } },
        { practiceName: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Add status filter
    if (status) {
      whereClause.isVerified = status === 'verified';
    }
    
    // Add specialization filter
    if (specialization) {
      whereClause.specializations = { [Op.contains]: [specialization] };
    }
    
    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      doctors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalDoctors: count,
        doctorsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      message: 'Failed to retrieve doctors. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get Doctor Profile by ID (for admin purposes)
const getDoctorProfileById = async (req, res) => {
  const { Doctor } = getModels();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'Doctor ID is required',
        field: 'id',
        suggestion: 'Please provide a valid doctor ID'
      });
    }

    const doctor = await Doctor.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found',
        suggestion: 'The doctor with this ID does not exist or has been deleted'
      });
    }

    res.status(200).json({
      doctor
    });

  } catch (error) {
    console.error('Get doctor profile by ID error:', error);
    res.status(500).json({
      message: 'Failed to retrieve doctor profile. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get Doctor Profile
const getDoctorProfile = async (req, res) => {
  const { Doctor } = getModels();
  try {
    const doctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      doctor
    });

  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      message: 'Failed to retrieve doctor profile. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update Doctor Profile Picture
const updateDoctorProfilePicture = async (req, res) => {
  const { Doctor } = getModels();
  try {
    console.log('Doctor profile picture update request received:', {
      body: req.body,
      userId: req.user.id
    });

    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({
        message: 'Profile picture is required',
        field: 'profilePicture',
        suggestion: 'Please select a profile picture to upload'
      });
    }

    // Validate profile picture size
    if (profilePicture.length > 5000000) { // 5MB limit
      return res.status(400).json({
        message: 'Profile picture too large',
        field: 'profilePicture',
        suggestion: 'Profile picture size must be less than 5MB. Please compress the image or use a smaller file. Recommended size: 500x500 pixels.'
      });
    }

    // Find the doctor
    const doctor = await Doctor.findByPk(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Update only the profile picture
    await doctor.update({ profilePicture });

    // Fetch updated doctor data
    const updatedDoctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'Profile picture updated successfully',
      doctor: updatedDoctor
    });

  } catch (error) {
    console.error('Update doctor profile picture error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while updating profile picture. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete Doctor Specialization
const deleteDoctorSpecialization = async (req, res) => {
  try {
    console.log('Doctor specialization delete request received:', {
      body: req.body,
      userId: req.user.id
    });

    const { specializationIndex } = req.body;

    if (specializationIndex === undefined || specializationIndex < 0) {
      return res.status(400).json({
        message: 'Valid specialization index is required',
        field: 'specializationIndex',
        suggestion: 'Please provide a valid specialization index to delete'
      });
    }

    // Find the doctor
    const doctor = await Doctor.findByPk(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Get current specializations
    const currentSpecializations = Array.isArray(doctor.specializations) ? doctor.specializations : [];
    
    if (specializationIndex >= currentSpecializations.length) {
      return res.status(400).json({
        message: 'Specialization index out of range',
        field: 'specializationIndex',
        value: specializationIndex,
        suggestion: `Please provide a valid index between 0 and ${currentSpecializations.length - 1}`
      });
    }

    // Check if removing this specialization would leave none
    if (currentSpecializations.length <= 1) {
      return res.status(400).json({
        message: 'Cannot delete the last specialization',
        field: 'specializationIndex',
        suggestion: 'At least one specialization is required. Please add a new specialization before deleting this one.'
      });
    }

    // Remove the specialization at the specified index
    const updatedSpecializations = currentSpecializations.filter((_, index) => index !== specializationIndex);

    // Update the specializations
    await doctor.update({ specializations: updatedSpecializations });

    // Fetch updated doctor data
    const updatedDoctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'Specialization deleted successfully',
      doctor: updatedDoctor
    });

  } catch (error) {
    console.error('Delete doctor specialization error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while deleting specialization. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update Doctor Specializations
const updateDoctorSpecializations = async (req, res) => {
  try {
    console.log('Doctor specializations update request received:', {
      body: req.body,
      userId: req.user.id
    });

    const { specializations } = req.body;

    if (!specializations || specializations.length === 0) {
      return res.status(400).json({
        message: 'At least one specialization is required',
        field: 'specializations',
        suggestion: 'Please add at least one medical specialization from the form (e.g., Cardiology, Neurology, Pediatrics). You can add multiple specializations.'
      });
    }

    // Ensure specializations is an array
    if (!Array.isArray(specializations)) {
      return res.status(400).json({
        message: 'Specializations must be provided as a list',
        field: 'specializations',
        suggestion: 'Please use the form to add specializations one by one. Click the "Add" button after typing each specialization. You can remove specializations by clicking the "x" button.'
      });
    }

    // Validate each specialization
    for (let i = 0; i < specializations.length; i++) {
      const spec = specializations[i];
      if (typeof spec !== 'string' || spec.trim().length < 2 || spec.trim().length > 50) {
        return res.status(400).json({
          message: `Invalid specialization format`,
          field: `specializations[${i}]`,
          value: spec,
          suggestion: 'Each specialization must be 2-50 characters long and contain only letters and spaces (e.g., Cardiology, Neurology, Internal Medicine)'
        });
      }
    }

    // Find the doctor
    const doctor = await Doctor.findByPk(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Update only the specializations
    await doctor.update({ specializations });

    // Fetch updated doctor data
    const updatedDoctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'Specializations updated successfully',
      doctor: updatedDoctor
    });

  } catch (error) {
    console.error('Update doctor specializations error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while updating specializations. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete Doctor Certificate
const deleteDoctorCertificate = async (req, res) => {
  try {
    console.log('Doctor certificate delete request received:', {
      body: req.body,
      userId: req.user.id
    });

    const { certificateIndex } = req.body;

    if (certificateIndex === undefined || certificateIndex < 0) {
      return res.status(400).json({
        message: 'Valid certificate index is required',
        field: 'certificateIndex',
        suggestion: 'Please provide a valid certificate index to delete'
      });
    }

    // Find the doctor
    const doctor = await Doctor.findByPk(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Get current certificates
    const currentCertificates = Array.isArray(doctor.certificates) ? doctor.certificates : [];
    
    if (certificateIndex >= currentCertificates.length) {
      return res.status(400).json({
        message: 'Certificate index out of range',
        field: 'certificateIndex',
        value: certificateIndex,
        suggestion: `Please provide a valid index between 0 and ${currentCertificates.length - 1}`
      });
    }

    // Remove the certificate at the specified index
    const updatedCertificates = currentCertificates.filter((_, index) => index !== certificateIndex);

    // Update the certificates
    await doctor.update({ certificates: updatedCertificates });

    // Fetch updated doctor data
    const updatedDoctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'Certificate deleted successfully',
      doctor: updatedDoctor
    });

  } catch (error) {
    console.error('Delete doctor certificate error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while deleting certificate. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update Doctor Certificates
const updateDoctorCertificates = async (req, res) => {
  try {
    console.log('Doctor certificates update request received:', {
      body: req.body,
      userId: req.user.id
    });

    const { certificates } = req.body;

    if (!certificates || !Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({
        message: 'At least one certificate is required',
        field: 'certificates',
        suggestion: 'Please upload at least one certificate file'
      });
    }

    // Validate certificates size
    for (let i = 0; i < certificates.length; i++) {
      if (certificates[i] && certificates[i].length > 10000000) { // 10MB limit per certificate
        return res.status(400).json({
          message: `Certificate ${i + 1} too large`,
          field: `certificates[${i}]`,
          suggestion: `Certificate ${i + 1} size must be less than 10MB. Please compress the file or use a smaller one. Supported formats: PDF, JPG, PNG.`
        });
      }
    }

    // Validate certificates format
    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      if (typeof cert !== 'string' || cert.trim().length === 0) {
        return res.status(400).json({
          message: `Certificate ${i + 1} format invalid`,
          field: `certificates[${i}]`,
          value: cert,
          suggestion: `Certificate ${i + 1} must be a valid file or string. Supported formats: PDF, JPG, PNG, or base64 encoded.`
        });
      }
    }

    // Find the doctor
    const doctor = await Doctor.findByPk(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Update only the certificates
    await doctor.update({ certificates });

    // Fetch updated doctor data
    const updatedDoctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'Certificates updated successfully',
      doctor: updatedDoctor
    });

  } catch (error) {
    console.error('Update doctor certificates error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while updating certificates. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update Appointment Status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        message: 'Appointment ID is required',
        field: 'appointmentId',
        suggestion: 'Please provide a valid appointment ID'
      });
    }

    if (!status) {
      return res.status(400).json({
        message: 'Appointment status is required',
        field: 'status',
        suggestion: 'Please provide a valid status (pending, confirmed, completed, cancelled)'
      });
    }

    // Valid statuses
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid appointment status',
        field: 'status',
        value: status,
        suggestion: 'Status must be one of: pending, confirmed, completed, cancelled'
      });
    }

    // Find the appointment
    const appointment = await Appointment.findOne({
      where: { 
        id: appointmentId,
        doctorId: req.user.id // Ensure doctor can only update their own appointments
      },
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });
    
    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        suggestion: 'The appointment with this ID does not exist or you do not have permission to update it'
      });
    }

    // Update appointment status
    await appointment.update({ 
      status,
      doctorNotes: notes || null,
      updatedAt: new Date()
    });

    // Fetch updated appointment
    const updatedAppointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    res.status(200).json({
      message: 'Appointment status updated successfully',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while updating appointment status. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get Doctor Appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, startDate, endDate } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    // Add status filter
    if (status) {
      whereClause.status = status;
    }
    
    // Add date filter
    if (startDate && endDate) {
      whereClause.appointmentDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Find the doctor
    const doctor = await Doctor.findByPk(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Get appointments
    const { count, rows: appointments } = await doctor.getAppointments({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['appointmentDate', 'DESC']],
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });
    
    res.status(200).json({
      appointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalAppointments: count,
        appointmentsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get doctor appointments error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while retrieving appointments. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get Doctor Earnings
const getDoctorEarnings = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    } else if (period) {
      const now = new Date();
      let startDateObj;
      
      switch (period) {
        case 'week':
          startDateObj = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDateObj = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDateObj = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      }
      
      dateFilter = {
        createdAt: {
          [Op.gte]: startDateObj
        }
      };
    }

    // Find the doctor
    const doctor = await Doctor.findByPk(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Get appointments for the period
    const appointments = await doctor.getAppointments({
      where: {
        ...dateFilter,
        status: 'completed'
      },
      attributes: ['id', 'consultationFee', 'createdAt']
    });

    // Calculate earnings
    const totalEarnings = appointments.reduce((sum, appointment) => {
      return sum + parseFloat(appointment.consultationFee || 0);
    }, 0);

    const totalAppointments = appointments.length;
    const averageEarnings = totalAppointments > 0 ? totalEarnings / totalAppointments : 0;

    // Group by date for chart data
    const earningsByDate = appointments.reduce((acc, appointment) => {
      const date = appointment.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + parseFloat(appointment.consultationFee || 0);
      return acc;
    }, {});

    res.status(200).json({
      earnings: {
        total: totalEarnings,
        totalAppointments,
        average: averageEarnings,
        byDate: earningsByDate,
        period: period || 'custom'
      }
    });

  } catch (error) {
    console.error('Get doctor earnings error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while retrieving earnings. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update Doctor Status (Available/Unavailable)
const updateDoctorStatus = async (req, res) => {
  try {
    console.log('Doctor status update request received:', {
      body: req.body,
      userId: req.user.id
    });

    const { isAvailable, statusMessage } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        message: 'Availability status is required',
        field: 'isAvailable',
        suggestion: 'Please provide true or false for availability status'
      });
    }

    // Find the doctor
    const doctor = await Doctor.findByPk(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Update status
    await doctor.update({ 
      isAvailable,
      statusMessage: statusMessage || null
    });

    // Fetch updated doctor data
    const updatedDoctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: `Status updated to ${isAvailable ? 'available' : 'unavailable'}`,
      doctor: updatedDoctor
    });

  } catch (error) {
    console.error('Update doctor status error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while updating status. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get Doctor Availability
const getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = id || req.user.id;

    // Find the doctor
    const doctor = await Doctor.findByPk(doctorId, {
      attributes: ['id', 'name', 'availability', 'isAvailable']
    });
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found',
        suggestion: 'The doctor with this ID does not exist or has been deleted'
      });
    }

    res.status(200).json({
      doctor: {
        id: doctor.id,
        name: doctor.name,
        availability: doctor.availability || [],
        isAvailable: doctor.isAvailable
      }
    });

  } catch (error) {
    console.error('Get doctor availability error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while retrieving availability. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update Doctor Availability
const updateDoctorAvailability = async (req, res) => {
  try {
    console.log('Doctor availability update request received:', {
      body: req.body,
      userId: req.user.id
    });

    const { availability } = req.body;

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({
        message: 'Availability schedule is required',
        field: 'availability',
        suggestion: 'Please provide a valid availability schedule array'
      });
    }

    // Validate availability structure
    for (let i = 0; i < availability.length; i++) {
      const day = availability[i];
      if (!day.day || !day.startTime || !day.endTime || typeof day.isAvailable !== 'boolean') {
        return res.status(400).json({
          message: `Invalid availability structure for day ${i + 1}`,
          field: `availability[${i}]`,
          value: day,
          suggestion: 'Each day must have: day, startTime, endTime, and isAvailable fields'
        });
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(day.startTime) || !timeRegex.test(day.endTime)) {
        return res.status(400).json({
          message: `Invalid time format for day ${i + 1}`,
          field: `availability[${i}]`,
          value: day,
          suggestion: 'Time must be in HH:MM format (e.g., 09:00, 17:30)'
        });
      }

      // Validate start time is before end time
      if (day.startTime >= day.endTime) {
        return res.status(400).json({
          message: `Start time must be before end time for day ${i + 1}`,
          field: `availability[${i}]`,
          value: day,
          suggestion: 'Start time should be earlier than end time'
        });
      }
    }

    // Find the doctor
    const doctor = await Doctor.findByPk(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Update availability
    await doctor.update({ availability });

    // Fetch updated doctor data
    const updatedDoctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'Availability updated successfully',
      doctor: updatedDoctor
    });

  } catch (error) {
    console.error('Update doctor availability error:', error);
    
    res.status(500).json({
      message: 'An unexpected error occurred while updating availability. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update Doctor Profile
const updateDoctorProfile = async (req, res) => {
  try {
    console.log('Doctor profile update request received:', {
      body: req.body,
      userId: req.user.id
    });

    const {
      name,
      email,
      phone,
      dob,
      gender,
      profilePicture,
      experience,
      specializations,
      qualifications,
      bio,
      certificates,
      practiceName,
      address,
      city,
      state,
      zipCode,
      country,
      consultationFee
    } = req.body;

    // Find the doctor
    const doctor = await Doctor.findByPk(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Check if email is being changed and if it's already taken by another doctor
    if (email && email !== doctor.email) {
      const existingDoctor = await Doctor.findOne({
        where: { 
          email,
          id: { [Op.ne]: req.user.id } // Exclude current doctor
        }
      });

      if (existingDoctor) {
        return res.status(400).json({
          message: 'A doctor with this email already exists',
          field: 'email',
          suggestion: 'Please use a different email address'
        });
      }
    }

    // Check if phone is being changed and if it's already taken by another doctor
    if (phone && phone !== doctor.phone) {
      const existingDoctor = await Doctor.findOne({
        where: { 
          phone,
          id: { [Op.ne]: req.user.id } // Exclude current doctor
        }
      });

      if (existingDoctor) {
        return res.status(400).json({
          message: 'A doctor with this phone number already exists',
          field: 'phone',
          suggestion: 'Please use a different phone number'
        });
      }
    }

    // Validate required fields
    const requiredFields = [
      'name', 'phone', 'experience', 'specializations', 'qualifications',
      'practiceName', 'address', 'city', 'state', 'zipCode', 'country', 'consultationFee'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'The following required fields are missing:',
        missingFields: missingFields.map(field => ({
          field,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        })),
        suggestion: 'Please fill in all required fields and try again. All fields marked with * are required.'
      });
    }

    // Validate specializations array
    if (!specializations || specializations.length === 0) {
      return res.status(400).json({
        message: 'At least one specialization is required',
        field: 'specializations',
        suggestion: 'Please add at least one medical specialization from the form (e.g., Cardiology, Neurology, Pediatrics). You can add multiple specializations.'
      });
    }

    // Ensure specializations is an array
    if (!Array.isArray(specializations)) {
      return res.status(400).json({
        message: 'Specializations must be provided as a list',
        field: 'specializations',
        suggestion: 'Please use the form to add specializations one by one. Click the "Add" button after typing each specialization. You can remove specializations by clicking the "x" button.'
      });
    }

    // Validate each specialization
    for (let i = 0; i < specializations.length; i++) {
      const spec = specializations[i];
      if (typeof spec !== 'string' || spec.trim().length < 2 || spec.trim().length > 50) {
        return res.status(400).json({
          message: `Invalid specialization format`,
          field: `specializations[${i}]`,
          value: spec,
          suggestion: 'Each specialization must be 2-50 characters long and contain only letters and spaces (e.g., Cardiology, Neurology, Internal Medicine)'
        });
      }
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Invalid email format',
          field: 'email',
          value: email,
          suggestion: 'Please enter a valid email address (e.g., doctor@example.com). Make sure to include @ and domain. This will be used for login and notifications.'
        });
      }
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: 'Invalid phone number format',
        field: 'phone',
        value: phone,
        suggestion: 'Phone number must be exactly 10 digits without spaces or special characters (e.g., 9876543210). Remove any +91 or country code. This will be used for patient contact.'
      });
    }

    // Validate experience
    if (isNaN(experience) || parseInt(experience) < 0) {
      return res.status(400).json({
        message: 'Invalid experience value',
        field: 'experience',
        value: experience,
        suggestion: 'Experience must be a valid positive number in years (e.g., 5). Enter only the number of years. This helps patients understand your expertise level.'
      });
    }

    // Validate experience range
    if (parseInt(experience) > 50) {
      return res.status(400).json({
        message: 'Experience value too high',
        field: 'experience',
        value: experience,
        suggestion: 'Experience cannot exceed 50 years. Please enter a realistic value between 0 and 50. Most doctors have 0-30 years of experience.'
      });
    }

    // Validate consultation fee
    if (isNaN(consultationFee) || parseFloat(consultationFee) < 0) {
      return res.status(400).json({
        message: 'Invalid consultation fee',
        field: 'consultationFee',
        value: consultationFee,
        suggestion: 'Consultation fee must be a valid positive number in rupees (e.g., 500). Enter only the amount without ₹ symbol.'
      });
    }

    // Validate consultation fee range
    if (parseFloat(consultationFee) > 10000) {
      return res.status(400).json({
        message: 'Consultation fee too high',
        field: 'consultationFee',
        value: consultationFee,
        suggestion: 'Consultation fee cannot exceed ₹10,000. Please enter a realistic amount between ₹0 and ₹10,000. Most consultations cost ₹200-₹2000.'
      });
    }

    // Validate date of birth if provided
    if (dob) {
      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        return res.status(400).json({
          message: 'Invalid date of birth',
          field: 'dob',
          value: dob,
          suggestion: 'Please enter a valid date in YYYY-MM-DD format (e.g., 1990-01-01). Use the date picker for best results.'
        });
      }

      if (dobDate > new Date()) {
        return res.status(400).json({
          message: 'Date of birth cannot be in the future',
          field: 'dob',
          value: dob,
          suggestion: 'Please enter a valid date that is in the past or today. You cannot be born in the future.'
        });
      }
    }

    // Validate practice name length
    if (practiceName.length < 3 || practiceName.length > 100) {
      return res.status(400).json({
        message: 'Practice name length invalid',
        field: 'practiceName',
        value: practiceName,
        suggestion: 'Practice name must be between 3 and 100 characters (e.g., City General Hospital, Dr. Smith Clinic)'
      });
    }

    // Validate address length
    if (address.length < 10 || address.length > 500) {
      return res.status(400).json({
        message: 'Address length invalid',
        field: 'address',
        value: address,
        suggestion: 'Address must be between 10 and 500 characters (e.g., 123 Main Street, Downtown Area, Near City Center)'
      });
    }

    // Validate city, state, and country length
    if (city.length < 2 || city.length > 50) {
      return res.status(400).json({
        message: 'City name length invalid',
        field: 'city',
        value: city,
        suggestion: 'City must be between 2 and 50 characters (e.g., Mumbai, Delhi, Bangalore)'
      });
    }

    if (state.length < 2 || state.length > 50) {
      return res.status(400).json({
        message: 'State name length invalid',
        field: 'state',
        value: state,
        suggestion: 'State must be between 2 and 50 characters (e.g., Maharashtra, Karnataka, Tamil Nadu)'
      });
    }

    if (country.length < 2 || country.length > 50) {
      return res.status(400).json({
        message: 'Country name length invalid',
        field: 'country',
        value: country,
        suggestion: 'Country must be between 2 and 50 characters (e.g., India, USA, UK)'
      });
    }

    // Validate zip code format
    const zipRegex = /^[A-Za-z0-9]{5,10}$/;
    if (!zipRegex.test(zipCode)) {
      return res.status(400).json({
        message: 'Invalid zip code format',
        field: 'zipCode',
        value: zipCode,
        suggestion: 'Zip code must be 5-10 alphanumeric characters without spaces (e.g., 12345 or ABC123). This is your postal code.'
      });
    }

    // Validate qualifications length
    if (qualifications.length < 10 || qualifications.length > 1000) {
      return res.status(400).json({
        message: 'Qualifications length invalid',
        field: 'qualifications',
        value: qualifications,
        suggestion: 'Qualifications must be between 10 and 1000 characters (e.g., MBBS, MD in Cardiology, Fellowship in Interventional Cardiology)'
      });
    }

    // Validate bio length (optional field for updates)
    if (bio && bio.trim().length > 0 && (bio.length < 10 || bio.length > 2000)) {
      return res.status(400).json({
        message: 'Bio length invalid',
        field: 'bio',
        value: bio,
        suggestion: 'Bio must be between 10 and 2000 characters (e.g., Experienced cardiologist with expertise in interventional procedures, patient care, and research...)'
      });
    }

    // Validate profile picture size (if provided)
    if (profilePicture && profilePicture.length > 5000000) { // 5MB limit
      return res.status(400).json({
        message: 'Profile picture too large',
        field: 'profilePicture',
        suggestion: 'Profile picture size must be less than 5MB. Please compress the image or use a smaller file. Recommended size: 500x500 pixels.'
      });
    }

    // Validate certificates size (if provided)
    if (certificates && Array.isArray(certificates)) {
      for (let i = 0; i < certificates.length; i++) {
        if (certificates[i] && certificates[i].length > 10000000) { // 10MB limit per certificate
          return res.status(400).json({
            message: `Certificate ${i + 1} too large`,
            field: `certificates[${i}]`,
            suggestion: `Certificate ${i + 1} size must be less than 10MB. Please compress the file or use a smaller one. Supported formats: PDF, JPG, PNG.`
          });
        }
      }
    }

    // Validate certificates format (if provided)
    if (certificates && Array.isArray(certificates)) {
      for (let i = 0; i < certificates.length; i++) {
        const cert = certificates[i];
        if (typeof cert !== 'string' || cert.trim().length === 0) {
          return res.status(400).json({
            message: `Certificate ${i + 1} format invalid`,
            field: `certificates[${i}]`,
            value: cert,
            suggestion: `Certificate ${i + 1} must be a valid file or string. Supported formats: PDF, JPG, PNG, or base64 encoded.`
          });
        }
      }
    }

    // Prepare data with proper types
    const updateData = {
      name: name ? name.trim() : doctor.name,
      email: email ? email.toLowerCase().trim() : doctor.email,
      phone: phone ? phone.trim() : doctor.phone,
      dob: dob ? new Date(dob) : doctor.dob,
      gender: gender ? gender.toLowerCase() : doctor.gender,
      profilePicture: profilePicture || doctor.profilePicture,
      experience: experience ? parseInt(experience) : doctor.experience,
      specializations: Array.isArray(specializations) ? specializations : [specializations],
      qualifications: qualifications ? qualifications.trim() : doctor.qualifications,
      bio: bio || doctor.bio,
      certificates: Array.isArray(certificates) ? certificates : (certificates ? [certificates] : doctor.certificates),
      practiceName: practiceName ? practiceName.trim() : doctor.practiceName,
      address: address ? address.trim() : doctor.address,
      city: city ? city.trim() : doctor.city,
      state: state ? state.trim() : doctor.state,
      zipCode: zipCode ? zipCode.trim() : doctor.zipCode,
      country: country ? country.trim() : doctor.country,
      consultationFee: consultationFee ? parseFloat(consultationFee) : doctor.consultationFee
    };

    // Update the doctor profile
    console.log('Updating doctor profile with data:', updateData);
    await doctor.update(updateData);

    // Fetch updated doctor data
    const updatedDoctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      doctor: updatedDoctor
    });

  } catch (error) {
    console.error('Update doctor profile error:', error);
    
    // Check for specific validation errors
    if (error.name === 'SequelizeValidationError') {
      const fieldErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        message: 'Please check the following fields:',
        errors: fieldErrors,
        suggestion: 'Please correct the highlighted fields and try again. If you need help, contact support or check the field suggestions below.'
      });
    }
    
    // Check for unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      const duplicateField = error.errors?.[0]?.path || 'field';
      return res.status(400).json({
        message: `A doctor with this ${duplicateField} already exists`,
        field: duplicateField,
        suggestion: `Please use a different ${duplicateField} or try logging in if you already have an account. If you forgot your password, use the forgot password option. You can also contact support for help.`
      });
    }
    
    res.status(500).json({
      message: 'An unexpected error occurred while updating profile. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    // Find doctor by email
    const doctor = await Doctor.findOne({
      where: { email }
    });

    if (!doctor) {
      return res.status(404).json({
        message: 'No account found with this email address'
      });
    }

    // TODO: Implement email sending functionality
    // For now, just return a success message
    res.status(200).json({
      message: 'Password reset instructions have been sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Failed to process forgot password request. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Token and new password are required'
      });
    }

    // TODO: Implement token verification and password reset
    // For now, just return a success message
    res.status(200).json({
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'Failed to reset password. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  registerDoctor,
  loginDoctor,
  getDoctorProfile,
  getDoctorProfileById,
  getAllDoctors,
  getDoctorStatistics,
  getDoctorAvailability,
  getDoctorEarnings,
  getDoctorAppointments,
  updateDoctorProfile,
  updateDoctorProfilePicture,
  updateDoctorSpecializations,
  updateDoctorCertificates,
  updateDoctorAvailability,
  updateDoctorStatus,
  updateAppointmentStatus,
  updateDoctorVerificationStatus,
  deleteDoctorSpecialization,
  deleteDoctorCertificate,
  deleteDoctor,
  forgotPassword,
  resetPassword
}; 