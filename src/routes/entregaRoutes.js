const express = require('express');
const entregaRoutes = express.Router();

const { entregaController } = require('../controllers/entregaController');

entregaRoutes.post('/entregas/:idPedidoFK', entregaController.inserirEntrega);
entregaRoutes.get('/entregas', entregaController.buscarEntrega);
entregaRoutes.put('/entregas/:idEntrega', entregaController.atualizarEntrega);
entregaRoutes.delete('/entregas/:idEntrega', entregaController.cancelarEntrega);


module.exports = {entregaRoutes};
