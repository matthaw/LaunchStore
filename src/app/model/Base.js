const { db } = require('../../config/db');

const find = async (filters, table) => {
  let query = `select * from ${table}`;

  if (filters) {
    Object.keys(filters).map((key) => {
      query += ` ${key}`;

      Object.keys(filters[key]).map((field) => {
        query += ` ${field} = '${filters[key][field]}'`;
      });
    });
  }

  return await db.query(query);
};

const Base = {
  init({ table }) {
    if (!table) {
      throw new Error('Invalid params');
    }

    this.table = table;
  },

  async find(id) {
    const results = await find({ where: { id } }, this.table);
    return results.rows[0];
  },

  async findOne(filters) {
    const results = await find(filters, this.table);
    return results.rows[0];
  },

  async findAll(filters) {
    const results = await find(filters, this.table);
    return results.rows;
  },

  async create(fields) {
    const keys = [];
    const values = [];

    try {
      Object.keys(fields).map((key, index, array) => {
        keys.push(key);
        values.push(`'${fields[key]}'`);
      });
    } catch (err) {
      console.error(err);
    }

    const query = `insert into ${this.table} (${keys.join(', ')}) values (${values.join(', ')}) returning id`;
    const results = await db.query(query);
    return results.rows[0].id;
  },

  async update(id, fields) {
    const update = [];
    console.log(fields);
    try {
      Object.keys(fields).map((key) => {
        const line = `${key} = '${fields[key]}'`;
        update.push(line);
      });
      
      

      const query = `update ${this.table} set
      ${update.join(',')}
      where id = ${id}`;

      await db.query(query);
    } catch (err) {
      console.error(err);
    }
  },

  async delete(id) {
    return db.query(`delete from ${this.table} where id = $1`, [id]);
  },
};

module.exports = Base;
