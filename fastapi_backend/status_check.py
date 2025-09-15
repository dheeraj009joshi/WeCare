#!/usr/bin/env python3
"""Quick status check for the appointment system"""

import asyncio
import aiohttp
import json
import time

async def main():
    # Test authentication
    login_data = {
        'username': 'test@test.com',
        'password': 'testuser123'
    }
    
    async with aiohttp.ClientSession() as session:
        # Login
        print("🔐 Testing login...")
        start_time = time.time()
        async with session.post('http://localhost:8000/api/auth/login', data=login_data) as resp:
            login_result = await resp.json()
            token = login_result['token']['access_token']
            login_time = time.time() - start_time
            print(f"✅ Login successful in {login_time:.2f}s")
        
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test appointments list
        print("\n📋 Testing appointments list...")
        start_time = time.time()
        async with session.get('http://localhost:8000/api/appointments/', headers=headers) as resp:
            appointments = await resp.json()
            list_time = time.time() - start_time
            print(f"✅ Found {len(appointments)} appointments in {list_time:.2f}s")
        
        # Test appointment booking
        print("\n📅 Testing appointment booking...")
        booking_data = {
            "doctor_id": "68c5bd122f44474b8b78e112",
            "appointment_date": "2025-09-25",
            "appointment_time": "16:00",
            "symptoms": "Status check test",
            "consultation_fee": 700
        }
        
        start_time = time.time()
        async with session.post('http://localhost:8000/api/appointments/', json=booking_data, headers=headers) as resp:
            booking_result = await resp.json()
            booking_time = time.time() - start_time
            if resp.status == 200:
                print(f"✅ Booking successful in {booking_time:.2f}s")
            else:
                print(f"❌ Booking failed in {booking_time:.2f}s: {booking_result}")

if __name__ == "__main__":
    asyncio.run(main())