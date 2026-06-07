# Agentic Multimodal Assistant Frontend

A Next.js 16 frontend for an agentic multimodal chat experience. The app supports streaming responses, file uploads, and assistant state for OCR and audio workflows.

## Live Demo

- Deployed app: [https://multi-modal-agent-frontend-seven.vercel.app/](https://multi-modal-agent-frontend-seven.vercel.app/)

## Features

- Multimodal chat UI for text, PDF, image, and audio workflows
- Streaming assistant responses
- File upload and preview support
- Agent reasoning and tool activity indicators
- Session-based chat history
- Zustand-powered client state
- React Query-powered request handling

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- TanStack React Query
- Lucide React icons
- Sonner for notifications

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
```

### Start the production server

```bash
npm run start
```

### Lint

```bash
npm run lint
```

## Project Structure

- `app/` - Next.js app router pages, layout, and global styles
- `components/` - Chat UI, upload UI, extracted file previews, and shared components
- `hooks/` - Chat and streaming hooks
- `services/` - API client and streaming helpers
- `store/` - Zustand chat state
- `types/` - Shared TypeScript types

## Environment

The frontend talks to the backend through the API configured in [`services/api.ts`](/Users/lokii/Documents/DATASMITH_AI/frontend/services/api.ts). Update that service if the backend URL changes.

## Notes

- The main experience is rendered from [`app/page.tsx`](/Users/lokii/Documents/DATASMITH_AI/frontend/app/page.tsx).
- Global app metadata lives in [`app/layout.tsx`](/Users/lokii/Documents/DATASMITH_AI/frontend/app/layout.tsx).
- Chat streaming behavior is implemented in [`hooks/useStreaming.ts`](/Users/lokii/Documents/DATASMITH_AI/frontend/hooks/useStreaming.ts).

