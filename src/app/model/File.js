const db = require('../../config/db');
const Base = require("./Base");

Base.init({table: 'files'});

module.exports = {
  ...Base,
}