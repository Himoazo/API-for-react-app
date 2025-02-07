const express = require('express')
const app = express()
app.use(express.json());
const port = 3000
const db = require("./db");

// Middleware to validate input
function inputValidation(req, res, next) {
    
    const { todo, description, status } = req.body;

    if (typeof todo !== "string" || typeof description !== "string") {
        return res.status(400).json({ error: "Todo and description must be strings" });
    }

    if (!todo || todo.trim() === "") {
        return res.status(400).json({ error: "Name can't be empty" });
    }
    if (todo.length < 3 || todo.length > 30) {
        return res.status(400).json({ error: "Name must be between 3 and 30 chars" });
    }

    if (description.length > 200) {
        return res.status(400).json({ error: "Description can't be more than 200 chars" });
    }

    if (status === undefined || !Number.isInteger(status) || status < 0 || status > 2) {
        return res.status(400).json({ error: "Invalid status" });
    }

    next();
}


app.get('/api', (req, res) => {
    db.all("SELECT * FROM Todos", [], (err, rows) => { 
        if (err) {
            return res.status(500).json({error: err.message});
        }
        res.json(rows);
    });
  
});

app.get('/api/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM Todos WHERE id = ?", [id], (err, row) => { 
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Todo not found" });
        return res.json(row);
    });
});

app.post('/api', inputValidation, (req, res) => {
    const { todo, description, status } = req.body;

    
    const insertion = db.prepare("INSERT INTO Todos (todo_name, description, status) VALUES (?, ?, ?)");
    insertion.run(todo, description, status, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }
        res.status(201).json({ succes: "A todo has been created" });
        insertion.finalize();
    });
        
});
  

app.put('/api/:id', inputValidation, (req, res) => {
    const { todo, description, status } = req.body;
    const { id } = req.params;

    db.get("SELECT id FROM Todos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Todo was not found" });

        const update = db.prepare("UPDATE Todos SET todo_name = ?, description = ?, status = ? WHERE id = ?");
        update.run(todo, description, status, id, function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.status(200).json({ success: "A todo has been updated" });
            update.finalize();
        });
    });
});

  

app.delete('/api/:id', (req, res) => {
    const { id } = req.params;

    db.get("SELECT id FROM Todos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Todo was not found" });

        const deleteTodo = db.prepare("DELETE FROM Todos WHERE id = ?");
        deleteTodo.run(id, (err) => { 
            if (err) return res.status(500).json({ error: err.message });

            res.status(200).json({ success: "A todo has been deleted" });
            deleteTodo.finalize();
        });
    });
});


app.listen(port, '0.0.0.0', (error) => {
    if (error) {
        console.log(error); 
        throw error;  
    }
    console.log(`Server is running on port: ${port}`);
});


