const { sequelize } = require('../config/db');
const Doctor = require('../models/Doctor');

const updateExistingDoctors = async () => {
  try {
    console.log('🔄 Updating existing doctor records with default bio...');
    
    // Update all existing doctors that don't have a bio
    const result = await Doctor.update(
      { bio: 'Professional healthcare provider with expertise in patient care.' },
      { 
        where: { 
          bio: null 
        } 
      }
    );
    
    console.log(`✅ Updated ${result[0]} doctor records with default bio`);
    
    // Verify the update
    const doctorsWithoutBio = await Doctor.count({
      where: { bio: null }
    });
    
    if (doctorsWithoutBio === 0) {
      console.log('✅ All doctor records now have bio values');
    } else {
      console.log(`⚠️ ${doctorsWithoutBio} doctor records still don't have bio values`);
    }
    
  } catch (error) {
    console.error('❌ Error updating existing doctors:', error.message);
  } finally {
    await sequelize.close();
  }
};

// Run the script
updateExistingDoctors();
