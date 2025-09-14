const {
    getConnection,
    releaseClient
} = require('../DBacces.js')

const {format, parseISO} = require("date-fns")
const nodemailer = require('nodemailer')
const dotenv = require('dotenv');
const path = require('path');
const {getLogger} = require("nodemailer/lib/shared");
dotenv.config({ path: path.resolve('../.env') });

dotenv.config();

let client;

async function startWorker() {
    try{
        client = await getConnection();

        process.on('SIGINT', async () => {
            console.log('Process interrupted. Closing DB pool...');
            await releaseClient(client);
            process.exit(0);
        });

        await getReminders(client);

        setInterval(async () => getReminders(client), 60 * 1000);
    } catch(e) {
        console.error(`Error getting connection to the database: ${e.message}`);
    }
}

async function getReminders (connection) {

    try {

        const result = await client.query(`SELECT task.description, task.title, task.username, task.remind_date, task.id, users.email FROM task LEFT JOIN users ON task.username = users.username WHERE task.reminded = 'false' AND task.remind_date IS NOT NULL`)

        const today = format(new Date(), "yyyy-MM-dd");

        console.log('[Worker] Task reminder worker started.');

        if (result.rows.length > 0) {
            console.info(`[Worker] - Reminders ${result.rows.length} rows`);
            for (let row of result.rows) {
                //parses date format in database to Date.now() format, so i can check it
                const dbDate = parseISO(row.remind_date);
                const dbDay = format(dbDate, "yyyy-MM-dd");

                console.log(`Today's date: ${format(new Date(), "yyyy-MM-dd")}`);
                console.log(`[Worker] - Checking date for task ${row.id}, with date: ${dbDay}`);

                const { id: task_id, title: task_title, description: task_description } = row;


                if (dbDay === today) {

                    if (task_id && task_description && task_title) {
                        let transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: process.env.EMAIL_USER,
                                pass: process.env.EMAIL_PASS
                            }
                        });

                        const email = await transporter.sendMail({
                            from: '"Sparkr - Task Manager" <sparkr.emberalive@gmail.com>',
                            to: row.email,
                            subject: row.title,
                            text: row.description // plain‑text body
                        });

                        connection.query(`UPDATE task SET reminded = TRUE WHERE id = $1`, [task_id])

                        console.info(`[Worker] - Reminder sent for task: ${task_id} \n      Email: ${email.messageId} \n`)
                        console.log("")
                    } else {
                        console.error(`[Worker] - Reminder unsent for task (incorrect parameters received): ${task_id}`)
                    }
                } else {
                    console.log(`reminder for task: ${task_id} was not today`)
                }
                console.log("Next reminder to be checked")
            }
        } else {
            console.error(
                "[Worker] - There are no tasks to be reminded of for date: " +
                today // local YYYY-MM-DD
            );
        }
    } catch (e) {
        console.error("[Worker] - Error getting reminders: \n" + e.message)
    }
}

startWorker().catch(error => console.error(error))