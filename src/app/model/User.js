const { hash } = require('bcryptjs');
const fs = require('fs');
const { db } = require('../../config/db');
const Product = require('./Product');
const Base = require('./Base');

Base.init({ table: 'users' })

module.exports = {
  ...Base,
}