const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

function dispose (client) {
    client.end()
}

module.exports = { client, dispose }


// async function connectDB () {
//     console.log("attempting to connect to database\n");
//     try {
//         return await new Client({
//             host: process.env.DB_HOST,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASS,
//             database: process.env.DB_NAME,
//             port: process.env.DB_PORT,
//         })
//     } catch (err) {
//         console.error("This is the error:\n" + err.message);
//         return null
//     }
// }