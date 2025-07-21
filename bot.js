require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { generateResponse } = require('./gemini-parser');

// Add better error handling for bot initialization
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true
});

// Add more detailed error handling
bot.on('polling_error', (error) => {
    console.error(`[polling_error] ${error.code}: ${error.message}`);
});

// Add connection error handling
bot.on('error', (error) => {
    console.error('Bot error:', error);
});

console.log('Bot started, waiting for messages...');

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hai! Kalau mau catat pengeluaran, chat aja aku kaya gini \'Beli cilok 15rb\'.');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (userMessage.startsWith('/')) return;

    try {
        console.log('Processing message:', userMessage);
        const response = await generateResponse(userMessage);
        if (response) {
            await bot.sendMessage(
                chatId,
                `✅ Tercatat: ${response.description}\n💸 Jumlah: Rp${response.amount?.toLocaleString() || 'N/A'}\n🗂️ Kategori: ${response.category || 'Uncategorized'}\n📅 Tanggal: ${new Date().toLocaleDateString()}\n\nTerima kasih telah mencatat pengeluaranmu!`
            );
        } else {
            await bot.sendMessage(chatId, 'Maaf, format pengeluaran tidak dikenali. Contoh yang benar: "Beli cilok 15rb".');
        }
    } catch (error) {
        console.error('Error in message handler:', error);
        try {
            await bot.sendMessage(chatId, 'Maaf, terjadi kesalahan saat memproses permintaanmu.');
        } catch (sendError) {
            console.error('Failed to send error message:', sendError);
        }
    }
});

// Handle uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
