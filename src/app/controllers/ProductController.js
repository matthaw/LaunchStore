const Category = require('../model/Category');
const Product = require('../model/Product');
const File = require('../model/File');
const { formatPrice, date } = require('../../lib/utils');

module.exports = {
  create(request, response) {
    Category.all()
    .then(results => {
      const categories = results.rows;
      return response.render('products/create.njk', {categories})
    }).catch(err => {
      throw new Error(err);
    })
  },

  async show(request, response) {
    let results = await Product.find(request.params.id);
    const product = results.rows[0];

    if (!product) return response.send('Product not found!');

    const {day, hour, minutes, month} = date(product.update_at);

    product.published = {
      day: `${day}/${month}`,
      hour: `${hour}h${minutes}`,
    }

    product.oldPrice = formatPrice(product.old_price);
    product.price = formatPrice(product.price);

    results = await Product.files(product.id);
    const files = results.rows.map(file => ({
      ...file,
      src: `${request.protocol}://${request.headers.host}${file.path.replace('public', '')}`
    }));

    return response.render('products/show', {product, files});
  },

  async post(request, response) {
    const keys = Object.keys(request.body);

    for (key of keys) {
      if (request.body[key] === "") {
        return response.send("Please, fill all fields!");
      }
    }

    if (request.files.length == 0) {
      return response.send('Please fill all fields!');
    }

    request.body.user_id = request.session.userId;
    let results = await Product.create(request.body);
    const productID = results.rows[0].id;

    const filesPromise = request.files.map(file => File.create({...file, product_id: productID}));
    await Promise.all(filesPromise);

    return response.redirect(`/products/${productID}/edit`)

  },

  async edit(request, response) {
    let results = await Product.find(request.params.id);
    const product = results.rows[0];

    if (!product) return response.send('Product not found!');

    product.price = formatPrice(product.price);
    product.old_price = formatPrice(product.old_price);

    // Get categories
    results = await Category.all();
    const categories = results.rows;

    // Get images
    results = await Product.files(product.id)
    let files = results.rows
    files = files.map(file => ({
      ...file,
      src: `${request.protocol}://${request.headers.host}${file.path.replace('public', '')}`
    }))

    return response.render('products/edit.njk', {product, categories, files});
  },

  async put(request, response) {
    const keys = Object.keys(request.body);

    for (key of keys) {
      if (request.body[key] === "" && key != "removed_files") {
        return response.send("Please, fill all fields!");
      }
    }

    if (request.files.length != 0) {
      const newFilesPromise = request.files.map(file => File.create({...file, product_id: request.body.id}));

      await Promise.all(newFilesPromise);
    }

    if (request.body.removed_files) {
      const removedFiles = request.body.removed_files.split(',');

      const lastIndex = removedFiles.length - 1;
      removedFiles.splice(lastIndex, 1);

      const removedFilesPromise = removedFiles.map(file => File.delete(file));

      await Promise.all(removedFilesPromise);
    }

    request.body.price = request.body.price.replace(/\D/g, '');
    request.body.old_price = request.body.old_price.replace(/\D/g, '');

    if (request.body.old_price != request.body.price) {
      const oldProduct = await Product.find(request.body.id);
      if (!oldProduct.rows[0].price == request.price) {
        request.body.old_price = oldProduct.rows[0].price;
      }
    }

    try {
      await Product.update(request.body);
    } catch (err) {
      console.error(`Error to update product :: ${err}`);
    }

    return response.redirect(`/products/${request.body.id}`)
  },

  delete(request, response) {
    
  }
}