const express = require('express');
const entregaRoutes = express.Router();

const { pedidoController } = require('../controllers/pedidoController');

entregaRoutes.post('/pedidos', pedidoController.addPedido);
entregaRoutes.get('/pedidos', pedidoController.selecionarPedido);
entregaRoutes.get('/clientes/:cpfCliente', pedidoController.selecionarPedidoCliente);
entregaRoutes.put('/clientes/:idCliente', pedidoController.atualizarPedido);
entregaRoutes.delete('/clientes/:idCliente', pedidoController.cancelarPedido);


module.exports = { entregaRoutes };
