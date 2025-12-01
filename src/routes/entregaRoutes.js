const express = require('express');
const entregaRoutes = express.Router();

const { pedidoController } = require('../controllers/pedidoController');

entregaRoutes.post('/entregas', pedidoController.addPedido);
entregaRoutes.get('/entregas', pedidoController.selecionarPedido);
entregaRoutes.get('/entregas/:cpfCliente', pedidoController.selecionarPedidoCliente);
entregaRoutes.put('/entregas/:idCliente', pedidoController.atualizarPedido);
entregaRoutes.delete('/entregas/:idCliente', pedidoController.cancelarPedido);


module.exports = entregaRoutes ;
