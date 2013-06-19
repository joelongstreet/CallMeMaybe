
/**
 * Module dependencies.
 */
try {
  require('nodefly').profile(
      process.env.NODEFLY_KEY || '',
      'callmemaybe'
  );
}catch(e){ }

var express = require('express')
  , routes = require('./routes')
  , hooks = require('./routes/hooks')
  , user = require('./routes/user')
  , utils = require('./routes/utils')
  , Voice = require('./routes/voice')
  , http = require('http')
  , path = require('path')
  , mailbox = require('./routes/mailbox')
  , db = require('./config/dbschema')
  , pass = require('./config/pass')
  , passport = require('passport');
var voice = new Voice({
  persona: { gender: 'male', language: 'en-gb' }
});
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/login/:id', user.fakeLogin);

// Utils
  app.get('/', routes.index);
  app.get('/faq', utils.faq);
  app.get('/callme', utils.callme);
  app.get('/error', function(req, res){
    console.log('error');
  });
  app.post('/error', function(req, res){
    console.log('error');
  });

// Users
  app.get('/users', user.list);
  app.get('/user/create', user.newuser);
  app.get('/user/login', user.login);
  app.get('/user/home', user.home);
app.get('/postlogin1', user.login);
app.post('/postlogin1', user.postlogin);

// Voice
  app.all('/voice', function(req,res){ voice.gotoRoute.call(voice, req, res); });
  app.all('/voice/*', function(req,res){ voice.gotoRoute.call(voice, req, res); });

// Returns latest message in your inbox
  app.post('/message', user.getSession, mailbox.message);
  app.get('/message', user.getSession, mailbox.message);

// Get Message by id
  app.post('/message/id/:messageid', mailbox.message);
  app.get('/message/id/:messageid', mailbox.message);

// Get the next message  
  app.post('/message/next', user.getSession, mailbox.nextmessage);
  app.get('/message/next', user.getSession, mailbox.nextmessage);

// Call a phone number and read a message
  app.get('/call', user.getSession, mailbox.call);

// Context Web Hooks
  app.get('/hook/create', user.getSession, hooks.create);
  app.get('/hook/delete/:hookId', user.getSession, hooks.deleteMe);
  app.post('/hook/reveal', hooks.reveal);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});