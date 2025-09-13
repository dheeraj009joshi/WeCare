"""
Google OAuth Service for WeCure
Handles Google OAuth authentication for users and doctors
"""

import os
import logging
from typing import Optional, Dict, Any
import httpx
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import json

logger = logging.getLogger(__name__)

class GoogleOAuthService:
    def __init__(self):
        self.credentials_file = os.path.join(os.path.dirname(__file__), '..', 'credentials', 'google-calendar-credentials.json')
        self.client_id = None
        self.client_secret = None
        self._load_credentials()
    
    def _load_credentials(self):
        """Load Google OAuth credentials from file"""
        try:
            if os.path.exists(self.credentials_file):
                with open(self.credentials_file, 'r') as f:
                    creds = json.load(f)
                    
                # Handle both 'web' and 'installed' client types
                if 'web' in creds:
                    client_config = creds['web']
                elif 'installed' in creds:
                    client_config = creds['installed']
                else:
                    logger.error("Invalid Google credentials file format")
                    return
                
                self.client_id = client_config.get('client_id')
                self.client_secret = client_config.get('client_secret')
                logger.info("Google OAuth credentials loaded successfully")
            else:
                logger.warning("Google OAuth credentials file not found")
        except Exception as e:
            logger.error(f"Error loading Google OAuth credentials: {e}")
    
    def is_configured(self) -> bool:
        """Check if Google OAuth is properly configured"""
        return self.client_id is not None and self.client_secret is not None
    
    def get_authorization_url(self, redirect_uri: str, state: str = None) -> Optional[str]:
        """Get Google OAuth authorization URL"""
        if not self.is_configured():
            logger.warning("Google OAuth not configured")
            return None
        
        try:
            # Create flow instance
            flow = Flow.from_client_secrets_file(
                self.credentials_file,
                scopes=[
                    'openid',
                    'email',
                    'profile'
                ]
            )
            flow.redirect_uri = redirect_uri
            
            # Generate authorization URL
            auth_url, _ = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                state=state
            )
            
            return auth_url
            
        except Exception as e:
            logger.error(f"Error generating authorization URL: {e}")
            return None
    
    async def exchange_code_for_tokens(self, code: str, redirect_uri: str) -> Optional[Dict[str, Any]]:
        """Exchange authorization code for access tokens"""
        if not self.is_configured():
            logger.warning("Google OAuth not configured")
            return None
        
        try:
            # Create flow instance
            flow = Flow.from_client_secrets_file(
                self.credentials_file,
                scopes=[
                    'openid',
                    'email',
                    'profile'
                ]
            )
            flow.redirect_uri = redirect_uri
            
            # Exchange code for tokens
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            # Get user info
            user_info = await self.get_user_info(credentials.token)
            
            return {
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'user_info': user_info
            }
            
        except Exception as e:
            logger.error(f"Error exchanging code for tokens: {e}")
            return None
    
    async def get_user_info(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Get user information from Google"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    'https://www.googleapis.com/oauth2/v2/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Error fetching user info: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting user info: {e}")
            return None
    
    async def verify_token(self, access_token: str) -> bool:
        """Verify if access token is valid"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={access_token}'
                )
                
                return response.status_code == 200
                
        except Exception as e:
            logger.error(f"Error verifying token: {e}")
            return False

# Global Google OAuth service instance
google_oauth_service = GoogleOAuthService()