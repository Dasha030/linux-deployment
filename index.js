const express = require('express');
const app = express();
const PORT = 3000;

app.get('/tasks', (req, res) => {
    res.json([
        { id: 1, title: "Learn Docker layers", completed: true },
        { id: 2, title: "Complete Lab 3", completed: false }
    ]);
});

app.get('/', (req, res) => {
    res.send("Task Manager API is running inside Docker!");
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

module.exports = app;

//...
