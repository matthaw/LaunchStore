const { db } = require('../../config/db');
const { hash } = require('bcryptjs');
const fs = require('fs');

const Product = require('./Product');

module.exports = {
  async findOne(filters) {
    let query = `select * from users`

    Object.keys(filters).map(key => {
      query = `${query}
      ${key}`

      Object.keys(filters[key]).map(field => {
        query = `${query} ${field} = '${filters[key][field]}'`
      })

    })

    const results = await db.query(query);
    return results.rows[0];
  },

  async create(data) {
    const query = `INSERT INTO users (name, email, password, cpf_cnpj, cep, address) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`


    // hash of password
    const passwordHash = await hash(data.password, 8);
    
    const values = [
      data.name,
      data.email,
      passwordHash,
      data.cpf_cnpj.replace(/\D/g, ''),
      data.cep.replace(/\D/g, ''),
      data.address,
    ]

    const results = await db.query(query, values);
    return results.rows[0].id;
  },

  async update(id, fields) {
    let query = `update users set`

    Object.keys(fields).map((key, index, arr) => {
      if ((index + 1) < arr.length) {
        query = `${query}
        ${key} = '${fields[key]}',`
      } else {
        // last iteration
        query = `${query}
        ${key} = '${fields[key]}'
        where id = ${id}
        `
      }
    })

    await db.query(query);
  },

  async delete(id) {
    // Pegar todos os produtos
    let results = await db.query('select * from products where user_id = $1', [id]);
    const products = results.rows

    // Pegar todas imagens
    const allFilesPromise = products.map(product => {
      return Product.files(product.id);
    });

    let promiseResults = await Promise.all(allFilesPromise);

    // remover todas imagens
    promiseResults.map(results => {
      results.rows.map(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error(`Não foi possivel deletar uma imagem :: ${err}`);
        }
      })
    });

    // remover o usuário
    await db.query(`delete from users where id = $1`, [id]);
  }
}