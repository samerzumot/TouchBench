# 🎯 TouchBench

Interactive Touch & Gesture Performance Benchmark

A web-based application for testing and measuring touch performance, gesture recognition, and device responsiveness.

## 🚀 Deployment

This project is configured to automatically deploy to GitHub Pages.

### 🌐 Live Site (Available Now!)

**Immediate Access (Renders Properly):**
**https://raw.githack.com/samerzumot/TouchBench/cursor/deploy-and-share-project-link-9660/index.html**

**Alternative Link:**
https://htmlpreview.github.io/?https://raw.githubusercontent.com/samerzumot/TouchBench/cursor/deploy-and-share-project-link-9660/index.html

**Future GitHub Pages URL (requires manual setup):**
https://samerzumot.github.io/TouchBench/

### Deployment Method

The project uses GitHub Actions for automatic deployment. When code is pushed to the `cursor/deploy-and-share-project-link-9660` or `main` branch, the workflow automatically:

1. Builds the site
2. Deploys to GitHub Pages
3. Makes it publicly accessible

### Files Included

- `index.html` - Main website with modern, responsive design
- `.github/workflows/deploy.yml` - GitHub Actions workflow for automatic deployment
- `vercel.json` - Configuration for Vercel deployment (alternative)
- `netlify.toml` - Configuration for Netlify deployment (alternative)

### Alternative Deployment Options

If you prefer to use other platforms, configuration files are included for:
- **Vercel**: `vercel.json`
- **Netlify**: `netlify.toml`

Simply run:
```bash
# For Vercel
vercel --prod

# For Netlify
netlify deploy --prod
```

## 🎨 Features

The deployed demo includes:

### ⚡ Real-time Performance Monitoring
- Touch event counter
- Average response time tracking
- Active touch point detection
- Live FPS counter

### 🎨 Interactive Drawing Canvas
- Multi-touch support
- Drawing with mouse or touch
- Color picker (6 vibrant colors)
- Variable brush sizes (small, medium, large)
- Clear canvas functionality

### 📊 Benchmark Testing
- Automated performance tests
- Response time analytics
- Visual touch indicators
- Export-ready statistics

### 💎 Modern UI/UX
- Glassmorphism design
- Smooth animations
- Responsive layout (mobile & desktop)
- Touch-optimized controls
- Real-time toast notifications

---

**Status**: Ready to deploy! Push this code to trigger automatic deployment.
