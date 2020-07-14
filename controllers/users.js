const express = require('express');
const users = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/users.js');

users.get('/users', (req, res) => {
    res.render('users/new.ejs', {
        currentUser: req.session.currentUser
    });
});

users.post('/new', (req, res) => {
    req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    User.create(req.body, (err, createdUser) => {
        console.log('user is created', createdUser);
        res.redirect('/users');
    });
});

module.exports = userRouter;
