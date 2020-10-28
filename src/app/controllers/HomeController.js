const LoadProductService = require('../services/loadProductService');

module.exports = {
  async index(request, response) {

    const allProducts = await LoadProductService.load('products');
    const products = allProducts.filter((product, index) => index > 2 ? false : true);

    return response.render('home/index', {products});
  }
}