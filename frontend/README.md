# TouchBench v0 - Frontend

Next.js 14 web application for visualizing synthetic tactile data.

## Features

- 🎨 **Beautiful UI** - Modern gradient design with Tailwind CSS
- 📊 **Real-time Visualization** - Interactive pressure heatmaps
- 🎬 **Animation** - Time-series playback with frame controls
- 📥 **Export** - Download data as JSON or CSV
- 📈 **Batch Analysis** - Generate and analyze multiple episodes with charts
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Make sure the backend is running on http://localhost:8000

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── app/
│   ├── components/          # React components
│   │   ├── PressureHeatmap.tsx
│   │   ├── JsonViewer.tsx
│   │   ├── StatsPanel.tsx
│   │   └── BatchViewer.tsx
│   ├── lib/                 # Utilities and API
│   │   ├── api.ts
│   │   └── types.ts
│   ├── layout.tsx
│   ├── page.tsx             # Main page
│   └── globals.css
├── package.json
└── tsconfig.json
```

## Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (default: http://localhost:8000)
