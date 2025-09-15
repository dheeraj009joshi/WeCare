#!/usr/bin/env python3
"""Test appointments API to verify doctor names are properly populated"""

import asyncio
import aiohttp
import json

async def test_appointments_api():
    """Test the user appointments endpoint"""
    
    print('🧪 Testing appointments API...')
    
    # You'll need to replace this with a valid JWT token
    # For now, let's just test if the endpoint is accessible
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        # Test if server is running
        try:
            async with session.get(f"{base_url}/docs") as response:
                if response.status == 200:
                    print('✅ Server is running')
                else:
                    print(f'❌ Server returned status: {response.status}')
                    return
        except Exception as e:
            print(f'❌ Cannot connect to server: {e}')
            return
            
        # Test doctors endpoint to see available doctors
        try:
            async with session.get(f"{base_url}/api/doctors/") as response:
                if response.status == 200:
                    doctors = await response.json()
                    print(f'👨‍⚕️ Found {len(doctors)} doctors:')
                    for doctor in doctors:
                        print(f'  - {doctor.get("full_name", "NO NAME")} ({doctor.get("specialization", "NO SPEC")})')
                else:
                    print(f'❌ Doctors endpoint returned status: {response.status}')
        except Exception as e:
            print(f'❌ Error accessing doctors endpoint: {e}')

if __name__ == "__main__":
    asyncio.run(test_appointments_api())