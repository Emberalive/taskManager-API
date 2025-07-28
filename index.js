const express = require('express');
const app = express();
const port = 7000
const cors = require('cors')


const {getConnection, releaseClient} = require('./DBacces')
const {
    authorizeUser,
    registerUser,
    createTask,
    getUserTasks,
    deleteTask,
    updateTask,
    completedTask,
    getCompletedTasks,
    patchUserData, getGroups, createGroup
} = require('./DbOps')

app.use(express.json());
//enable cors for specific routes
app.use(cors(
    {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        "preflightContinue": false
    }
));

app.get('/login', async (req, res) => {
    const connection = await getConnection();
    let validUser = {};
    try {
        console.log("starting login end-point")
        let {password, username} = req.query;

        username = username.trim();
        password = decodeURIComponent(password).trim();

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
                user: {
                    username: validUser.username,
                    email: validUser.email,
                    bio: validUser.bio
                },
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
    } finally {
        await releaseClient(connection)
    }
});

app.patch('/profile', async (req, res) => {
    const connection = await getConnection();
    console.log("started patch on user data:" + req.body.username);

        try {
           if (req.body.newUserData) {
               const result = await patchUserData(connection, req.body.newUserData, req.body.username)


               if (result) {
                   return res.status(201).send({
                       success: true
                   })
               } else {
                   return res.status(400).send({
                       success: false,
                   })
               }
           } else {
               res.status(400).send({
                   success: false
               })
           }
        } catch (err) {
        res.status(500).send({
            success: false,
            error: err.message
        })
    }
})

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

            if (result.success ===false) {
                return res.status(500).send({
                    error: 'server error'
                })
            } else {
                return res.status(201).send(
                    result
                )
            }
        }
    } catch (err) {
        console.error("Error while creating task: ", err.message);
        res.status(500).send({
            success: false,
        })
    } finally {
        await releaseClient(connection)
    }
})

app.post('/completedTask', async (req, res) => {
    const connection = await getConnection();
    try {
        const task = req.body.task
        if (!task) {
            return res.status(400).send({
                success : false
            })
        } else {
            const result = await completedTask(connection, task)
            if (result.success === false) {
                return res.status(500).send(
                    result
                )
            } else {
                res.status(201).send(
                    result
                )
            }
        }
    } catch (err) {
        res.status(500).send({
            success : false
        })
    }
})

app.get('/getUserTasks', async (req, res) => {
    const connection = await getConnection();
    try {
        if (req.query.username) {
            console.log("attempting to get tasks for: " + req.query.username)

            const tasks = await getUserTasks(connection, req.query.username)
            res.status(200).send({
                tasks: tasks,
                success: true
            })
        } else {
            res.status(400).send({
                success: false
            })
        }
    } catch (err){
        console.error("Error getting user tasks :", err.message);
        res.status(500).send({})
    } finally {
        await releaseClient(connection)
    }
})

app.get('/getCompletedTasks', async (req, res) => {
    const connection = await getConnection();
    try {
        if (req.query.username) {
            console.log("attempting to get completed tasks for: " + req.query.username)

            const tasks = await getCompletedTasks(connection, req.query.username)

            res.status(200).send({
                tasks: tasks,
                success: true
            })
        } else {
            res.status(400).send({
                success: false
            })
        }
    } catch (err){
        console.error("Error getting user completed tasks :", err.message);
        res.status(500).send({})
    } finally {
        await releaseClient(connection)
    }
})

app.delete('/deleteTask', async (req, res) => {
    const connection = await getConnection();

    console.log("starting delete task for task: " + req.query.id)

    try {
        const taskId = req.query.id
        if (!taskId) {
            return res.status(400).send({
                success : false
            })
        }
        const result = await deleteTask(connection, taskId)
        if (result.success) {
            console.log("deleted task:\n", result.success)
            return res.status(200).send({
                success: true
            })
        } else {
            console.log("deleted task: \n", result)
            return res.status(500).send({
                success: false
            })
        }
    } catch (err) {
        console.error("Error while deleting task" + "\nError: " + err.message);
    } finally {
        await releaseClient(connection)
    }
})

app.patch('/updateTask', async (req, res) => {
    const connection = await getConnection();
    const task = req.body
    // const {id, title, description} = task;
    console.log(task.id + " " + task.title + " " + task.description);

    console.log("update task for task: " + task.id + " started")
    try {
        if (task.id && task.title && task.description) {
            console.log("calling DB Operation")
            const result = await updateTask(connection, task.id, task.title, task.description);

            if (result.success) {
                return res.status(200).send({
                    success: true
                })
            } else {
                return res.status(400).send({
                    success: false
                })
            }
        } else {
            return res.status(400).send({
                success: false,
                error: "missing parameters"
            })
        }

    } catch (err){
        console.log("error updating task for task: " + task.id)
        return res.status(500).send({
            success: false,
            error : err.message
        })
    }
})

app.get('/getGroups', async (req, res) => {
    const connection = await getConnection();
    console.log("starting getGroups for: " + req.query.username)

    try {
        const result = await getGroups(connection, req.query.username)
        if (result.success) {
            res.status(200).send({
                success: true,
                groups: result.groups
            })
        } else {
            res.status(400).send({
                success: false
            })
        }
    } catch (err) {
        console.error("Error getting Groups for user: " + req.query.username  + "\nError: " + err.message);
        res.status(500).send({
            success: false
        })
    }
})

app.post('/createGroup', async (req, res) => {
    const connection = await getConnection();
    console.log("starting create group for user: " + req.body.username)
    try {
        console.log("calling DB Operation")
        const result = await createGroup(connection, req.body.username, req.body.groupName);
        if (result.success) {
            console.log(result)
            return res.status(200).send({
                success: true
            })
        } else {
            return res.status(400).send({
                success: false
            })
        }
    } catch (err) {
        console.log("Error create group for user: " + req.body.username + "\nError: " + err.message);
        res.status(500).send({
            success: false
        })
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})