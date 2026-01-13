const axios = require('axios');
const discordConfig = require('../config/discord.config');
const FormData = require('form-data');
const fs = require('fs');

// Helper function to make Discord API requests
const discordRequest = async (method, endpoint, data = null) => {
  try {
    const url = `${discordConfig.apiBase}${endpoint}`;
    const config = {
      method,
      url,
      headers: discordConfig.getHeaders(true),
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
      details: error.response?.data
    };
  }
};

// Message Controllers
exports.sendMessage = async (req, res) => {
  try {
    const { channelId, content, embeds, components } = req.body;

    if (!channelId || !content) {
      return res.status(400).json({ 
        error: 'channelId and content are required' 
      });
    }

    const messageData = { content };
    if (embeds) messageData.embeds = embeds;
    if (components) messageData.components = components;

    const result = await discordRequest(
      'POST',
      `/channels/${channelId}/messages`,
      messageData
    );

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully',
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
};

exports.sendMessageWithMedia = async (req, res) => {
  try {
    const { channelId, content, embeds, components } = req.body;

    if (!channelId) {
      return res.status(400).json({ 
        error: 'channelId is required' 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'At least one file is required' 
      });
    }

    const formData = new FormData();
    
    // Add message payload
    const payload = {};
    if (content) payload.content = content;
    if (embeds) payload.embeds = JSON.parse(embeds);
    if (components) payload.components = JSON.parse(components);
    
    formData.append('payload_json', JSON.stringify(payload));

    // Add files
    req.files.forEach((file, index) => {
      formData.append(`files[${index}]`, fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype
      });
    });

    // Make request with form-data
    const url = `${discordConfig.apiBase}/channels/${channelId}/messages`;
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bot ${discordConfig.botToken}`
      }
    });

    // Clean up uploaded files
    req.files.forEach(file => {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    });

    res.status(200).json({ 
      success: true, 
      message: 'Message with media sent successfully',
      data: response.data 
    });
  } catch (error) {
    // Clean up files on error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting temp file:', err);
        });
      });
    }

    res.status(error.response?.status || 500).json({ 
      error: 'Failed to send message with media',
      details: error.response?.data?.message || error.message 
    });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const { channelId, messageId } = req.params;
    const { content, embeds, components } = req.body;

    const messageData = {};
    if (content) messageData.content = content;
    if (embeds) messageData.embeds = embeds;
    if (components) messageData.components = components;

    const result = await discordRequest(
      'PATCH',
      `/channels/${channelId}/messages/${messageId}`,
      messageData
    );

    res.status(200).json({ 
      success: true, 
      message: 'Message edited successfully',
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to edit message',
      details: error.message 
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { channelId, messageId } = req.params;

    await discordRequest('DELETE', `/channels/${channelId}/messages/${messageId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Message deleted successfully' 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to delete message',
      details: error.message 
    });
  }
};

// Channel Controllers
exports.createChannel = async (req, res) => {
  try {
    const { guildId, name, type, topic, parent_id } = req.body;

    if (!guildId || !name) {
      return res.status(400).json({ 
        error: 'guildId and name are required' 
      });
    }

    const channelData = { name };
    if (type !== undefined) channelData.type = type;
    if (topic) channelData.topic = topic;
    if (parent_id) channelData.parent_id = parent_id;

    const result = await discordRequest(
      'POST',
      `/guilds/${guildId}/channels`,
      channelData
    );

    res.status(201).json({ 
      success: true, 
      message: 'Channel created successfully',
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to create channel',
      details: error.message 
    });
  }
};

exports.updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const updateData = req.body;

    const result = await discordRequest(
      'PATCH',
      `/channels/${channelId}`,
      updateData
    );

    res.status(200).json({ 
      success: true, 
      message: 'Channel updated successfully',
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to update channel',
      details: error.message 
    });
  }
};

exports.deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    await discordRequest('DELETE', `/channels/${channelId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Channel deleted successfully' 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to delete channel',
      details: error.message 
    });
  }
};

exports.getChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    const result = await discordRequest('GET', `/channels/${channelId}`);

    res.status(200).json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to get channel',
      details: error.message 
    });
  }
};

// Guild/Server Controllers
exports.getGuild = async (req, res) => {
  try {
    const { guildId } = req.params;

    const result = await discordRequest('GET', `/guilds/${guildId}`);

    res.status(200).json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to get guild',
      details: error.message 
    });
  }
};

exports.updateGuild = async (req, res) => {
  try {
    const { guildId } = req.params;
    const updateData = req.body;

    const result = await discordRequest(
      'PATCH',
      `/guilds/${guildId}`,
      updateData
    );

    res.status(200).json({ 
      success: true, 
      message: 'Guild updated successfully',
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to update guild',
      details: error.message 
    });
  }
};

exports.getGuildChannels = async (req, res) => {
  try {
    const { guildId } = req.params;

    const result = await discordRequest('GET', `/guilds/${guildId}/channels`);

    res.status(200).json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to get guild channels',
      details: error.message 
    });
  }
};

// Role Controllers
exports.createRole = async (req, res) => {
  try {
    const { guildId } = req.params;
    const roleData = req.body;

    const result = await discordRequest(
      'POST',
      `/guilds/${guildId}/roles`,
      roleData
    );

    res.status(201).json({ 
      success: true, 
      message: 'Role created successfully',
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to create role',
      details: error.message 
    });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { guildId, roleId } = req.params;
    const roleData = req.body;

    const result = await discordRequest(
      'PATCH',
      `/guilds/${guildId}/roles/${roleId}`,
      roleData
    );

    res.status(200).json({ 
      success: true, 
      message: 'Role updated successfully',
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to update role',
      details: error.message 
    });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { guildId, roleId } = req.params;

    await discordRequest('DELETE', `/guilds/${guildId}/roles/${roleId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Role deleted successfully' 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to delete role',
      details: error.message 
    });
  }
};

// Member Controllers
exports.getGuildMember = async (req, res) => {
  try {
    const { guildId, userId } = req.params;

    const result = await discordRequest('GET', `/guilds/${guildId}/members/${userId}`);

    res.status(200).json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to get guild member',
      details: error.message 
    });
  }
};

exports.updateGuildMember = async (req, res) => {
  try {
    const { guildId, userId } = req.params;
    const updateData = req.body;

    const result = await discordRequest(
      'PATCH',
      `/guilds/${guildId}/members/${userId}`,
      updateData
    );

    res.status(200).json({ 
      success: true, 
      message: 'Guild member updated successfully',
      data: result 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to update guild member',
      details: error.message 
    });
  }
};

exports.kickMember = async (req, res) => {
  try {
    const { guildId, userId } = req.params;

    await discordRequest('DELETE', `/guilds/${guildId}/members/${userId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Member kicked successfully' 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to kick member',
      details: error.message 
    });
  }
};

exports.banMember = async (req, res) => {
  try {
    const { guildId, userId } = req.params;
    const { delete_message_days } = req.body;

    const banData = {};
    if (delete_message_days !== undefined) {
      banData.delete_message_days = delete_message_days;
    }

    await discordRequest('PUT', `/guilds/${guildId}/bans/${userId}`, banData);

    res.status(200).json({ 
      success: true, 
      message: 'Member banned successfully' 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to ban member',
      details: error.message 
    });
  }
};

exports.unbanMember = async (req, res) => {
  try {
    const { guildId, userId } = req.params;

    await discordRequest('DELETE', `/guilds/${guildId}/bans/${userId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Member unbanned successfully' 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: 'Failed to unban member',
      details: error.message 
    });
  }
};
