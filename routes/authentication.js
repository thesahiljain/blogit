const User = require('../models/user');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const config = require('../config');

router.post('/register', (req, res) => {
    email = req.body.email;
    username = req.body.username;
    password = req.body.password;

    if(!email || !username || !password) {
        res.json({success : false,  message : 'All required fields must be present'});
        return;
    }

    new User({email:email.toLowerCase(), username:username.toLowerCase(), password:password}).save((err) => {
        if(err) res.json({success : false, message : err});
        else res.json({success : true, message : 'User added to database'});
    });
});

router.post('/login', (req, res) => {
    username = req.body.username;
    password = req.body.password;

    if(!username || !password) {
        res.json({success : false,  message : 'All required fields must be present'});
        return;
    }

    User.findOne({username: username}, (err, user) => {
        if(err) res.json({success : false, message : err});
        else if(!user) res.json({succees : false, message : 'Username not found'});
        else if(user.password != password) res.json({success : false, message : 'Password incorrect'});
        else {
            const token = jwt.sign({userId : user._id}, config.secret, {expiresIn: '24h'});
            res.json({success : true, message : 'Successful login', token:token, user: {username:user.username}});
        }
    });
});

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

router.get('/profile', (req, res) => {
    User.findOne({_id : req.decoded.userId}).select('username email').exec((err, user) => {
        if(err) res.json({success : false, message : err});
        else if (!user) res.json({success : false, message : 'User not found'});
        else res.json({success : true, message : 'User profile found', user : user});
    });
});

module.exports = router;