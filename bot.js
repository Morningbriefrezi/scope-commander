import http from 'http';
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('🔭 ასტრომანი Bot is running');
}).listen(process.env.PORT || 10000);

import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import {
  generatePost,
  dailyCampaign,
  weeklyCampaign,
  generateImage,
  findViralProducts,
  georgianCompetitorAnalysis,
  businessIdeas
} from './ai.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) { console.error('TELEGRAM_BOT_TOKEN not set'); process.exit(1); }

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const AUTH = (process.env.AUTHORIZED_USERS || '').split(',').map(s => s.trim()).filter(Boolean);

function ok(msg) {
  if (AUTH.length === 0) return true;
  return AUTH.includes(String(msg.from?.id || msg.chat?.id));
}

// --- Send long text split at 4000 chars ---
async function send(chatId, text) {
  const chunks = [];
  let cur = '';
  for (const line of text.split('\n')) {
    if ((cur + '\n' + line).length > 4000 && cur) { chunks.push(cur); cur = line; }
    else { cur = cur ? cur + '\n' + line : line; }
  }
  if (cur) chunks.push(cur);
  for (const c of chunks) {
    await bot.sendMessage(chatId, c, { disable_web_page_preview: true });
    if (chunks.length > 1) await new Promise(r => setTimeout(r, 500));
  }
}

// --- Loading indicator ---
async function withLoading(chatId, label, fn) {
  const l = await bot.sendMessage(chatId, `⏳ ${label}...`);
  try {
    const res = await fn();
    await bot.deleteMessage(chatId, l.message_id).catch(() => {});
    return res;
  } catch (err) {
    await bot.editMessageText(`❌ შეცდომა: ${err.message}`, {
      chat_id: chatId, message_id: l.message_id
    }).catch(() => {});
    throw err;
  }
}

// ═══════════════════════════════════════
// /start — Main Menu with Inline Keyboard
// ═══════════════════════════════════════

bot.onText(/\/start/, (msg) => {
  if (!ok(msg)) return;

  bot.sendMessage(msg.chat.id,
    `🔭 *ასტრომანი — AI ბიზნეს ასისტენტი*

გამარჯობა! აირჩიე რა გინდა:`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔭 ტელესკოპი', callback_data: 'post_telescope' },
          { text: '💡 ლამპები', callback_data: 'post_lamps' }
        ],
        [
          { text: '🛸 ლევიტაციური', callback_data: 'post_levitating' },
          { text: '🧸 სათამაშოები', callback_data: 'post_toys' }
        ],
        [
          { text: '📅 დღის კამპანია', callback_data: 'campaign_daily' },
          { text: '📆 კვირის კამპანია', callback_data: 'campaign_weekly' }
        ],
        [
          { text: '🎨 სურათის გენერაცია', callback_data: 'image_gen' },
          { text: '🔥 ვირუსული პროდუქტები', callback_data: 'viral' }
        ],
        [
          { text: '🔍 კონკურენტები', callback_data: 'competitors' },
          { text: '💡 იდეები', callback_data: 'ideas' }
        ],
        [
          { text: '📋 ყველა ბრძანება', callback_data: 'help' }
        ]
      ]
    }
  });
});

// ═══════════════════════════════════════
// Callback Handler (Inline Buttons)
// ═══════════════════════════════════════

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  if (!ok(query)) return;

  try {
    switch (data) {
      case 'post_telescope': {
        const text = await withLoading(chatId, '🔭 ტელესკოპის პოსტი იქმნება', () => generatePost('telescope'));
        await send(chatId, `🔭 *ტელესკოპის პოსტი*\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
        break;
      }
      case 'post_lamps': {
        const text = await withLoading(chatId, '💡 ლამპების პოსტი იქმნება', () => generatePost('lamps'));
        await send(chatId, `💡 *ლამპების პოსტი*\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
        break;
      }
      case 'post_levitating': {
        const text = await withLoading(chatId, '🛸 ლევიტაციური ლამპების პოსტი იქმნება', () => generatePost('levitating'));
        await send(chatId, `🛸 *ლევიტაციური ლამპების პოსტი*\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
        break;
      }
      case 'post_toys': {
        const text = await withLoading(chatId, '🧸 სათამაშოების პოსტი იქმნება', () => generatePost('toys'));
        await send(chatId, `🧸 *საბავშვო სათამაშოების პოსტი*\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
        break;
      }
      case 'campaign_daily': {
        const text = await withLoading(chatId, '📅 დღის კამპანია იქმნება', () => dailyCampaign());
        await send(chatId, `📅 *დღის მარკეტინგული კამპანია*\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
        break;
      }
      case 'campaign_weekly': {
        const text = await withLoading(chatId, '📆 კვირის კამპანია იქმნება', () => weeklyCampaign());
        await send(chatId, `📆 *კვირის მარკეტინგული კამპანია*\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
        break;
      }
      case 'image_gen': {
        await bot.sendMessage(chatId, `🎨 აღწერე რა სურათი გინდა.\n\nმაგალითები:\n• /image telescope on mountain under stars\n• /image levitating moon lamp in dark room\n• /image kid looking through telescope at moon\n• /image cozy room with galaxy projector\n\nსურათი დაგენერირდება DALL-E 3-ით.`);
        break;
      }
      case 'viral': {
        const text = await withLoading(chatId, '🔥 ქართული ბაზრის ანალიზი', () => findViralProducts());
        await send(chatId, `🔥 *ვირუსული პროდუქტები — ქართული ბაზარი*\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
        break;
      }
      case 'competitors': {
        const text = await withLoading(chatId, '🔍 კონკურენტების ანალიზი', () => georgianCompetitorAnalysis());
        await send(chatId, `🔍 *კონკურენტული ანალიზი*\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
        break;
      }
      case 'ideas': {
        const text = await withLoading(chatId, '💡 ბიზნეს იდეები იქმნება', () => businessIdeas());
        await send(chatId, `💡 *ბიზნეს იდეები*\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
        break;
      }
      case 'help': {
        await send(chatId, HELP_TEXT);
        break;
      }
    }

    // Show menu again after response
    if (data !== 'help' && data !== 'image_gen') {
      setTimeout(() => {
        bot.sendMessage(chatId, '↩️ კიდევ რამე?', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔭 ტელესკოპი', callback_data: 'post_telescope' },
                { text: '💡 ლამპები', callback_data: 'post_lamps' }
              ],
              [
                { text: '🛸 ლევიტაციური', callback_data: 'post_levitating' },
                { text: '🧸 სათამაშოები', callback_data: 'post_toys' }
              ],
              [
                { text: '📅 დღის კამპანია', callback_data: 'campaign_daily' },
                { text: '📆 კვირის კამპანია', callback_data: 'campaign_weekly' }
              ],
              [
                { text: '🎨 სურათი', callback_data: 'image_gen' },
                { text: '🔥 ვირუსული', callback_data: 'viral' }
              ],
              [
                { text: '🔍 კონკურენტები', callback_data: 'competitors' },
                { text: '💡 იდეები', callback_data: 'ideas' }
              ]
            ]
          }
        });
      }, 1000);
    }
  } catch (err) {
    console.error(`Callback error [${data}]:`, err.message);
  }
});

// ═══════════════════════════════════════
// /telescope, /lamps, /levitating, /toys
// ═══════════════════════════════════════

bot.onText(/\/telescope(.*)/, async (msg, match) => {
  if (!ok(msg)) return;
  try {
    const text = await withLoading(msg.chat.id, '🔭 ტელესკოპის პოსტი', () => generatePost('telescope'));
    await send(msg.chat.id, `🔭 ტელესკოპის პოსტი\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
  } catch (err) { console.error(err.message); }
});

bot.onText(/\/lamps(.*)/, async (msg) => {
  if (!ok(msg)) return;
  try {
    const text = await withLoading(msg.chat.id, '💡 ლამპების პოსტი', () => generatePost('lamps'));
    await send(msg.chat.id, `💡 ლამპების პოსტი\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
  } catch (err) { console.error(err.message); }
});

bot.onText(/\/levitating(.*)/, async (msg) => {
  if (!ok(msg)) return;
  try {
    const text = await withLoading(msg.chat.id, '🛸 ლევიტაციური ლამპა', () => generatePost('levitating'));
    await send(msg.chat.id, `🛸 ლევიტაციური ლამპების პოსტი\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
  } catch (err) { console.error(err.message); }
});

bot.onText(/\/toys(.*)/, async (msg) => {
  if (!ok(msg)) return;
  try {
    const text = await withLoading(msg.chat.id, '🧸 სათამაშოების პოსტი', () => generatePost('toys'));
    await send(msg.chat.id, `🧸 სათამაშოების პოსტი\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
  } catch (err) { console.error(err.message); }
});

// ═══════════════════════════════════════
// /daily, /weekly — Campaigns
// ═══════════════════════════════════════

bot.onText(/\/daily(.*)/, async (msg, match) => {
  if (!ok(msg)) return;
  const focus = (match[1] || '').trim();
  try {
    const text = await withLoading(msg.chat.id, '📅 დღის კამპანია', () => dailyCampaign(focus));
    await send(msg.chat.id, `📅 დღის მარკეტინგული კამპანია\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
  } catch (err) { console.error(err.message); }
});

bot.onText(/\/weekly(.*)/, async (msg, match) => {
  if (!ok(msg)) return;
  const focus = (match[1] || '').trim();
  try {
    const text = await withLoading(msg.chat.id, '📆 კვირის კამპანია', () => weeklyCampaign(focus));
    await send(msg.chat.id, `📆 კვირის მარკეტინგული კამპანია\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
  } catch (err) { console.error(err.message); }
});

// ═══════════════════════════════════════
// /image — Image Generation
// ═══════════════════════════════════════

bot.onText(/\/image(.+)/, async (msg, match) => {
  if (!ok(msg)) return;
  const description = (match[1] || '').trim();
  if (!description) {
    return bot.sendMessage(msg.chat.id, '🎨 აღწერე რა სურათი გინდა.\nმაგ: /image telescope under starry sky');
  }

  try {
    const result = await withLoading(msg.chat.id, '🎨 სურათი იქმნება', () => generateImage(description));

    await bot.sendPhoto(msg.chat.id, result.url, {
      caption: `🎨 ${SHOP_NAME}\n📝 ${description}\n🤖 ${result.source}`
    });
  } catch (err) {
    await bot.sendMessage(msg.chat.id, `❌ სურათის გენერაცია ვერ მოხერხდა: ${err.message}`);
  }
});

const SHOP_NAME = 'ასტრომანი';

// ═══════════════════════════════════════
// /viral — Georgian Market Products
// ═══════════════════════════════════════

bot.onText(/\/viral/, async (msg) => {
  if (!ok(msg)) return;
  try {
    const text = await withLoading(msg.chat.id, '🔥 ქართული ბაზრის სკანირება', () => findViralProducts());
    await send(msg.chat.id, `🔥 ვირუსული პროდუქტები — ქართული ბაზარი\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
  } catch (err) { console.error(err.message); }
});

// ═══════════════════════════════════════
// /competitors — Georgian Competition
// ═══════════════════════════════════════

bot.onText(/\/competitors/, async (msg) => {
  if (!ok(msg)) return;
  try {
    const text = await withLoading(msg.chat.id, '🔍 კონკურენტული ანალიზი', () => georgianCompetitorAnalysis());
    await send(msg.chat.id, `🔍 კონკურენტული ანალიზი\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
  } catch (err) { console.error(err.message); }
});

// ═══════════════════════════════════════
// /ideas — Business Growth Ideas
// ═══════════════════════════════════════

bot.onText(/\/ideas(.*)/, async (msg, match) => {
  if (!ok(msg)) return;
  const focus = (match[1] || '').trim();
  try {
    const text = await withLoading(msg.chat.id, '💡 იდეების გენერაცია', () => businessIdeas(focus));
    await send(msg.chat.id, `💡 ბიზნეს იდეები\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`);
  } catch (err) { console.error(err.message); }
});

// ═══════════════════════════════════════
// /help — Full command list
// ═══════════════════════════════════════

const HELP_TEXT = `🔭 *ასტრომანი — ბრძანებების სია*

📱 *კონტენტის შექმნა:*
  /telescope — ტელესკოპის პოსტი
  /lamps — ლამპების პოსტი
  /levitating — ლევიტაციური ლამპების პოსტი
  /toys — საბავშვო სათამაშოების პოსტი

📢 *მარკეტინგი:*
  /daily — დღის მარკეტინგული კამპანია
  /daily [თემა] — კონკრეტული თემით
  /weekly — კვირის მარკეტინგული კამპანია
  /weekly [თემა] — კონკრეტული თემით

🎨 *სურათის გენერაცია:*
  /image [აღწერა] — DALL-E სურათი
  მაგ: /image telescope on mountain

🔥 *ბაზრის ანალიზი:*
  /viral — ვირუსული პროდუქტები ქართულ ბაზარზე
  /competitors — კონკურენტების ანალიზი

💡 *სტრატეგია:*
  /ideas — ბიზნეს იდეები
  /ideas [ფოკუსი] — კონკრეტული მიმართულებით

ℹ️ *ყოველი ბრძანება სხვადასხვა შედეგს იძლევა!*
🇬🇪 *ყველაფერი ქართულად*`;

bot.onText(/\/help/, (msg) => {
  if (!ok(msg)) return;
  send(msg.chat.id, HELP_TEXT);
});

// --- Menu button shortcut ---
bot.onText(/\/menu/, (msg) => {
  if (!ok(msg)) return;
  bot.sendMessage(msg.chat.id, '🔭 აირჩიე:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔭 ტელესკოპი', callback_data: 'post_telescope' },
          { text: '💡 ლამპები', callback_data: 'post_lamps' }
        ],
        [
          { text: '🛸 ლევიტაციური', callback_data: 'post_levitating' },
          { text: '🧸 სათამაშოები', callback_data: 'post_toys' }
        ],
        [
          { text: '📅 დღის კამპანია', callback_data: 'campaign_daily' },
          { text: '📆 კვირის კამპანია', callback_data: 'campaign_weekly' }
        ],
        [
          { text: '🎨 სურათი', callback_data: 'image_gen' },
          { text: '🔥 ვირუსული', callback_data: 'viral' }
        ],
        [
          { text: '🔍 კონკურენტები', callback_data: 'competitors' },
          { text: '💡 იდეები', callback_data: 'ideas' }
        ]
      ]
    }
  });
});

// --- Error handling ---
bot.on('polling_error', (err) => console.error('Poll:', err.code));
process.on('SIGINT', () => { bot.stopPolling(); process.exit(0); });

console.log('🔭 ასტრომანი Bot v2.0 active');
