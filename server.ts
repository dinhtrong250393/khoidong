import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' }
  });
  const PORT = 3000;

  // In-memory state
  let surveyData = {
    mathOnly: 0,
    literatureOnly: 0,
    both: 0
  };

  io.on('connection', (socket) => {
    // Send current state to new client
    socket.emit('survey-data', surveyData);

    // Handle vote
    socket.on('vote', (choice) => {
      if (choice === 'math') surveyData.mathOnly++;
      else if (choice === 'literature') surveyData.literatureOnly++;
      else if (choice === 'both') surveyData.both++;
      
      // Broadcast updated state to all clients
      io.emit('survey-data', surveyData);
    });

    // Handle reset
    socket.on('reset', () => {
      surveyData = { mathOnly: 0, literatureOnly: 0, both: 0 };
      io.emit('survey-data', surveyData);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
