const bcrypt = require('bcrypt')
const express = require('express')
const sessions = express.Router()
const User = require('../models/users.js')

sessions.get('/user', (req, res) => {
  res.render('sessions/users.ejs', 
  { currentUser: req.session.currentUser })
})

// on sessions log in
sessions.post('/new', (req, res) => {
  User.findOne({ username: req.body.username }, (err, foundUser) => {
    if (err) {
      console.log(err)
      res.send('oops the db had a problem')
    } else if (!foundUser) {
      res.send('<a  href="/pictures">Sorry, no user found </a>')
    } else {
   
      if (bcrypt.compareSync(req.body.password, foundUser.password)) {
        req.session.currentUser = foundUser
        res.redirect('/pictures')
      } else {
        res.send('<a href="/pictures"> password does not match </a>')
      }
    }
  })
})

// logout
sessions.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

module.exports = sessions