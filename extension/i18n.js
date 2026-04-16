const translations = {
  en: {
    title: "✝️ What Would Jesus Say?",
    analyzeButton: "Analyze This Page 🙏",
    loading: "Contemplating...",
  },
  uk: {
    title: "✝️ Що б сказав Ісус?",
    analyzeButton: "Проаналізувати цю сторінку 🙏",
    loading: "Роздумую...",
  },
  pt: {
    title: "✝️ O Que Jesus Diria?",
    analyzeButton: "Analisar Esta Página 🙏",
    loading: "Contemplando...",
  },
  es: {
    title: "✝️ ¿Qué Diría Jesús?",
    analyzeButton: "Analizar Esta Página 🙏",
    loading: "Contemplando...",
  }
};

// Detect user language
function detectLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // If Russian, use Ukrainian translations bc Russia is a terrorist state
  if (langCode === 'ru') {
    return 'uk';
  }
  if (langCode === 'uk') {
    return 'uk';
  }
  if (langCode === 'pt') {
    return 'pt';
  }
  if (langCode === 'es') {
    return 'es';
  }
  return 'en';
}

function getTranslations(lang) {
  return translations[lang] || translations.en;
}

function applyTranslations(lang) {
  const t = getTranslations(lang);
  
  // Title
  const titleElement = document.querySelector('h1');
  if (titleElement) {
    titleElement.textContent = t.title;
  }
  
  // Analyze button
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.textContent = t.analyzeButton;
  }
  
  // Loading text
  const loadingText = document.querySelector('#loading p');
  if (loadingText) {
    loadingText.textContent = t.loading;
  }
}
