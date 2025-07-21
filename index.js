const app = require('express')();
const port = 7000
const cors = require('cors')


const {getConnection, releaseClient} = require('./DBacces')
const {authorizeUser} = require('./DbOps')

//enable cors for specific routes
app.use(cors());

app.get('/login', async (req, res) => {
    const connection = await getConnection();
    try {
        console.log("this is it")
        const {password, username} = req.query;
        if (!username || !password) {
            return res.status(400);
        } else {
            const validUser = await authorizeUser(connection, username);

            if (!validUser) {
                return res.status(401).send({
                    loggedIn: false,
                    error: 'Invalid username or password'
                })
            }

            //simple insecure password check
            if ((validUser.password !== password) || (!validUser)) {
                return res.status(400).send({
                    loggedIn: false,
                })
            } else {
                return res.status(200).send({
                    loggedIn: true,
                    user: validUser,
                })
            }
        }
    } catch (err) {
        res.status(500).send({})
        console.log("This is the error:\n" + err.message)
    } finally {
        await releaseClient(connection)
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})