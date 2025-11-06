# TouchBench v0 - Testing Guide

This document describes how to test all features of TouchBench v0.

## Prerequisites

Make sure both servers are running:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Backend API Tests

### 1. Test Single Episode Generation

```bash
curl http://localhost:8000/api/generate_tactile | python3 -m json.tool
```

**Expected output:**
```json
{
  "episode_id": "touch_xxxxxxxx",
  "object": "ceramic_mug",
  "material": "ceramic",
  "pressure_map": [[...], ...],
  "timestamp": "2025-11-06T...",
  "grasp_success": true,
  "mean_pressure": 0.542,
  "max_pressure": 0.875,
  "variance": 0.042
}
```

### 2. Test Time Series Generation

```bash
curl "http://localhost:8000/api/generate_timeseries?frames=10" | python3 -m json.tool
```

**Expected:** Array of 10 TactileEpisode objects

### 3. Test Batch Generation

```bash
curl "http://localhost:8000/api/generate_batch?n=20" | python3 -m json.tool
```

**Expected:** Array of 20 TactileEpisode objects

### 4. Test Interactive API Docs

Visit: http://localhost:8000/docs

**Expected:** Swagger UI with all endpoints documented

## Frontend Tests

### 1. Generate Single Episode

1. Open http://localhost:3000
2. Click "Generate Episode" button
3. Verify:
   - ✓ Pressure heatmap appears (5×5 grid)
   - ✓ Object and material are displayed
   - ✓ Success/failure badge shows
   - ✓ Statistics panel shows mean, max, and variance
   - ✓ JSON viewer can be expanded
   - ✓ Download buttons work (JSON and CSV)

### 2. Generate Time Series

1. Click "Generate Time Series" button
2. Verify:
   - ✓ 10 frames are generated
   - ✓ Play/Pause button appears
   - ✓ Frame slider works
   - ✓ Animation plays automatically when clicking Play
   - ✓ Pressure map changes between frames
   - ✓ Statistics update with each frame

### 3. Generate Batch

1. Click "Generate Batch (20)" button
2. Verify:
   - ✓ Summary cards show statistics
   - ✓ Success rate is calculated
   - ✓ Material distribution chart appears
   - ✓ Pressure vs Variance scatter plot shows (green = success, red = failure)
   - ✓ Episode table lists all 20 episodes
   - ✓ Export CSV button downloads batch data

### 4. Download Functionality

**JSON Download:**
1. Generate an episode
2. Click "JSON" download button
3. Verify: File downloads with name `touch_xxxxxxxx.json`

**CSV Download:**
1. Generate an episode
2. Click "CSV" download button
3. Verify: File downloads with flattened pressure data

**Batch CSV Download:**
1. Generate batch
2. Click "Export CSV" in summary card
3. Verify: File downloads with all episodes

### 5. Responsive Design

Test on different screen sizes:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

Verify layout adapts appropriately.

## Data Validation Tests

### 1. Pressure Map Validation

```bash
curl -s http://localhost:8000/api/generate_tactile | \
python3 -c "
import sys, json
data = json.load(sys.stdin)
pm = data['pressure_map']
assert len(pm) == 5, 'Should have 5 rows'
assert all(len(row) == 5 for row in pm), 'Each row should have 5 values'
assert all(0 <= val <= 1 for row in pm for val in row), 'Values should be 0-1'
print('✓ Pressure map validation passed')
"
```

### 2. Statistics Validation

```bash
curl -s http://localhost:8000/api/generate_tactile | \
python3 -c "
import sys, json
data = json.load(sys.stdin)
assert 0 <= data['mean_pressure'] <= 1, 'Mean should be 0-1'
assert 0 <= data['max_pressure'] <= 1, 'Max should be 0-1'
assert data['variance'] >= 0, 'Variance should be non-negative'
print('✓ Statistics validation passed')
"
```

### 3. Material Consistency

```bash
curl -s http://localhost:8000/api/generate_tactile | \
python3 -c "
import sys, json
data = json.load(sys.stdin)
materials = ['ceramic', 'glass', 'aluminum', 'plastic', 'wood', 'rubber', 
             'cardboard', 'foam', 'steel', 'clay', 'silicon', 'leather', 
             'fabric', 'paper', 'stone']
assert data['material'] in materials, f'Unknown material: {data[\"material\"]}'
print(f'✓ Material validation passed: {data[\"material\"]}')
"
```

## Performance Tests

### 1. Generation Speed

```bash
time curl -s http://localhost:8000/api/generate_tactile > /dev/null
```

**Expected:** < 100ms

### 2. Batch Generation Speed

```bash
time curl -s "http://localhost:8000/api/generate_batch?n=100" > /dev/null
```

**Expected:** < 2 seconds

### 3. Time Series Generation Speed

```bash
time curl -s "http://localhost:8000/api/generate_timeseries?frames=50" > /dev/null
```

**Expected:** < 1 second

## Integration Tests

### 1. Full Stack Test

```bash
# Start both servers
./start.sh

# Wait for startup
sleep 15

# Test backend
curl -s http://localhost:8000/api/generate_tactile > /tmp/test_episode.json

# Test frontend can fetch from backend
curl -s http://localhost:3000 | grep "TouchBench v0"

echo "✓ Full stack test passed"
```

### 2. CORS Test

```bash
# Verify CORS headers allow frontend to call backend
curl -s -I http://localhost:8000/api/generate_tactile | grep "access-control-allow-origin"
```

**Expected:** Header present allowing CORS

## Regression Tests

Run these after making changes:

```bash
# Test all endpoints still work
curl -s http://localhost:8000/api/generate_tactile > /dev/null && echo "✓ Single"
curl -s "http://localhost:8000/api/generate_timeseries?frames=5" > /dev/null && echo "✓ Series"
curl -s "http://localhost:8000/api/generate_batch?n=10" > /dev/null && echo "✓ Batch"

# Test frontend builds
cd frontend && npm run build
```

## Known Issues / Edge Cases

1. **Very large batch sizes** (n > 100) are rate-limited by the API
2. **Time series with > 50 frames** may take longer to generate
3. **Slow networks** may cause frontend to timeout (10s timeout)

## Test Coverage Summary

- ✅ Backend API endpoints (3/3)
- ✅ Data generation algorithms
- ✅ Frontend visualization components
- ✅ Time series animation
- ✅ Batch analysis charts
- ✅ Download functionality (JSON/CSV)
- ✅ Responsive design
- ✅ CORS configuration
- ✅ Error handling
- ✅ Data validation

## Automated Testing (Future)

For production, consider adding:
- Unit tests (pytest for backend, Jest for frontend)
- E2E tests (Playwright/Cypress)
- Load testing (Locust/k6)
- Visual regression tests (Percy/Chromatic)
