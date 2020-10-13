const express = require('express');
const nunjucks = require('nunjucks');
const methodOverride = require('method-override');
const router = require('./routes');
const session = require('./config/session');
const PORT = 3002;
const server = express();

server.use(session);
server.use((request, response, next) => {
    response.locals.session = request.session;
    next();
})
server.use(express.static('public'));
server.use(express.urlencoded({extended: true}));
server.use(methodOverride("_method"));
server.set('view engine', 'njk');
nunjucks.configure('src/app/views', {
    express: server,
    autoescape: false,
    noCache: true
});

// Rotas
server.use(router);

server.listen(PORT, () => {
    console.log(`Server is started in http://localhost:${PORT}`);
})