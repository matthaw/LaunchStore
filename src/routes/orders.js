const express = require('express');
const OrderController = require('../app/controllers/OrderController');
const { onlyUsers } = require('../app/middlewares/session');

const routes = express.Router();

routes.post('/', onlyUsers, OrderController.post)
      .get('/', onlyUsers, OrderController.index)
      .get('/sales', onlyUsers, OrderController.sales)
      .get('/:id', OrderController.show)
      .post('/:id/:action', OrderController.update);
      
module.exports = routes;