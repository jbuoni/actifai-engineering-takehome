import {
    addGroup,
    addUserToGroup,
    deleteGroup,
    getGroupById,
    getGroups,
    updateGroup
} from '../db/groups';

import * as express from 'express';

const router = express.Router();

// Get all groups
router.get('/', async (req, res) => {
    console.log('Get all groups');
    try {
        const groups = await getGroups()
        res.send(groups);
    } catch (error) {
        console.error('Error getting groups:', error);
        return res.status(500).send(`Error getting groups:${JSON.stringify(error)}`);
    }
});

// Get a single group by ID
router.get('/:id', async (req, res) => {
    console.log(`Get group by id: ${req.params.id}`);
    const groupId = req.params.id;
    
    try {
        const group = await getGroupById(groupId);
        res.send(group);
    } catch (error) {
        console.error('Error getting group:', error);
        return res.status(500).send(`Error getting group:${JSON.stringify(error)}`);
    }
});

// Create a new group
router.post('/', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).send('Name is required');
    }
    
    console.log(`Create group with name: ${name}`);

    try {
        const group = await addGroup(name);
        res.send(`Update group with ID: ${group.id}, Data: ${JSON.stringify(group)}`);
    } catch (error) {
        console.error('Error creating group:', error);
        return res.status(500).send(`Error creating group:${JSON.stringify(error)}`);
    }
});

// Update a group by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    
    console.log(`Updating group with id ${id}. New name: ${name}`);

    try {
        const group = await updateGroup(id, name);
        res.send(`Update group with ID: ${group.id}, Data: ${JSON.stringify(group)}`);
    } catch (error) {
        console.error('Error creating group:', error);
        return res.status(500).send(`Error creating group:${JSON.stringify(error)}`);
    }
});

// Delete a group by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await deleteGroup(id);
        res.send(`Deleted group with ID: ${id}`);
    } catch (error) {
        console.error('Error deleting group:', error);
        return res.status(500).send(`Error deleting group:${JSON.stringify(error)}`);
    }
});

router.post('/:groupId/add/user/:userId/', async (req, res) => {
    const { groupId, userId } = req.params;
    console.log(`Add user with id ${userId} to group with id ${groupId}`);
    try {
        const group = await addUserToGroup(groupId, userId);
        res.send(`Added user with ID: ${userId} to group with ID: ${groupId}, Data: ${JSON.stringify(group)}`);
    } catch (error) {
        console.error('Error adding user to group:', error);
        return res.status(500).send(`Error adding user to group:${JSON.stringify(error)}`);
    }
});

module.exports = router;