const express = require('express')
const app = express()
app.use(express.json());
const port = 3000
const db = require("./db");


app.get('/api', async (req, res) => {
    db.all("SELECT * FROM Todos", [], (err, rows) => { 
        if (err) {
            return res.status(500).json({error: err.message});
        }
        res.json(rows);
    });
  
});

app.post('/', (req, res) => {
    res.send('Got a POST request')
});
  

app.put('/user', (req, res) => {
    res.send('Got a PUT request at /user')
});
  

app.delete('/user', (req, res) => {
    res.send('Got a DELETE request at /user')
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
}); 



