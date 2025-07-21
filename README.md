# Expense Tracker Chatbot 💬💸

This is simple Telegram chatbot that lets you record expenses using natural language like `beli cilok 5rb`, powered by Gemini AI and stored in SQLite.

## Features
- ✅ Parses Indonesian expense messages via Gemini AI
- 💬 Responds on Telegram with confirmation
- 💾 Stores parsed expenses in SQLite DB
- 📊 Coming soon: Reports for daily, weekly, categorized summaries, and OCR from receipt.

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/gaisuke/catat-pengeluaran-bot
cd catat_pengeluaran_bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory and add your Google API key and Telegram bot token:
```ini
GOOGLE_API_KEY=your_google_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 4. Run the bot
```bash
npm run start
```

## License
This project is licensed under the MIT License.