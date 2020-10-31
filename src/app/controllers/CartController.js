const { response } = require('express');
const { addOne, removeOne } = require('../../lib/cart');
const Cart = require('../../lib/cart');
const LoadProductServices = require('../services/loadProductService');

module.exports = {
  async index(request, response) {
  try {
    
    let { cart } = request.session;

    const product = await LoadProductServices.load('product', {where: {id: 1}});

    cart = Cart.init(cart);

    return response.render('cart/index', { cart });
  } catch (error) {
    console.error(`CartController :: index :: ${error}`);
  }
  },

  async addOne(request, response) {
    const { id } = request.params;

    const product = await LoadProductServices.load('product', {where: {id}});

    let { cart } = request.session;

    request.session.cart = Cart.init(cart).addOne(product);

    return response.redirect('/cart');
  },

  async removeOne(request, response) {
    let { id } = request.params;

    let { cart } = request.session;

    if (!cart) return response.redirect('/cart');

    cart = Cart.init(cart).removeOne(id);

    request.session.cart = cart;

    return response.redirect('/cart');
  },

  delete(request, response) {
    let { cart } = request.session;
    const { id } = request.params;
    if (!cart) return;

    request.session.cart = Cart.init(cart).delete(id);

    return response.redirect('/cart');
  }
}