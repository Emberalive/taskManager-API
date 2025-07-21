
module.exports = {
    authorizeUser
}

async function authorizeUser (client, username) {
    if (!client) {
        console.log("connection not established")
        return false
    }
    try {
        console.log("getting user info")
        const result = await client.query(
            `SELECT * FROM users WHERE user_id = ?`,
            [username]
        );
        if (result.rows.length === 0) {
            console.log("no users found")
            return null
        }
        console.log("user info found")
        return result.rows[0];
    } catch (err) {
        console.log("this is the error:\n", err.message)
    }
}