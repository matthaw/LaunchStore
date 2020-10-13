const Product = require('../model/Product');
const { formatPrice } = require('../../lib/utils');

module.exports = {
  async index(request, response) {
    let results = await Product.all();
    const products = results.rows;

    if (!products) return response.send('Products not found!');

    async function getImage(productID) {
      let results = await Product.files(productID);
      const files = results.rows.map(file => 
        `${request.protocol}://${request.headers.host}${file.path.replace('public', '')}`
      );

      return files[0];
    }

    const productPromise = products.map(async product => {
      product.img = await getImage(product.id);
      product.price = formatPrice(product.price);
      product.oldPrice = formatPrice(product.old_price);
      return product;
    }).filter((product, index) => index > 2 ? false : true);

    const lastAdded = await Promise.all(productPromise);

    return response.render('home/index', {products: lastAdded});
  }
}