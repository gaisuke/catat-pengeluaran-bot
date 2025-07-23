const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

// initialize the database
const db = new Database(path.join(dbDir, 'database.db'));

db.prepare(`
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        category TEXT NOT NULL
    )
    `).run();

function insertExpense({ description, amount, category, date }) {
    const stmt = db.prepare(`
        INSERT INTO expenses (description, amount, category, created_at)
        VALUES (?, ?, ?, ?)
        RETURNING *
    `);
    const result = stmt.get(description, amount, category, date || new Date().toISOString());
    console.log(`Expense inserted:`, result);
    return result;
}

function getExpensesByWeek() {
    const stmt = db.prepare(`
        SELECT * FROM expenses
        WHERE strftime('%W', created_at) = strftime('%W', 'now')
        ORDER BY created_at DESC
        `)
    return stmt.all();
}

function getExpensesByMonth() {
    const stmt = db.prepare(`
        SELECT * FROM expenses
        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
        ORDER BY created_at DESC
        `)
    return stmt.all();
}

module.exports = {
    insertExpense,
    getExpensesByWeek,
    getExpensesByMonth
}