import db from '../db/database';
import slackService from '../services/slackServices';

interface ScheduledMessage {
    id: number;
    channel: string;
    message: string;
    scheduled_time: string;
}

export default {
    initialize() {
        this.reload();
        setInterval(() => this.reload(), 60 * 1000);
    },

    reload() {
        const messages: ScheduledMessage[] = db.getScheduledMessages();
        const now = Date.now();

        for (const msg of messages) {
            const time = new Date(msg.scheduled_time).getTime();
            if (time <= now) {
                slackService.sendMessage(msg.channel, msg.message);
                db.deleteScheduledMessage(msg.id);
            }
        }
    }
};
