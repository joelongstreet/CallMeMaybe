module.exports.routes = {
    '/' : {
        controller: 'main',
        action: 'index'
    },
    '/faq': { 
        controller: 'main',
        action: 'faq'
    },
    '/home' : {
        controller: 'user',
        action: 'home'
    },
    '/signup' : {
        controller: 'main',
        action: 'signup'
    },
    '/signupAction' : {
        controller: 'main',
        action: 'signupAction'
    },
    '/login' : {
        controller: 'main',
        action: 'login'
    },
    '/loginAction' : {
        controller: 'main',
        action: 'loginAction'
    },
    '/logout': { 
        controller: 'main',
        action: 'logout'
    }
};

/*

app.get('/login/:id', user.fakeLogin);

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

*/