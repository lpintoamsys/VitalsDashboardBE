import express from 'express';
import cors from 'cors';
import vitalsRoutes from './routes/vitalsRoutes.js';

const app = express();

// Configure CORS with specific options to allow SSE connections
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Apply JSON parsing middleware to all API routes except SSE endpoints
const jsonParsingMiddleware = express.json();
app.use('/api', (req, res, next) => {
    // Skip JSON parsing for SSE routes to avoid interfering with the stream
    if (req.path.includes('/vitals-stream')) {
        next();
    } else {
        jsonParsingMiddleware(req, res, next);
    }
});

// Register routes
app.use('/api', vitalsRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    // Determine appropriate status code (default to 500 if not specified)
    const statusCode = err.statusCode || 500;
    
    // Send standardized error response
    res.status(statusCode).json({
        error: {
            message: err.message || 'An unexpected error occurred',
            status: statusCode
        }
    });
});

export default app;
