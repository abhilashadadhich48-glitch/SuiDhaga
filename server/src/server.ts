import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import tailorRoutes from './routes/tailorRoutes';
import orderRoutes from './routes/orderRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import adminRoutes from './routes/adminRoutes';
import categoryRoutes from './routes/categoryRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

// Connect to database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure static uploads directory exists and serve it
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Mounting application endpoints
app.use('/api/auth', authRoutes);
app.use('/api/tailors', tailorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('SuiDhaga API running successfully...');
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ message: err.message || 'An internal server error occurred.' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
export default app;
