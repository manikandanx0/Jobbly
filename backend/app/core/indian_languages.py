# backend/app/core/indian_languages.py
import re
from typing import Dict, Optional, List
import logging

logger = logging.getLogger(__name__)

class IndianLanguageDetector:
    """Enhanced language detection for Indian languages based on script patterns and keywords"""
    
    # Unicode ranges for Indian scripts
    SCRIPT_RANGES = {
        'ta': (0x0B80, 0x0BFF),  # Tamil
        'hi': (0x0900, 0x097F),  # Devanagari (Hindi)
        'bn': (0x0980, 0x09FF),  # Bengali
        'te': (0x0C00, 0x0C7F),  # Telugu
        'ml': (0x0D00, 0x0D7F),  # Malayalam
    }
    
    # Common words in each language for better detection
    LANGUAGE_KEYWORDS = {
        'ta': ['தமிழ்', 'வேலை', 'நிறுவனம்', 'திறமை', 'அனுபவம்', 'மாணவர்', 'பணி', 'வேலைவாய்ப்பு'],
        'hi': ['काम', 'कंपनी', 'अनुभव', 'कौशल', 'नौकरी', 'छात्र', 'रोजगार', 'इंटर्नशिप', 'प्रोजेक्ट'],
        'bn': ['কাজ', 'কোম্পানি', 'অভিজ্ঞতা', 'দক্ষতা', 'চাকরি', 'ছাত্র', 'প্রকল্প', 'ইন্টার্নশিপ'],
        'te': ['పని', 'కంపెనీ', 'అనుభవం', 'నైపుణ্యం', 'ఉద్యోగం', 'విద్యార్థి', 'ప్రాజెక్ట్', 'ఇంటర్న్‌షిప్'],
        'ml': ['ജോലി', 'കമ്പനി', 'അനുഭവം', 'കഴിവ്', 'ജോലി', 'വിദ്യാർത്ഥി', 'പദ്ധതി', 'ഇന്റേൺഷിപ്പ്'],
        'en': ['work', 'job', 'company', 'experience', 'skill', 'student', 'internship', 'project', 'developer', 'engineer']
    }
    
    # Character frequency patterns for each language
    COMMON_CHARS = {
        'ta': ['த', 'ம', 'ல', 'ர', 'ன', 'க', 'வ', 'ப', 'യ', 'ட'],
        'hi': ['क', 'र', 'त', 'न', 'स', 'म', 'ह', 'ल', 'द', 'प'],
        'bn': ['র', 'ত', 'ন', 'ক', 'স', 'ম', 'ল', 'দ', 'হ', 'প'],
        'te': ['త', 'న', 'ర', 'క', 'ల', 'మ', 'వ', 'స', 'ద', 'య'],
        'ml': ['ം', 'ന', 'ര', 'ക', 'ത', 'ല', 'മ', 'യ', 'സ', 'പ'],
        'en': ['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r', 'l']
    }
    
    def detect_by_script(self, text: str) -> Optional[str]:
        """Detect language based on Unicode script ranges"""
        if not text:
            return None
        
        script_counts = {lang: 0 for lang in self.SCRIPT_RANGES}
        total_chars = 0
        
        for char in text:
            if char.isalpha():  # Only count alphabetic characters
                total_chars += 1
                char_code = ord(char)
                for lang, (start, end) in self.SCRIPT_RANGES.items():
                    if start <= char_code <= end:
                        script_counts[lang] += 1
                        break
        
        if total_chars == 0:
            return None
        
        # Find the script with the highest percentage
        max_count = max(script_counts.values())
        if max_count > 0 and max_count / total_chars > 0.3:  # At least 30% of characters
            for lang, count in script_counts.items():
                if count == max_count:
                    return lang
        
        return None
    
    def detect_by_keywords(self, text: str) -> Optional[str]:
        """Detect language based on common keywords"""
        if not text:
            return None
            
        text_lower = text.lower()
        
        keyword_scores = {lang: 0 for lang in self.LANGUAGE_KEYWORDS}
        
        for lang, keywords in self.LANGUAGE_KEYWORDS.items():
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    # Weight longer keywords more heavily
                    keyword_scores[lang] += len(keyword)
        
        # Find language with highest keyword score
        max_score = max(keyword_scores.values())
        if max_score > 0:
            for lang, score in keyword_scores.items():
                if score == max_score:
                    return lang
        
        return None
    
    def detect_by_char_frequency(self, text: str) -> Optional[str]:
        """Detect language based on character frequency patterns"""
        if not text or len(text) < 20:  # Need sufficient text for frequency analysis
            return None
        
        text_chars = [char.lower() for char in text if char.isalpha()]
        if len(text_chars) < 10:
            return None
        
        char_scores = {lang: 0 for lang in self.COMMON_CHARS}
        
        for lang, common_chars in self.COMMON_CHARS.items():
            for char in common_chars:
                char_count = text_chars.count(char)
                char_scores[lang] += char_count
        
        # Normalize by text length
        total_chars = len(text_chars)
        for lang in char_scores:
            char_scores[lang] = char_scores[lang] / total_chars
        
        max_score = max(char_scores.values())
        if max_score > 0.05:  # At least 5% frequency match
            for lang, score in char_scores.items():
                if score == max_score:
                    return lang
        
        return None
    
    def enhanced_detect(self, text: str) -> str:
        """Enhanced detection combining multiple methods"""
        if not text or len(text.strip()) < 3:
            return 'en'
        
        # Method 1: Script-based detection (most reliable for Indian languages)
        script_detection = self.detect_by_script(text)
        
        # Method 2: Keyword-based detection
        keyword_detection = self.detect_by_keywords(text)
        
        # Method 3: Character frequency analysis
        freq_detection = self.detect_by_char_frequency(text)
        
        # Voting system - weight the methods
        votes = {}
        
        # Script detection gets highest weight
        if script_detection:
            votes[script_detection] = votes.get(script_detection, 0) + 3
        
        # Keyword detection gets medium weight
        if keyword_detection:
            votes[keyword_detection] = votes.get(keyword_detection, 0) + 2
        
        # Frequency detection gets lowest weight
        if freq_detection:
            votes[freq_detection] = votes.get(freq_detection, 0) + 1
        
        # Return language with most votes
        if votes:
            winner = max(votes.items(), key=lambda x: x[1])
            logger.info(f"Language detection votes: {votes}, winner: {winner[0]}")
            return winner[0]
        
        # Check if it's likely English (ASCII only)
        if re.match(r'^[a-zA-Z0-9\s\.,!?\-()]+$', text.strip()):
            return 'en'
        
        # Final fallback
        logger.warning(f"Could not reliably detect language for: {text[:50]}...")
        return 'en'
    
    def get_confidence_score(self, text: str, detected_lang: str) -> float:
        """Get confidence score (0-1) for the detected language"""
        if not text:
            return 0.0
        
        score = 0.0
        total_methods = 0
        
        # Script-based confidence
        script_detection = self.detect_by_script(text)
        if script_detection == detected_lang:
            score += 0.5
        total_methods += 1
        
        # Keyword-based confidence
        keyword_detection = self.detect_by_keywords(text)
        if keyword_detection == detected_lang:
            score += 0.3
        total_methods += 1
        
        # Frequency-based confidence
        freq_detection = self.detect_by_char_frequency(text)
        if freq_detection == detected_lang:
            score += 0.2
        total_methods += 1
        
        return min(score, 1.0)  # Cap at 1.0

# Global instance
indian_detector = IndianLanguageDetector()

def detect_indian_language(text: str) -> str:
    """Convenience function for Indian language detection"""
    return indian_detector.enhanced_detect(text)

def detect_with_confidence(text: str) -> tuple[str, float]:
    """Detect language with confidence score"""
    detected_lang = indian_detector.enhanced_detect(text)
    confidence = indian_detector.get_confidence_score(text, detected_lang)
    return detected_lang, confidence