const sqlite3 = require('sqlite3').verbose();


// Create db and table
const db = new sqlite3.Database("./db/todolist.db", (err) => {
    if (err) {
        console.error("Unable to connect to db", err.message)
    } else {
        console.log("Connected to db");
    }
});

db.serialize(() => { 
    db.run(`
    CREATE TABLE IF NOT EXISTS Todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo_name TEXT NOT NULL,
        description TEXT NOT NULL,
        status INTEGER NOT NULL CHECK (status IN (0, 1, 2)),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
    `);
});
    




module.exports = db; 