# What Would Jesus Say - Backend API

Backend API for the "What Would Jesus Say" browser extension.

## Features

- ✝️ OpenAI GPT-4o-mini integration
- 🚀 TypeScript for type safety
- 🔒 Rate limiting and security
- 💾 Response caching
- 🌐 CORS support for browser extensions

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 3. Run development server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### 4. Build for production

```bash
npm run build
npm start
```

## API Endpoints

### POST /api/analyze

Analyze a webpage and get Jesus's perspective.

**Request:**

```json
{
  "pageData": {
    "url": "https://example.com",
    "title": "Example Page",
    "description": "Page description",
    "mainContent": "Page content..."
  }
}
```

**Response:**

```json
{
  "message": "My child, seek truth with a humble heart...",
  "cached": false,
  "model": "gpt-4o-mini",
  "tokensUsed": 156
}
```

### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-26T12:00:00.000Z",
  "cache": {
    "keys": 5,
    "hits": 12,
    "misses": 3
  }
}
```

## Deployment

### Railway

1. Create account on [Railway](https://railway.app)
2. New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Deploy!

### Render

1. Create account on [Render](https://render.com)
2. New Web Service → Connect repository
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables
6. Deploy!

## Environment Variables

| Variable                  | Description             | Default           |
| ------------------------- | ----------------------- | ----------------- |
| `PORT`                    | Server port             | `3002`            |
| `NODE_ENV`                | Environment             | `development`     |
| `OPENAI_API_KEY`          | OpenAI API key          | Required          |
| `OPENAI_MODEL`            | Model to use            | `gpt-4o-mini`     |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window       | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `10`              |
| `ALLOWED_ORIGINS`         | CORS allowed origins    | `*`               |

## License

MIT
