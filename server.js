import app from './app.js';
import http from 'http';

const port = process.env.PORT || 5001;
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
