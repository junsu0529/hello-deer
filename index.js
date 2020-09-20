var express = require('express');
var mongoose = require('mongoose');
var app = express();
var MONGO_DB = 'mongodb://junsuAdmin:wnstn05@cluster0-shard-00-00.oyj21.mongodb.net:27017,cluster0-shard-00-01.oyj21.mongodb.net:27017,cluster0-shard-00-02.oyj21.mongodb.net:27017/Cluster0?ssl=true&replicaSet=atlas-5qn12e-shard-0&authSource=admin&retryWrites=true&w=majority';

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

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));



var port = 3000;
app.listen(port, function(){ //3000번 포트에 node.js 서버 연결
  console.log('server on! http://localhost:'+port);
});
