import google.generativeai as genai
from typing import Dict, Any, Optional
import logging
from ..core.config import settings
import random

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_keys = [
            settings.gemini_api_key,
            settings.gemini_api_key_1,
            settings.gemini_api_key_2
        ]
        self.current_key_index = 0
        self.configure_ai()
    
    def configure_ai(self):
        """Configure Google Gemini AI"""
        try:
            api_key = self.api_keys[self.current_key_index]
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("AI Service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AI Service: {e}")
            raise
    
    def rotate_api_key(self):
        """Rotate to next API key if current one fails"""
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        self.configure_ai()
        logger.info(f"Rotated to API key index: {self.current_key_index}")
    
    async def generate_response(
        self, 
        user_message: str, 
        session_type: str = "general",
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate AI response based on user message and context"""
        try:
            # Prepare system prompt based on session type
            system_prompt = self._get_system_prompt(session_type)
            
            # Prepare context string
            context_str = ""
            if context:
                context_str = f"Context: {context}\n\n"
            
            # Combine prompt
            full_prompt = f"{system_prompt}\n\n{context_str}User: {user_message}\n\nAssistant:"
            
            # Generate response
            response = self.model.generate_content(full_prompt)
            
            if response.text:
                return response.text.strip()
            else:
                return "I apologize, but I'm having trouble generating a response right now. Please try again."
                
        except Exception as e:
            logger.error(f"AI response generation failed: {e}")
            
            # Try rotating API key and retry once
            try:
                self.rotate_api_key()
                response = self.model.generate_content(full_prompt)
                if response.text:
                    return response.text.strip()
            except Exception as retry_error:
                logger.error(f"AI retry also failed: {retry_error}")
            
            return "I'm currently experiencing technical difficulties. Please try again later or contact support."
    
    def _get_system_prompt(self, session_type: str) -> str:
        """Get system prompt based on session type"""
        prompts = {
            "general": """You are WeCure AI, a helpful healthcare assistant. You provide general health information, wellness tips, and guidance on when to seek medical care. You are empathetic, professional, and always recommend consulting healthcare professionals for specific medical concerns.

Guidelines:
- Provide helpful, accurate health information
- Never diagnose or prescribe medications
- Always recommend consulting doctors for serious concerns
- Be empathetic and supportive
- Keep responses concise and easy to understand""",
            
            "medical": """You are WeCure Medical AI, a specialized medical consultation assistant. You help users understand symptoms, provide health guidance, and facilitate connections with healthcare providers.

Guidelines:
- Ask relevant questions to understand symptoms
- Provide educational information about conditions
- Assess urgency and recommend appropriate care level
- Never provide definitive diagnoses
- Always recommend professional medical consultation
- Be thorough but clear in explanations""",
            
            "emergency": """You are WeCure Emergency AI. You assist with urgent health situations and help determine if emergency care is needed.

Guidelines:
- Quickly assess emergency situations
- Provide immediate first aid guidance when appropriate
- Strongly recommend emergency services for serious conditions
- Stay calm and provide clear instructions
- Collect essential information for emergency responders
- Never delay emergency care with lengthy consultations""",
            
            "food_delivery": """You are WeCure Nutrition AI, helping users make healthy food choices and manage dietary needs.

Guidelines:
- Recommend healthy meal options
- Consider dietary restrictions and allergies
- Provide nutritional information
- Suggest balanced meal combinations
- Help with meal planning for health conditions
- Promote healthy eating habits"""
        }
        
        return prompts.get(session_type, prompts["general"])
    
    async def analyze_symptoms(self, symptoms: str, additional_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """Analyze symptoms and provide preliminary assessment"""
        try:
            prompt = f"""As a medical AI assistant, analyze the following symptoms and provide a structured assessment:

Symptoms: {symptoms}

Additional Information: {additional_info or 'None provided'}

Please provide:
1. Possible conditions (educational purposes only)
2. Urgency level (low/medium/high/emergency)
3. Recommended actions
4. When to seek immediate care
5. Questions to ask a doctor

Format your response as a structured analysis. Remember to emphasize that this is for educational purposes only and professional medical consultation is required for proper diagnosis."""

            response = self.model.generate_content(prompt)
            
            # Parse response into structured format
            analysis = {
                "assessment": response.text if response.text else "Unable to analyze symptoms",
                "urgency": self._extract_urgency(response.text if response.text else ""),
                "recommendations": self._extract_recommendations(response.text if response.text else ""),
                "disclaimer": "This analysis is for educational purposes only. Please consult a healthcare professional for proper diagnosis and treatment."
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Symptom analysis failed: {e}")
            return {
                "assessment": "Unable to analyze symptoms at this time",
                "urgency": "medium",
                "recommendations": ["Consult a healthcare professional"],
                "disclaimer": "This analysis is for educational purposes only. Please consult a healthcare professional for proper diagnosis and treatment."
            }
    
    def _extract_urgency(self, text: str) -> str:
        """Extract urgency level from AI response"""
        text_lower = text.lower()
        if any(word in text_lower for word in ["emergency", "urgent", "immediate", "911", "ambulance"]):
            return "emergency"
        elif any(word in text_lower for word in ["high", "soon", "quickly", "promptly"]):
            return "high"
        elif any(word in text_lower for word in ["medium", "moderate", "few days"]):
            return "medium"
        else:
            return "low"
    
    def _extract_recommendations(self, text: str) -> list:
        """Extract recommendations from AI response"""
        # Simple extraction - in production, you'd use more sophisticated NLP
        recommendations = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if line.startswith(('•', '-', '*')) or 'recommend' in line.lower():
                recommendations.append(line.lstrip('•-* '))
        
        if not recommendations:
            recommendations = ["Consult a healthcare professional for proper evaluation"]
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    async def generate_health_tips(self, category: str = "general") -> list:
        """Generate health tips for specified category"""
        try:
            prompt = f"""Generate 5 practical, actionable health tips for the category: {category}.
            
Make them:
- Specific and actionable
- Easy to understand
- Evidence-based
- Suitable for general population
- Focused on prevention and wellness

Format as a numbered list."""

            response = self.model.generate_content(prompt)
            
            if response.text:
                # Parse tips from response
                tips = []
                lines = response.text.split('\n')
                for line in lines:
                    line = line.strip()
                    if line and (line[0].isdigit() or line.startswith(('•', '-', '*'))):
                        tips.append(line.lstrip('0123456789. •-*'))
                
                return tips[:5]  # Ensure max 5 tips
            
        except Exception as e:
            logger.error(f"Health tips generation failed: {e}")
        
        # Fallback tips
        return [
            "Stay hydrated by drinking at least 8 glasses of water daily",
            "Get 7-9 hours of quality sleep each night",
            "Exercise for at least 30 minutes, 5 days a week",
            "Eat a balanced diet with plenty of fruits and vegetables",
            "Practice stress management techniques like meditation or deep breathing"
        ]

# Create global instance
ai_service = AIService()