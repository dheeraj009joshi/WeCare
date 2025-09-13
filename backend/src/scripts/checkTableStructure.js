const { sequelize } = require('../config/db');

const checkTableStructure = async () => {
  try {
    console.log('🔍 Checking doctors table structure...');
    
    // Query to get table structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'doctors' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Current doctors table structure:');
    console.table(results);
    
    // Check if bio column exists
    const bioColumn = results.find(col => col.column_name === 'bio');
    if (bioColumn) {
      console.log('✅ Bio column found:', bioColumn);
    } else {
      console.log('❌ Bio column NOT found in table structure');
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  } finally {
    await sequelize.close();
  }
};

// Run the script
checkTableStructure();
