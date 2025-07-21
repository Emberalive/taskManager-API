const app = require('express')();
const port = 7000
const cors = require('cors')


const {client, dispose} = require('./DBacces')
const {authorizeUser} = require('./DbOps')

//enable cors for specific routes
const allowedOrigins = [
    'http://192.168.0.134:5173', // React dev server
];

app.use(cors({
    origin: allowedOrigins, // Only allow these domains
    methods: ['GET', 'POST'], // Allowed HTTP methods
    credentials: true, // Enable cookies/auth headers (if needed)
}));
app.post('/register', (req, res) => {
    try {
        console.log("attempting to register");

        const { username } = req.body;
        const { password } = req.body;
        const { secondPassword } = req.body;

        if (!username || !password) {
            return res.status(400).send({
                error: 'username and password is required',
            })
        } else if (password !== secondPassword) {
            return res.status(400).send({
                error: 'password doesn\'t match',
            })
        } else {
            //add the user to the database
        }
    }catch(err) {
        res.status(500).send({})
        console.log("This is error:\n" + err.message)
    }finally {
        // dispose(client)
    }
})

app.get('/login', (req, res) => {
    try {
        console.log("this is it")
        const { password, username } = req.query;

        if (!username || !password) {
            return res.status(400);
        } else {
            const validUser = authorizeUser(client, username);

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
        // dispose(client)
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})