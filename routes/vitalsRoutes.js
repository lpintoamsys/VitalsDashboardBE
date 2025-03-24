import express from 'express';
import generateRandomVitals from '../utils/randomDataGenerator.js';

const router = express.Router();

// Endpoint for fetching vitals
router.get('/vitals', async (req, res) => {
    try {
        const vitals = await generateRandomVitals();
        res.json(vitals);
    } catch (error) {
        console.error('Error generating vitals:', error);
        res.status(500).json({ error: 'Failed to generate vitals' });
    }
});

// SSE Streaming Endpoint for continuous vitals updates
router.get('/vitals-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const sendVitals = async () => {
        try {
            const vitals = await generateRandomVitals();
            res.write(`id: ${Date.now()}\n`);
            res.write(`data: ${JSON.stringify(vitals)}\n\n`);
        } catch (error) {
            console.error('Error in SSE stream:', error);
            // Send a keepalive to prevent connection loss
            res.write(`:keepalive\n\n`);
        }
    };

    // Send initial data
    sendVitals();

    // Send updates every 30 minutes
    const interval = setInterval(sendVitals, 30 * 60 * 1000 );

    // Clean up when the client closes the connection
    req.on('close', () => {
        clearInterval(interval);
        res.end();
        console.log('SSE connection closed by client');
    });
});

export default router;