const express = require('express')
const router = express.Router()
const {
    createTask,
    getUserTasks,
    deleteTask,
    updateTask, getCompletedTasks, completedTask

} = require('../DbOps')

const {
    getConnection,
    releaseClient
} = require('../DBacces')

//Create a task
router.post('/', async (req, res) => {
    const connection = await getConnection();
    const task = req.body;

    console.log(JSON.stringify(task))
    console.log("[Create Task Endpoint] Starting task creation for user: " + task.username);

    try {
        console.log("[Create Task Endpoint] Task data: " + JSON.stringify(task));

        if (!task) {
            return res.status(400).send({
                success : false
            })
        }else {
            const result = await createTask(connection, task)

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

// get user tasks
router.get('/', async (req, res) => {
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

//delete a Task
router.delete('/', async (req, res) => {
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

// update task
router.patch('/', async (req, res) => {
    console.log("[Update Task Endpoint] Starting task update")
    const connection = await getConnection();
    const task = req.body

    console.log("[Update Task Endpoint] Update started for task ID: " + task.id)
    try {
        if (task) {
            console.log("[Update Task Endpoint] Calling database operation")
            const result = await updateTask(connection, task);

            if (result.success) {
                console.log("[Update Task Endpoint] Task updated successfully")
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

router.get('/getCompletedTasks', async (req, res) => {
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

router.post('/completedTask', async (req, res) => {
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

module.exports = router