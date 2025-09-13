#!/usr/bin/env python3
"""
Google Calendar Setup Script for WeCure
This script helps set up Google Calendar integration
"""

import os
import sys
import json
from pathlib import Path

def main():
    print("🗓️  Google Calendar Setup for WeCure")
    print("="*50)
    
    # Check if we're in the right directory
    if not os.path.exists('app'):
        print("❌ Please run this script from the fastapi_backend directory")
        sys.exit(1)
    
    credentials_dir = Path('app/credentials')
    credentials_file = credentials_dir / 'google-calendar-credentials.json'
    sample_file = credentials_dir / 'google-calendar-credentials-sample.json'
    
    print("📋 Setup Steps:")
    print()
    print("1. Go to Google Cloud Console: https://console.cloud.google.com/")
    print("2. Create a new project or select existing one")
    print("3. Enable Google Calendar API:")
    print("   - Go to 'APIs & Services' → 'Library'")
    print("   - Search 'Google Calendar API'")
    print("   - Click 'Enable'")
    print()
    print("4. Create OAuth2 Credentials:")
    print("   - Go to 'APIs & Services' → 'Credentials'")
    print("   - Click 'Create Credentials' → 'OAuth 2.0 Client IDs'")
    print("   - Application type: 'Web application'")
    print("   - Add redirect URIs:")
    print("     * http://localhost:4000/auth/google/callback")
    print("     * https://developers.google.com/oauthplayground")
    print("   - For production, add your domain:")
    print("     * https://yourdomain.com/auth/google/callback")
    print()
    print("5. Download the JSON file and save it as:")
    print(f"   {credentials_file.absolute()}")
    print()
    
    # Check current status
    print("📊 Current Status:")
    if credentials_file.exists():
        print("✅ Google Calendar credentials file found")
        try:
            with open(credentials_file) as f:
                data = json.load(f)
                if 'installed' in data and 'client_id' in data['installed']:
                    print(f"✅ Client ID configured: {data['installed']['client_id'][:20]}...")
                elif 'web' in data and 'client_id' in data['web']:
                    print(f"✅ Client ID configured: {data['web']['client_id'][:20]}...")
                else:
                    print("❌ Invalid credentials file format")
        except Exception as e:
            print(f"❌ Error reading credentials file: {e}")
    else:
        print(f"❌ Credentials file not found: {credentials_file}")
        print(f"📝 Sample format available at: {sample_file}")
    
    print()
    print("🧪 Test Integration:")
    print("Once configured, you can use:")
    print("📅 Calendar Integration:")
    print("- Calendar events will be created automatically when booking appointments")
    print("- Google Meet links will be generated")
    print("- Both doctor and patient will receive calendar invites")
    print()
    print("🔐 Google OAuth Login:")
    print("- GET /auth/google/login?user_type=user (for patients)")
    print("- GET /auth/google/login?user_type=doctor (for doctors)")
    print("- Users can sign in with their Google accounts")
    print("- New users will be registered automatically")
    print()
    print("🔧 Troubleshooting:")
    print("- Make sure the credentials file is valid JSON")
    print("- Ensure Google Calendar API is enabled in your project")
    print("- Check that redirect URIs match exactly")
    print("- First time setup will require browser authentication")

if __name__ == "__main__":
    main()