import express,{Request,Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import messageRoutes from './routes/messageRoutes';
import scheduler from './scheduler/scheduler';
import db from './db/database';
import Database from 'better-sqlite3';
const dbs = new Database('data.db');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.get('/hi', (req:Request, res:Response) => {
  res.json({ message: 'Hello from the backend!' });
})

// app.get('/delaccess', (req:Request, res:Response) => {
//   dbs.prepare(`update tokens 
//     set access_token = 'dadsadasaca'
//     `).run();
//   res.json({ message: 'Hello from the aceess change!' });
// })

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);


app.get('/trigger-scheduler', (req: Request, res: Response) => {
  scheduler.reload();
  res.send('Scheduler triggered');
});



db.initialize();
scheduler.initialize();

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));