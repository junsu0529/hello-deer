var express  = require('express');
var router = express.Router();
var Post = require('../models/Post');
var User = require('../models/User');
var Comment = require('../models/Comment');
var util = require('../util');

// Index
//카테고리 기능 충돌
router.get('/', async function(req, res){
  let ctgr = req.query.category;
  let align = req.query.align;

  if (!align){ align = '-createdAt'}

  if(!ctgr){
    Post.find({})
      .populate('author')
      .sort(align)
      .exec(function(err, posts){
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts, ctgr:''});
      });
  }
  else if(ctgr == '서록관'){
    Post.find({category:['서록1관', '서록2관']})
      .populate('author')
      .sort('-createdAt')
      .exec(function(err, posts){
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts, ctgr:req.query.category});
    });
  }
  else{
    Post.find({category:ctgr})
      .populate('author')
      .sort('-createdAt')
      .exec(function(err, posts){
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts, ctgr:ctgr});
    });
  }
});
//여기까지 충돌합니다.

router.get('/', async function(req, res){ // 1
  var page = Math.max(1, parseInt(req.query.page));   // 2
  var limit = Math.max(1, parseInt(req.query.limit)); // 2
  page = !isNaN(page)?page:1;                         // 3
  limit = !isNaN(limit)?limit:10;                     // 3

  var skip = (page-1)*limit; // 4
  var count = await Post.countDocuments({}); // 5
  var maxPage = Math.ceil(count/limit); // 6
  var posts = await Post.find({}) // 7
    .populate('author')
    .sort('-createdAt')
    .skip(skip)   // 8
    .limit(limit) // 8
    .exec();

  res.render('posts/index', {
    posts:posts,
    currentPage:page, // 9
    maxPage:maxPage,  // 9
    limit:limit       // 9
  });
});


// New
router.get('/new', util.isLoggedin, function(req, res){
  var post = req.flash('post')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('posts/new', { post:post, errors:errors });
});

// create
router.post('/', util.isLoggedin, function(req, res){
  req.body.author = req.user._id;
  Post.create(req.body, function(err, post){
    if(err){
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/new'+res.locals.getPostQueryString()); // 1
    }
    res.redirect('/posts'+res.locals.getPostQueryString(false, {page:1})); //2
  });
});

// show
router.get('/:id', function(req, res){
  var commentForm = req.flash('commentForm')[0] || { _id: null, form: {} };
  var commentError = req.flash('commentError')[0] || { _id:null, parentComment: null, errors:{}};

  Promise.all([
      Post.findOne({_id:req.params.id}).populate({ path: 'author', select: 'username' }),
      Comment.find({post:req.params.id}).sort('createdAt').populate({ path: 'author', select: 'username' })
    ])
    .then(([post, comments]) => {
      var commentTrees = util.convertToTrees(comments, '_id','parentComment','childComments');                               //2
      res.render('posts/show', { post:post, commentTrees:commentTrees, commentForm:commentForm, commentError:commentError}); //2
    })
    .catch((err) => {
      return res.json(err);
    });
 });

// edit
router.get('/:id/edit', util.isLoggedin, checkPermission, function(req, res){
  var post = req.flash('post')[0];
 var errors = req.flash('errors')[0] || {};
 if(!post){
  Post.findOne({_id:req.params.id}, function(err, post){
    if(err) return res.json(err);
    res.render('posts/edit', {post:post, errors:errors});
  });
}
else {
 post._id = req.params.id;
 res.render('posts/edit', { post:post, errors:errors });
}
});

// update
router.put('/:id', util.isLoggedin, checkPermission, function(req, res){
  req.body.updatedAt = Date.now();
  Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){
    if(err){
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/'+req.params.id+'/edit'+res.locals.getPostQueryString()); // 1
    }
    res.redirect('/posts/'+req.params.id+res.locals.getPostQueryString()); // 1
  });
});


// destroy
router.delete('/:id', util.isLoggedin, checkPermission, function(req, res){
  Post.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/posts'+res.locals.getPostQueryString()); // 1
  });
});

// nav


module.exports = router;

// private functions // 1
function checkPermission(req, res, next){
  Post.findOne({_id:req.params.id}, function(err, post){
    if(err) return res.json(err);
    if(post.author != req.user.id) return util.noPermission(req, res);

    next();
  });
}
