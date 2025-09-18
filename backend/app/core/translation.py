# backend/app/core/translation.py
import os
import logging
from typing import Dict, List, Optional, Tuple
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException
from functools import lru_cache
import time
from deep_translator import GoogleTranslator

# Set seed for consistent language detection
DetectorFactory.seed = 0

logger = logging.getLogger(__name__)

class TranslationService:
    """Service for handling multilingual content translation"""
    
    # Target languages for Indian talent platform
    TARGET_LANGUAGES = {
        'en': 'English',
        'ta': 'Tamil',
        'hi': 'Hindi', 
        'ml': 'Malayalam',
        'bn': 'Bengali',
        'te': 'Telugu'
    }
    
    def __init__(self):
        self.deepl_auth_key = os.getenv('DEEPL_AUTH_KEY')
        self.google_api_key = os.getenv('GOOGLE_TRANSLATE_API_KEY')

        # Use deep-translator Google's web translate to avoid httpx conflicts
        self.google_translator = GoogleTranslator
        self.primary_service = 'google'

        # Optional DeepL if provided
        try:
            import deepl
            self.deepl_translator = deepl.Translator(self.deepl_auth_key) if self.deepl_auth_key else None
        except Exception:
            self.deepl_translator = None
    
    def detect_language(self, text: str) -> str:
        """
        Detect the language of input text
        Returns language code (e.g., 'en', 'ta', 'hi')
        """
        if not text or len(text.strip()) < 3:
            return 'en'  # Default to English for short text
        
        try:
            # First try enhanced Indian language detection
            from app.core.indian_languages import detect_indian_language
            indian_detected = detect_indian_language(text)
            
            # If Indian language detected with high confidence, use it
            if indian_detected != 'en':
                logger.info(f"Indian language detected: {indian_detected} for text: {text[:30]}...")
                return indian_detected
            
            # Fallback to langdetect for non-Indian languages
            detected = detect(text)
            
            # Map common misdetections
            lang_mapping = {
                'ne': 'hi',  # Nepali often misdetected as Hindi
                'ur': 'hi',  # Urdu sometimes misdetected as Hindi
                'pa': 'hi',  # Punjabi sometimes misdetected as Hindi
                'sq': 'en',  # Albanian often misdetected for English names
                'no': 'en',  # Norwegian sometimes misdetected for English
                'da': 'en',  # Danish sometimes misdetected for English
            }
            
            mapped_lang = lang_mapping.get(detected, detected)
            logger.info(f"Langdetect result: {detected} -> mapped to: {mapped_lang}")
            return mapped_lang
                
        except LangDetectException:
            logger.warning(f"Could not detect language for text: {text[:50]}...")
            return 'en'  # Default to English
        except Exception as e:
            logger.error(f"Language detection error: {str(e)}")
            return 'en'  # Default to English
    
    def translate_text(self, text: str, source_lang: str, target_lang: str) -> Optional[str]:
        """
        Translate text from source language to target language
        Uses Google Translate for Indian languages, DeepL as fallback for English
        """
        if not text or source_lang == target_lang:
            return text
        
        if not self.google_translator and not self.deepl_translator:
            logger.error("No translator available")
            return text
        
        try:
            # Use Google Translate for Indian languages (better support)
            if self.primary_service == 'google' and self.google_translator:
                # Create a new translator instance for each translation
                translator = self.google_translator(source=source_lang, target=target_lang)
                translated = translator.translate(text)
                logger.info(f"Google Translate: {source_lang} -> {target_lang}: '{text}' -> '{translated}'")
                return translated
            
            # Fallback to DeepL for English and supported languages
            elif self.deepl_translator:
                # DeepL language code mapping (limited Indian language support)
                deepl_lang_mapping = {
                    'en': 'EN',
                    'hi': 'HI',  # Hindi is supported by DeepL
                    # Other Indian languages not supported by DeepL
                }
                
                deepl_source = deepl_lang_mapping.get(source_lang)
                deepl_target = deepl_lang_mapping.get(target_lang)
                
                if deepl_source and deepl_target:
                    result = self.deepl_translator.translate_text(
                        text, 
                        source_lang=deepl_source,
                        target_lang=deepl_target
                    )
                    return result.text
                else:
                    if self.google_translator:
                        translator = self.google_translator(source=source_lang, target=target_lang)
                        return translator.translate(text)
            
            return text  # Return original if no translation possible
            
        except Exception as e:
            logger.error(f"Translation failed from {source_lang} to {target_lang}: {str(e)}")
            return text  # Return original on failure
    
    def translate_to_all_languages(self, text: str, source_lang: Optional[str] = None) -> Dict[str, str]:
        """
        Translate text to all target languages
        Returns a dictionary with language codes as keys
        """
        if not text:
            return {}
        
        # Detect source language if not provided
        if not source_lang:
            source_lang = self.detect_language(text)
        
        translations = {}
        
        # Always include the original text in its detected language
        translations[source_lang] = text
        
        # Translate to other target languages
        for target_lang in self.TARGET_LANGUAGES.keys():
            if target_lang != source_lang:
                translated = self.translate_text(text, source_lang, target_lang)
                if translated:
                    translations[target_lang] = translated
                    # Small delay to avoid rate limiting
                    time.sleep(0.1)
        
        return translations
    
    def get_translated_content(self, translations: Dict[str, str], preferred_lang: str = 'en') -> str:
        """
        Get content in preferred language, fallback to English, then original
        """
        if not translations:
            return ""
        
        # Try preferred language first
        if preferred_lang in translations:
            return translations[preferred_lang]
        
        # Fallback to English
        if 'en' in translations:
            return translations['en']
        
        # Return any available translation
        return list(translations.values())[0]
    
    @lru_cache(maxsize=1000)
    def cached_detect_language(self, text: str) -> str:
        """Cached version of language detection for better performance"""
        return self.detect_language(text)

# Global instance
translation_service = TranslationService()

def detect_and_translate(text: str, content_type: str = None) -> Tuple[str, Dict[str, str]]:
    """
    Convenience function to detect language and translate content
    Returns (source_language, translations_dict)
    """
    source_lang = translation_service.detect_language(text)
    translations = translation_service.translate_to_all_languages(text, source_lang)
    
    logger.info(f"Translated {content_type or 'content'} from {source_lang} to {len(translations)} languages")
    
    return source_lang, translations