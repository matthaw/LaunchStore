const { db } = require('../../config/db');
const Base = require("./Base");

Base.init({ table: 'products' });

module.exports = {
  ...Base,

  async files(id) {
    const results = await db.query(`select * from files where product_id = $1`, [id]);

    return results.rows;
  },

  async search({ filter, category }) {
    let query = `
      select products.*,
        categories.name as category_name
      from products
      left join categories on (categories.id = products.category_id)
      where 1 = 1
      `

    if (category) {
      query += ` and products.category_id = ${category}`
    }

    if (filter) {
      query += `
      and
      (products.name ilike '%${filter}%' or products.description ilike '%${filter}%')
      `
    }

    query += ` and status != 0 `

    const results = await db.query(query);
    return results.rows;
  }
}