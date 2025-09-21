const { Sequelize } = require('sequelize');

let sequelize;

// Use environment variables for database connection
const DB_HOST = process.env.DB_HOST || 'aws-1-ap-south-1.pooler.supabase.com';
const DB_USER = process.env.DB_USER || 'postgres.hgadghokrtershbefoic';
const DB_PASSWORD = process.env.DB_PASSWORD || 'U9VDFeu0rKH0OAOs';
const DB_NAME = process.env.DB_NAME || 'postgres';
const DB_PORT = process.env.DB_PORT || '6543';

// Use DATABASE_URL if available, otherwise construct from individual variables
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

console.log('🔌 Database URL:', DATABASE_URL.replace(DB_PASSWORD, '***'));

sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    // Enable SSL for Supabase connections
    ssl: { 
      require: true, 
      rejectUnauthorized: false 
    }
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const isDev = process.env.NODE_ENV !== 'production';

    // ⛑️ Safe syncing: 'alter' in dev only, never use force
    if (isDev) {
      try {
        // Use alter to preserve data and fix schema issues
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced with alter in development');
      } catch (syncError) {
        console.warn('⚠️ Database sync with alter failed, trying to fix schema issues...');
        
        // Try to fix common schema issues
        try {
          // Check if specializations column exists and is the right type
          const [results] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'doctors' AND column_name = 'specializations';
          `);
          
          if (results.length > 0 && results[0].data_type !== 'json') {
            console.log('🔧 Converting specializations column to JSON...');
            
            // Handle array to JSON conversion properly
            if (results[0].data_type === 'ARRAY') {
              await sequelize.query(`
                ALTER TABLE doctors 
                ALTER COLUMN specializations TYPE JSON USING array_to_json(specializations);
              `);
            } else {
              await sequelize.query(`
                ALTER TABLE doctors 
                ALTER COLUMN specializations TYPE JSON USING CASE 
                  WHEN specializations IS NULL THEN '[]'::json
                  WHEN specializations = '' THEN '[]'::json
                  ELSE ('["' || replace(specializations, ',', '","') || '"]')::json
                END;
              `);
            }
            console.log('✅ Specializations column converted to JSON');
          }
          
          // Check certificates column
          const [certResults] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'doctors' AND column_name = 'certificates';
          `);
          
          if (certResults.length > 0 && certResults[0].data_type !== 'json') {
            console.log('🔧 Converting certificates column to JSON...');
            
            if (certResults[0].data_type === 'ARRAY') {
              await sequelize.query(`
                ALTER TABLE doctors 
                ALTER COLUMN certificates TYPE JSON USING array_to_json(certificates);
              `);
            } else {
              await sequelize.query(`
                ALTER TABLE doctors 
                ALTER COLUMN certificates TYPE JSON USING CASE 
                  WHEN certificates IS NULL THEN '[]'::json
                  WHEN certificates = '' THEN '[]'::json
                  ELSE ('["' || replace(certificates, ',', '","') || '"]')::json
                END;
              `);
            }
            console.log('✅ Certificates column converted to JSON');
          }
          
          // Check if bio column exists
          const [bioResults] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'doctors' AND column_name = 'bio';
          `);
          
          if (bioResults.length === 0) {
            console.log('🔧 Adding bio column...');
            await sequelize.query(`
              ALTER TABLE doctors 
              ADD COLUMN bio TEXT DEFAULT 'Professional healthcare provider with expertise in patient care.';
            `);
            console.log('✅ Bio column added');
          }
          
          console.log('✅ Database schema issues fixed');
        } catch (fixError) {
          console.error('❌ Failed to fix schema issues:', fixError.message);
          console.log('⚠️ Continuing with existing schema...');
        }
      }
    } else {
      await sequelize.sync(); // ✅ No schema changes in production
      console.log('✅ Database synced safely in production');
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };