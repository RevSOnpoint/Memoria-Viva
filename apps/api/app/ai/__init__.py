from app.config import settings
from app.ai.mock_services import (
    MockTranscriptionService,
    MockImageAnalysisService,
    MockLLMNarratorService,
    MockVoiceService
)

def get_transcription_service():
    # Estructura lista para integrar Whisper u otro proveedor si AI_MODE == 'real'
    return MockTranscriptionService()

def get_image_analysis_service():
    # Estructura lista para integrar Gemini Vision si AI_MODE == 'real'
    return MockImageAnalysisService()

def get_llm_narrator_service():
    # Estructura lista para integrar Gemini LLM si AI_MODE == 'real'
    return MockLLMNarratorService()

def get_voice_service():
    return MockVoiceService()

