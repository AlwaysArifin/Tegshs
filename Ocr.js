const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const FormData = require('form-data');

// Token Bot Telegram & OCR.Space API Key
const TOKEN = 'ISI_TOKEN_TELEGRAM_MU';
const OCR_API_KEY = 'ISI_API_KEY_OCR_SPACE_MU'; // daftar gratis di https://ocr.space/OCRAPI

// Inisialisasi bot
const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;

    // Ambil foto kualitas tertinggi
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;

    bot.sendMessage(chatId, '🔍 Sedang memproses gambar...');

    try {
        // Kirim gambar ke OCR.Space API
        const formData = new FormData();
        formData.append('url', fileUrl);
        formData.append('language', 'eng'); // ganti ke 'ind' untuk bahasa Indonesia
        formData.append('apikey', OCR_API_KEY);

        const response = await axios.post('https://api.ocr.space/parse/image', formData, {
            headers: formData.getHeaders()
        });

        const parsedText = response.data.ParsedResults?.[0]?.ParsedText;

        if (parsedText && parsedText.trim()) {
            bot.sendMessage(chatId, `📝 Hasil PCR/OCR:\n\n${parsedText}`);
        } else {
            bot.sendMessage(chatId, '❌ Tidak ada teks yang terbaca.');
        }
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, '⚠️ Terjadi kesalahan saat memproses gambar.');
    }
});

bot.on('message', (msg) => {
    if (!msg.photo) {
        bot.sendMessage(msg.chat.id, '📸 Kirim gambar berisi teks untuk diproses.');
    }
});
