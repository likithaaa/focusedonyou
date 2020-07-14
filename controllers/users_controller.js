const bcrypt = require('bcrypt')
const express = require('express')
const users = express.Router()

const User = require('../models/users.js')

const isAuthenticated = (req, res, next) => {
  if (req.session.currentUser) {
    return next();
  } else {
    res.render('sessions/new.ejs');
  }
}

users.get('/user', isAuthenticated,(req, res) => {
  res.render('controllers/user.js', {
    currentUser: req.session.currentUser
  })
})

users.post('/user', (req, res) => {
  console.log(req.body)
  req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
  User.create(req.body, (err, createdUser) => {
    res.redirect('/')
  })
})

module.exports = users