import { Router } from 'express';
import axios from 'axios';
import db from '../db/database';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

router.get('/status', (req, res) => {
  const token = db.getAccessToken();
  res.json({ connected: !!token });
});

router.get('/slack', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    scope: 'chat:write,channels:read,groups:read',
    redirect_uri: process.env.SLACK_REDIRECT_URI!,
  });
  res.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code as string;
  try {
    const response : any = await axios.post('https://slack.com/api/oauth.v2.access', null, {
      params: {
        code,
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        redirect_uri: process.env.SLACK_REDIRECT_URI!,
      },
    });

    if (response.data.ok) {
      db.saveTokens(response.data.team.id, response.data.access_token, response.data.refresh_token);
      res.redirect(`${process.env.CORS_ORIGIN}`);
    } else {
      res.status(400).send('Slack Auth Failed');
    }
  } catch (err) {
    res.status(500).send('Slack Auth Error');
  }
});

router.post('/disconnect', (req, res) => {
  db.clearTokens();
  res.send('Slack disconnected');
});

export default router;
