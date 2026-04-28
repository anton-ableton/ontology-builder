import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/upload.routes.js';

const app = express();

app.use(cors());

app.use('/api/upload', uploadRoutes);

app.listen(8080, () => {
  console.log('Server running on port 8080');
});
