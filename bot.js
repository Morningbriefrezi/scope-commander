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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Smart Send (no forced big headers anymore)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function send(chatId, text) {
  await bot.sendMessage(chatId, text, {
    disable_web_page_preview: true
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Loading
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function withLoading(chatId, label, fn) {
  const l = await bot.sendMessage(chatId, `⏳ ${label}...`);
  try {
    const res = await fn();
    await bot.deleteMessage(chatId, l.message_id).catch(() => {});
    return res;
  } catch (err) {
    await bot.editMessageText(`❌ შეცდომა: ${err.message}`, {
      chat_id: chatId,
      message_id: l.message_id
    }).catch(() => {});
    throw err;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MENU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function mainMenu() {
  return {
    inline_keyboard: [
      [
        { text: '🔭 ტელესკოპი', callback_data: 'post_telescope' },
        { text: '💡 ლამპები', callback_data: 'post_lamps' }
      ],
      [
        { text: '🛸 ლევიტაციური', callback_data: 'post_levitating' },
        { text: '📚 ინფო პოსტი', callback_data: 'post_info' }
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
  };
}

bot.onText(/\/start|\/menu/, (msg) => {
  if (!ok(msg)) return;

  bot.sendMessage(msg.chat.id,
`🔭 ასტრომანი — AI ასისტენტი

აირჩიე მიმართულება:`, {
    reply_markup: mainMenu()
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CALLBACK HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);
  if (!ok(query)) return;

  try {
    switch (data) {

      case 'post_telescope': {
        const text = await withLoading(chatId, 'ტელესკოპის პოსტი', () => generatePost('telescope'));
        await send(chatId, text);
        break;
      }

      case 'post_lamps': {
        const text = await withLoading(chatId, 'ლამპების პოსტი', () => generatePost('lamps'));
        await send(chatId, text);
        break;
      }

      case 'post_levitating': {
        const text = await withLoading(chatId, 'ლევიტაციური პოსტი', () => generatePost('levitating'));
        await send(chatId, text);
        break;
      }

      case 'post_info': {
        const text = await withLoading(chatId, 'ინფო პოსტი', () => generatePost('info'));
        await send(chatId, text);
        break;
      }

      case 'campaign_daily': {
        const text = await withLoading(chatId, 'დღის კამპანია', () => dailyCampaign());
        await send(chatId, text);
        break;
      }

      case 'campaign_weekly': {
        const text = await withLoading(chatId, 'კვირის კამპანია', () => weeklyCampaign());
        await send(chatId, text);
        break;
      }

      case 'image_gen': {
        await send(chatId, `🎨 დაწერე: /image შენი აღწერა`);
        break;
      }

      case 'viral': {
        const text = await withLoading(chatId, 'ბაზრის ანალიზი', () => findViralProducts());
        await send(chatId, text);
        break;
      }

      case 'competitors': {
        const text = await withLoading(chatId, 'კონკურენტები', () => georgianCompetitorAnalysis());
        await send(chatId, text);
        break;
      }

      case 'ideas': {
        const text = await withLoading(chatId, 'იდეები', () => businessIdeas());
        await send(chatId, text);
        break;
      }
    }

    setTimeout(() => {
      bot.sendMessage(chatId, '↩️ კიდევ რამე?', {
        reply_markup: mainMenu()
      });
    }, 800);

  } catch (err) {
    console.error(err.message);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMANDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bot.onText(/\/telescope/, async (msg) => {
  if (!ok(msg)) return;
  const text = await withLoading(msg.chat.id, 'ტელესკოპი', () => generatePost('telescope'));
  send(msg.chat.id, text);
});

bot.onText(/\/lamps/, async (msg) => {
  if (!ok(msg)) return;
  const text = await withLoading(msg.chat.id, 'ლამპები', () => generatePost('lamps'));
  send(msg.chat.id, text);
});

bot.onText(/\/levitating/, async (msg) => {
  if (!ok(msg)) return;
  const text = await withLoading(msg.chat.id, 'ლევიტაციური', () => generatePost('levitating'));
  send(msg.chat.id, text);
});

bot.onText(/\/info/, async (msg) => {
  if (!ok(msg)) return;
  const text = await withLoading(msg.chat.id, 'ინფო პოსტი', () => generatePost('info'));
  send(msg.chat.id, text);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bot.onText(/\/image(.+)/, async (msg, match) => {
  if (!ok(msg)) return;
  const description = (match[1] || '').trim();
  if (!description) return send(msg.chat.id, 'მიუთითე აღწერა');

  const result = await withLoading(msg.chat.id, 'სურათი იქმნება', () => generateImage(description));

  await bot.sendPhoto(msg.chat.id, result.url, {
    caption: `🤖 ${result.source}`
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bot.on('polling_error', (err) => console.error(err.code));
process.on('SIGINT', () => { bot.stopPolling(); process.exit(0); });

console.log('🔭 ასტრომანი Bot active');
