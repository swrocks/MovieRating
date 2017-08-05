var mongoose = require('mongoose');  
var blobSchema = new mongoose.Schema({  
  title: String,
  rating: Number,
  watched: Boolean
});
mongoose.model('movie', blobSchema);