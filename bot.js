import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import {
  huntProducts,
  generateContent,
  getAstroEvents,
  createCampaign,
  getBusinessIdeas,
  analyzeCompetitors,
  weeklyBriefing
} from './ai.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN not set');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const AUTHORIZED_USERS = (process.env.AUTHORIZED_USERS || '').split(',').map(s => s.trim()).filter(Boolean);

console.log('SCOPE COMMANDER v1.0 active');

function isAuthorized(msg) {
  if (AUTHORIZED_USERS.length === 0) return true;
  return AUTHORIZED_USERS.includes(String(msg.from.id));
}

async function send(chatId, text) {
  const chunks = [];
  let current = '';
  for (const line of text.split('\n')) {
    if ((current + '\n' + line).length > 4000 && current) {
      chunks.push(current);
      current = line;
    } else {
      current = current ? current + '\n' + line : line;
    }
  }
  if (current) chunks.push(current);

  for (const chunk of chunks) {
    await bot.sendMessage(chatId, chunk, { disable_web_page_preview: true });
    if (chunks.length > 1) await new Promise(r => setTimeout(r, 500));
  }
}

async function withLoading(chatId, label, fn) {
  const loading = await bot.sendMessage(chatId, `⏳ ${label}...`);
  try {
    const result = await fn();
    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    return result;
  } catch (err) {
    await bot.editMessageText(`❌ Error: ${err.message}`, {
      chat_id: chatId,
      message_id: loading.message_id
    }).catch(() => {});
    throw err;
  }
}

bot.onText(/\/start/, (msg) => {
  if (!isAuthorized(msg)) return;

  send(msg.chat.id, `🔭 SCOPE COMMANDER — AI Business Command Center

🛒 PRODUCT DISCOVERY
  /hunt — Find viral products for your store
  /hunt [niche] — Hunt specific sub-niche

📱 CONTENT CREATION
  /content — Content for all platforms
  /content instagram [topic]
  /content tiktok [topic]
  /content facebook [topic]

🌌 ASTRONOMY INTELLIGENCE
  /astro — Upcoming events + sales triggers

📢 MARKETING
  /campaign [product] — Full 7-day campaign
  /ideas — Business growth strategies
  /ideas [focus] — Specific focus area

🔍 MARKET INTELLIGENCE
  /competitor — Full market analysis
  /weekly — Weekly strategic briefing

💡 Examples:
  /hunt astrophotography
  /content tiktok meteor shower
  /campaign Smart WiFi Telescope
  /ideas partnerships

Your chat ID: ${msg.chat.id}`);
});

bot.onText(/\/hunt(.*)/, async (msg, match) => {
  if (!isAuthorized(msg)) return;
  const niche = (match[1] || '').trim();

  try {
    const products = await withLoading(
      msg.chat.id,
      `🔍 Hunting ${niche || 'viral'} products`,
      () => huntProducts(niche)
    );

    let text = `🔭 PRODUCT HUNT RESULTS\n`;
    text += niche ? `🎯 Niche: ${niche}\n` : '';
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    products.forEach((p, i) => {
      text += `${i + 1}) ${p.name}\n`;
      text += `   💰 Cost: $${p.price.toFixed(2)} → Sell: $${parseFloat(p.suggestedRetail).toFixed(2)} (${p.margin})\n`;
      text += `   📦 ${p.orders.toLocaleString()}+ orders  ⭐ ${p.rating.toFixed(1)}\n`;
      text += `   🔥 ${p.whyViral}\n`;
      text += `   🎯 ${p.marketingAngle}\n`;
      text += `   🔗 ${p.link}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💡 /campaign [product name] for full marketing plan`;

    await send(msg.chat.id, text);
  } catch (err) {
    console.error('Hunt error:', err.message);
  }
});

bot.onText(/\/content(.*)/, async (msg, match) => {
  if (!isAuthorized(msg)) return;
  const args = (match[1] || '').trim().split(' ');
  const platform = ['instagram', 'tiktok', 'facebook'].includes(args[0]?.toLowerCase())
    ? args.shift() : '';
  const topic = args.join(' ');

  try {
    const content = await withLoading(msg.chat.id,
      `📱 Creating ${platform || 'multi-platform'} content${topic ? ` about "${topic}"` : ''}`,
      () => generateContent(platform, topic)
    );

    let text = `📱 CONTENT READY\n`;
    text += platform ? `Platform: ${platform.toUpperCase()}\n` : '';
    text += topic ? `Topic: ${topic}\n` : '';
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += content;

    await send(msg.chat.id, text);
  } catch (err) {
    console.error('Content error:', err.message);
  }
});

bot.onText(/\/astro/, async (msg) => {
  if (!isAuthorized(msg)) return;

  try {
    const events = await withLoading(msg.chat.id, '🌌 Scanning the skies', getAstroEvents);

    let text = `🌌 ASTRONOMY EVENTS & SALES OPPORTUNITIES\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += events;

    await send(msg.chat.id, text);
  } catch (err) {
    console.error('Astro error:', err.message);
  }
});

bot.onText(/\/campaign(.*)/, async (msg, match) => {
  if (!isAuthorized(msg)) return;
  const product = (match[1] || '').trim();

  try {
    const campaign = await withLoading(msg.chat.id,
      `📢 Building campaign${product ? ` for "${product}"` : ''}`,
      () => createCampaign(product)
    );

    let text = `📢 7-DAY MARKETING CAMPAIGN\n`;
    text += product ? `Product: ${product}\n` : '';
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += campaign;

    await send(msg.chat.id, text);
  } catch (err) {
    console.error('Campaign error:', err.message);
  }
});

bot.onText(/\/ideas(.*)/, async (msg, match) => {
  if (!isAuthorized(msg)) return;
  const focus = (match[1] || '').trim();

  try {
    const ideas = await withLoading(msg.chat.id,
      `💡 Brainstorming${focus ? ` on "${focus}"` : ''}`,
      () => getBusinessIdeas(focus)
    );

    let text = `💡 BUSINESS GROWTH IDEAS\n`;
    text += focus ? `Focus: ${focus}\n` : '';
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += ideas;

    await send(msg.chat.id, text);
  } catch (err) {
    console.error('Ideas error:', err.message);
  }
});

bot.onText(/\/competitor/, async (msg) => {
  if (!isAuthorized(msg)) return;

  try {
    const analysis = await withLoading(msg.chat.id, '🔍 Analyzing competitors', analyzeCompetitors);

    let text = `🔍 COMPETITIVE INTELLIGENCE\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += analysis;

    await send(msg.chat.id, text);
  } catch (err) {
    console.error('Competitor error:', err.message);
  }
});

bot.onText(/\/weekly/, async (msg) => {
  if (!isAuthorized(msg)) return;

  try {
    const briefing = await withLoading(msg.chat.id, '📊 Preparing weekly briefing', weeklyBriefing);

    let text = `📊 WEEKLY INTELLIGENCE BRIEFING\n`;
    text += `📅 ${new Date().toISOString().split('T')[0]}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += briefing;

    await send(msg.chat.id, text);
  } catch (err) {
    console.error('Weekly error:', err.message);
  }
});

bot.on('polling_error', (err) => {
  console.error('Polling error:', err.code);
});

process.on('SIGINT', () => {
  bot.stopPolling();
  process.exit(0);
});
