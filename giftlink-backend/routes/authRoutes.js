// Step 1 - Task 2: Import necessary packages
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const dotenv = require('dotenv');
const pino = require('pino');

dotenv.config();

const router = express.Router();

// Step 1 - Task 3: Create a Pino logger instance
const logger = pino();

// Step 1 - Task 4: Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// ===================== REGISTER =====================

router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase();

        // Task 2: Access MongoDB `users` collection
        const collection = db.collection('users');

        // Task 3: Check for existing email
        const existingEmail = await collection.findOne({
            email: req.body.email
        });

        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({
                error: 'Email id already exists'
            });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        // Task 4: Save user details in database
        const newUser = await collection.insertOne({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash,
            createdAt: new Date()
        });

        // Task 5: Create JWT authentication with user._id as payload
        const payload = {
            user: {
                id: newUser.insertedId
            }
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');

        res.json({
            authtoken,
            email: req.body.email
        });

    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

// ===================== LOGIN =====================

router.post('/login', async (req, res) => {
    try {
        // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase`
        const db = await connectToDatabase();

        // Task 2: Access MongoDB `users` collection
        const collection = db.collection('users');

        // Task 3: Check for user credentials in database
        const user = await collection.findOne({
            email: req.body.email
        });

        // Task 7: Send appropriate message if user not found
        if (!user) {
            logger.error('User not found');
            return res.status(400).json({
                error: 'Invalid credentials'
            });
        }

        // Task 4: Check if password matches encrypted password
        const passwordCompare = await bcryptjs.compare(
            req.body.password,
            user.password
        );

        if (!passwordCompare) {
            logger.error('Password mismatch');
            return res.status(400).json({
                error: 'Invalid credentials'
            });
        }

        // Task 5: Fetch user details
        const userName = `${user.firstName} ${user.lastName}`;
        const userEmail = user.email;

        // Task 6: Create JWT authentication with user._id as payload
        const payload = {
            user: {
                id: user._id
            }
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User logged in successfully');

        res.json({
            authtoken,
            userName,
            userEmail
        });

    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});


// ===================== UPDATE PROFILE

// Task 1: Use the `body` and `validationResult` from `express-validator` for input validation
// (Note: This package statement is already declared at the top of your file)
// const { body, validationResult } = require('express-validator');[cite: 5]

router.put('/update', [
    // Define sanitization rules for incoming profile data
    body('firstName').notEmpty().withMessage('First name cannot be empty'),
    body('lastName').notEmpty().withMessage('Last name cannot be empty')
], async (req, res) => {
    
    // Task 2: Validate the input using `validationResult` and return appropriate message if there is an error.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Profile update validation failed');[cite: 5]
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Task 3: Check if `email` is present in the header and throw an appropriate error message if not present.
        const userEmail = req.headers.email;
        if (!userEmail) {
            logger.error('Authentication email header missing');[cite: 5]
            return res.status(400).json({ error: 'Email header is required for profile updates' });
        }

        // Task 4: Connect to MongoDB and access users collection
        const db = await connectToDatabase();[cite: 5]
        const collection = db.collection('users');[cite: 5]

        // Task 5: find user credentials in database
        const existingUser = await collection.findOne({ email: userEmail });[cite: 5]
        if (!existingUser) {
            logger.error('No user found matching the provided header email');[cite: 5]
            return res.status(404).json({ error: 'User profile not found' });
        }

        // Preserve your template timestamp modification structure
        existingUser.updatedAt = new Date();[cite: 5]

        // Task 6: update user credentials in database
        await collection.updateOne(
            { email: userEmail },
            {
                $set: {
                    firstName: req.body.firstName,[cite: 5]
                    lastName: req.body.lastName,[cite: 5]
                    updatedAt: existingUser.updatedAt
                }
            }
        );

        // Task 7: create JWT authentication with user._id as payload using secret key from .env file
        const payload = {
            user: {
                id: existingUser._id[cite: 5]
            }
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);[cite: 5]

        logger.info('User profile successfully updated and token re-issued');[cite: 5]
        res.json({ authtoken });

    } catch (e) {
        logger.error(e);[cite: 5]
        return res.status(500).send('Internal server error');[cite: 5]
    }
});

module.exports = router;