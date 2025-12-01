const express = require('express');
const clienteRoutes = express.Router();

const { pedidoController } = require('../controllers/pedidoController');

clienteRoutes.post('/pedidos', pedidoController.addPedido);
clienteRoutes.get('/pedidos', pedidoController.selecionarPedido);
clienteRoutes.get('/clientes/:cpfCliente', pedidoController.selecionarPedidoCliente);
clienteRoutes.put('/clientes/:idCliente', pedidoController.atualizarPedido);
clienteRoutes.delete('/clientes/:idCliente', pedidoController.cancelarPedido);


module.exports = { clienteRoutes };
