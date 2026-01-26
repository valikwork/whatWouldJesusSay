import { Request, Response, Router } from "express";
import { AIService } from "../services/ai.service";
import { AnalyzeRequest, ErrorResponse } from "../types";

const router = Router();
let aiService: AIService;

// Lazy initialization
function getAIService(): AIService {
  if (!aiService) {
    aiService = new AIService();
  }
  return aiService;
}

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { pageData } = req.body as AnalyzeRequest;

    // Validation
    if (!pageData) {
      return res.status(400).json({
        error: "Missing pageData in request body",
      } as ErrorResponse);
    }

    if (!pageData.url || !pageData.title) {
      return res.status(400).json({
        error: "pageData must include url and title",
      } as ErrorResponse);
    }

    // Sanitize input
    const sanitizedPageData = {
      url: pageData.url.substring(0, 500),
      title: pageData.title.substring(0, 200),
      description: (pageData.description || "").substring(0, 500),
      ogDescription: (pageData.ogDescription || "").substring(0, 500),
      keywords: (pageData.keywords || "").substring(0, 500),
      mainContent: (pageData.mainContent || "").substring(0, 5000),
      headings: (pageData.headings || [])
        .slice(0, 50)
        .map((h) => h.substring(0, 200)),
      images: (pageData.images || [])
        .slice(0, 20)
        .map((img) => img.substring(0, 500)),
    };

    console.log(`Analyzing page: ${sanitizedPageData.title}`);

    // Get AI response
    const response = await getAIService().analyze(sanitizedPageData);

    res.json(response);
  } catch (error) {
    console.error("Error in /analyze:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      error: "Failed to analyze page",
      details: errorMessage,
    } as ErrorResponse);
  }
});

// Health check endpoint
router.get("/health", (_: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    cache: getAIService().getCacheStats(),
  });
});

export default router;
