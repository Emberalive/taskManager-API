import {
    getConnection,
    releaseClient
} from '../DBacces.js'

const client = await getConnection()

process.on('SIGINT', async () => {
    console.log('Process interrupted. Closing DB pool...');
    await releaseClient(client);
    process.exit(0);
});

async function getReminders (connection) {

    try {
        // const query = `SELECT task.description, task.title, task.username, task.remind_date, task.id, users.email FROM task LEFT JOIN users ON task.username = users.username WHERE task.reminded = $1 AND task.remind_date IS NOT NULL`;
        // const value = 'false';
        // const result = await connection.query({
        //     text: query,
        //     values: [value],
        // });

        const result = await client.query(`SELECT task.description, task.title, task.username, task.remind_date, task.id, users.email FROM task LEFT JOIN users ON task.username = users.username WHERE task.reminded = 'false' AND task.remind_date IS NOT NULL`)

        const today = new Date();

        const month = today.getMonth() + 1
        const date = today.getDate()
        const year = today.getFullYear()
        const onlyDate = `${date}/${month}/${year}`


        if (result.rows.length > 0) {
            console.info(`[Worker] - Reminders ${result.rows.length} rows`);
            for (let row of result.rows) {
                if (row.remind_date === onlyDate) {
                    const task_id = row.id
                    connection.query(`UPDATE task SET reminded = TRUE WHERE id = $1`, [task_id])
                    console.info(`[Worker] - Reminder sent for task: ${task_id}`)
                }
            }
        } else {
            console.error("[Worker] - There are no tasks to be reminded of for date: " + onlyDate);
        }
    } catch (e) {
        // await releaseClient(connection);
        console.error("[Worker] - Error getting reminders: \n" + e.message)
    }
}

await getReminders(client)

setInterval(async ()  => getReminders(client), 60 * 1000)

console.log('[Worker] Task reminder worker started.');