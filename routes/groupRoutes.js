const express = require('express')
const router = express.Router()
const {
    getGroups,
    createGroup,
    deleteGroup,
} = require('../DbOps')

const {
    getConnection,
    releaseClient
} = require('../DBacces')

//create Group
router.post('/', async (req, res) => {
    console.log("[Create Group Endpoint] Starting group creation")
    const connection = await getConnection();
    console.log("[Create Group Endpoint] Creating group for user: " + req.body.username)
    try {
        console.log("[Create Group Endpoint] Calling database operation")
        const result = await createGroup(connection, req.body.username, req.body.groupName);
        if (result.success) {
            console.log("[Create Group Endpoint] Group created successfully:", result)
            return res.status(200).send({
                success: true
            })
        } else {
            return res.status(400).send({
                success: false
            })
        }
    } catch (err) {
        console.error("[Create Group Endpoint] Error creating group for user: " + req.body.username + " - " + err.message);
        res.status(500).send({
            success: false
        })
    }
})

//Get Groups
router.get('/', async (req, res) => {
    console.log("[Get Groups Endpoint] Starting group retrieval")
    const connection = await getConnection();
    console.log("[Get Groups Endpoint] Retrieving groups for user: " + req.query.username)

    try {
        const result = await getGroups(connection, req.query.username)
        if (result.success) {
            res.status(200).send({
                success: true,
                groups: result.groups
            })
        } else {
            res.status(400).send({
                success: false
            })
        }
    } catch (err) {
        console.error("[Get Groups Endpoint] Error retrieving groups for user: " + req.query.username  + " - " + err.message);
        res.status(500).send({
            success: false
        })
    }
})


//delete Group
router.delete('/', async (req, res) => {
    console.log("[Delete Group Endpoint] Starting group deletion")
    const connection = await getConnection();
    try {
        const { group, username } = req.query;
        console.log(`[Delete Group Endpoint] Attempting to delete group: ${group} for user: ${username}`);

        if (!group || !username) {
            return res.status(400).send({
                success: false
            });
        }

        const result = await deleteGroup(connection, group, username);

        if (result.success) {
            console.log("[Delete Group Endpoint] Group deleted successfully");
            return res.status(200).send({
                success: true
            });
        } else {
            console.log("[Delete Group Endpoint] Could not delete group");
            return res.status(500).send({
                success: false
            });
        }
    } catch (err) {
        console.error("[Delete Group Endpoint] Error: " + err.message);
        res.status(500).send({
            success: false
        });
    } finally {
        await releaseClient(connection);
    }
})

module.exports = router;