const express = require('express');
const app = express();
const port = 7000
const cors = require('cors')

const groupRoutes = require('./routes/groupRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use(express.json());
//enable cors for specific routes
app.use(cors(
    {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        "preflightContinue": false
    }
));

app.use('/groups', groupRoutes)
app.use('/users', userRoutes)
app.use('/tasks', taskRoutes)

app.listen(port, () => {
    console.log(`[Server] API server listening on port ${port}`);
})