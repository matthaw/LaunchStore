const express = require('express');
const routes = express.Router();

const SessionController = require('../app/controllers/SessionController');
const UserController = require('../app/controllers/UserController');
const userValidator = require('../app/validators/user');
const sessionValidator = require('../app/validators/session');

const { isLoggedRedirectToUser, onlyUsers } = require('../app/middlewares/session');

// // Login/logout 
routes.get('/login', isLoggedRedirectToUser, SessionController.loginForm);
routes.post('/login', sessionValidator.login, SessionController.login);
routes.post('/logout', SessionController.logout);

// // reset password / forgot
routes.get('/forgot-password', SessionController.forgotForm);
routes.get('/password-reset', SessionController.resetForm);
routes.post('/forgot-password', sessionValidator.forgot, SessionController.forgot);
routes.post('/password-reset', sessionValidator.reset, SessionController.reset);

// // user register
routes.get('/register', UserController.registerForm);
routes.post('/register', userValidator.post, UserController.post);

routes.get('/', onlyUsers, userValidator.show, UserController.show);
routes.put('/', userValidator.update, UserController.update);
routes.delete('/', UserController.delete);

routes.get('/ads', UserController.ads);

module.exports = routes;