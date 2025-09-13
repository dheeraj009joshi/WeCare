const { sequelize } = require('../config/db');

const addBioColumn = async () => {
  try {
    console.log('🔧 Adding bio column to doctors table...');
    
    // Check if bio column already exists
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'doctors' AND column_name = 'bio';
    `);
    
    if (columns.length > 0) {
      console.log('✅ Bio column already exists');
      return;
    }
    
    // Add bio column
    await sequelize.query(`
      ALTER TABLE doctors 
      ADD COLUMN bio TEXT;
    `);
    
    console.log('✅ Bio column added successfully');
    
    // Verify the column was added
    const [newColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'doctors' AND column_name = 'bio';
    `);
    
    console.log('📋 Bio column details:', newColumns[0]);
    
  } catch (error) {
    console.error('❌ Error adding bio column:', error.message);
  } finally {
    await sequelize.close();
  }
};

// Run the script
addBioColumn();
