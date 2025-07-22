
module.exports = {
    authorizeUser,
    registerUser,
    createTask,
    getUserTasks
}

async function authorizeUser(client, username) {
    // Validate client connection
    if (!client || !client._connected) {
        console.error("Database connection not established");
        throw new Error("Database connection error");
    }

    try {
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
            return null;
        }

    } catch (err) {
        console.error("Authorization failed:\n" + err.message);
    }
}

async function registerUser(client, username, password) {
    console.log("registering user:", username);
    try {
        if (!client || !client._connected) {
            console.error("Database connection not established");
        }

        console.log("adding the user to the database:", username);
        const result = await client.query(`INSERT INTO users (username, password) VALUES ($1, $2)`, [username, password]);
        if ((result.rows === 0) || (result.rows.length > 1)) {
            console.error("Invalid query result format");
            return null;
        }else {
            return {
                registered: true,
            }
        }
    } catch (err) {
        console.error("Registering user:", err);
    }
}

async function createTask (client, task) {
    console.log("creating task for :", task.username);
    console.log("creating task for user:", task);
    try {
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
    } catch (err){
        console.error("Error creating task :", err.message);
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
