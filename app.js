const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const authentication = require('./routes/authentication');
const blogs = require('./routes/blogs');
const path = require('path');

mongoose.connect(config.database_uri, (err) => {
    if(err) console.log('Unable to connect to database : ', err);
    else console.log('Successfully connected to database');
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(__dirname + '/client'));
app.use('/authentication', authentication);
app.use('/blogs', blogs);
app.get('*', (req, res) => res.sendFile(path.join(__dirname + '/client/index.html')));

port = process.env.port || 8080;
app.listen(port, () => {console.log(`Server listening at port : ${port}`);});