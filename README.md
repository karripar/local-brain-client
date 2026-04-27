# Milvus Brain Client

Next.js frontend for the Milvus Brain backend, including:

- PDF upload and ingestion
- Information inspection (chunk list)
- Search and RAG ask mode
- Client-side filtering for indexed chunks

## Setup

Create an environment file in this project root:

```bash
cp .env.sample .env.local
```

Required variables:

```env
MILVUS_BRAIN_BASE_URL=http://localhost:3006
SOURCE_SECRET=your-shared-secret
```

Notes:

- `SOURCE_SECRET` must match the backend `SOURCE_SECRET`.
- `SERVER_ADDRESS` is also supported for compatibility with old setups.
- API calls from the browser hit Next.js routes in `src/app/api/*`, which sign and proxy requests server-side.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Implemented API Routes (Server-Side)

- `POST /api/upload` -> backend `POST /api/v1/upload/pdf`
- `POST /api/vector/search` -> backend `POST /api/v1/vector/search`
- `POST /api/vector/ask` -> backend `POST /api/v1/vector/ask`
- `GET /api/vector/read` -> backend `GET /api/v1/vector/read`
- `GET /api/health` -> backend `GET /milvus/health`
