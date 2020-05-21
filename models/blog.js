const mongoose = require('mongoose');
const joi = require('@hapi/joi');
const joigoose = require('joigoose')(mongoose);

const commentSchema = joi.object({
    comment : joi.string().min(1).max(200),
    commentator : joi.string()    
});

const schema = joi.object({
    title : joi.string().required().min(5).max(50),
    body : joi.string().required().min(5).max(1000),
    createdBy : joi.string(),
    createdAt : joi.date().default(Date.now()),
    likes : joi.number().default(0),
    likedBy : joi.array(),
    dislikes : joi.number().default(0),
    dislikedBy : joi.array(),
    comments : joi.array().items(commentSchema)
});

const blogSchema = joigoose.convert(schema);
const Blog = module.exports = mongoose.model('Blog', blogSchema);