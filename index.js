const express = require('express');
import helmet from "helmet";
const app = express();
const port = 7000
const cors = require('cors')

const groupRoutes = require('./routes/groupRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use(helmet());
app.use(express.json());
//enable cors for specific routes
app.use(cors(
    {
	    origin: "https://sparkr.emberalive.com",
        methods: ["GET", "POST", "PATCH", "DELETE", "HEAD"],
        "preflightContinue": false
    }
));

app.use('/groups', groupRoutes)
app.use('/users', userRoutes)
app.use('/tasks', taskRoutes)

app.listen(port, () => {
    console.log(`[Server] API server listening on port ${port}`);
})
