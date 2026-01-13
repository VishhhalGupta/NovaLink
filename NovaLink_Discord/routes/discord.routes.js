const express = require('express');
const router = express.Router();
const discordController = require('../controllers/discord.controller');
const upload = require('../middleware/upload');

// Base route - API info
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'NovaLink Discord API',
    version: '1.0.0',
    endpoints: {
      messages: {
        'POST /messages/send': 'Send a message to a channel',
        'POST /messages/send-media': 'Send a message with media/files to a channel',
        'PATCH /messages/:channelId/:messageId': 'Edit a message',
        'DELETE /messages/:channelId/:messageId': 'Delete a message'
      },
      channels: {
        'POST /channels/create': 'Create a new channel',
        'GET /channels/:channelId': 'Get channel information',
        'PATCH /channels/:channelId': 'Update a channel',
        'DELETE /channels/:channelId': 'Delete a channel'
      },
      guilds: {
        'GET /guilds/:guildId': 'Get guild information',
        'PATCH /guilds/:guildId': 'Update guild settings',
        'GET /guilds/:guildId/channels': 'Get all guild channels'
      },
      roles: {
        'POST /guilds/:guildId/roles': 'Create a role',
        'PATCH /guilds/:guildId/roles/:roleId': 'Update a role',
        'DELETE /guilds/:guildId/roles/:roleId': 'Delete a role'
      },
      members: {
        'GET /guilds/:guildId/members/:userId': 'Get member information',
        'PATCH /guilds/:guildId/members/:userId': 'Update member',
        'DELETE /guilds/:guildId/members/:userId': 'Kick member',
        'PUT /guilds/:guildId/bans/:userId': 'Ban member',
        'DELETE /guilds/:guildId/bans/:userId': 'Unban member'
      }
    }
  });
});

// Message routes
router.post('/messages/send', discordController.sendMessage);
router.post('/messages/send-media', upload.array('files', 10), discordController.sendMessageWithMedia);
router.delete('/messages/:channelId/:messageId', discordController.deleteMessage);
router.patch('/messages/:channelId/:messageId', discordController.editMessage);

// Channel routes
router.post('/channels/create', discordController.createChannel);
router.patch('/channels/:channelId', discordController.updateChannel);
router.delete('/channels/:channelId', discordController.deleteChannel);
router.get('/channels/:channelId', discordController.getChannel);

// Guild/Server routes
router.get('/guilds/:guildId', discordController.getGuild);
router.patch('/guilds/:guildId', discordController.updateGuild);
router.get('/guilds/:guildId/channels', discordController.getGuildChannels);
router.post('/guilds/:guildId/roles', discordController.createRole);
router.patch('/guilds/:guildId/roles/:roleId', discordController.updateRole);
router.delete('/guilds/:guildId/roles/:roleId', discordController.deleteRole);

// Member routes
router.get('/guilds/:guildId/members/:userId', discordController.getGuildMember);
router.patch('/guilds/:guildId/members/:userId', discordController.updateGuildMember);
router.delete('/guilds/:guildId/members/:userId', discordController.kickMember);
router.put('/guilds/:guildId/bans/:userId', discordController.banMember);
router.delete('/guilds/:guildId/bans/:userId', discordController.unbanMember);

module.exports = router;
