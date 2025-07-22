const express = require('express');
const app = express();
const port = 7000
const cors = require('cors')


const {getConnection, releaseClient} = require('./DBacces')
const {authorizeUser, registerUser, createTask, getUserTasks} = require('./DbOps')

app.use(express.json());
//enable cors for specific routes
app.use(cors());

app.get('/login', async (req, res) => {
    const connection = await getConnection();
    let validUser = {};
    try {
        console.log("starting login end-point")
        let {password, username} = req.query;

        username = username.trim();
        password = password.trim();

        console.log("request parameters: " + password + " " + username);
        console.log("verifying parameters")
        if (username && password) {
            console.log("verifying the user details")
            validUser = await authorizeUser(connection, username);

            if (!validUser) {
                return res.status(401).send({
                    loggedIn: false,
                    error: 'Invalid username or password'
                })
            }
        } else {
            console.log("incorrect parameters")
            return res.status(400);
        }
        //simple insecure password check
        console.log("verifying password");
        if ((!validUser) || (validUser.password !== password)) {
            return res.status(400).send({
                loggedIn: false,
            })
        } else {
            console.log("verified password");
            return res.status(200).send({
                loggedIn: true,
                user: validUser,
            })
        }
    } catch (err) {
        res.status(500).send({})
        console.log("Error while login: \n" + err.message)
    } finally {
        await releaseClient(connection)
    }
})

app.post('/register', async (req, res) => {
    console.log("registering user:", req.body.username)
    const connection = await getConnection();
    try {
        const {username, password, confirmPassword} = req.body;

        if (!username || !password || !confirmPassword) {
            return res.status(400).send({
                registered: false,
            })
        }  else if (password !== confirmPassword) {
            return res.status(400).send({
                registered: false,
            })
        } else {
            const isCreated = await registerUser(connection, username, password);
            if (isCreated.registered) {
                return res.status(200).send({
                    registered: true,
                })
            }
        }
    } catch (err) {
        console.log("Error while registering: " + err.message);
        res.status(500).send({
            registered: false,
        })
    }
});

app.post('/createTask', async (req, res) => {
    console.log("registering task for :", req.body.task.username)
    const connection = await getConnection();
    try {

        console.log("request parameters: " + JSON.stringify(req.body.task));

        if (!req.body.task) {
            return res.status(400).send({
                success : false
            })
        }else {
            const result = await createTask(connection, req.body.task)

            if (!result.success) {
                return res.status(500).send({
                    error: 'server error'
                })
            } else {
                return res.status(201).send({
                    success: true
                })
            }
        }
    } catch (err) {
        res.status(500).send({
            success: false,
        })
    }
})

app.get('/getUserTasks', async (req, res) => {
    const connection = await getConnection();
    try {
        console.log("attempting to get tasks for: " + req.query.username)

    } catch (err){
        console.error("Error getting user tasks :", err.message);
        res.status(500).send({})
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})