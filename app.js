
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
  , userRoutes = require('./routes/user')
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

// Utils
app.get('/', pass.ensureAuthenticated, userRoutes.home);

app.get('/faq', utils.faq);
app.get('/callme', utils.callme);
app.get('/error', function(req, res){
  console.log('error');
});
app.post('/error', function(req, res){
  console.log('error');
});

// User
app.post('/user/create', userRoutes.postnewuser);
app.get('/user/create', userRoutes.getnewuser);
app.get('/user/connect', pass.ensureAuthenticated, mailbox.connect);
app.post('/login', userRoutes.postlogin);  
app.get('/login', userRoutes.getlogin);
app.get('/logout', userRoutes.logout);


// Voice
  app.all('/voice', function(req,res){ voice.gotoRoute.call(voice, req, res); });
  app.all('/voice/*', function(req,res){ voice.gotoRoute.call(voice, req, res); });

// Returns latest message in your inbox
  app.post('/message', userRoutes.userSession, mailbox.message);
  app.get('/message', userRoutes.userSession, mailbox.message);

// Get Message by id
  app.post('/message/id/:messageid', mailbox.message);
  app.get('/message/id/:messageid', mailbox.message);

// Get the next message  
  app.post('/message/next', userRoutes.userSession, mailbox.nextmessage);
  app.get('/message/next', userRoutes.userSession, mailbox.nextmessage);

// Call a phone number and read a message
  app.get('/call', userRoutes.userSession, mailbox.call);

// Context Web Hooks
  app.get('/hook/create', userRoutes.userSession, hooks.create);
  app.get('/hook/delete/:hookId', userRoutes.userSession, hooks.deleteMe);
  app.post('/hook/reveal', hooks.reveal);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});