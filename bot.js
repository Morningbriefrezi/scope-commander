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
  businessIdeas,
  todayInSpaceHistory
} from './ai.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN not set');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

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
        { text: '📅 დღეს კოსმოსში', callback_data: 'history_today' }
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

async function send(chatId, text) {
  await bot.sendMessage(chatId, text, {
    disable_web_page_preview: true
  });
}

async function withLoading(chatId, label, fn) {
  const loading = await bot.sendMessage(chatId, `⏳ ${label}...`);
  try {
    const result = await fn();
    await bot.deleteMessage(chatId, loading.message_id);
    return result;
  } catch (err) {
    await bot.editMessageText(`❌ შეცდომა: ${err.message}`, {
      chat_id: chatId,
      message_id: loading.message_id
    });
    throw err;
  }
}

// START / MENU
bot.onText(/^\/start$|^\/menu$/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
`🔭 ასტრომანი — AI ასისტენტი

აირჩიე მიმართულება:`,
    { reply_markup: m_
