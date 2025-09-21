const { getModels } = require('../models');
const { Op } = require('sequelize');

class AdminDashboardController {
  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const { User, Doctor, Appointment, Product } = getModels();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get appointments statistics
      const [appointments, runningNow, scheduledToday, completedToday] = await Promise.all([
        Appointment.count(),
        Appointment.count({
          where: {
            status: 'confirmed',
            appointmentDate: {
              [Op.gte]: today,
              [Op.lt]: tomorrow
            }
          }
        }),
        Appointment.count({
          where: {
            status: 'confirmed',
            appointmentDate: {
              [Op.gte]: today,
              [Op.lt]: tomorrow
            }
          }
        }),
        Appointment.count({
          where: {
            status: 'completed',
            appointmentDate: {
              [Op.gte]: today,
              [Op.lt]: tomorrow
            }
          }
        })
      ]);

      // Get earnings for today
      const earningsToday = await Appointment.sum('fee', {
        where: {
          status: 'completed',
          paymentStatus: 'paid',
          appointmentDate: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        }
      });

      // Get total counts
      const [totalDoctors, totalPatients] = await Promise.all([
        Doctor.count(),
        User.count({ where: { role: 'user' } })
      ]);

      const stats = {
        appointments,
        runningNow,
        scheduledToday,
        completedToday,
        earningsToday: earningsToday || 0,
        totalDoctors,
        totalPatients
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard statistics',
        error: error.message
      });
    }
  }

  // Get running appointments
  async getRunningAppointments(req, res) {
    try {
      const { User, Doctor, Appointment } = getModels();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const runningAppointments = await Appointment.findAll({
        where: {
          status: 'confirmed',
          appointmentDate: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        },
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['name']
          },
          {
            model: Doctor,
            as: 'doctor',
            attributes: ['name']
          }
        ],
        order: [['appointmentDate', 'ASC']]
      });

      res.json({
        success: true,
        data: runningAppointments
      });
    } catch (error) {
      console.error('Error getting running appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get running appointments',
        error: error.message
      });
    }
  }

  // Get scheduled appointments for today
  async getScheduledAppointments(req, res) {
    try {
      const { User, Doctor, Appointment } = getModels();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const scheduledAppointments = await Appointment.findAll({
        where: {
          status: 'confirmed',
          appointmentDate: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        },
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['name']
          },
          {
            model: Doctor,
            as: 'doctor',
            attributes: ['name']
          }
        ],
        order: [['appointmentDate', 'ASC']]
      });

      res.json({
        success: true,
        data: scheduledAppointments
      });
    } catch (error) {
      console.error('Error getting scheduled appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get scheduled appointments',
        error: error.message
      });
    }
  }

  // Get patients list
  async getPatients(req, res) {
    try {
      const { User, Appointment } = getModels();
      const { search, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = { role: 'user' };
      
      if (search) {
        whereClause = {
          ...whereClause,
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } }
          ]
        };
      }

      const patients = await User.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'name', 'email', 'age', 'gender', 'createdAt'],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      // Get appointment count for each patient
      const patientsWithAppointments = await Promise.all(
        patients.rows.map(async (patient) => {
          const appointmentCount = await Appointment.count({
            where: { patientId: patient.id }
          });
          
          const lastAppointment = await Appointment.findOne({
            where: { patientId: patient.id },
            order: [['createdAt', 'DESC']],
            attributes: ['createdAt']
          });

          return {
            ...patient.toJSON(),
            appointments: appointmentCount,
            lastVisit: lastAppointment ? 
              this.getTimeAgo(lastAppointment.createdAt) : 
              'Never'
          };
        })
      );

      res.json({
        success: true,
        data: {
          patients: patientsWithAppointments,
          total: patients.count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(patients.count / limit)
        }
      });
    } catch (error) {
      console.error('Error getting patients:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patients',
        error: error.message
      });
    }
  }

  // Helper method to get time ago
  getTimeAgo(date) {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }
}

module.exports = new AdminDashboardController();
