const { hash } = require('bcryptjs');
const { unlinkSync } = require('fs');

const User = require('../model/User');
const { formatCpfCnpj, formatCep } = require('../../lib/utils');
const loadProductService = require('../services/loadProductService');
const Product = require('../model/Product');

module.exports = {
  registerForm(request, response) {
    return response.render('user/register');
  },

  async show(request, response) {
    try {
      const { user } = request;
      user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj);
      user.cep = formatCep(String(user.cep));

      return response.render('user/index', { user });
    } catch (error) {
      console.error(`UserController :: show :: ${error}`);
    }
  },

  async post(request, response) {
    try {
      let { name, email, password, cpf_cnpj, cep, address } = request.body;

      password = hash(password);

      cpf_cnpj = cpf_cnpj.replace(/\D/g, '');
      cep = cep.replace(/\D/g, '');

      const userId = await User.create({
        name,
        email,
        password,
        cpf_cnpj,
        cep,
        address
      });

      request.session.userId = userId;

      return response.redirect('/users');
    } catch (error) {
      console.error(`UserController :: post :: ${error}`);
    }
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

      const products = await Product.findAll({ where: { user_id: request.body.id } });

      // Pegar todas imagens
      const allFilesPromise = products.map(product => {
        return Product.files(product.id);
      });

      let promiseResults = await Promise.all(allFilesPromise);

      // Deletando Usuário

      await User.delete(request.body.id);
      request.session.destroy();

      // remover todas imagens
      promiseResults.map(files => {
        files.map(file => {
          try {
            unlinkSync(file.path);
          } catch (err) {
            console.error(`Não foi possivel deletar uma imagem :: ${err}`);
          }
        })
      });

      return response.render('session/login', { sucess: 'Conta deletada com sucesso' });

    } catch (err) {
      console.error(`userController:: delete :: ${err}`);
      return response.render('user/index', { user: request.body, error: 'Não foi possivel deletar sua conta!' });
    }
  },

  async ads(request, response) {
    const products = await loadProductService.load('products', {
      where: { user_id: request.session.userId }
    });

    return response.render('user/ads', { products });
  },
}