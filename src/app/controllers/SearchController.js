const Product = require('../model/Product');
const { formatPrice } = require('../../lib/utils');

module.exports = {
  async index(request, response) {
    try {
      let results, params = {};

      const { filter, category } = request.query;

      if (!filter) return response.redirect('/');

      params.filter = filter;

      if (category) {
        params.category = category;
      }

      results = await Product.search(params);

      async function getImage(productID) {
        let results = await Product.files(productID);
        const files = results.rows.map(file => 
          `${request.protocol}://${request.headers.host}${file.path.replace('public', '')}`
        );
  
        return files[0];
      }

      const porductsPromise = results.rows.map(async product => {
        product.img = await getImage(product.id);
        product.price = formatPrice(product.price);
        product.oldPrice = formatPrice(product.old_price);
        return product;
      })

      const products = await Promise.all(porductsPromise);

      const search = {
        term: request.query.filter,
        total: products.lenght
      }

      const categories = products.map(product => ({
        id: product.category_id,
        name: product.category_name,
      })).reduce((categoriesFiltered, category) => {
        const found = categoriesFiltered.some(cat => cat.id == category.id)

        if (!found) {
          categoriesFiltered.push(category);
        }

        return categoriesFiltered;
      }, [])

      return response.render('search/index', {products, search, categories});
    } catch (err) {
      console.log(`SearchController :: ${err}`);
    }
  }  
}