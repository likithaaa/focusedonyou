const mongoose = require('mongoose');
const pictures = require('./pictures.js');

const pictureSchema = new mongoose.Schema({
    name:  { type: String, required: true },
    location:  { type: String, required: true },
    camera:  { type: String, required: true },
    image: { type: String},
    isFixed: {type: Boolean, default: false},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});

const Picture = mongoose.model('Picture', pictureSchema);

Picture.deleteMany({isFixed: true}).then(() => {
    for(let i = 0 ; i < pictures.length; i++){
        picture = pictures[i];
        Picture.create({name: picture.name, location: picture.location, camera: picture.camera, image: picture.image, isFixed: true});
    }
})

module.exports = Picture;

