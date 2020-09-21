var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var app = express();
var MONGO_DB = 'mongodb+srv://junsuAdmin:wnstn05@deercluster.o9yl3.mongodb.net/DeerCluster?retryWrites=true&w=majority';

//DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(MONGO_DB);
var db = mongoose.connection;
db.once('open', function(){
  console.log('DB connected');
});
db.on('error', function(err){
  console.log('DB ERROR : ',err);
});

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

// Routes
app.use('/', require('./routes/home'));

// Port setting
var port = 3000;
app.listen(port, function(){ //3000번 포트에 node.js 서버 연결
  console.log('server on! http://localhost:'+port);
});
