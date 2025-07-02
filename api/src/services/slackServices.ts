import db from '../db/database';
import axios from 'axios';

export default {
    async sendMessage(channel: string, message: string) {
        let token = db.getAccessToken();
        const refreshToken = db.getRefreshToken();
        if (!token || !refreshToken) throw new Error('Slack not connected');

        try {
            const response:any = await axios.post('https://slack.com/api/chat.postMessage', {
                channel,
                text: message,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.ok===true) {
                return;
            }

            if (response.data.error === 'invalid_auth' || response.data.error === 'token_revoked') {

                const newToken = await this.refreshToken(refreshToken);
                if (newToken) {
                    const retry:any = await axios.post('https://slack.com/api/chat.postMessage', {
                        channel,
                        text: message,
                    }, {
                        headers: { Authorization: `Bearer ${newToken}` },
                    });

                    if (retry.data.ok) {
                        return;
                    } else {
                        throw new Error(`Failed to send message after refresh: ${retry.data.error}`);
                    }
                } else {
                    throw new Error('Token refresh failed');
                }
            } else {
                throw new Error(`Slack API error: ${response.data.error}`);
            }

        } catch (err) {
            throw err;
        }
    },

    async refreshToken(refreshToken: string): Promise<string | null> {
        try {
            const response:any = await axios.post('https://slack.com/api/oauth.v2.access', null, {
                params: {
                    client_id: process.env.SLACK_CLIENT_ID!,
                    client_secret: process.env.SLACK_CLIENT_SECRET!,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token',
                },
            });
            console.log('Refresh token response:', response.data);
            if (response.data.ok) {
                db.saveAccessToken(response.data.access_token);
                return response.data.access_token;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }
};