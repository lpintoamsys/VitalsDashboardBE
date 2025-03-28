import express from 'express';
import generateRandomVitals from '../utils/randomDataGenerator.js';

const router = express.Router();

// Logger function to provide consistent error logging format
const logError = (context, error) => {
  console.error(`[ERROR] ${context}:`, error.message, '\nStack:', error.stack);
};

// Endpoint for fetching vitals
router.get('/vitals', async (req, res, next) => {
    try {
        const vitals = await generateRandomVitals();
        res.json(vitals);
    } catch (error) {
        logError('Error generating vitals', error);
        // Pass error to Express error handler middleware
        return next(error);
    }
});

/**
 * SSE Streaming Endpoint for continuous vitals updates
 * 
 * This endpoint establishes a Server-Sent Events connection that:
 * - Sends initial vitals data immediately upon connection
 * - Updates with new vitals data every 5 minutes
 * - Maintains connection with keepalive messages during errors
 * - Automatically reconnects on client-side if connection is lost (browser SSE implementation)
 * 
 * Reconnection behavior:
 * - Browsers automatically attempt to reconnect to SSE streams when connection is lost
 * - The 'id' field allows clients to track which events they've already processed
 * - If an error occurs during data generation, a keepalive is sent to maintain the connection
 */
router.get('/vitals-stream', (req, res) => {
    // Set required SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const sendVitals = async () => {
        try {
            const vitals = await generateRandomVitals();
            // The 'id' field helps clients track which events they've received
            res.write(`id: ${Date.now()}\n`);
            res.write(`data: ${JSON.stringify(vitals)}\n\n`);
        } catch (error) {
            logError('Error in SSE stream while generating vitals', error);
            // Send a keepalive to prevent connection loss during errors
            // This maintains the connection while not sending invalid data
            res.write(`:keepalive\n\n`);
        }
    };

    // Send initial data immediately when client connects
    sendVitals();

    // Send updates every 5 minutes (300,000 ms)
    const interval = setInterval(sendVitals, 5 * 60 * 1000);

    // Clean up when the client closes the connection
    req.on('close', () => {
        clearInterval(interval);
        res.end();
        console.log('[INFO] SSE connection closed by client');
    });

    // Handle unexpected errors in the SSE connection
    req.on('error', (error) => {
        logError('Unexpected error in SSE connection', error);
        clearInterval(interval);
        res.end();
    });
});

export default router;
