const express = require('express');
const pedidoRoutes = express.Router();

const { pedidoController } = require('../controllers/pedidoController');

pedidoRoutes.post('/pedidos', pedidoController.addPedido);
pedidoRoutes.get('/pedidos', pedidoController.selecionarPedido);
pedidoRoutes.get('/pedidos/:idCliente', pedidoController.selecionarPedidoCliente);
pedidoRoutes.put('/pedidos/:idPedido', pedidoController.atualizarPedido);
pedidoRoutes.delete('/pedidos/:idPedido', pedidoController.cancelarPedido);


module.exports = pedidoRoutes;
