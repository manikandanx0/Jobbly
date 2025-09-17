# backend/app/core/translation.py
import os
import deepl
import logging
from typing import Dict, List, Optional, Tuple
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException
from functools import lru_cache
import time

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
        
        # DeepL has limited support for Indian languages, so we'll use Google Translate as primary
        if self.google_api_key:
            from googletrans import Translator
            self.google_translator = Translator()
            self.primary_service = 'google'
        elif self.deepl_auth_key:
            import deepl
            self.deepl_translator = deepl.Translator(self.deepl_auth_key)
            self.primary_service = 'deepl'
        else:
            logger.warning("No translation API keys found, translation will be limited")
            self.google_translator = None
            self.deepl_translator = None
            self.primary_service = None
    
    def detect_language(self, text: str) -> str:
        """
        Detect the language of input text
        Returns language code (e.g., 'en', 'ta', 'hi')
        """
        if not text or len(text.strip()) < 3:
            return 'en'  # Default to English for short text
        
        try:
            detected = detect(text)
            # Map some common variations and handle Indian languages
            language_mapping = {
                'mr': 'hi',  # Marathi -> Hindi (similar script)
                'ne': 'hi',  # Nepali -> Hindi (similar script)
                'ur': 'hi',  # Urdu -> Hindi (similar for job platform context)
                'gu': 'hi',  # Gujarati -> Hindi (fallback)
                'kn': 'te',  # Kannada -> Telugu (similar region)
                'or': 'bn',  # Odia -> Bengali (similar script)
            }
            
            detected_lang = language_mapping.get(detected, detected)
            
            # Ensure we only return supported languages
            if detected_lang in self.TARGET_LANGUAGES:
                return detected_lang
            else:
                # Default to English if unsupported language detected
                logger.info(f"Unsupported language detected: {detected}, defaulting to English")
                return 'en'
                
        except LangDetectException:
            logger.warning(f"Could not detect language for text: {text[:50]}...")
            return 'en'  # Default to English
    
    def translate_text(self, text: str, source_lang: str, target_lang: str) -> Optional[str]:
        """
        Translate text from source language to target language
        Uses Google Translate for Indian languages, DeepL as fallback for English
        """
        if not text or source_lang == target_lang:
            return text
        
        if not self.google_translator and not hasattr(self, 'deepl_translator'):
            logger.error("No translator available")
            return text
        
        try:
            # Use Google Translate for Indian languages (better support)
            if self.primary_service == 'google' and self.google_translator:
                result = self.google_translator.translate(
                    text, 
                    src=source_lang, 
                    dest=target_lang
                )
                return result.text
            
            # Fallback to DeepL for English and supported languages
            elif hasattr(self, 'deepl_translator') and self.deepl_translator:
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
                    # Use Google Translate as fallback
                    if hasattr(self, 'google_translator') and self.google_translator:
                        from googletrans import Translator
                        fallback_translator = Translator()
                        result = fallback_translator.translate(text, src=source_lang, dest=target_lang)
                        return result.text
            
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