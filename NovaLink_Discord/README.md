# NovaLink Discord API Backend

A Node.js Express backend for interacting with Discord's API to send messages, manage channels, customize servers, and more.

## Features

- 📨 Send, edit, and delete Discord messages
- 📺 Create, update, and delete channels
- 🛡️ Manage server roles and permissions
- 👥 Manage server members (kick, ban, unban)
- ⚙️ Customize server settings
- 🔒 Secure environment variable configuration

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Rename `.env.example` to `.env` (or use the existing `.env` file)
2. Add your Discord Bot credentials:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
```

### 3. Getting Discord Bot Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to the "Bot" section
4. Click "Reset Token" to get your `DISCORD_BOT_TOKEN`
5. Enable required intents (Privileged Gateway Intents if needed)
6. Go to "OAuth2" section to get your `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`

### 4. Invite Bot to Your Server

Use this URL format (replace CLIENT_ID with your client ID):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot
```

### 5. Run the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Messages
- `POST /api/discord/messages/send` - Send a message
- `PATCH /api/discord/messages/:channelId/:messageId` - Edit a message
- `DELETE /api/discord/messages/:channelId/:messageId` - Delete a message

### Channels
- `POST /api/discord/channels/create` - Create a channel
- `GET /api/discord/channels/:channelId` - Get channel info
- `PATCH /api/discord/channels/:channelId` - Update channel
- `DELETE /api/discord/channels/:channelId` - Delete channel

### Guilds/Servers
- `GET /api/discord/guilds/:guildId` - Get guild info
- `PATCH /api/discord/guilds/:guildId` - Update guild
- `GET /api/discord/guilds/:guildId/channels` - Get all channels

### Roles
- `POST /api/discord/guilds/:guildId/roles` - Create role
- `PATCH /api/discord/guilds/:guildId/roles/:roleId` - Update role
- `DELETE /api/discord/guilds/:guildId/roles/:roleId` - Delete role

### Members
- `GET /api/discord/guilds/:guildId/members/:userId` - Get member info
- `PATCH /api/discord/guilds/:guildId/members/:userId` - Update member
- `DELETE /api/discord/guilds/:guildId/members/:userId` - Kick member
- `PUT /api/discord/guilds/:guildId/bans/:userId` - Ban member
- `DELETE /api/discord/guilds/:guildId/bans/:userId` - Unban member

## Example Usage

### Send a Message
```bash
curl -X POST http://localhost:3000/api/discord/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "YOUR_CHANNEL_ID",
    "content": "Hello from NovaLink!"
  }'
```

### Create a Channel
```bash
curl -X POST http://localhost:3000/api/discord/channels/create \
  -H "Content-Type: application/json" \
  -d '{
    "guildId": "YOUR_GUILD_ID",
    "name": "new-channel",
    "type": 0
  }'
```

## Project Structure

```
NovaLink_Discord/
├── config/
│   └── discord.config.js    # Discord configuration
├── controllers/
│   └── discord.controller.js # API controllers
├── routes/
│   └── discord.routes.js     # API routes
├── .env                      # Environment variables (your tokens)
├── .env.example              # Example environment variables
├── .gitignore                # Git ignore file
├── package.json              # Dependencies
├── server.js                 # Main server file
└── README.md                 # This file
```

## Security Notes

- Never commit your `.env` file to version control
- Keep your bot token secure
- Use appropriate permissions for your bot
- Validate all user inputs

## License

ISC
