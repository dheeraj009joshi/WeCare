#!/usr/bin/env python3
"""
WeCure FastAPI Backend Startup Script
"""
import uvicorn
import asyncio
import sys
import os
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

async def main():
    """Main startup function"""
    print("🚀 Starting WeCure FastAPI Backend...")
    print("=" * 50)
    print("📊 Service Information:")
    print("   - API Version: 2.0.0")
    print("   - Database: MongoDB Atlas")
    print("   - Storage: Azure Blob Storage")
    print("   - AI: Google Gemini")
    print("   - Email: Gmail SMTP")
    print("=" * 50)
    
    # Start the server
    config = uvicorn.Config(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )
    
    server = uvicorn.Server(config)
    
    try:
        await server.serve()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Check if required environment variables are set
    required_env_vars = [
        "MONGODB_URL",
        "AZURE_STORAGE_CONNECTION_STRING",
        "GEMINI_API_KEY",
        "JWT_SECRET_KEY"
    ]
    
    missing_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set these variables in your .env file or environment.")
        sys.exit(1)
    
    print("✅ Environment variables validated")
    
    # Run the server
    asyncio.run(main())