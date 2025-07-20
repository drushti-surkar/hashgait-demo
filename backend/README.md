# HashGait Backend

A Node.js + Express backend for the HashGait behavioral authentication demo.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn

### Installation
```bash
npm install
# or
yarn install
```

### Run the Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will start at `http://localhost:3000`

## 📚 API Endpoints

### GET /
Health check endpoint
```bash
curl http://localhost:3000/
```
**Response:**
```json
{
  "message": "HashGait Backend Running!",
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:45.123Z",
  "version": "1.0.0"
}
```

### POST /hash
Generate SHA-256 hash from gait data
```bash
curl -X POST http://localhost:3000/hash \
  -H "Content-Type: application/json" \
  -d '{"gaitData": "user-behavioral-pattern-data"}'
```
**Response:**
```json
{
  "success": true,
  "hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  "originalData": "user-behavioral-pattern-data",
  "timestamp": "2024-01-20T10:30:45.123Z",
  "historyCount": 1,
  "message": "Hash generated successfully. History contains 1 entries."
}
```

### GET /history
Get latest hash history (max 5 entries)
```bash
curl http://localhost:3000/history
```

### GET /stats
Get backend statistics
```bash
curl http://localhost:3000/stats
```

## 🏗️ Architecture

### Features
- ✅ **CORS Support** - Configured for frontend integration
- ✅ **SHA-256 Hashing** - Secure hash generation from gait data
- ✅ **In-Memory Storage** - Stores latest 5 hashes for demo
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Input Validation** - Validates gait data input
- ✅ **Logging** - Request logging for debugging

### Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **CORS:** cors middleware
- **Hashing:** Node.js crypto module

## 🧪 Testing

### Test Health Check
```bash
curl http://localhost:3000/
```

### Test Hash Generation
```bash
# Test valid request
curl -X POST http://localhost:3000/hash \
  -H "Content-Type: application/json" \
  -d '{"gaitData": "sample-gait-pattern-123"}'

# Test multiple requests to see history
curl -X POST http://localhost:3000/hash \
  -H "Content-Type: application/json" \
  -d '{"gaitData": "another-pattern-456"}'

# Check history
curl http://localhost:3000/history
```

### Test Error Handling
```bash
# Missing gaitData
curl -X POST http://localhost:3000/hash \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid data type
curl -X POST http://localhost:3000/hash \
  -H "Content-Type: application/json" \
  -d '{"gaitData": 123}'
```

## 📁 Project Structure
```
backend/
├── server.js          # Main Express application
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)

### CORS Configuration
- Currently allows all origins for demo purposes
- Modify `cors()` options in `server.js` for production

## 🚀 Deployment

This backend is ready for deployment on platforms like:
- Heroku
- Vercel
- Railway
- AWS EC2
- Digital Ocean

For production, consider:
1. Using a real database instead of in-memory storage
2. Adding authentication/authorization
3. Implementing rate limiting
4. Adding request logging middleware
5. Setting up monitoring and health checks

## 🔗 Integration

The backend is designed to work with the HashGait React Native frontend. The frontend should make requests to:
- `POST /hash` for generating hashes from behavioral data
- `GET /history` for displaying recent hash history

## 📝 Notes

- Hash history is stored in memory and will reset when server restarts
- Maximum 5 hashes are kept in history for demo purposes
- All endpoints return JSON responses
- Error responses include helpful debugging information