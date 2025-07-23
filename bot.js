require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { generateResponse } = require('./gemini-parser');
const { insertExpense, getExpensesByWeek, getExpensesByMonth } = require('./db');

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

        if (!response || !response.intent) {
            await bot.sendMessage(chatId, '❌ Maaf, saya tidak mengerti maksudmu. Coba tulis seperti "beli nasi goreng 15rb" atau "berapa pengeluaran minggu ini".');
            return;
        }

        switch (response.intent) {
            case 'add_expense': {
                const data = response.data || {};

                // Insert into database and get the result
                let insertedExpense;
                try {
                    insertedExpense = insertExpense({
                        description: data.description,
                        amount: data.amount,
                        category: data.category || 'Uncategorized',
                        date: new Date().toISOString()
                    });
                    console.log('Database insert successful:', insertedExpense);
                } catch (dbError) {
                    console.error('Database error:', dbError);
                    await bot.sendMessage(chatId, '❌ Gagal menyimpan data pengeluaran.');
                    return;
                }

                await bot.sendMessage(chatId, `✅ Tercatat: ${insertedExpense.description}\n💸 Jumlah: Rp${insertedExpense.amount?.toLocaleString() || 'N/A'}\n🗂️ Kategori: ${insertedExpense.category || 'Uncategorized'}\n📅 Tanggal: ${new Date(insertedExpense.created_at).toLocaleDateString()}\n\nTerima kasih telah mencatat pengeluaranmu!`);
                break;
            }
            case 'report_week': {
                const expenses = getExpensesByWeek();
                if (expenses.length === 0) {
                    await bot.sendMessage(chatId, '📊 Tidak ada pengeluaran yang tercatat minggu ini.');
                    return;
                }

                console.log("expenses => ", expenses);


                const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
                const report = expenses.map(expense => `• ${expense.description} - Rp${expense.amount?.toLocaleString() || 0}`).join('\n');
                await bot.sendMessage(chatId, `📊 Laporan Pengeluaran Minggu Ini:\n\n${report}\n\n💰 Total: Rp${total.toLocaleString()}`);
                break;
            }
            case 'report_month': {
                const expenses = getExpensesByMonth();
                if (expenses.length === 0) {
                    await bot.sendMessage(chatId, '📊 Tidak ada pengeluaran yang tercatat bulan ini.');
                    return;
                }

                const total = expenses.reduce((sum, expenses) => sum + expenses.amount, 0);
                const report = expenses.map(expenses => `• ${expenses.description} - Rp${expenses.amount.toLocaleString()}`).join('\n');
                await bot.sendMessage(chatId, `📊 Laporan Pengeluaran Bulan Ini:\n\n${report}\n\n💰 Total: Rp${total.toLocaleString()}`);
                break;
            }
            default:
                await bot.sendMessage(chatId, '⚠️ Maaf, perintah belum didukung.');
        }
    } catch (error) {
        console.error('Error in message handler:', error);
        await bot.sendMessage(chatId, 'Maaf, terjadi kesalahan saat memproses permintaanmu.');
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
