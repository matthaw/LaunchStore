const { use } = require('browser-sync');
const { compare } = require('bcryptjs');
const User = require('../model/User');


function checkAllFields(body) {
    // check if has all fieldss
    const keys = Object.keys(body);

    for (key of keys) {
      if (body[key] === "") {
        return {error: 'Por favor, preencha todos os campos.', user: body};
      }
    }
}


async function show(request, response, next) {
  const {userId: id} = request.session;

  const user = await User.findOne({where: {id}});

  if (!user) return response.render('user/register', {error: 'Usuário não encontrado!'})

  request.user = user;

  next();
}

async function post(request, response, next) {
  // check if has all fieldss
  const fillAllFields = checkAllFields(request.body);
  if (fillAllFields) {
    return response.render('user/register', fillAllFields);
  }

  // check if users exists [email, cpf_cnpj]
  let { email, cpf_cnpj, password, passwordRepeat } = request.body;
  cpf_cnpj = cpf_cnpj.replace(/\D/g, '');

  let user = await User.findOne({ where: { email }, or: { cpf_cnpj } });


  if (user) {
    return response.render('user/register', {error: 'Usuário já cadastrado', user: request.body});
  }

  // check password match
  if (password !== passwordRepeat) {
    return response.render('user/register', {error: 'Senhas incorretas.', user: request.body});
  }

  next();
}

async function update(request, response, next) {
  // check if has all fieldss
  const fillAllFields = checkAllFields(request.body);
  if (fillAllFields) {
    return response.render('user/index', fillAllFields);
  }

  const { id, password } = request.body;

  if (!password) return response.render('user/index', {
    user: request.body,
    error: 'Coloque sua senha para atualizar seu cadastro'
  })

  const user = await User.findOne({where: {id}});
  const passed = await compare(password, user.password);

  if (!passed) {
    return response.render('user/index', {user: request.body, error: 'Senha incorreta!'});
  }

  request.user = user;
  next();
}


module.exports = {
  post,
  show,
  update,
}