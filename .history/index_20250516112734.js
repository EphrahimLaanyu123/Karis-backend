const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
require('dotenv').config(); // Load environment variables from .env file

// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Please enter your email address'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: 8,
        select: false // Exclude password from query results by default
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash the password before saving the user
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateToken = function() {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: '7d' // Token expires in 7 days
    });
};

// Create the User model
const User = mongoose.model('User', userSchema);

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_ATLAS_URI;
        if (!mongoURI) {
            throw new Error('MONGO_ATLAS_URI is not defined in the environment variables.');
        }
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1); // Exit the process if connection fails
    }
};

connectDB();

// User registration controller
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email is already registered
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Create the new user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate JWT token
        const token = user.generateToken();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
};

// Example usage (assuming this is part of an Express.js application)
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

//  Register User endpoint
app.post('/api/users/register', registerUser);

//  start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Error handling middleware (optional, but recommended)
app.use((err, req, res, next) => {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = { connectDB, User, registerUser }; // For testing or other modules
