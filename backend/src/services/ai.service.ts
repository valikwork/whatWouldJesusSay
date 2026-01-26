import NodeCache from "node-cache";
import OpenAI from "openai";
import { AnalyzeResponse, PageData } from "../types";

// Cache for 1 minute
const cache = new NodeCache({ stdTTL: 60 });

export class AIService {
  private openai: OpenAI;
  private model: string;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async analyze(pageData: PageData): Promise<AnalyzeResponse> {
    // Generate cache key from URL and title
    const cacheKey = this.generateCacheKey(pageData);

    // Check cache
    const cached = cache.get<string>(cacheKey);
    if (cached) {
      console.log("Cache hit for:", pageData.url);
      return {
        message: cached,
        cached: true,
        model: this.model,
      };
    }

    // Build prompt
    const prompt = this.buildPrompt(pageData);

    try {
      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are Jesus Christ from the Christian tradition, speaking with wisdom, but also with righteous criticism when content goes against Christian teachings. Respond in first person. Use 2-3 sentences.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const responseText = completion.choices[0]?.message?.content;

      if (!responseText) {
        throw new Error("No response text from OpenAI");
      }

      // Cache the result
      cache.set(cacheKey, responseText);

      return {
        message: responseText,
        cached: false,
        model: this.model,
        tokensUsed: completion.usage?.total_tokens,
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        console.error("OpenAI API Error:", error.status, error.message);
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }

  private buildPrompt(pageData: PageData): string {
    return `
    You are responding as Jesus Christ from the Christian tradition. Based on the teachings in the Gospels and Christian scripture, provide a brief response (2-3 sentences) about this webpage content.
    Critisize content of the page if it goes against christian teachings even if a little. Try to find at least something in this content that goes against christian teachings and critisize it.
    You can express righteous rage if needed, not sparing anyones feelings.
    Emphasize the role of devil in temptation and sin of the content you provided.

    Website: ${pageData.title}
    URL: ${pageData.url}
    Description: ${pageData.description || "No description"}
    Content preview: ${pageData.mainContent.substring(0, 1000)}

    What would you say about this content? Respond in first person as Jesus in 2-3 sentences, with wisdom, and reference to relevant Biblical principles where appropriate. 
    Critisize content of the page if it goes against christian teachings even if a little. 
    Try to find at least something in this content that goes against christian teachings and critisize it.
    You can express righteous rage if needed, not sparing anyones feelings.
    Emphasize the role of devil in temptation and sin of the content you provided.
    `;
  }

  private generateCacheKey(pageData: PageData): string {
    // Create a simple cache key from URL
    return `analysis:${pageData.url}`.substring(0, 200);
  }

  // Method to clear cache (useful for admin endpoints)
  clearCache(): void {
    cache.flushAll();
  }

  // Get cache stats
  getCacheStats() {
    return cache.getStats();
  }
}
