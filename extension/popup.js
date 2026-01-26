// Extract meaningful content from the page
const extractPageData = () => {
  const data = {
    url: window.location.href,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || '',
    ogDescription: document.querySelector('meta[property="og:description"]')?.content || '',
    keywords: document.querySelector('meta[name="keywords"]')?.content || '',
    
    // Get main content (prioritize article tags, then main, then body)
    mainContent: '',
    headings: [],
    images: []
  };

  // Extract main text content
  const article = document.querySelector('article');
  const main = document.querySelector('main');
  const body = document.body;
  
  const contentElement = article || main || body;
  
  // Get visible text, limit to first ~1000 words for API efficiency
  const textContent = contentElement.innerText || contentElement.textContent;
  data.mainContent = textContent.slice(0, 5000);

  // Extract headings
  document.querySelectorAll('h1, h2, h3').forEach((h, idx) => {
    if (idx < 10) { // Limit headings
      data.headings.push(h.textContent.trim());
    }
  });

  // Extract some image alt texts for context
  document.querySelectorAll('img[alt]').forEach((img, idx) => {
    if (idx < 5) {
      data.images.push(img.alt);
    }
  });

  return data;
}

// Listen for requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    sendResponse(extractPageData());
  }
});

document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const loading = document.getElementById('loading');
  const response = document.getElementById('response');
  const error = document.getElementById('error');
  
  // Reset UI
  loading.classList.remove('hidden');
  response.classList.add('hidden');
  error.classList.add('hidden');

  try {
    // Get active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      throw new Error('No active tab found');
    }
    
    const tab = tabs[0];

    // Extract page data
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageData
    });

    // Check if we got results
    if (!results) {
      throw new Error('No results from script execution');
    }
    
    if (results.length === 0) {
      throw new Error('Results array is empty');
    }
    
    if (!results[0]) {
      throw new Error('First result is undefined');
    }
    
    if (!results[0].result) {
      throw new Error('Result data is undefined');
    }

    const pageData = results[0].result;
    
    if (pageData.error) {
      throw new Error('Content script error: ' + pageData.error);
    }

    // Send to background script for AI processing
    chrome.runtime.sendMessage(
      { action: 'analyzeWithAI', data: pageData },
      (aiResponse) => {
        loading.classList.add('hidden');
        
        // Check for chrome runtime errors
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          error.textContent = 'Extension error: ' + chrome.runtime.lastError.message;
          error.classList.remove('hidden');
          return;
        }
        
        if (!aiResponse) {
          error.textContent = 'No response from background script';
          error.classList.remove('hidden');
          return;
        }
        
        if (aiResponse.error) {
          error.textContent = aiResponse.error;
          error.classList.remove('hidden');
        } else {
          document.querySelector('.jesus-quote').textContent = aiResponse.message;
          response.classList.remove('hidden');
        }
      }
    );
    
  } catch (err) {
    console.error('Caught error:', err);
    loading.classList.add('hidden');
    error.textContent = 'Failed to analyze page: ' + err.message;
    error.classList.remove('hidden');
  }
});