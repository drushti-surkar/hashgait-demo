const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true, // Allow all origins for hackathon demo
    credentials: true
}));
app.use(express.json());

// In-memory storage for latest 5 hashes (for demo purposes)
let hashHistory = [];
const MAX_HISTORY = 5;

// Utility function to add hash to history
function addToHistory(hash, gaitData) {
    const entry = {
        hash,
        gaitData,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    
    hashHistory.unshift(entry); // Add to beginning
    
    if (hashHistory.length > MAX_HISTORY) {
        hashHistory = hashHistory.slice(0, MAX_HISTORY); // Keep only latest 5
    }
    
    return entry;
}

// Routes

// GET / - Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: "HashGait Backend Running!",
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});

// POST /hash - Generate SHA-256 hash of gait data
app.post('/hash', (req, res) => {
    try {
        const { gaitData } = req.body;
        
        // Validate input
        if (!gaitData) {
            return res.status(400).json({
                error: "Missing gaitData in request body",
                example: { gaitData: "your-gait-data-string" }
            });
        }
        
        if (typeof gaitData !== 'string') {
            return res.status(400).json({
                error: "gaitData must be a string",
                received: typeof gaitData
            });
        }
        
        // Generate SHA-256 hash
        const hash = crypto.createHash('sha256')
            .update(gaitData)
            .digest('hex');
        
        // Add to history
        const entry = addToHistory(hash, gaitData);
        
        // Return response with hash and current history
        res.json({
            success: true,
            hash: hash,
            originalData: gaitData,
            timestamp: entry.timestamp,
            historyCount: hashHistory.length,
            message: `Hash generated successfully. History contains ${hashHistory.length} entries.`
        });
        
        // Log for demo purposes
        console.log(`[${new Date().toISOString()}] Hash generated: ${hash.substring(0, 16)}... for data: "${gaitData.substring(0, 50)}${gaitData.length > 50 ? '...' : ''}"`);
        
    } catch (error) {
        console.error('Error generating hash:', error);
        res.status(500).json({
            error: "Internal server error while generating hash",
            message: error.message
        });
    }
});

// GET /history - Get latest hash history (bonus endpoint for demo)
app.get('/history', (req, res) => {
    res.json({
        success: true,
        history: hashHistory,
        count: hashHistory.length,
        maxCount: MAX_HISTORY
    });
});

// GET /stats - Get backend statistics (bonus endpoint for demo)
app.get('/stats', (req, res) => {
    res.json({
        success: true,
        stats: {
            totalHashesGenerated: hashHistory.length,
            maxHistorySize: MAX_HISTORY,
            serverUptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: "Endpoint not found",
        availableEndpoints: {
            "GET /": "Health check",
            "POST /hash": "Generate hash from gaitData",
            "GET /history": "Get latest hash history",
            "GET /stats": "Get backend statistics"
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unexpected error:', error);
    res.status(500).json({
        error: "Internal server error",
        message: "Something went wrong!"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 HashGait Backend Server running at http://localhost:${PORT}`);
    console.log(`📊 Available endpoints:`);
    console.log(`   GET  / - Health check`);
    console.log(`   POST /hash - Generate hash from gaitData`);
    console.log(`   GET  /history - Get latest hash history`);
    console.log(`   GET  /stats - Get backend statistics`);
    console.log(`💾 In-memory storage ready (max ${MAX_HISTORY} hashes)`);
});

module.exports = app;