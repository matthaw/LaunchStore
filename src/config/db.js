const { Pool, Client } = require('pg')


const db = new Pool({
  user: 'your_user',
  password: '',
  host: 'localhost',
  port: 5432,
  database: 'launchstoredb'
})

exports.db = db;