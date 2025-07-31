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
        console.log("[Login Endpoint] Starting login process")
        let {password, username} = req.query;

        username = username.trim();
        password = decodeURIComponent(password).trim();

        console.log("[Login Endpoint] Request received for user: " + username);
        console.log("[Login Endpoint] Verifying parameters")
        if (username && password) {
            console.log("[Login Endpoint] Verifying user details for: " + username)
            validUser = await authorizeUser(connection, username);

            if (!validUser) {
                return res.status(401).send({
                    loggedIn: false,
                    error: 'Invalid username or password'
                })
            }
        } else {
            console.warn("[Login Endpoint] Received incorrect parameters")
            return res.status(400);
        }
        //simple insecure password check
        console.log("[Login Endpoint] Verifying password");
        if ((!validUser) || (validUser.password !== password)) {
            return res.status(400).send({
                loggedIn: false,
            })
        } else {
            console.log("[Login Endpoint] Password verified for user: " + username);
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
        console.error("[Login Endpoint] Error: " + err.message)
    } finally {
        await releaseClient(connection)
    }
})

app.post('/register', async (req, res) => {
    console.log("[Register Endpoint] Starting registration process")
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
        console.error("[Register Endpoint] Error: " + err.message);
        res.status(500).send({
            registered: false,
        })
    } finally {
        await releaseClient(connection)
    }
});

app.patch('/profile', async (req, res) => {
    const connection = await getConnection();
    console.log("[Profile Endpoint] Starting profile update for user: " + req.body.username);

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
    console.log("[Create Task Endpoint] Starting task creation for user: " + req.body.task.username);
    const connection = await getConnection();
    try {
        console.log("[Create Task Endpoint] Task data: " + JSON.stringify(req.body.task));

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
        console.error("[Create Task Endpoint] Error: " + err.message);
        res.status(500).send({
            success: false,
        })
    } finally {
        await releaseClient(connection)
    }
})

app.post('/completedTask', async (req, res) => {
    console.log("[Completed Task Endpoint] Starting completed task process")
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
    console.log("[Get User Tasks Endpoint] Starting task retrieval")
    const connection = await getConnection();
    try {
        if (req.query.username) {
            console.log("[Get User Tasks Endpoint] Fetching tasks for user: " + req.query.username)

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
        console.error("[Get User Tasks Endpoint] Error: " + err.message);
        res.status(500).send({})
    } finally {
        await releaseClient(connection)
    }
})

app.get('/getCompletedTasks', async (req, res) => {
    console.log("[Get Completed Tasks Endpoint] Starting completed task retrieval")
    const connection = await getConnection();
    try {
        if (req.query.username) {
            console.log("[Get Completed Tasks Endpoint] Fetching completed tasks for user: " + req.query.username)

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
        console.error("[Get Completed Tasks Endpoint] Error: " + err.message);
        res.status(500).send({})
    } finally {
        await releaseClient(connection)
    }
})

app.delete('/deleteTask', async (req, res) => {
    console.log("[Delete Task Endpoint] Starting task deletion")
    const connection = await getConnection();

    console.log("[Delete Task Endpoint] Deleting task with ID: " + req.query.id)

    try {
        const taskId = req.query.id
        if (!taskId) {
            return res.status(400).send({
                success : false
            })
        }
        const result = await deleteTask(connection, taskId)
        if (result.success) {
            console.log("[Delete Task Endpoint] Task deleted successfully")
            return res.status(200).send({
                success: true
            })
        } else {
            console.log("[Delete Task Endpoint] Task deletion failed", result)
            return res.status(500).send({
                success: false
            })
        }
    } catch (err) {
        console.error("[Delete Task Endpoint] Error: " + err.message);
    } finally {
        await releaseClient(connection)
    }
})

app.patch('/updateTask', async (req, res) => {
    console.log("[Update Task Endpoint] Starting task update")
    const connection = await getConnection();
    const task = req.body
    // const {id, title, description} = task;
    console.log("[Update Task Endpoint] Task details - ID: " + task.id + ", Title: " + task.title + ", Description: " + task.description);

    console.log("[Update Task Endpoint] Update started for task ID: " + task.id)
    try {
        if (task.id && task.title && task.description) {
            console.log("[Update Task Endpoint] Calling database operation")
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
        console.error("[Update Task Endpoint] Error updating task ID: " + task.id + " - " + err.message);
        return res.status(500).send({
            success: false,
            error : err.message
        })
    }
})

app.get('/getGroups', async (req, res) => {
    console.log("[Get Groups Endpoint] Starting group retrieval")
    const connection = await getConnection();
    console.log("[Get Groups Endpoint] Retrieving groups for user: " + req.query.username)

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
        console.error("[Get Groups Endpoint] Error retrieving groups for user: " + req.query.username  + " - " + err.message);
        res.status(500).send({
            success: false
        })
    }
})

app.post('/createGroup', async (req, res) => {
    console.log("[Create Group Endpoint] Starting group creation")
    const connection = await getConnection();
    console.log("[Create Group Endpoint] Creating group for user: " + req.body.username)
    try {
        console.log("[Create Group Endpoint] Calling database operation")
        const result = await createGroup(connection, req.body.username, req.body.groupName);
        if (result.success) {
            console.log("[Create Group Endpoint] Group created successfully:", result)
            return res.status(200).send({
                success: true
            })
        } else {
            return res.status(400).send({
                success: false
            })
        }
    } catch (err) {
        console.error("[Create Group Endpoint] Error creating group for user: " + req.body.username + " - " + err.message);
        res.status(500).send({
            success: false
        })
    }
})

app.listen(port, () => {
    console.log(`[Server] API server listening on port ${port}`);
})