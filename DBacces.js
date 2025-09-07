const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: "86.20.86.223",
    user: "samuel",
    password: "QwErTy1243!",
    database: "taskManager",
    port: 5432,
    max: 20,
});


async function getConnection() {
    return await pool.connect();
}

async function releaseClient(client) {
    try {
        if (client) {
            client.release();
        }
    } catch(err) {
        console.error("Error releasing client:", err.message);
    }
}

module.exports = { getConnection, releaseClient, pool };