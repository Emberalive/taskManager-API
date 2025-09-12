module.exports = {
    authorizeUser,
    registerUser,
    createTask,
    getUserTasks,
    deleteTask,
    updateTask,
    completedTask,
    getCompletedTasks,
    patchUserData,
    getGroups,
    createGroup,
    deleteGroup,
}

async function authorizeUser(client, username) {
    // Validate client connection
    console.log(`[DbOps - AuthorizeUser] Starting authorization for user: ${username}`);
    if (!client || !client._connected) {
        console.error("[DbOps - AuthorizeUser] Database connection not established");
        throw new Error("Database connection error");
    }

        const query = `SELECT * FROM users WHERE username = $1;`
        const values = [username, ]
        const result = await client.query({
            text : query,
            values: values,
        });
        // Check if user exists
        if (result.rows.length > 0) {
            console.log(`[DbOps - AuthorizeUser] User found: ${result.rows[0].username}`);
            console.log(`[DbOps - AuthorizeUser] Authorization successful for: ${username}`);
            return result.rows[0];
        } else {
            console.warn(`[DbOps - AuthorizeUser] User not found: ${username}`);
        }
}

async function registerUser(client, username, password) {
    console.log(`[DbOps - RegisterUser] Starting registration for user: ${username}`);
    if (!client || !client._connected) {
        console.error("[DbOps - RegisterUser] Database connection not established");
    }

    console.log(`[DbOps - RegisterUser] Adding user to database: ${username}`);
    const result = await client.query(`INSERT INTO users (username, password) VALUES ($1, $2)`, [username, password]);
    if ((result.rows === 0) || (result.rows.length > 1)) {
        console.error("[DbOps - RegisterUser] Invalid query result format");
        return {
            registered: false,
        };
    }else {
        console.log(`[DbOps - RegisterUser] User registered successfully: ${username}`);
        return {
            registered: true,
        }
    }
}


async function patchUserData(client, userData, username) {
    console.log(`[DbOps - PatchUserData] Starting user data update for: ${username}`);
    if (!client || !client._connected) {
        console.error("[DbOps - PatchUserData] Database connection not established");
        return false
    }
    try {
        const result = await client.query(`UPDATE users
            SET username = $1,
            bio = $2,
            email = $3
            WHERE username = $4;`, [userData.username, userData.bio, userData.email, username]);

        if ((result.rowCount === 0) || (result.rowCount > 1)) {
            console.error("[DbOps - PatchUserData] Invalid query result format");
            return false
        } else {
            console.log(`[DbOps - PatchUserData] User data updated successfully for: ${username}`);
            return true
        }
    } catch (err) {
        throw new Error("Error updating users data" + err.message);
    }
}

async function createTask (client, task) {
    console.log(`[DbOps - CreateTask] Creating task for user: ${task.username}`);
        if (!client || !client._connected) {
            console.error("[DbOps - CreateTask] Database connection not established");
            return {
                success: false,
            }
        }
        const result = await client.query(`INSERT INTO task (id, title, description, date, username, groups, completed)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [task.id, task.title, task.description, task.date, task.username, task.groups, task.completed]);

        if ((result.rows === 0)|| (result.rows.length > 1)) {
            console.error("[DbOps - CreateTask] Invalid query result format");
        } else {
            console.log(`[DbOps - CreateTask] Task created successfully for user: ${task.username}`);
            return {
                success: true,
            }
        }
}

async function getUserTasks (client, username) {
    console.log(`[DbOps - GetUserTasks] Fetching tasks for user: ${username}`);
        if (!client || !client._connected) {
            console.error("[DbOps - GetUserTasks] Database connection not established");
            return {
                success: false,
            }
        } else {
            const result = await client.query(`SELECT * FROM task WHERE username = $1;`, [username]);
            if (result) {
                console.log(`[DbOps - GetUserTasks] Tasks retrieved successfully for user: ${username}`);
                return result.rows;
            } else {
                console.warn(`[DbOps - GetUserTasks] No tasks found for user: ${username}`);
                return null
            }
        }
}

async function getCompletedTasks (client, username) {
    console.log(`[DbOps - GetCompletedTasks] Fetching completed tasks for user: ${username}`);
    if (!client || !client._connected) {
        console.error("[DbOps - GetCompletedTasks] Database connection not established");
        return {
            success: false,
        }
    } else {
        const result = await client.query(`SELECT * FROM completedTask WHERE username = $1;`, [username]);
        if (result) {
            console.log(`[DbOps - GetCompletedTasks] Completed tasks retrieved successfully for user: ${username}`);
            return result.rows;
        } else {
            console.warn(`[DbOps - GetCompletedTasks] No completed tasks found for user: ${username}`);
            return null
        }
    }
}

async function deleteTask (client, taskId) {
    console.log(`[DbOps - DeleteTask] Deleting task with ID: ${taskId}`);
    if (!client || !client._connected) {
        console.error("[DbOps - DeleteTask] Database connection not established");
        return {
            success: false,
        }
    }
    console.log(`[DbOps - DeleteTask] Performing delete operation for task ID: ${taskId}`);
    const result = await client.query(`DELETE FROM task WHERE id = $1;`, [taskId]);
    if ((result.rowCount === 0) || (result.rowCount > 1)) {
        console.error("[DbOps - DeleteTask] Invalid query result format");
        return {
            success: false,
        }
    } else {
        console.log(`[DbOps - DeleteTask] Task deleted successfully, ID: ${taskId}`);
        return {
            success: true,
        }
    }
}

async function updateTask (client, taskData) {
    const { id, title, description, completed, reminderDate } = taskData;

    console.log(taskData);

    console.log(`[DbOps - UpdateTask] Update task with ID: ${id}`);
    if (!client || !client._connected) {
        console.error("[DbOps - UpdateTask] Invalid query result format");
        return {
            success: false,
        }
    }

    if (!id) {
        console.error("[DbOps - UpdateTask] Invalid query result format");
        return {
            success: false,
        }
    }

    console.log("reminderDate destructured:", reminderDate, "from taskData:", taskData);
    console.log("keys:", Object.keys(taskData));


    const updates = []
    const values = []
    let index = 1


    if (description !== undefined) {
        updates.push(`description = $${index++}`);
        values.push(description);
    }

    if (completed !== undefined) {
        updates.push(`completed = $${index++}`);
        values.push(completed);
    }

    if (title !== undefined) {
        updates.push(`title = $${index++}`);
        values.push(title);
    }

    if (reminderDate !== undefined) {
        updates.push(`remind_date = $${index++}`);
        values.push(reminderDate);
    }

    if (updates.length === 0) {
        console.log(`[DbOps - UpdateTask] No updates found for askID: ${id}`);
        return {
            success: true,
        }
    }

    values.push(id);
    const query = `UPDATE task SET ${updates.join(', ')} WHERE id = $${index};`

    try {
        const result  = await client.query(query, values);

        if (result.rowCount === 0) {
            console.log("[DbOps - UpdateTask] Error: " + result.rowCount);
            return {
                success: false,
            }
        }

        return {success: true};

    } catch (err) {
        console.error("[DbOps - UpdateTask] Invalid query result format: " + err.message);
        return {
            success: false,
        }
    }
}

async function completedTask (client, task) {
    console.log(`[DbOps - CompletedTask] Marking task as completed for user: ${task.username}`);
    if (!client || !client._connected) {
        console.error("[DbOps - CompletedTask] Database connection not established");
        return {
            success: false,
        }
    }
    console.log(`[DbOps - CompletedTask] Adding task to completed table, ID: ${task.id}`);
    const result = await client.query(`INSERT INTO completedTask (id, title, description, date, username)
        VALUES ($1, $2, $3, $4, $5)`,[task.id, task.title, task.description, task.date, task.username])

    if ((result.rowCount === 0) || (result.rowCount > 1)) {
        console.error("[DbOps - CompletedTask] Operation completed unsuccessfully");
        return {
            success: false,
        }
    } else {
        console.log(`[DbOps - CompletedTask] Task marked as completed successfully, ID: ${task.id}`);
        return {
            success: true,
        }
    }
}

async function getGroups (client, username) {
    console.log(`[DbOps - GetGroups] Retrieving groups for user: ${username}`);
    if (!client || !client._connected) {
        console.error("[DbOps - GetGroups] Database connection not established");
        return {
            success: false,
        }
    }
    console.log(`[DbOps - GetGroups] Querying database for user groups: ${username}`);
    const result = await client.query(`SELECT name FROM groups WHERE username = $1;`, [username]);
    if (result) {
        console.log(`[DbOps - GetGroups] Groups retrieved successfully for user: ${username}`);
        return {
            success: true,
            groups: result.rows
        };
    } else {
        console.warn(`[DbOps - GetGroups] No groups found for user: ${username}`);
        return null
    }
}

async function createGroup (client, username, groupName) {
    console.log(`[DbOps - CreateGroup] Creating group for user: ${username}`);
    if (!client || !client._connected) {
        console.error("[DbOps - CreateGroup] Database connection not established");
        return {
            success: false,
        }
    }
    console.log(`[DbOps - CreateGroup] Executing database query to create group: ${groupName}`);
    const result = await client.query(`INSERT INTO groups (name, username) VALUES ($1, $2)`,[groupName, username])
    if ((result.rowCount === 0) || (result.rowCount > 1)) {
        console.error("[DbOps - CreateGroup] Invalid query result format");
        return {
            success: false,
        }
    } else {
        console.log(`[DbOps - CreateGroup] Group created successfully: ${groupName} for user: ${username}`);
        return {
            success: true,
        }
    }
}

async function deleteGroup (client, groupName, username) {
    console.log(`[DbOps - DeleteGroup] Deleting group: ${groupName} for user: ${username}`);
    if (!client || !client._connected) {
        console.error("[DbOps - DeleteGroup] Database connection not established");
        return {
            success: false,
        }
    }
    console.log(`[DbOps - DeleteGroup] Executing database query to delete group: ${groupName}`);
    const result = await client.query(`DELETE FROM groups WHERE name = $1 AND username = $2;`, [groupName, username]);
    if (result.rowCount === 1) {
        console.log(`[DbOps - DeleteGroup] Group deleted successfully: ${groupName} for user: ${username}`);
        return {
            success: true,
        }
    } else {
        console.warn(`[DbOps - DeleteGroup] Failed to delete group or group not found: ${groupName} for user: ${username}`);
        return {
            success: false,
        }
    }
}
