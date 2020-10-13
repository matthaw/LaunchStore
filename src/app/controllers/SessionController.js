const crypto = require('crypto');
const { hash } = require('bcryptjs');
const mailer = require('../../lib/mailer');
const User = require('../model/User');

module.exports = {
  loginForm(request, response) {
    return response.render('session/login');
  },

  async login(request, response) {
    request.session.userId = request.user.id;

    return response.redirect('/users');
  },

  logout(request, response) {
    request.session.destroy();
    return response.redirect('/');
  },

  forgotForm(request, response) {
    return response.render('session/forgot-password');
  },

  async forgot(request, response) {
    const user = request.user;

    try {

      // Um token para esse usuário
      const token = crypto.randomBytes(20).toString('hex');

      // criar um expiração
      let now = new Date();
      now = now.setHours(now.getHours() + 1);

      await User.update(user.id, { reset_token: token, reset_token_expires: now });

      // Enviando um email para recuperação de senha
      await mailer.sendMail({
        to: user.email,
        from: 'no-reply@launchstore.com.br',
        subject: 'Recuperação de senha',
        html: `
      <h2>Perdeu a chave</h2>
      <p> Não se preocupe, clique no link abaixo para recuperar sua senha</p>
      <p>
        <a href='http://localhost:3000/users/password-reset?token=${token}' target='_blank'>RECUPERAR SENHA</a>
      </p>
      `
      })

      // Avisar o usuário que enviamos o e-mail

      return response.render('session/forgot-password', { sucess: 'Verfique seu email para resetar sua senha' });
    } catch (err) {
      console.error(errr);
      return response.render('session/forgot-password', { error: 'Error inesperado tente novamente.' });
    }


  },

  resetForm(request, response) {
    return response.render('session/password-reset.njk', { token: request.query.token });
  },

  async reset(request, response) {
    const { user } = request;
    const { password } = request.body;
    try {
      // cria uma novo hash de senha
      const newPassword = await new hash(password, 8);
      // atualiza o usuário
      await User.update(user.id, {password: newPassword, reset_token: '', reset_token_expires: ''});
      // avisa o usuário que ele tem uma
      return response.render('session/login', {user: request.body, sucess: 'Senha atualiza com sucesso! Faça seu login.'});
    } catch (err) {
      console.error(err);
      return response.render('session/password-reset', { error: 'Error inesperado tente novamente.' });
    }

  }
}