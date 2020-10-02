var express  = require('express');
var router = express.Router();
var Post = require('../models/Post');

// Index
router.get('/', function(req, res){
  let ctgr = req.query.category;
  if(!ctgr){
    Post.find({})
      .populate('author')
      .sort('-createdAt')
      .exec(function(err, posts){
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts});
      });
  }
  else{
    Post.find({category:ctgr})
      .populate('author')
      .sort('-createdAt')
      .exec(function(err, posts){
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts});
    });
  }
});


// New
router.get('/new', function(req, res){
  res.render('posts/new');
});

// create
router.post('/', function(req, res){
  req.body.author = req.user._id;
  Post.create(req.body, function(err, post){
    if(err){
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/new');
    }
    res.redirect('/posts');
  });
});

// show
router.get('/:id', function(req, res){
  Post.findOne({_id:req.params.id}, function(req, post){
    post.views++;
    post.save();
  })
    .populate('author')
    .exec(function(err, post){
      if(err) return res.json(err);
      res.render('posts/show', {post:post});
    });
});

// edit
router.get('/:id/edit', function(req, res){
  Post.findOne({_id:req.params.id}, function(err, post){
    if(err) return res.json(err);
    res.render('posts/edit', {post:post});
  });
});

// update
router.put('/:id', function(req, res){
  req.body.updatedAt = Date.now();
  Post.findOneAndUpdate({_id:req.params.id}, req.body, function(err, post){
    if(err) return res.json(err);
    res.redirect("/posts/"+req.params.id);
  });
});

// destroy
router.delete('/:id', function(req, res){
  Post.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/posts');
  });
});

// nav


module.exports = router;
