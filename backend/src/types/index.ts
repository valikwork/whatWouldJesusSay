export interface PageData {
  url: string;
  title: string;
  description: string;
  ogDescription: string;
  keywords: string;
  mainContent: string;
  headings: string[];
  images: string[];
}

export interface AnalyzeRequest {
  pageData: PageData;
}

export interface AnalyzeResponse {
  message: string;
  cached?: boolean;
  model?: string;
  tokensUsed?: number;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
