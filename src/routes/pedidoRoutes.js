const express = require('express');
const pedidoRoutes = express.Router();

// Placeholders para cada rota
pedidoRoutes.post('/pedidos', (req, res) => {
    res.send("POST /pedidos - placeholder");
});

pedidoRoutes.get('/pedidos', (req, res) => {
    res.send("GET /pedidos - placeholder");
});

pedidoRoutes.get('/pedidos/:idCliente', (req, res) => {
    res.send(`GET /pedidos/${req.params.idCliente} - placeholder`);
});

pedidoRoutes.put('/pedidos/:idPedido', (req, res) => {
    res.send(`PUT /pedidos/${req.params.idPedido} - placeholder`);
});

pedidoRoutes.delete('/pedidos/:idPedido', (req, res) => {
    res.send(`DELETE /pedidos/${req.params.idPedido} - placeholder`);
});

module.exports = pedidoRoutes;
