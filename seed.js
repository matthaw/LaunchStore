const faker = require('faker');
const { hash } = require('bcryptjs');

const File = require('./src/app/model/File');
const User = require('./src/app/model/User');
const Product = require('./src/app/model/Product');

let usersIds = [];
const totalUsers = 3;
let totalProducts = 10;

async function createUsers() {
  const users = []
  const password = await hash('123', 8);

  while (users.length < totalUsers) {
    users.push({
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: password,
      cpf_cnpj: faker.random.number(999999999),
      cep: faker.random.number(99999),
      address: faker.address.streetName(),
    });
  }

  const usersPromise = users.map(user => User.create(user))

  usersIds = await Promise.all(usersPromise);
}

async function createProducts() {
  let products = []
  console.log(`UserID ${usersIds}`);
  while (products.length < totalProducts) {
    products.push({
      category_id: Math.ceil(Math.random() * 3),
      user_id: usersIds[Math.floor(Math.random() * totalUsers)],
      name: faker.name.title(),
      description: faker.lorem.paragraph(Math.ceil(Math.random() * 10)),
      old_price: faker.random.number(99999),
      price: faker.random.number(99999),
      quantity: faker.random.number(999),
      status: Math.round(Math.random()),
    })
  }
  console.log(products);
  const productPromise = products.map(product => Product.create(product))

  productsIds = await Promise.all(productPromise);

  let files = []
  while (files.length < 50) {
    files.push({
      name: faker.image.image(),
      path: `public/images/placeholder.png`,
      product_id: productsIds[Math.round(Math.random())],

    })
  }

  const filesPromise = files.map(file => {
    File.create(file);
  })

  await Promise.all(filesPromise);
}

async function init() {
  await createUsers();
  await createProducts();
}

init();