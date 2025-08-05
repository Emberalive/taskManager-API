const express = require('express')
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
            })
        }  else if (password !== confirmPassword) {
            return res.status(400).send({
                registered: false,
            })
        } else {
            const isCreated = await registerUser(connection, username, password);
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
        let {password, username} = req.query;

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
        if ((!validUser) || (validUser.password !== password)) {
            return res.status(400).send({
                loggedIn: false,
            })
        } else {
            console.log("[Login Endpoint] Password verified for user: " + username);
            return res.status(200).send({
                loggedIn: true,
                user: {
                    username: validUser.username,
                    email: validUser.email,
                    bio: validUser.bio
                },
            })
        }
    } catch (err) {
        res.status(500).send({})
        console.error("[Login Endpoint] Error: " + err.message)
    } finally {
        await releaseClient(connection)
    }
})

module.exports = router