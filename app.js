import express from 'express';
import cors from 'cors';
import vitalsRoutes from './routes/vitalsRoutes.js';

const app = express();

// Configure CORS with specific options for SSE
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Only use JSON parsing for non-SSE routes
app.use((req, res, next) => {
    if (!req.url.includes('/vitals-stream')) {
        express.json()(req, res, next);
    } else {
        next();
    }
});

// Register routes
app.use('/api', vitalsRoutes);

export default app;
