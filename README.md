# TouchBench v0 — Synthetic Tactile Data Explorer

A full-stack web application for generating and visualizing synthetic tactile sensor data for AI benchmarking.

![TouchBench v0](https://img.shields.io/badge/TouchBench-v0.1.0-purple?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

## 🌟 Features

### Backend (FastAPI)
- ⚡ **Dynamic Data Generation** - No hardcoded samples, all data procedurally generated
- 🎨 **Perlin Noise Simulation** - Realistic pressure maps using noise algorithms
- 🧪 **Material-Aware Physics** - Different materials produce different pressure patterns
- 📊 **Multiple Endpoints** - Single episode, time-series, and batch generation
- 🔄 **Time-Series Support** - Generate temporal sequences with realistic variation
- 📈 **Statistical Analysis** - Automatic calculation of pressure metrics

### Frontend (Next.js)
- 🎯 **Interactive Visualization** - Real-time pressure heatmaps
- 🎬 **Animation Controls** - Play/pause time-series with frame scrubbing
- 📥 **Export Functionality** - Download as JSON or CSV
- 📊 **Batch Analysis** - Visualize and compare multiple episodes
- 📈 **Charts & Graphs** - Material distribution, scatter plots, and statistics
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🌈 **Modern UI** - Gradient design with smooth animations

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (for backend)
- Node.js 18+ (for frontend)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

You can view the interactive API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

The web app will be available at `http://localhost:3000`

## 🎮 Usage

### Generate Single Episode
1. Click "Generate Episode" button
2. View the pressure heatmap and statistics
3. Download as JSON or CSV if needed

### Generate Time Series
1. Click "Generate Time Series" button
2. Use the Play/Pause controls to animate through frames
3. Scrub through frames manually with the slider
4. Observe how pressure changes over time

### Generate Batch
1. Click "Generate Batch (20)" button
2. View aggregate statistics (success rate, average pressure, etc.)
3. Explore material distribution charts
4. Analyze pressure vs variance scatter plot
5. Browse all episodes in the data table
6. Export entire batch to CSV

## 📡 API Endpoints

### `GET /api/generate_tactile`
Generate a single synthetic tactile episode.

**Response:**
```json
{
  "episode_id": "touch_a1b2c3d4",
  "object": "ceramic_mug",
  "material": "ceramic",
  "pressure_map": [[0.1, 0.3, ...], ...],
  "timestamp": "2025-11-06T19:00:00Z",
  "grasp_success": true,
  "mean_pressure": 0.542,
  "max_pressure": 0.875,
  "variance": 0.042
}
```

### `GET /api/generate_timeseries?frames=10`
Generate a time-series of tactile episodes.

**Parameters:**
- `frames` (optional): Number of frames (2-50, default 10)

**Response:** Array of TactileEpisode objects

### `GET /api/generate_batch?n=10`
Generate multiple independent episodes.

**Parameters:**
- `n` (optional): Number of episodes (1-100, default 10)

**Response:** Array of TactileEpisode objects

## 🏗️ Project Structure

```
TouchBench-v0/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment template
│   └── README.md
├── frontend/
│   ├── app/
│   │   ├── components/      # React components
│   │   ├── lib/             # API & utilities
│   │   ├── page.tsx         # Main page
│   │   └── globals.css      # Styles
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
└── README.md                # This file
```

## 🔬 Data Generation Algorithm

### Pressure Map Generation
1. **Perlin Noise Base** - Generate 2D Perlin noise for natural variation
2. **Center Bias** - Apply Gaussian weighting (grasps concentrate pressure in center)
3. **Material Hardness** - Adjust based on material properties
4. **Sensor Noise** - Add realistic measurement noise
5. **Normalization** - Clip and normalize to [0, 1] range

### Grasp Success Determination
Success is calculated based on:
- **Mean Pressure** - Must be in optimal range (0.35-0.7)
- **Variance** - Lower variance indicates more uniform grasp
- **Random Factor** - Small randomization for realism

### Supported Materials
- Metals: Steel, Aluminum
- Ceramics: Ceramic, Glass, Stone, Clay
- Polymers: Plastic, Rubber, Silicon, Foam
- Organics: Wood, Leather, Fabric, Paper, Cardboard

Each material has unique hardness properties affecting pressure distribution.

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **NumPy** - Numerical computations
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📊 Data Schema

```typescript
interface TactileEpisode {
  episode_id: string        // Unique identifier
  object: string           // Object name
  material: string         // Material type
  pressure_map: number[][] // 5×5 pressure matrix (0-1)
  timestamp: string        // ISO 8601 timestamp
  grasp_success: boolean   // Whether grasp succeeded
  mean_pressure: number    // Average pressure
  max_pressure: number     // Maximum pressure
  variance: number         // Pressure variance
}
```

## 🚢 Deployment

### Backend (Render/Railway)
1. Push to GitHub
2. Connect to deployment service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel/Netlify)
1. Push to GitHub
2. Connect to deployment service
3. Set build command: `npm run build`
4. Set environment variable: `NEXT_PUBLIC_API_BASE_URL=<your-backend-url>`

## 🤝 Contributing

Contributions are welcome! This is a demo project to showcase TouchBench v0 capabilities.

## 📝 License

MIT License - feel free to use this for your own projects!

## 🎯 Future Enhancements

- [ ] 3D visualization of pressure over time
- [ ] Integration with real sensor datasets
- [ ] Machine learning model training interface
- [ ] Multi-sensor fusion simulation
- [ ] Real-time streaming data generation
- [ ] Custom object/material definitions
- [ ] Export to common ML frameworks (PyTorch, TensorFlow)

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Built with ❤️ using FastAPI, Next.js, and Perlin Noise**

*All data is dynamically generated • No hardcoded samples • Perfect for AI benchmarking*
