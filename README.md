# ChartLab

Analyze your trading charts with the power of AI. Upload an image, get an analysis, and improve your trading strategy.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- pnpm

### Installation

1.  Clone the repository.

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Set up environment variables:
    -   Copy the `.env.example` file to `.env` and fill in the required values.
    ```bash
    cp .env.example .env
    ```

4.  Initialize the database:
    ```bash
    pnpm prisma migrate dev
    ```

### Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API

### `/api/analyze`

Analyzes a trading chart image.

**Method:** `POST`

**Body:**

```json
{
  "imageUrl": "data:image/png;base64,...",
  "horizon": "long-term"
}
```

**Sample `curl` command:**

```bash
curl -X POST http://localhost:3000/api/analyze \
-H "Content-Type: application/json" \
-H "Cookie: next-auth.session-token=..." \
-d '{
  "imageUrl": "your_base64_image_data",
  "horizon": "long-term"
}'
```
*Note: You need to be authenticated to use this endpoint. Replace `next-auth.session-token` with a valid session token.*