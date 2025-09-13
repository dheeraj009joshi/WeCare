const { getModels } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

class AdminDoctorsController {
  // Get all doctors with filtering and search
  async getDoctors(req, res) {
    try {
      const { Doctor, Appointment, User } = getModels();
      const { search, status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      
      if (search) {
        whereClause = {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { specializations: { [Op.overlap]: [search] } },
            { email: { [Op.iLike]: `%${search}%` } }
          ]
        };
      }

      if (status && status !== 'All') {
        whereClause.isAvailable = status === 'Active';
      }

      const doctors = await Doctor.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 'name', 'email', 'specializations', 'isAvailable', 
          'consultationFee', 'rating', 'totalRatings', 'createdAt'
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      // Get consultation count for each doctor
      const doctorsWithConsultations = await Promise.all(
        doctors.rows.map(async (doctor) => {
          const consultationCount = await Appointment.count({
            where: { 
              doctorId: doctor.id,
              status: 'completed'
            }
          });

          return {
            ...doctor.toJSON(),
            consultations: consultationCount,
            status: doctor.isAvailable ? 'Active' : 'Pending'
          };
        })
      );

      res.json({
        success: true,
        data: {
          doctors: doctorsWithConsultations,
          total: doctors.count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(doctors.count / limit)
        }
      });
    } catch (error) {
      console.error('Error getting doctors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get doctors',
        error: error.message
      });
    }
  }

  // Add new doctor
  async addDoctor(req, res) {
    try {
      const { Doctor, User } = getModels();
      const {
        name,
        email,
        password,
        phone,
        specializations,
        qualifications,
        experience,
        gender,
        dateOfBirth,
        address,
        city,
        state,
        country,
        pincode,
        licenseNumber,
        hospital,
        consultationFee
      } = req.body;

      // Check if doctor already exists
      const existingDoctor = await Doctor.findOne({
        where: { 
          [Op.or]: [
            { email },
            { licenseNumber }
          ]
        }
      });

      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: 'Doctor with this email or license number already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create doctor
      const doctor = await Doctor.create({
        name,
        email,
        password: hashedPassword,
        phone,
        specializations: Array.isArray(specializations) ? specializations : [specializations],
        qualifications,
        experience,
        gender,
        dateOfBirth,
        address,
        city,
        state,
        country,
        pincode,
        licenseNumber,
        hospital,
        consultationFee: consultationFee || 0,
        isAvailable: false // New doctors start as pending
      });

      // Create user account for doctor
      await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'doctor'
      });

      res.status(201).json({
        success: true,
        message: 'Doctor added successfully',
        data: {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          specializations: doctor.specializations,
          status: 'Pending'
        }
      });
    } catch (error) {
      console.error('Error adding doctor:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add doctor',
        error: error.message
      });
    }
  }

  // Update doctor status
  async updateDoctorStatus(req, res) {
    try {
      const { Doctor } = getModels();
      const { id } = req.params;
      const { isAvailable } = req.body;

      const doctor = await Doctor.findByPk(id);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      await doctor.update({ isAvailable });

      res.json({
        success: true,
        message: 'Doctor status updated successfully',
        data: {
          id: doctor.id,
          name: doctor.name,
          status: doctor.isAvailable ? 'Active' : 'Pending'
        }
      });
    } catch (error) {
      console.error('Error updating doctor status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update doctor status',
        error: error.message
      });
    }
  }

  // Delete doctor
  async deleteDoctor(req, res) {
    try {
      const { Doctor } = getModels();
      const { id } = req.params;

      const doctor = await Doctor.findByPk(id);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      // Check if doctor has any appointments
      const appointmentCount = await Appointment.count({
        where: { doctorId: id }
      });

      if (appointmentCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete doctor with existing appointments'
        });
      }

      // Delete doctor and associated user account
      await Promise.all([
        doctor.destroy(),
        User.destroy({ where: { email: doctor.email } })
      ]);

      res.json({
        success: true,
        message: 'Doctor deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting doctor:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete doctor',
        error: error.message
      });
    }
  }

  // Get doctor details
  async getDoctorDetails(req, res) {
    try {
      const { Doctor, Appointment } = getModels();
      const { id } = req.params;

      const doctor = await Doctor.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      // Get consultation count
      const consultationCount = await Appointment.count({
        where: { 
          doctorId: id,
          status: 'completed'
        }
      });

      const doctorData = {
        ...doctor.toJSON(),
        consultations: consultationCount,
        status: doctor.isAvailable ? 'Active' : 'Pending'
      };

      res.json({
        success: true,
        data: doctorData
      });
    } catch (error) {
      console.error('Error getting doctor details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get doctor details',
        error: error.message
      });
    }
  }

  // Get active doctors summary
  async getActiveDoctorsSummary(req, res) {
    try {
      const { Doctor } = getModels();
      const activeDoctors = await Doctor.findAll({
        where: { isAvailable: true },
        attributes: ['id', 'name', 'specializations', 'consultationFee'],
        order: [['name', 'ASC']]
      });

      const doctorsWithConsultations = await Promise.all(
        activeDoctors.map(async (doctor) => {
          const consultationCount = await Appointment.count({
            where: { 
              doctorId: doctor.id,
              status: 'completed'
            }
          });

          return {
            ...doctor.toJSON(),
            consultations: consultationCount
          };
        })
      );

      res.json({
        success: true,
        data: doctorsWithConsultations
      });
    } catch (error) {
      console.error('Error getting active doctors summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active doctors summary',
        error: error.message
      });
    }
  }
}

module.exports = new AdminDoctorsController();
