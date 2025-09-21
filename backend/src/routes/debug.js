const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');

// Debug endpoint to check table structure
router.get('/table-structure', async (req, res) => {
  try {
    console.log('🔍 Checking doctors table structure...');
    
    // Query to get table structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'doctors' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Current doctors table structure:', results);
    
    // Check if bio column exists
    const bioColumn = results.find(col => col.column_name === 'bio');
    if (bioColumn) {
      console.log('✅ Bio column found:', bioColumn);
    } else {
      console.log('❌ Bio column NOT found in table structure');
    }
    
    res.json({
      message: 'Table structure checked',
      tableStructure: results,
      hasBioColumn: !!bioColumn,
      bioColumn: bioColumn
    });
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
    res.status(500).json({
      message: 'Error checking table structure',
      error: error.message
    });
  }
});

// Debug endpoint to add bio column
router.post('/add-bio-column', async (req, res) => {
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
      return res.json({
        message: 'Bio column already exists',
        status: 'exists'
      });
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
    
    res.json({
      message: 'Bio column added successfully',
      status: 'added',
      columnDetails: newColumns[0]
    });
    
  } catch (error) {
    console.error('❌ Error adding bio column:', error.message);
    res.status(500).json({
      message: 'Error adding bio column',
      error: error.message
    });
  }
});

module.exports = router; 