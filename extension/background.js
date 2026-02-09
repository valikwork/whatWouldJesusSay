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

// async function analyzeWithOpenAI(pageData) {
//   try {
//     const prompt = `You are responding as Jesus Christ from the Christian tradition. Based on the teachings in the Gospels and Christian scripture, provide a brief response (2-3 sentences) about this webpage content.
//     Critisize content of the page if it goes against christian teachings even if a little. Try to find at least something in this content that goes against christian teachings and critisize it.
//     You can express righteous rage if needed, not sparing anyones feelings.
//     Emphasize the role of devil in temptation and sin of the content you provided.

//     Website: ${pageData.title}
//     URL: ${pageData.url}
//     Description: ${pageData.description}
//     Content preview: ${pageData.mainContent.substring(0, 1000)}

//     What would you say about this content? Respond in first person as Jesus, with wisdom, and reference to relevant Biblical principles where appropriate. 
//     Critisize content of the page if it goes against christian teachings even if a little. 
//     Try to find at least something in this content that goes against christian teachings and critisize it.
//     You can express righteous rage if needed, not sparing anyones feelings.
//     Emphasize the role of devil in temptation and sin of the content you provided
// `;

//     console.log('Background: Making API call to OpenAI...');

//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${OPENAI_API_KEY}`
//       },
//       body: JSON.stringify({
//         model: 'gpt-4o-mini',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are Jesus Christ from the Christian tradition, speaking with wisdom, but also with righteous criticism when content goes against Christian teachings.'
//           },
//           {
//             role: 'user',
//             content: prompt
//           }
//         ],
//         max_tokens: 300,
//         temperature: 0.7
//       })
//     });

//     console.log('Background: Response status:', response.status);

//     const data = await response.json();
//     console.log('Background: Response data:', data);
    
//     // Check for errors
//     if (data.error) {
//       throw new Error(data.error.message || JSON.stringify(data.error));
//     }
    
//     if (!data.choices) {
//       throw new Error('No choices in response: ' + JSON.stringify(data));
//     }
    
//     if (!data.choices[0]) {
//       throw new Error('No first choice in response');
//     }
    
//     if (!data.choices[0].message) {
//       throw new Error('No message in first choice');
//     }
    
//     return data.choices[0].message.content;
//   } catch (error) {
//     console.error('Background: Exception in analyzeWithOpenAI:', error);
//     throw error;
//   }
// }

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
