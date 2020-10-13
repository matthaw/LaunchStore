const User = require('../model/User');
const { formatCpfCnpj, formatCep } = require('../../lib/utils');

module.exports = {
  registerForm(request, response) {
    return response.render('user/register');
  },

  async show(request, response) {
    const { user } = request;
    user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj);
    user.cep = formatCep(String(user.cep));

    return response.render('user/index', { user });
  },

  async post(request, response) {
    const userId = await User.create(request.body);

    request.session.userId = userId;

    return response.redirect('/users');
  },

  async update(request, response) {
    try {
      const { user } = request;

      let { name, email, cpf_cnpj, cep, address } = request.body;

      cpf_cnpj = cpf_cnpj.replace(/\D/g, '');
      cep = cep.replace(/\D/g, '');
      await User.update(user.id, {
        name,
        email,
        cpf_cnpj,
        cep,
        address
      })

      return response.render('user/index', { user: request.body, sucess: 'Conta atulizada com sucesso' });

    } catch (err) {
      console.error(`userController::update :: ${err}`);
      return response.render('user/index', { error: err });
    }
  },

  async delete(request, response) {
    try {
      await User.delete(request.session.userId);

      request.session.destroy();

      return response.render('session/login', { sucess: 'Conta deletada com sucesso' });

    } catch (err) {
      console.error(`userController::update :: ${err}`);
      return response.render('user/index', { user: request.body, error: 'Não foi possivel deletar sua conta!' });
    }
  }
}