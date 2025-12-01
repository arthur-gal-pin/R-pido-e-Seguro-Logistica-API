const express = require('express');
const pedidoRoutes = express.Router();

const { pedidoController } = require('../controllers/pedidoController');

pedidoRoutes.post('/pedidos', pedidoController.addPedido);
pedidoRoutes.get('/pedidos', pedidoController.selecionarPedido);
pedidoRoutes.get('/clientes/:cpfCliente', pedidoController.selecionarPedidoCliente);
pedidoRoutes.put('/clientes/:idCliente', pedidoController.atualizarPedido);
pedidoRoutes.delete('/clientes/:idCliente', pedidoController.cancelarPedido);


module.exports = pedidoRoutes;
