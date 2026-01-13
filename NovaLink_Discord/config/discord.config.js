module.exports = {
  botToken: process.env.DISCORD_BOT_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  apiBase: process.env.DISCORD_API_BASE || 'https://discord.com/api/v10',
  
  // Common Discord API headers
  getHeaders: (includeAuth = true) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth && process.env.DISCORD_BOT_TOKEN) {
      headers['Authorization'] = `Bot ${process.env.DISCORD_BOT_TOKEN}`;
    }
    
    return headers;
  }
};
