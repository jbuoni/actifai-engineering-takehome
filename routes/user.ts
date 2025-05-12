import { updateUser, addUser, getUserById, getUsers, deleteUser } from '../db/users';

import { Router } from 'express';

const router = Router();

// Get all users
router.get('/', async (req, res) => {
    console.log('Get all users');
    try {
        const users = await getUsers()
        res.send(users);
    } catch (error) {
        console.error('Error getting users:', error);
        return res.status(500).send(`Error getting users:${JSON.stringify(error)}`);
    }
});

// Get a single user by ID
router.get('/:id', async (req, res) => {
    console.log(`Get user by id: ${req.params.id}`);
    const userId = req.params.id;
    try {
        const user = await getUserById(userId);
        res.send(user);
    } catch (error) {
        console.error('Error getting user:', error);
        return res.status(500).send(`Error getting user:${JSON.stringify(error)}`);
    }
});

// Create a new user
router.post('/', async (req, res) => {
    const { name, role } = req.body;

    if (!name || ! role) {
        return res.status(400).send('Name and role are required');
    }
    
    console.log(`Create user with name: ${name}`);

    try {
        const user = await addUser(name, role);
        res.send(`Update user with ID: ${user.id}, Data: ${JSON.stringify(user)}`);
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).send(`Error creating user:${JSON.stringify(error)}`);
    }
});

// Update a user by ID
router.put('/:id', async (req, res) => {
    const { name, role } = req.body;

    console.log(`Updating user with id: ${req.params.id}, name: ${name}`);

    try {
        const user = await updateUser(req.params.id, name, role);
        res.send(`Update user with ID: ${user.id}, Data: ${JSON.stringify(user)}`);
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).send(`Error updating user:${JSON.stringify(error)}`);
    }
    
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        await deleteUser(userId);
        res.send(`Delete user with ID: ${userId}`);
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).send(`Error deleting user:${JSON.stringify(error)}`);
    }
});

module.exports = router;