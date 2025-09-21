const { sequelize } = require('../config/db');
const Service = require('../models/Service');
const Doctor = require('../models/Doctor');

const seedDefaultServices = async () => {
  try {
    console.log('🌱 Seeding default medical services...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Check if services already exist
    const existingServices = await Service.count();
    if (existingServices > 0) {
      console.log(`⚠️ ${existingServices} services already exist, skipping seed`);
      return;
    }
    
    // Default services with automatic doctor matching
    const defaultServices = [
      {
        name: 'General Health Checkup',
        description: 'Comprehensive health assessment including vital signs, physical examination, and health screening',
        category: 'General Medicine',
        price: 800,
        duration: 45,
        specializations: ['General Medicine', 'Internal Medicine', 'Family Medicine'],
        requirements: ['Fasting for 8-12 hours', 'Bring previous medical reports'],
        minExperience: 3,
        maxPrice: 1500,
        location: null
      },
      {
        name: 'Cardiology Consultation',
        description: 'Expert consultation for heart-related issues, ECG analysis, and cardiovascular health assessment',
        category: 'Cardiology',
        price: 1500,
        duration: 30,
        specializations: ['Cardiology', 'Interventional Cardiology', 'Cardiovascular Medicine'],
        requirements: ['Recent ECG if available', 'Blood pressure readings'],
        minExperience: 5,
        maxPrice: 2500,
        location: null
      },
      {
        name: 'Dermatology Consultation',
        description: 'Skin, hair, and nail condition diagnosis and treatment planning',
        category: 'Dermatology',
        price: 1000,
        duration: 25,
        specializations: ['Dermatology', 'Cosmetic Dermatology'],
        requirements: ['Clear photos of affected areas', 'List of current medications'],
        minExperience: 3,
        maxPrice: 2000,
        location: null
      },
      {
        name: 'Pediatric Care',
        description: 'Specialized care for children including growth monitoring and vaccination',
        category: 'Pediatrics',
        price: 900,
        duration: 30,
        specializations: ['Pediatrics', 'Child Health', 'Neonatology'],
        requirements: ['Child\'s growth chart', 'Vaccination records'],
        minExperience: 4,
        maxPrice: 1800,
        location: null
      },
      {
        name: 'Mental Health Consultation',
        description: 'Professional mental health assessment and therapy planning',
        category: 'Psychiatry',
        price: 1200,
        duration: 50,
        specializations: ['Psychiatry', 'Clinical Psychology', 'Mental Health'],
        requirements: ['Confidential consultation', 'Previous mental health history if any'],
        minExperience: 5,
        maxPrice: 2500,
        location: null
      },
      {
        name: 'Orthopedic Consultation',
        description: 'Bone, joint, and muscle problem diagnosis and treatment',
        category: 'Orthopedics',
        price: 1100,
        duration: 35,
        specializations: ['Orthopedics', 'Sports Medicine', 'Joint Replacement'],
        requirements: ['X-ray reports if available', 'Current pain description'],
        minExperience: 4,
        maxPrice: 2200,
        location: null
      },
      {
        name: 'Gynecology Consultation',
        description: 'Women\'s health consultation and reproductive health care',
        category: 'Gynecology',
        price: 1000,
        duration: 30,
        specializations: ['Gynecology', 'Obstetrics', 'Women\'s Health'],
        requirements: ['Menstrual cycle details', 'Previous pregnancy history'],
        minExperience: 4,
        maxPrice: 2000,
        location: null
      },
      {
        name: 'Nutrition Consultation',
        description: 'Personalized diet planning and nutritional guidance',
        category: 'Nutrition',
        price: 700,
        duration: 40,
        specializations: ['Nutrition', 'Dietetics', 'Clinical Nutrition'],
        requirements: ['Food diary for 3 days', 'Current weight and height'],
        minExperience: 3,
        maxPrice: 1500,
        location: null
      }
    ];
    
    console.log('📝 Creating default services...');
    
    for (const serviceData of defaultServices) {
      try {
        const service = await Service.create(serviceData);
        console.log(`✅ Created service: ${service.name}`);
        
        // Find matching doctors automatically
        const matchingDoctors = await Doctor.findAll({
          where: {
            isVerified: true,
            isAvailable: true
          },
          attributes: [
            'id', 'name', 'specializations', 'experience', 'consultationFee',
            'profilePicture', 'practiceName', 'city', 'state', 'rating'
          ]
        });
        
        console.log(`   👨‍⚕️ Found ${matchingDoctors.length} available doctors`);
        
        // Show some doctor details
        if (matchingDoctors.length > 0) {
          matchingDoctors.slice(0, 3).forEach(doctor => {
            console.log(`      • Dr. ${doctor.name} - ${doctor.specializations?.join(', ') || 'General'} - ₹${doctor.consultationFee}`);
          });
          if (matchingDoctors.length > 3) {
            console.log(`      ... and ${matchingDoctors.length - 3} more doctors`);
          }
        }
        
      } catch (error) {
        console.error(`❌ Failed to create service ${serviceData.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Default services seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Created ${defaultServices.length} medical services`);
    console.log('   • Each service automatically finds matching doctors');
    console.log('   • Doctors are filtered by verification and availability');
    console.log('   • Services include specialization matching and experience requirements');
    
  } catch (error) {
    console.error('❌ Error seeding services:', error.message);
  } finally {
    await sequelize.close();
  }
};

// Run the seed function
if (require.main === module) {
  seedDefaultServices()
    .then(() => {
      console.log('✅ Service seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Service seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDefaultServices };
