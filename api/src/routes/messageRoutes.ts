import { Router, Request, Response, RequestHandler } from 'express';
import db from '../db/database';
import axios from 'axios';
import scheduler from '../scheduler/scheduler';
import slackService from '../services/slackServices';

const router = Router();

router.post('/send', (async (req: Request, res: Response) => {
  const { channel, message } = req.body;

  try {
    const response:any = await slackService.sendMessage(channel, message);
    res.send('Message sent');
  } catch (err) {
    res.status(401).send('Failed to send message from send endpoint');
  }
}) as RequestHandler);

router.post('/schedule', (req: Request, res: Response) => {
  const { channel, message, scheduledTime } = req.body;
  db.saveScheduledMessage(channel, message, scheduledTime);
  scheduler.reload();
  res.send('Message scheduled');
});

router.get('/scheduled', (req: Request, res: Response) => {
  const messages = db.getScheduledMessages();
  res.json(messages);
});

router.delete('/scheduled/:id', (req: Request, res: Response) => {
  db.deleteScheduledMessage(Number(req.params.id));
  scheduler.reload();
  res.send('Message cancelled');
});

router.get('/channels', (async (req: Request, res: Response) => {
  const token = db.getAccessToken();
  if (!token) return res.status(400).send('Slack not connected');

  try {
    const response:any = await axios.get('https://slack.com/api/conversations.list', {
      headers: { Authorization: `Bearer ${token}` },
      params: { types: 'public_channel,private_channel' }
    });
    if (response.data.ok) {
      res.json(response.data.channels);
    } else {
      res.status(400).send('Failed to fetch channels');
    }
  } catch (err) {
    console.error('Error fetching channels:', err);
    res.status(500).send('Internal server error');
  }
}) as RequestHandler);

export default router;


