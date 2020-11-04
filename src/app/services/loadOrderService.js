const { formatPrice, date } = require('../../lib/utils');
const Order = require('../model/Order');
const User = require('../model/User');

const LoadProductService = require('./loadProductService');

async function format(order) {
  // Detalhes do produto
  order.product = await LoadProductService.load('productWithDeleted', { where: { id: order.product_id } });
  // Detalhes do comprador
  order.buyer = await User.findOne({ where: { id: order.buyer_id } });
  // Detalhes do vendedor
  order.seller = await User.findOne({ where: { id: order.seller_id } });

  order.formattedPrice = formatPrice(order.price);
  order.formattedTotal = formatPrice(order.total);

  const status = {
    open: 'Aberto',
    sold: 'Vendido',
    canceled: 'Cancelado'
  }

  order.formattedStatus = status[order.status];

  const updated_at = date(order.update_at);
  order.formattedUpdatedAt = `${order.formattedStatus} em ${updated_at.day}/${updated_at.month}/${updated_at.year} às ${updated_at.hour}h ${updated_at.minutes}`;
  return order;
}

const LoadServices = {
  load(service, filter) {
    this.filter = filter;
    return this[service]();
  },

  async order() {
    try {
      const order = await Order.findOne(this.filter);
      return format(order);
    } catch (error) {
      console.error(`LoadProductService :: product :: ${error}`);
    }
  },

  async orders() {
    try {
      const orders = await Order.findAll(this.filter);
      const ordersPromise = orders.map(format);
      return Promise.all(ordersPromise);
    } catch (error) {
      console.error(`LoadProductService :: products :: ${error}`);
    }
  },
  format,
}

module.exports = LoadServices;