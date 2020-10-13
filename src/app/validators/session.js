const { compare } = require('bcryptjs');
const User = require('../model/User');

async function login(request, response, next) {
  const { email, password } = request.body;

  const user = await User.findOne({ where: { email } });

  if (!user) return response.render('session/login', { user: request.body, error: 'Usuário não cadastrado!' })

  const passed = await compare(password, user.password);

  if (!passed) {
    return response.render('session/login', { user: request.body, error: 'Senha incorreta!' });
  }

  request.user = user;

  next();
}

async function forgot(request, response, next) {
  const { email } = request.body;

  try {
    let user = await User.findOne({ where: { email } })
    if (!user) return response.render('session/forgot-password', { error: 'Email não cadastrado!' })

    request.user = user;

    next();
  } catch (err) {
    console.error(`Validator :: session :: forgot :: ${err}`);
  }
}

async function reset(request, response, next) {
  const { email, password, passwordRepeat, token } = request.body;

  // Procura usuario
  const user = await User.findOne({ where: { email } });

  if (!user) return response.render('session/password-reset', { user: request.body, token, error: 'Usuário não cadastrado!' })

  // Comparando as senhas
  if (password !== passwordRepeat) {
    return response.render('session/password-reset', {error: 'Senhas incorretas.', user: request.body, token});
  }

  // verifcar se o token são iguais
  if (token !== user.reset_token) {
    return response.render('session/password-reset', {error: 'Token invalido! Solicite uma nova recuperação de senha'});
  }

  // verificar se o token não expirou
  let now = new Date();
  now = now.setHours(now.getHours())
  if (now > user.reset_token.expires) {
    if (token != user.reset_token) return response.render('session/password-reset', {user: request.body, token, error: 'Token expirado, por favor solicite uma nova recuperaçao de senha'});
  }

  request.user = user;
  next();
}

module.exports = {
  login,
  forgot,
  reset,
}