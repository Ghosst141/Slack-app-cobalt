import Database from 'better-sqlite3';
const db = new Database('data.db');

interface TokenRow {
    access_token: string;
    refresh_token: string;
}

interface ScheduledMessage {
    id: number;
    channel: string;
    message: string;
    scheduled_time: string;
}

export default {
    initialize() {
        db.exec(`
      CREATE TABLE IF NOT EXISTS tokens (workspace_id TEXT PRIMARY KEY, access_token TEXT, refresh_token TEXT);
      CREATE TABLE IF NOT EXISTS scheduled_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel TEXT,
        message TEXT,
        scheduled_time TEXT
      );
    `);
    },

    saveTokens(workspaceId: string, accessToken: string, refreshToken: string) {
        db.prepare('INSERT OR REPLACE INTO tokens VALUES (?, ?, ?)').run(workspaceId, accessToken, refreshToken);
    },

    getAccessToken(): string | undefined {
        const row = db.prepare('SELECT access_token FROM tokens LIMIT 1').get() as TokenRow | undefined;
        return row?.access_token;
    },

    getRefreshToken(): string | undefined {
        const row = db.prepare('SELECT refresh_token FROM tokens LIMIT 1').get() as TokenRow | undefined;
        return row?.refresh_token;
    },

    saveAccessToken(accessToken: string) {
        db.prepare('UPDATE tokens SET access_token = ?').run(accessToken);
    },

    saveScheduledMessage(channel: string, message: string, time: string) {
        db.prepare('INSERT INTO scheduled_messages (channel, message, scheduled_time) VALUES (?, ?, ?)')
            .run(channel, message, time);
    },

    getScheduledMessages(): ScheduledMessage[] {
        return db.prepare('SELECT * FROM scheduled_messages').all() as ScheduledMessage[];
    },

    deleteScheduledMessage(id: number) {
        db.prepare('DELETE FROM scheduled_messages WHERE id = ?').run(id);
    },

    clearTokens() {
        db.prepare('DELETE FROM tokens').run();
    },
};
