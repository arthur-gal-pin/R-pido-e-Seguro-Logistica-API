const express = require('express');
const pedidoRoutes = express.Router();

const { pedidoController } = require('../controllers/pedidoController');

pedidoRoutes.post('/pedidos', pedidoController.addPedido);
pedidoRoutes.get('/pedidos', pedidoController.selecionarPedido);
pedidoRoutes.get('/pedidos/:cpfCliente', pedidoController.selecionarPedidoCliente);
pedidoRoutes.put('/pedidos/:idCliente', pedidoController.atualizarPedido);
pedidoRoutes.delete('/pedidos/:idCliente', pedidoController.cancelarPedido);


module.exports = pedidoRoutes;
