import http from 'http';
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

// Keep Render alive
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot running');
}).listen(process.env.PORT || 10000);

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true
});

// ─────────────────────────────
// MENU
// ─────────────────────────────

function mainMenu() {
  return {
    inline_keyboard: [
      [
        { text: '🔭 ტელესკოპი', callback_data: 'telescope' },
        { text: '💡 ლამპები', callback_data: 'lamps' }
      ],
      [
        { text: '🛸 ლევიტაციური', callback_data: 'levitating' },
        { text: '📚 ინფო პოსტი', callback_data: 'info' }
      ],
      [
        { text: '📅 დღეს კოსმოსში', callback_data: 'history' }
      ],
      [
        { text: '📅 დღის კამპანია', callback_data: 'daily' },
        { text: '📆 კვირის კამპანია', callback_data: 'weekly' }
      ],
      [
        { text: '🔥 ვირუსული', callback_data: 'viral' },
        { text: '🔍 კონკურენტები', callback_data: 'competitors' }
      ],
      [
        { text: '💡 იდეები', callback_data: 'ideas' }
      ]
    ]
  };
}

// ─────────────────────────────
// START
// ─────────────────────────────

bot.onText(/^\/start$|^\/menu$/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    '🔭 ასტრომანი — AI ასისტენტი\n\nაირჩიე მიმართულება:',
    { reply_markup: mainMenu() }
  );
});

// ─────────────────────────────
// CALLBACKS
// ─────────────────────────────

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const action = query.data;

  await bot.answerCallbackQuery(query.id);

  try {
    let result;

    if (action === 'telescope') {
      result = await generatePost('telescope');
    }

    if (action === 'lamps') {
      result = await generatePost('lamps');
    }

    if (action === 'levitating') {
      result = await generatePost('levitating');
    }

    if (action === 'info') {
      result = await generatePost('info');
    }

    if (action === 'history') {
      result = await todayInSpaceHistory();
    }

    if (action === 'daily') {
      result = await dailyCampaign();
    }

    if (action === 'weekly') {
      result = await weeklyCampaign();
    }

    if (action === 'viral') {
      result = await findViralProducts();
    }

    if (action === 'competitors') {
      result = await georgianCompetitorAnalysis();
    }

    if (action === 'ideas') {
      result = await businessIdeas();
    }

    if (result) {
      await bot.sendMessage(chatId, result, {
        disable_web_page_preview: true
      });
    }

  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, '❌ შეცდომა მოხდა.');
  }
});

// ─────────────────────────────
// IMAGE COMMAND
// ─────────────────────────────

bot.onText(/\/image (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const description = match[1];

  try {
    const image = await generateImage(description);

    await bot.sendPhoto(chatId, image.url, {
      caption: `🤖 ${image.source}`
    });

  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, '❌ სურათი ვერ შეიქმნა.');
  }
});

console.log('🔭 Astromani bot running');
