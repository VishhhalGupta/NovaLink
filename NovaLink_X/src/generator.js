function generatePost({ topic = '', tone = 'professional', length = 'short' } = {}) {
  const now = new Date().toLocaleDateString();
  const base = topic ? `About ${topic}: ` : '';

  let body = '';
  if (length === 'short') {
    body = `${base}Quick thoughts on ${topic}.`;
  } else if (length === 'long') {
    body = `${base}A deeper look at ${topic} — insights, takeaways, and next steps.`;
  } else {
    body = `${base}Sharing an update on ${topic}.`;
  }

  const cta = tone === 'casual' ? 'What do you think?' : 'Comments welcome.';
  const hashtags = topic ? ` #${topic.replace(/\s+/g, '')}` : '';

  return `${body} (${now}) ${cta}${hashtags}`;
}

module.exports = { generatePost };
