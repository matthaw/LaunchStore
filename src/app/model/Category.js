const { db } = require('../../config/db');

module.exports = {
  all() {
    return db.query(`
      select * from categories
    `)
  }
}