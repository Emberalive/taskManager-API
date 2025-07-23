const result = require("pg/lib/query");

module.exports = {
    authorizeUser,
    registerUser,
    createTask,
    getUserTasks,
    deleteTask,
    updateTask,
    completedTask,
    getCompletedTasks,
    patchUserData
}

async function authorizeUser(client, username) {
    // Validate client connection
    if (!client || !client._connected) {
        console.error("Database connection not established");
        throw new Error("Database connection error");
    }
     console.log(`Authorizing user: ${username}`);

        const query = `SELECT * FROM users WHERE username = $1;`
        const values = [username, ]
        const result = await client.query({
            text : query,
            values: values,
        });
        // Check if user exists
        if (result.rows.length > 0) {
            console.log("User found:", result.rows[0].username);
            return result.rows[0];
        } else {
            console.error("Invalid query result format");
        }
}

async function registerUser(client, username, password) {
    console.log("registering user:", username);

        if (!client || !client._connected) {
            console.error("Database connection not established");
        }

        console.log("adding the user to the database:", username);
        const result = await client.query(`INSERT INTO users (username, password) VALUES ($1, $2)`, [username, password]);
        if ((result.rows === 0) || (result.rows.length > 1)) {
            console.error("Invalid query result format");
            return {
                registered: false,
            };
        }else {
            return {
                registered: true,
            }
        }
}


async function patchUserData(client, userData, username) {
    if (!client || !client._connected) {
        console.error("Database connection not established");
        return {
            success: false,
        }
    }
    try {
        const result = await client.query(`UPDATE users
            SET username = $1,
            bio = $2,
            email = $3
            WHERE username = $4;`, [userData.username, userData.bio, userData.email, username]);

        if ((result.rowCount === 0) || (result.rowCount > 1)) {
            console.error("Invalid query result format");
            return {
                success: false,
            }
        } else {
            return {
                success: true,
            }
        }
    } catch (err) {
        throw new Error("Error updating users data" + err.message);
    }
}

async function createTask (client, task) {
    console.log("creating task for :", task.username);
    console.log("creating task for user:", task);

        if (!client || !client._connected) {
            console.error("Database connection not established");
            return {
                success: false,
            }
        }
        const result = await client.query(`INSERT INTO task (id, title, description, date, username)
            VALUES ($1, $2, $3, $4, $5)`,
            [task.id, task.title, task.description, task.date, task.username]);

        if ((result.rows === 0)|| (result.rows.length > 1)) {
            console.error("Invalid query result format");
        } else {
            console.log("Task has been successfully created");
            return {
                success: true,
            }
        }
}

async function getUserTasks (client, username) {
        if (!client || !client._connected) {
            console.error("Database connection not established");
            return {
                success: false,
            }
        } else {
            const result = await client.query(`SELECT * FROM task WHERE username = $1;`, [username]);

            return result.rows;
        }
}

async function getCompletedTasks (client, username) {
    if (!client || !client._connected) {
        console.error("Database connection not established");
        return {
            success: false,
        }
    } else {
        const result = await client.query(`SELECT * FROM completedTask WHERE username = $1;`, [username]);

        return result.rows;
    }
}

async function deleteTask (client, taskId) {
    if (!client || !client._connected) {
        console.error("Database connection not established");
        return {
            success: false,
        }
    }
    console.log("deleting task :" + taskId);
    const result = await client.query(`DELETE FROM task WHERE id = $1;`, [taskId]);
    if ((result.rowCount === 0) || (result.rowCount > 1)) {
        console.error("Invalid query result format");
        return {
            success: false,
        }
    } else {
        console.log("Task has been successfully deleted");
        return {
            success: true,
        }
    }
}

async function updateTask (client, id, title, description) {
    if (!client || !client._connected) {
        console.error("Database connection not established");
        return {
            success: false,
        }
    }

    console.log("updating task details for task :", id);

    const result = await client.query(`UPDATE task
        SET title = $1,
        description = $2
        WHERE id = $3`, [title, description, id]);
    
    if ((result.rowCount === 0) || (result.rowCount > 1)) {
        console.error("Invalid query result format");
        return {
            success: false,
        }
    } else {
        console.log("Task has been successfully updated");
        return {
            success: true,
        }
    }
}

async function completedTask (client, task) {
    if (!client || !client._connected) {
        console.error("Database connection not established");
        return {
            success: false,
        }
    }
    console.log("adding completed task -> " + task.id);
    const result = await client.query(`INSERT INTO completedTask (id, title, description, date, username)
        VALUES ($1, $2, $3, $4, $5)`,[task.id, task.title, task.description, task.date, task.username])

    if ((result.rowCount === 0) || (result.rowCount > 1)) {
        console.error("peration completed unsuccessfuly");
        return {
            success: false,
        }
    } else {
        return {
            success: true,
        }
    }
}
