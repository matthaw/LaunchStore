const { unlinkSync } = require('fs');

const Category = require('../model/Category');
const Product = require('../model/Product');
const File = require('../model/File');

const LoadProductServices = require('../services/loadProductService');

module.exports = {
  async create(request, response) {
    try {
      const categories = await Category.findAll();
      return response.render('products/create', { categories })
    } catch (err) {
      console.error(`ProductController :: create :: ${err}`);
    }
  },

  async show(request, response) {
    try {
      let product = await LoadProductServices.load('product', {where: {id: request.params.id}});

      if (!product) return response.send('Product not found!');

      return response.render('products/show', { product });
    } catch (err) {
      console.error(`ProductController :: show :: ${err}`);
    }
  },

  async post(request, response) {
    try {
      let { category_id, name, description, old_price, price, quantity, status } = request.body;

      price = price.replace(/\D/g, '');

      const product_id = await Product.create({
        category_id,
        user_id: request.session.userId,
        name,
        description,
        old_price: old_price || price,
        price,
        quantity,
        status: status || 1
      });

      const filesPromise = request.files.map(file => File.create({ name: file.filename, path: file.path, product_id }));
      await Promise.all(filesPromise);

      return response.redirect(`/products/${product_id}/edit`)
    } catch (err) {
      console.error(`ProductController :: post :: ${err}`);
    }
  },

  async edit(request, response) {
    try {
      let product = await LoadProductServices.load('product', {where: {id: request.params.id}});

      if (!product) return response.send('Product not found!');

      // Get categories
      const categories = await Category.findAll();

      return response.render('products/edit.njk', { product, categories });
    } catch (err) {
      console.error(`ProductController :: edit :: ${err}`);
    }
  },

  async put(request, response) {
    try {
      if (request.files.length != 0) {
        const newFilesPromise = request.files.map(file => File.create({ ...file, product_id: request.body.id }));

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
      //request.body.old_price = request.body.old_price.replace(/\D/g, '');

      const oldProduct = await Product.find(request.body.id);
      if (oldProduct.price != request.price) {
        request.body.old_price = oldProduct.price;
      }

      await Product.update(request.body.id, {
        category_id: request.body.category_id,
        name: request.body.name,
        description: request.body.description,
        old_price: request.body.old_price,
        price: request.body.price,
        quantity: request.body.quantity,
        status: request.body.status,

      });

      return response.redirect(`/products/${request.body.id}`)
    } catch (err) {
      console.error(`Error to update product :: ${err}`);
    }
  },

  async delete(request, response) {
    
    let files = await Product.files(request.body.id);

    // remover todas imagens
    files.map(file => {
      try {
        unlinkSync(file.path);
      } catch (err) {
        console.error(`Não foi possivel deletar uma imagem :: ${err}`);
      }
    });

    await Product.delete(request.body.id);
    return response.redirect('products/create');
  }
}