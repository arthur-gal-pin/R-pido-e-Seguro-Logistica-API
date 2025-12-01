const express = require('express');
const entregaRoutes = express.Router();

const { entregaController } = require('../controllers/entregaController');

entregaRoutes.post('/:idPedidoFK', entregaController.inserirEntrega);
entregaRoutes.get('/', entregaController.buscarEntrega);
entregaRoutes.put('/:idEntrega', entregaController.atualizarEntrega);
entregaRoutes.delete('/:idEntrega', entregaController.cancelarEntrega);


module.exports = entregaRoutes;
