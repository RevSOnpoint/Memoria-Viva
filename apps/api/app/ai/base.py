from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class TranscriptionInterface(ABC):
    @abstractmethod
    def transcribe(self, file_path: str, filename: str, mime_type: str = "audio/mpeg") -> Dict[str, Any]:
        """Transcribe un archivo de audio a texto estructurado."""
        pass

class ImageAnalysisInterface(ABC):
    @abstractmethod
    def analyze(self, file_path: str, filename: str) -> Dict[str, Any]:
        """Analiza una fotografía histórica y extrae descripción y elementos detectados."""
        pass

class LLMNarratorInterface(ABC):
    @abstractmethod
    def ask(self, question: str, memoria_titular: str, knowledge_fragments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Responde a una pregunta basándose exclusivamente en los fragmentos validados.
        Si no hay información, responde 'no cuento con esa información'.
        """
        pass

class VoiceInterface(ABC):
    @abstractmethod
    def get_voice_config(
        self,
        memoria_id: Optional[int] = None,
        titular: str = ""
    ) -> Dict[str, Any]:
        """Retorna configuración para la síntesis de voz del navegador (Web Speech API)."""
        pass

