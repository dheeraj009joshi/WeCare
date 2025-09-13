const { sequelize } = require('../config/db');

const fixDatabaseSchema = async () => {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Check current table structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'doctors' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Current table structure:', results.map(r => `${r.column_name}: ${r.data_type}`));
    
    // Fix specializations column
    const specializationsColumn = results.find(col => col.column_name === 'specializations');
    if (specializationsColumn && specializationsColumn.data_type !== 'json') {
      console.log('🔧 Converting specializations column to JSON...');
      
      // Create a temporary column
      await sequelize.query(`
        ALTER TABLE doctors 
        ADD COLUMN specializations_new JSON;
      `);
      
      // Copy data from old column to new column
      await sequelize.query(`
        UPDATE doctors 
        SET specializations_new = CASE 
          WHEN specializations IS NOT NULL THEN 
            CASE 
              WHEN specializations = '{}' THEN '[]'::json
              WHEN specializations = '{}' THEN '[]'::json
              ELSE specializations::json
            END
          ELSE '[]'::json
        END;
      `);
      
      // Drop old column and rename new one
      await sequelize.query(`
        ALTER TABLE doctors DROP COLUMN specializations;
        ALTER TABLE doctors RENAME COLUMN specializations_new TO specializations;
      `);
      
      console.log('✅ Specializations column converted to JSON');
    }
    
    // Fix certificates column
    const certificatesColumn = results.find(col => col.column_name === 'certificates');
    if (certificatesColumn && certificatesColumn.data_type !== 'json') {
      console.log('🔧 Converting certificates column to JSON...');
      
      // Create a temporary column
      await sequelize.query(`
        ALTER TABLE doctors 
        ADD COLUMN certificates_new JSON;
      `);
      
      // Copy data from old column to new column
      await sequelize.query(`
        UPDATE doctors 
        SET certificates_new = CASE 
          WHEN certificates IS NOT NULL THEN 
            CASE 
              WHEN certificates = '{}' THEN '[]'::json
              WHEN certificates = '{}' THEN '[]'::json
              ELSE certificates::json
            END
          ELSE '[]'::json
        END;
      `);
      
      // Drop old column and rename new one
      await sequelize.query(`
        ALTER TABLE doctors DROP COLUMN certificates;
        ALTER TABLE doctors RENAME COLUMN certificates_new TO certificates;
      `);
      
      console.log('✅ Certificates column converted to JSON');
    }
    
    // Ensure bio column exists
    const bioColumn = results.find(col => col.column_name === 'bio');
    if (!bioColumn) {
      console.log('🔧 Adding bio column...');
      await sequelize.query(`
        ALTER TABLE doctors 
        ADD COLUMN bio TEXT;
      `);
      console.log('✅ Bio column added');
    }
    
    // Update existing doctors with default bio if they don't have one
    await sequelize.query(`
      UPDATE doctors 
      SET bio = 'Professional healthcare provider with expertise in patient care.'
      WHERE bio IS NULL OR bio = '';
    `);
    
    console.log('✅ Database schema fixed successfully!');
    
    // Show final structure
    const [finalResults] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'doctors' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Final table structure:', finalResults.map(r => `${r.column_name}: ${r.data_type}`));
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error.message);
    throw error;
  }
};

// Run the fix
if (require.main === module) {
  fixDatabaseSchema()
    .then(() => {
      console.log('✅ Database schema fix completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database schema fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixDatabaseSchema };
