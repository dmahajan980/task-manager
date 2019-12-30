const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task.js')

// Schema for user
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('E-mail is invaild.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password can\'t be password.');
            }
        },
        minlength: 7,
        trim: true
    },
    tokens: [{
        token: {
            required: true,
            type: String
        }
    }]
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Web token generator method
userSchema.methods.generateWebToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'mySecretKey');

    user.tokens = user.tokens.concat({ token });
    await user.save()

    return token;
}

// Produces public data sent to user
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

// Find user by email and password
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login!');
    }

    const isCorrect = await bcrypt.compare(password, user.password);

    if (!isCorrect) {
        throw new Error('Unable to login!');
    }

    return user;
}

// Hash password
userSchema.pre('save', async function(next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

// Delete task before user is deleted
userSchema.pre('remove', async function(next) {
    const user = this;

    await Task.deleteMany({ owner: user._id })

    next()
})

const User = mongoose.model('User', userSchema);

module.exports = User;