const express = require('express')
const bcrypt = require('bcrypt')
const saltRounds = 10

const router = express.Router()
const {
    patchUserData, registerUser, authorizeUser,

} = require('../DbOps')

const {
    getConnection,
    releaseClient
} = require('../DBacces')


// update profile
router.patch('/', async (req, res) => {
    const connection = await getConnection();
    console.log("[Profile Endpoint] Starting profile update for user: " + req.body.username);

    try {
        if (req.body.newUserData) {
            const result = await patchUserData(connection, req.body.newUserData, req.body.username)


            if (result) {
                return res.status(201).send({
                    success: true
                })
            } else {
                return res.status(400).send({
                    success: false,
                })
            }
        } else {
            res.status(400).send({
                success: false
            })
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            error: err.message
        })
    }
})

//register user, POST
router.post('/', async (req, res) => {
    console.log("[Register Endpoint] Starting registration process")
    const connection = await getConnection();
    try {
        const {username, password, confirmPassword} = req.body;

        if (!username || !password || !confirmPassword) {
            return res.status(400).send({
                registered: false,
                error: "Username and password is required"
            })
        }  else if (password !== confirmPassword) {
            return res.status(400).send({
                registered: false,
            })
        } else {
            const hashedPass = await bcrypt.hash(password, saltRounds)
            const isCreated = await registerUser(connection, username, hashedPass);
            if (isCreated.registered) {
                return res.status(200).send({
                    registered: true,
                })
            }
        }
    } catch (err) {
        console.error("[Register Endpoint] Error: " + err.message);
        res.status(500).send({
            registered: false,
        })
    } finally {
        await releaseClient(connection)
    }
});

//Logging in GET
router.get('/', async (req, res) => {
    const connection = await getConnection();
    let validUser = {};
    try {
        console.log("[Login Endpoint] Starting login process")
        let {password, username, stayLoggedIn} = req.query;

        if (!username || !password) {
            return res.status(400).send({})
        }
        username = username.trim();
        password = decodeURIComponent(password).trim();

        console.log("[Login Endpoint] Request received for user: " + username);
        console.log("[Login Endpoint] Verifying parameters")
        if (username && password) {
            console.log("[Login Endpoint] Verifying user details for: " + username)
            validUser = await authorizeUser(connection, username);

            if (!validUser) {
                return res.status(401).send({
                    loggedIn: false,
                    error: 'Invalid username or password'
                })
            }
        } else {
            console.warn("[Login Endpoint] Received incorrect parameters")
            return res.status(400);
        }
        //simple insecure password check

        console.log("[Login Endpoint] Verifying password");
        if (!validUser) {
            return res.status(400).send({
                loggedIn: false,
            })
        } else{
            const isMatch = await bcrypt.compare(password, validUser.password);

            console.log("[Login Endpoint] Password verified for user: " + username);

            if (stayLoggedIn) {
                //create jwt token, call a function
                //then send data with token
            } else {
                return res.status(isMatch? 200: 400).send(isMatch ?{
                    loggedIn: true,
                    user: {
                        username: validUser.username,
                        email: validUser.email,
                        bio: validUser.bio
                    },
                }: {
                    loggedIn: false,
                })
            }
        }
    } catch (err) {
        res.status(500).send({})
        console.error("[Login Endpoint] Error: " + err.message)
    } finally {
        await releaseClient(connection)
    }
})

module.exports = router