
module.exports = {
    authorizeUser
}

// async function authorizeUser (client, username) {
//     if (!client) {
//         console.log("connection not established")
//         return false
//     }
//     try {
//         //setting a timeout promise
//         const timeoutMs = 5000
//         const timeoutPromise = setTimeout(async () => {
//             setTimeout(() => {
//                 return(new Error('Timeout'))
//             }, timeoutMs)
//         })
//         console.log("getting user info")
//         const result = await Promise.race([
//             client.query(`SELECT * FROM users WHERE username = $1`, [username]),
//             timeoutPromise
//         ]);
//
//         if (result.rows.length === 0) {
//             console.log("no users found")
//             return null
//         }
//         console.log("user info found")
//         return result.rows[0];
//     } catch (err) {
//         console.log("this is the error:\n", err)
//         throw err;
//     }
// }
async function authorizeUser(client, username) {
    // Validate client connection
    if (!client || !client._connected) {
        console.error("Database connection not established");
        throw new Error("Database connection error");
    }

    try {
        console.log(`Querying user: ${username}`);

        // Create timeout promise
        const timeoutMs = 5000;
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Database query timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        });

        // Execute query with timeout
        const result = await Promise.race([
            client.query(`SELECT * FROM users WHERE username = $1`, [username]),
            timeoutPromise
        ]);

        // Validate result structure
        if (!result?.rows) {
            console.error("Invalid query result format");
            throw new Error("Database returned invalid response");
        }

        // Check if user exists
        if (result.rows.length === 0) {
            console.log("No user found");
            return null;
        }

        console.log("User found:", result.rows[0].username);
        return result.rows[0];

    } catch (err) {
        console.error("Authorization failed:", {
            error: err.message,
            query: err.query || `SELECT * FROM users WHERE username = $1`,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
        throw err; // Re-throw for the calling function to handle
    }
}
