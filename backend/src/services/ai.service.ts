import NodeCache from "node-cache";
import OpenAI from "openai";
import { AnalyzeResponse, PageData } from "../types";
import { SupportedLanguage, SYSTEM_PROMPTS, USER_PROMPTS } from "../utils/i18n";

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

  async analyze(
    pageData: PageData,
    language: SupportedLanguage = "en",
  ): Promise<AnalyzeResponse> {
    // cache key from URL, title, and language
    const cacheKey = this.generateCacheKey(pageData, language);

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
    const userPrompt = this.buildPrompt(pageData, language);
    const systemPrompt = this.buildSystemPrompt(language);

    try {
      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
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

  private buildSystemPrompt(language: SupportedLanguage): string {
    const basePrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.en;

    const languageSuffix: Record<SupportedLanguage, string> = {
      en: "\n\nRespond in 2-3 sentences.",
      uk: "\n\nВідповідайте ОБОВ'ЯЗКОВО українською мовою.",
      pt: "\n\nResponda OBRIGATORIAMENTE em português.",
      es: "\n\nResponde OBLIGATORIAMENTE en español.",
    };

    return basePrompt + (languageSuffix[language] || languageSuffix.en);
  }

  private buildPrompt(
    pageData: PageData,
    language: SupportedLanguage = "en",
  ): string {
    const labels: Record<SupportedLanguage, { website: string; description: string; noDescription: string; contentPreview: string }> = {
      en: { website: "Website", description: "Description", noDescription: "No description", contentPreview: "Content preview" },
      uk: { website: "Веб-сайт", description: "Опис", noDescription: "Немає опису", contentPreview: "Попередній перегляд контенту" },
      pt: { website: "Site", description: "Descrição", noDescription: "Sem descrição", contentPreview: "Pré-visualização do conteúdo" },
      es: { website: "Sitio web", description: "Descripción", noDescription: "Sin descripción", contentPreview: "Vista previa del contenido" },
    };

    const l = labels[language] || labels.en;
    const userPrompt = USER_PROMPTS[language] || USER_PROMPTS.en;

    return `
      ${l.website}: ${pageData.title}
      URL: ${pageData.url}
      ${l.description}: ${pageData.description || l.noDescription}
      ${l.contentPreview}: ${pageData.mainContent.substring(0, 1000)}
      ${userPrompt}
    `;
  }

  private generateCacheKey(
    pageData: PageData,
    language: SupportedLanguage = "en",
  ): string {
    // Create a simple cache key from URL and language
    return `analysis:${language}:${pageData.url}`.substring(0, 200);
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
