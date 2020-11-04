const mailer = require('../../lib/mailer');
const User = require('../model/User');
const Order = require('../model/Order');
const Cart = require('../../lib/cart');
const LoadProductService = require('../services/loadProductService');
const LoadOrderService = require('../services/loadOrderService');

const email = (seller, product, buyer) => {
  return (`
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
          `);
}

module.exports = {
  async index(request, response) {
    const orders = await LoadOrderService.load('orders', { where: { buyer_id: request.session.userId } });
    return response.render('orders/index', { orders });
  },

  async sales(request, response) {
    let sales = await LoadOrderService.load('orders', { where: { seller_id: request.session.userId } });

    sales = sales.filter(sale => {
      if (!sale.product.deleted_at) {
        return sale;
      }
    })

    return response.render('orders/sales', { sales });
  },

  async show(request, response) {
    const order = await LoadOrderService.load('order', { where: { id: request.params.id } });

    return response.render('orders/details', { order });
  },

  async post(request, response) {
    try {
      const cart = Cart.init(request.session.cart);

      const buyer_id = request.session.userId;
      const filteresItems = cart.items.filter(item => item.product.user_id != buyer_id);

      const createOrderPromisse = filteresItems.map(async item => {
        let { product, price: total, quantity } = item;
        const { price, id: product_id, user_id: seller_id } = product;
        const status = 'open';

        const order = await Order.create({
          seller_id,
          buyer_id,
          product_id,
          price,
          total,
          quantity,
          status
        })

        product = await LoadProductService.load('product', { where: { id: product_id } });

        const seller = await User.findOne({ where: { id: seller_id } })

        const buyer = await User.findOne({ where: { id: buyer_id } });

        await mailer.sendMail({
          to: seller.email,
          from: 'no-replay@launchstore.com.br',
          subject: 'Novo pedido de compra',
          html: email(seller, product, buyer),
        })

        return order;
      })

      await Promise.all(createOrderPromisse);

      // Clear cart
      delete request.session.cart;
      Cart.init();

      return response.render('orders/success');
    } catch (error) {
      console.error(`OrderController :: post :: ${error}`);
      return response.render('orders/error');
    }
  },

  async update(request, response) {
    try {
      const { id, action } = request.params;

      const acceptedActions = ['close', 'cancel'];

      if (!acceptedActions.includes(action)) {
        return response.send(`Can't do this action`)
      }

      const order = await LoadOrderService.load('order', { where: { id } });

      if (!order) {
        return response.send('Order not found');
      }

      if (order.status != 'open') {
        return response.send(`Can't do this action`);
      }

      const statuses = {
        close: 'sold',
        cancel: 'canceled'
      }

      order.status = statuses[action];

      await Order.update(id, {status: order.status});

      return response.redirect('/orders/sales');

    } catch (error) {
      console.error(`OrderController :: update :: ${error}`);
    }
  }
}