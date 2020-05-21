const mongoose = require('mongoose');
const joi = require('@hapi/joi');
const joigoose = require('joigoose')(mongoose);

const schema = joi.object({
    email : joi.string().email().required(),
    username : joi.string().min(5).max(30).required(),
    password : joi.string().min(5).max(30).required()
});

const userSchema = joigoose.convert(schema);
userSchema.email.unique = true;
userSchema.username.unique = true;
const User = module.exports = mongoose.model('User', userSchema);