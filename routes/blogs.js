const User = require('../models/user');
const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const config = require('../config');

router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if(!token) res.json({success : false, message : 'No token provided'});
    else jwt.verify(token, config.secret, (err, decoded) => {
        if(err) res.json({success : false, message : 'Token invalid : '+err});
        else {
            req.decoded = decoded;
            next();
        }
    });
});

router.post('/newBlog', (req, res) => {
    const title = req.body.title;
    const body = req.body.body;
    const createdBy = req.body.createdBy;
    if(!title || !body || !createdBy) res.json({success : false, message : 'All fields are required'});
    else {
        const blog = new Blog({title: title, body: body, createdBy: createdBy});
        blog.save((err) => {
            if(err) res.json({success : false, message : 'Unable to save blog : ', err});
            else res.json({success : true, message : 'Blog saved successfully'});
        });
    }
});

router.get('/allBlogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err) res.json({success : false, message : err});
        else if(!blogs) res.json({success : false, message : 'No blogs found'});
        else res.json({success : true, message : 'Found all blogs', blogs : blogs});
    }).sort({'_id':-1});
});

router.get('/singleBlog/:id', (req, res) => {
    Blog.findOne({_id : req.params.id}, (err, blog) => {
        if(err) res.json({success : false, message : err});
        else if(!blog) res.json({success : false, message : 'Blog not found'});
        else {
            User.findOne({_id : req.decoded.userId}, (err, user) => {
                if(err) res.json({success : false, message : err});
                if(!user) res.json({success : false, message : 'User not found'});
                else if(user.username != blog.createdBy) res.json({success : false, message : 'You are not authorized to edit this blog'});
                else res.json({success : true, message : 'Blog found', blog : blog});
            });
        }
    });
});

router.put('/updateBlog', (req, res) => {
    Blog.findOne({_id : req.body._id}, (err, blog) => {
        if(err) res.json({success : false, message : err});
        else if(!blog) res.json({success : false, message : 'Blog not found'});
        else {
            User.findOne({_id : req.decoded.userId}, (err, user) => {
                if(err) res.json({success : false, message : err});
                if(!user) res.json({success : false, message : 'User not found'});
                else if(user.username != blog.createdBy) res.json({success : false, message : 'You are not authorized to edit this blog'});
                else {
                    blog.title = req.body.title;
                    blog.body = req.body.body;
                    blog.save(blog, (err) => {
                        if(err) res.json({success : false, message : err});
                        else res.json({success : true, message : 'Blog updated successfully'});
                    });
                }
            });
        }
    });
});

router.delete('/deleteBlog/:id', (req, res) => {
    Blog.findOne({_id : req.params.id}, (err, blog) => {
        if(err) res.json({success : false, message : 'Invalid ID'});
        else if(!blog) res.json({success : false, message : 'Blog not found'});
        else {
            User.findOne({_id : req.decoded.userId}, (err, user) => {
                if(err) res.json({success : false, message : err});
                if(!user) res.json({success : false, message : 'User not found'});
                else if(user.username != blog.createdBy) res.json({success : false, message : 'You are not authorized to delete this blog'});
                else {
                    blog.remove((err) => {
                        if(err) res.json({success : false, message : 'Unable to delete blog'});
                        else res.json({success : true, message : 'Blog deleted successfully'});
                    });  
                }
            });
        }
    });
});

router.put('/likeBlog', (req, res) => {
    Blog.findOne({_id : req.body._id}, (err, blog) => {
        if(err) res.json({success : false, message : err});
        else if(!blog) res.json({success : false, message : 'Blog not found'});
        else {
            User.findOne({_id : req.decoded.userId}, (err, user) => {
                if(err) res.json({success : false, message : 'Unable to authenticate user'});
                if(!user) res.json({success : false, message : 'Something went wrong'});
                else {
                    if(user.username === blog.createdBy) res.json({success : true, message : 'Cannot like your own post'});
                    else {
                        if(blog.likedBy.includes(user.username)) res.json({success : true, message : 'You have already liked this post'});
                        else {
                            if(blog.dislikedBy.includes(user.username)) {
                                blog.dislikes--;
                                blog.dislikedBy.splice(blog.dislikedBy.indexOf(user.username), 1);
                            }
                            blog.likes++;
                            blog.likedBy.push(user.username);
                            blog.save((err) => {
                                if(err) res.json({success : false, message : 'Unable to like this post'});
                                else res.json({success : true, message : 'Post liked!'});
                            });
                        }
                    }
                }
            });
        }
    });
});

router.put('/dislikeBlog', (req, res) => {
    Blog.findOne({_id : req.body._id}, (err, blog) => {
        if(err) res.json({success : false, message : err});
        else if(!blog) res.json({success : false, message : 'Blog not found'});
        else {
            User.findOne({_id : req.decoded.userId}, (err, user) => {
                if(err) res.json({success : false, message : 'Unable to authenticate user'});
                if(!user) res.json({success : false, message : 'Something went wrong'});
                else {
                    if(user.username === blog.createdBy) res.json({success : true, message : 'Cannot dislike your own post'});
                    else {
                        if(blog.dislikedBy.includes(user.username)) res.json({success : true, message : 'You have already disliked this post'});
                        else {
                            if(blog.likedBy.includes(user.username)) {
                                blog.likes--;
                                blog.likedBy.splice(blog.likedBy.indexOf(user.username), 1);
                            }
                            blog.dislikes++;
                            blog.dislikedBy.push(user.username);
                            blog.save((err) => {
                                if(err) res.json({success : false, message : 'Unable to dislike this post'});
                                else res.json({success : true, message : 'Post disliked'});
                            });
                        }
                    }
                }
            });
        }
    });
});

router.post('/comment', (req, res) => {
    if(!req.body.comment) res.json({success : false, message : 'No comment provided'});
    else if(!req.body._id) res.json({success : false, message : 'No ID provided'});
    else {
        Blog.findOne({_id : req.body._id}, (err, blog) => {
            if(err) res.json({success : false, message : 'Invalid blog ID'});
            else if(!blog) res.json({success : false, message : 'Blog not found'});
            else {
                User.findOne({_id : req.decoded.userId}, (err, user) => {
                    if(err) res.json({success : false, message : 'Something went wrong'});
                    else if(!user) res.json({success : false, message : 'User not  found'});
                    else {
                        blog.comments.push({
                            comment : req.body.comment,
                            commentator : user.username
                        });
                        blog.save((err) => {
                            if(err) res.json('Unable to post comment');
                            else res.json({success : true, message : 'Comment saved'});
                        });
                    }
                });
            }
        });
    }
});

module.exports = router;