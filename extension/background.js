const API_URL = 'https://wwjs-production.up.railway.app/api'; // Production URL

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeWithAI') {
    console.log('Background: Received request with data:', request.data);

    analyzeWithBackend(request.data, request.language || 'en')
      .then(response => {
        console.log('Background: AI response success:', response);
        sendResponse(response);
      })
      .catch(error => {
        console.error('Background: AI response error:', error);
        sendResponse({ error: error.message });
      });
    return true; // Keep channel open for async response
  }
});

async function analyzeWithBackend(pageData, language) {
  try {
    console.log('Background: Making API call to backend...');

    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageData: {
          url: pageData.url,
          title: pageData.title,
          description: pageData.description || '',
          mainContent: pageData.mainContent || '',
        },
        language: language,
      }),
    });

    console.log('Background: Response status:', response.status);

    const data = await response.json();
    console.log('Background: Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.error || data.details || 'API request failed');
    }
    
    if (!data.message) {
      throw new Error('No message in response');
    }
    
    return data;
  } catch (error) {
    console.error('Background: Exception in analyzeWithBackend:', error);
    throw error;
  }
}
