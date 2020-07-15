const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const port = process.env.PORT || 3000;
const router = express.Router();
app.use(express.json());
const mongoose = require('mongoose');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(express.static('uploads'));
const Comment = require('./Models/commentsSchema.js');
const Picture = require('./Models/pictureSchema.js');
const ObjectId = mongoose.Types.ObjectId
const methodOverride = require('method-override')
require('dotenv').config();
const session = require('express-session');


/////// UPLOAD FORM /////////
const helpers = require('./helpers');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'uploads/');
  },
filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
app.post('/pictures', (req, res) => {
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('upload_pic');
    upload(req, res, function(err) {
      // req.file contains information of uploaded file
      if (req.fileValidationError) {
          return res.send(req.fileValidationError);
      }
      else if (!req.file) {
          return res.send('Please select an image to upload');
      }
      else if (err instanceof multer.MulterError) {
          return res.send(err);
      }
      else if (err) {
          return res.send(err);
      }
      // Display uploaded image for user validation
//       res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
//   });
    let uploadedPic = {
        name:  req.body.name,
        location: req.body.location,
        camera:  req.body.camera,
        image: req.file.filename
    }   
    Picture.create(uploadedPic, (err, pictures)=>{
        console.log(err, pictures)
        res.redirect('/pictures');
        });
    })
});

/////// USER /////////
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
const User = require('./controllers/users_controller.js')
app.use(
    session({
      secret: process.env.SECRET, 
      resave: false, 
      credentials: true,
      saveUninitialized: false 
    })
  )
const isAuthenticated = (req, res, next) => {
    if (req.session.currentUser) {
      return next();    
    } else {
      res.render('sessions/new.ejs');
    }
  }
app.get('/user', isAuthenticated, (req, res) => {
    res.render('sessions/new.ejs', {
      currentUser: req.session.currentUser
    });
  })
app.get('/users', isAuthenticated, (req, res) => {
    res.render('users/new.ejs', {
      currentUser: req.session.currentUser
    });
  })
const userController = require('./controllers/users_controller.js')
app.use('/users', userController)
const sessionsController = require('./controllers/sessions.js')
app.use('/sessions', sessionsController)

app.get('/sessions/new', isAuthenticated, (req, res) => {
    res.render('sessions/new.ejs', {
      currentUser: req.session.currentUser
    });
  })


// EXPRESS TO MONGO
mongoose.connect(process.env.MONGODB_URI + "/uploads", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', ()=> {
    console.log('connected to mongo');
});

// INDEX
app.get('/', (req, res) => {
    res.render('main.ejs');
  });
app.get('/pictures', (req, res) => {
    Picture.find({}, (err, pictures) => {
        res.render('index.ejs', { pictures: pictures, currentUser: req.session.currentUser });
    })
});

// NEW and CREATE
app.get('/pictures/new/', (req, res) => {
    res.render('new.ejs');
  });

// SHOW
app.get('/pictures/:pictureId/comments', (req, res) => {
  Picture.findById(req.params.pictureId).populate('comments').exec(function (err, picture) {
    if(err){
      res.redirect('/pictures');
    } else {
      res.render('comments/show.ejs', {picture: picture, currentUser: (req.session.currentUser && req.session.currentUser.username)});
    }
  })
});

// EDIT and UPDATE
app.post('/pictures/:pictureId/editComment/:commentId', (req, res) => {
  let commentId = req.params.commentId;
  let pictureId = req.params.pictureId;
  Comment.findById(commentId, (err, comment) => {
    if(err){
      res.redirect('/');
    } else {
      comment.comment = req.body.comment;
      comment.save(err => {
        if(err){
          res.redirect('/');
        } else {
          res.redirect(`/pictures/${pictureId}/comments`)
        }
      })
    }
  })
})

// DESTROY
app.get('/pictures/:pictureId/deleteComment/:commentId', (req, res) => {
  let commentId = req.params.commentId;
  let pictureId = req.params.pictureId;
  Picture.findById(pictureId, (err, picture) => {
    if(err){
      res.redirect('/');
    } else {
      const comments = picture.comments.filter(comment => {
        return new ObjectId(comment.id) != commentId;
      })

      picture.comments = comments;
      picture.save(err => {
        if(err){
          res.redirect('/');
        } else {
          res.redirect(`/pictures/${pictureId}/comments`)    
        }
      })
    }
  })
})

app.post('/pictures/:pictureId/comments/new', isAuthenticated, (req, res) => {
  Picture.findById(req.params.pictureId, (err, pic) => {
    if(err){
      res.redirect('/');
    }

    let comment = new Comment({comment: req.body.comment, postedUser: req.session.currentUser.username});
    comment.save();
    pic.comments.push(comment);
    pic.save(err => {
      if(err){
        res.redirect('/');
      } else {
        res.redirect(`/pictures/${pic.id}/comments`);
      }
    })
  })
})

app.get('/aboutUs', (req, res) => {
  res.render('aboutUs.ejs');
});

app.listen(3000, ()=> {
    console.log("I am listening on port " + port + "!");
  });