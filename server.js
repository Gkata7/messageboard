var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
mongoose.Promise = global.Promise;
var connection = mongoose.connect('mongodb://localhost/messageboard');


 var MessageSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 4},
  message: {type: String, required: true },
  _Comment: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
  created_at: {type: Date, default: Date.now },
  updated_at: {type: Date, default: Date.now }
});
 mongoose.model('Message', MessageSchema);
 var Message = mongoose.model('Message');

 var CommentSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 4},
  comment: {type: String, required: true },
  _Message: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
  created_at: {type: Date, default: Date.now },
  updated_at: {type: Date, default: Date.now }
});
 mongoose.model('Comment', CommentSchema);
 var Comment = mongoose.model('Comment');


app.get('/', function(req,res){
  Message.find({}).populate('_Comment').exec(function(err,results){
    if (err){
      console.log(err);
    }else {
      console.log("Not Valid!");
      res.render('index', {message: results});
    }
  });
});
app.post('/new',function(req,res){
  var message = new Message(req.body);
  message.save(function(err){
    if(err){
      res.render('index', {errors: message.errors});
    }else {
      res.redirect('/');
    }
  })
})
app.post('/comment/:id',function(req,res){
  Message.findOne({_id: req.params.id}, function(err, message){
    var comment = new Comment(req.body);
    console.log(comment);
    comment._Message = message._id;
    comment.save(function(err){
      message._Comment.push(comment);
      message.save(function(err){
        if (err) {
          res.render('index', {errors: comment.errors})
        }else {
          res.redirect('/');
        }
      })
    })
  })
});
app.listen(8000,function(){
  console.log("listening on port 8000");
})
