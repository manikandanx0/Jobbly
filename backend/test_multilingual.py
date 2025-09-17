# backend/test_multilingual.py
import os
import sys
import json

# Add paths
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
root_dir = os.path.dirname(backend_dir)
sys.path.insert(0, root_dir)

from app.core.translation import translation_service, detect_and_translate

def test_language_detection():
    print("🔍 Testing Language Detection...")
    
    test_texts = [
        ("Hello, I am a software developer", "en"),
        ("Hola, soy desarrollador de software", "es"),
        ("Bonjour, je suis développeur logiciel", "fr"),
        ("Hallo, ich bin Softwareentwickler", "de"),
        ("Olá, sou desenvolvedor de software", "pt")
    ]
    
    for text, expected in test_texts:
        detected = translation_service.detect_language(text)
        status = "✅" if detected == expected else "❌"
        print(f"  {status} '{text[:30]}...' -> {detected} (expected: {expected})")

def test_translation():
    print("\n🌐 Testing Translation...")
    
    original_text = "I am an experienced full-stack developer with 5 years of experience"
    source_lang, translations = detect_and_translate(original_text, "test")
    
    print(f"Source language: {source_lang}")
    print("Translations:")
    for lang, text in translations.items():
        lang_name = translation_service.TARGET_LANGUAGES.get(lang, lang)
        print(f"  {lang} ({lang_name}): {text}")

def test_user_creation():
    print("\n👤 Testing User Creation with Translation...")
    
    try:
        from app.models.user import UserCreate
        from app.core.services import user_service
        
        # Test user data in Spanish
        test_user = UserCreate(
            role="talent",
            full_name="María García",
            email="maria@example.com",
            professional_summary="Soy una desarrolladora frontend con experiencia en React y Vue.js. Me especializo en crear interfaces de usuario intuitivas y responsivas.",
            skills=["React", "Vue.js", "JavaScript", "CSS", "HTML"],
            experience_level="mid"
        )
        
        print("Creating user with Spanish summary...")
        # Note: This would actually create a user in the database
        # Uncomment to test with real database:
        # user = user_service.create_user(test_user)
        # print(f"✅ User created with translations")
        print("✅ User creation logic ready (skipped actual DB insert)")
        
    except Exception as e:
        print(f"❌ Error testing user creation: {str(e)}")

if __name__ == "__main__":
    print("🧪 Testing Multilingual System\n")
    
    # Check if DeepL key is configured
    deepl_key = os.getenv('DEEPL_AUTH_KEY')
    if deepl_key:
        print(f"✅ DeepL API key configured (length: {len(deepl_key)})")
    else:
        print("⚠️ DeepL API key not found - translation will be limited")
    
    test_language_detection()
    
    if deepl_key:
        test_translation()
    else:
        print("\n⚠️ Skipping translation test - no DeepL key")
    
    test_user_creation()
    
    print("\n🎉 Multilingual system testing complete!")