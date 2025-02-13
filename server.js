const express = require('express')
const app = express()
app.use(express.json());
const port = 3000
const db = require("./db");
//Cors
const cors = require("cors");
app.use(cors());


// Middleware to validate input
function inputValidation(req, res, next) {    
    const { todo_name, description, status } = req.body;

    if (typeof todo_name !== "string" || (description && typeof description !== "string")) {
        return res.status(400).json({ error: "Todo and description must be strings" });
    }

    if (!todo_name || todo_name.trim() === "") {
        return res.status(400).json({ error: "Name can't be empty" });
    }
    if (todo_name.length < 3 || todo_name.length > 50) {
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
    const { todo_name, description, status } = req.body;
    
    const insertion = db.prepare("INSERT INTO Todos (todo_name, description, status) VALUES (?, ?, ?)");
    insertion.run(todo_name, description, status, (err) => {
        if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                return res.status(422).json({ error: "Todo name must be unique" });
            }
            return res.status(500).json({ error: err })
        }
        res.status(201).json({ succes: "A todo has been created" });
        insertion.finalize();
    });
        
});
  

app.put('/api/:id', inputValidation, (req, res) => {
    const { todo_name, description, status } = req.body;
    const { id } = req.params;

    db.get("SELECT id FROM Todos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Todo was not found" });

        const update = db.prepare("UPDATE Todos SET todo_name = ?, description = ?, status = ? WHERE id = ?");
        update.run(todo_name, description, status, id, function (err) {
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


