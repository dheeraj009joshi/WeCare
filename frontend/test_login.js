#!/usr/bin/env node

// Simple test script to validate login functionality
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

// Test user login
async function testUserLogin() {
  try {
    console.log('🧪 Testing user login...');
    
    const response = await axios.post(`${API_BASE}/auth/login`, 
      new URLSearchParams({
        username: 'test@example.com',
        password: 'password123'
      }), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('✅ User login successful');
    console.log('Response format:', {
      user: !!response.data.user,
      token: !!response.data.token,
      token_type: response.data.token?.token_type,
      user_type: response.data.token?.user_type
    });
    
    return true;
  } catch (error) {
    console.error('❌ User login failed:', error.response?.data || error.message);
    return false;
  }
}

// Test doctor login
async function testDoctorLogin() {
  try {
    console.log('🧪 Testing doctor login...');
    
    const response = await axios.post(`${API_BASE}/auth/doctor/login`, 
      new URLSearchParams({
        username: 'doctor2@example.com',
        password: 'password123'
      }), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('✅ Doctor login successful');
    console.log('Response format:', {
      doctor: !!response.data.doctor,
      token: !!response.data.token,
      token_type: response.data.token?.token_type,
      user_type: response.data.token?.user_type
    });
    
    return true;
  } catch (error) {
    console.error('❌ Doctor login failed:', error.response?.data || error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting login tests...\n');
  
  const userTest = await testUserLogin();
  console.log('');
  const doctorTest = await testDoctorLogin();
  
  console.log('\n📊 Test Results:');
  console.log(`User Login: ${userTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Doctor Login: ${doctorTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (userTest && doctorTest) {
    console.log('\n🎉 All login tests passed! Frontend should work correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check backend configuration.');
  }
}

runTests().catch(console.error);