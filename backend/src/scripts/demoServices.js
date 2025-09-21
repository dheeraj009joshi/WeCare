const { sequelize } = require('../config/db');
const Service = require('../models/Service');
const Doctor = require('../models/Doctor');

const demoServices = async () => {
  try {
    console.log('🚀 Starting Services Demo...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Create some sample services
    const services = [
      {
        name: 'Cardiology Consultation',
        description: 'Expert consultation for heart-related issues',
        category: 'Cardiology',
        price: 1500,
        duration: 30,
        specializations: ['Cardiology', 'Interventional Cardiology']
      },
      {
        name: 'General Health Checkup',
        description: 'Comprehensive health assessment',
        category: 'General Medicine',
        price: 800,
        duration: 45,
        specializations: ['General Medicine', 'Internal Medicine']
      },
      {
        name: 'Pediatric Care',
        description: 'Specialized care for children',
        category: 'Pediatrics',
        price: 1000,
        duration: 30,
        specializations: ['Pediatrics', 'Child Health']
      }
    ];
    
    console.log('📝 Creating services...');
    
    for (const serviceData of services) {
      try {
        const service = await Service.create(serviceData);
        console.log(`✅ Created service: ${service.name}`);
        
        // Automatically find matching doctors
        let matchingDoctors = [];
        
        if (service.specializations && service.specializations.length > 0) {
          matchingDoctors = await Doctor.findAll({
            where: {
              isVerified: true,
              isAvailable: true,
              specializations: {
                [sequelize.Op.overlap]: service.specializations
              }
            },
            attributes: ['id', 'name', 'specializations', 'experience', 'consultationFee']
          });
        } else {
          matchingDoctors = await Doctor.findAll({
            where: {
              isVerified: true,
              isAvailable: true
            },
            attributes: ['id', 'name', 'specializations', 'experience', 'consultationFee']
          });
        }
        
        console.log(`🔍 Service "${service.name}" automatically found ${matchingDoctors.length} matching doctors:`);
        
        matchingDoctors.forEach(doctor => {
          console.log(`   👨‍⚕️ Dr. ${doctor.name} - ${doctor.specializations.join(', ')} - ${doctor.experience} years exp - ₹${doctor.consultationFee}`);
        });
        
      } catch (error) {
        console.error(`❌ Failed to create service ${serviceData.name}:`, error.message);
      }
    }
    
    // Show all services with their doctors
    console.log('\n📋 All Services with Available Doctors:');
    const allServices = await Service.findAll({
      where: { isActive: true },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    
    for (const service of allServices) {
      let matchingDoctors = [];
      
      if (service.specializations && service.specializations.length > 0) {
        matchingDoctors = await Doctor.findAll({
          where: {
            isVerified: true,
            isAvailable: true,
            specializations: {
              [sequelize.Op.overlap]: service.specializations
            }
          },
          attributes: ['id', 'name', 'specializations', 'experience', 'consultationFee', 'rating']
        });
      } else {
        matchingDoctors = await Doctor.findAll({
          where: {
            isVerified: true,
            isAvailable: true
          },
          attributes: ['id', 'name', 'specializations', 'experience', 'consultationFee', 'rating']
        });
      }
      
      console.log(`\n🏥 ${service.name} (${service.category}) - ₹${service.price}`);
      console.log(`   📝 ${service.description}`);
      console.log(`   👨‍⚕️ Available Doctors: ${matchingDoctors.length}`);
      
      if (matchingDoctors.length > 0) {
        matchingDoctors.forEach(doctor => {
          console.log(`      • Dr. ${doctor.name} - ${doctor.specializations.join(', ')} - ${doctor.experience} years - ₹${doctor.consultationFee} - ⭐${doctor.rating || 'N/A'}`);
        });
      }
    }
    
    console.log('\n✅ Services Demo completed successfully!');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('   1. Services are created with specific specializations');
    console.log('   2. Doctors are automatically matched based on their specializations');
    console.log('   3. Services show available doctors count and details');
    console.log('   4. Real-time matching when services are created or updated');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  } finally {
    await sequelize.close();
  }
};

// Run the demo
if (require.main === module) {
  demoServices()
    .then(() => {
      console.log('🎉 Demo completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Demo failed:', error);
      process.exit(1);
    });
}

module.exports = { demoServices };
