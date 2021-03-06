const { formatPrice, date } = require('../../lib/utils');
const Product = require('../model/Product');

async function getImages(productID) {
  let files = await Product.files(productID);
  files = files.map(file => ({
    ...file,
    src: `${file.path.replace('public', '')}`,
  }));

  return files;
}

async function format(product) {

  const files = await getImages(product.id);

  product.img = files[0].src;
  product.files = files;
  product.formattedOldPrice = formatPrice(product.old_price);
  product.formattedPrice = formatPrice(product.price);

  const { day, hour, minutes, month } = date(product.update_at);

  product.published = {
    day: `${day}/${month}`,
    hour: `${hour}h${minutes}`,
  }

  return product;
}

const LoadServices = {
  load(service, filter) {
    this.filter = filter;
    return this[service]();
  },

  async product() {
    try {
      const product = await Product.findOne(this.filter);
      return format(product);

    } catch (error) {
      console.error(`LoadProductService :: product :: ${error}`);
    }
  },

  async products() {
    try {
      const products = await Product.findAll(this.filter);
      const productsPromise = products.map(format);

      return Promise.all(productsPromise);
    } catch (error) {
      console.error(`LoadProductService :: products :: ${error}`);
    }
  },

  async productWithDeleted() {
    try {
      let product = await Product.findOneWithDeleted(this.filter);
      return format(product);
      
    } catch (error) {
      console.error(error);
    }
  },

  format,
}

module.exports = LoadServices;