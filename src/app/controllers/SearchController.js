const Product = require('../model/Product');
const LoadProductServices = require('../services/loadProductService');

module.exports = {
  async index(request, response) {
    try {
      let { filter, category } = request.query;

      if (!filter || filter.toLowerCase() == 'toda a loja') filter = null;

      let products = await Product.search({filter, category});

      const porductsPromise = products.map(LoadProductServices.format);

      products = await Promise.all(porductsPromise);

      const search = {
        term: filter || 'Toda a loja',
        total: products.length
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
      console.log(`SearchController :: index :: ${err}`);
    }
  }  
}