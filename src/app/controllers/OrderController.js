const mailer = require('../../lib/mailer');
const User = require('../model/User');
const LoadProductService = require('../services/loadProductService');

const email = (seller, product, buyer) => {`
<h2>Olá ${seller.name}</h2>
<p>Você tem um novo pedido de compra do seu produto.</p>
<p>Produto ${product.name}</p>
<p>Preço do produto: ${product.formattedPrice}</p>
<p></br></br></p>
<h3>Dados do comprador</h3>
<p>Nome: ${buyer.name}</p>
<p>Email: ${buyer.email}</p>
<p>Endereço: ${buyer.address}</p>
<p>Cep: ${buyer.cep}</p>
<p></br></br></p>
<p><strong>Entre em contato com o comprador para finalizar a venda</strong></p>
<p></br></br></p>
<p>Atenciosamente, equipe LaunchStore</p>
`}

module.exports = {
  async post(request, response) {
  try {
    const product = await LoadProductService.load('product', {where: {id: request.body.id}});
    
    const seller = await User.findOne({where: {id: product.user_id}})

    const buyer  = await User.findOne({where: {id: request.session.userId}});

    await mailer.sendMail({
      to: seller.email,
      from: 'no-replay@launchstore.com.br',
      subject: 'Novo pedido de compra',
      html: email(seller, product, buyer),
    })

    return response.render('orders/success');
  } catch (error) {
    console.error(`OrderController :: post :: ${error}`);
    return response.render('orders/error');
  }
  }
}