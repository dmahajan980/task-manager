const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth.js')

// Login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateWebToken();
        res.send({ user: user, token });
    }
    catch (error) {
        res.status(400).send(error);
    }
})

// Logout user from current device
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(tokenObj => {
            return tokenObj.token !== req.token
            
        })
        await req.user.save();
        res.status(200).send('Logged out successfully!')
    }
    catch (error) {
        res.status(500).send(error)
    }
})

// Logout user from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    console.log()
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send('Logged out from all devices successfully');
    }
    catch (error) {
        res.status(500).send(error);
    }
})

// Create user
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        const token = await user.generateWebToken();

        // Sends the user and the generated token only
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// List/read user's profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// Update a user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete a user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router