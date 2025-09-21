const { sequelize } = require('../config/db');

// Monitor connection pool status
const monitorPool = () => {
  try {
    const pool = sequelize.connectionManager.pool;
    
    if (pool && pool.config) {
      console.log('=== Connection Pool Status ===');
      console.log(`Total connections: ${pool.size || 'N/A'}`);
      console.log(`Available connections: ${pool.available || 'N/A'}`);
      console.log(`Pending connections: ${pool.pending || 'N/A'}`);
      console.log(`Max connections: ${pool.config.max || 'N/A'}`);
      console.log(`Min connections: ${pool.config.min || 'N/A'}`);
      console.log('=============================');
    } else {
      console.log('⏳ Pool initializing... (this is normal)');
    }
  } catch (error) {
    console.log('Pool monitoring error:', error.message);
  }
};

// Monitor pool every 30 seconds
const startPoolMonitoring = () => {
  // Check immediately, then every 30 seconds
  monitorPool();
  setInterval(monitorPool, 30000);
  
  console.log('Connection pool monitoring started');
};

// Get pool statistics
const getPoolStats = () => {
  try {
    const pool = sequelize.connectionManager.pool;
    
    if (pool && pool.config) {
      return {
        total: pool.size || 0,
        available: pool.available || 0,
        pending: pool.pending || 0,
        max: pool.config.max || 0,
        min: pool.config.min || 0,
        status: 'active'
      };
    } else {
      return {
        total: 0,
        available: 0,
        pending: 0,
        max: 0,
        min: 0,
        status: 'initializing',
        message: 'Pool is initializing (normal behavior)'
      };
    }
  } catch (error) {
    return {
      total: 0,
      available: 0,
      pending: 0,
      max: 0,
      min: 0,
      status: 'error',
      error: error.message
    };
  }
};

module.exports = {
  monitorPool,
  startPoolMonitoring,
  getPoolStats
}; 