const express = require('express');
const clienteRoutes = express.Router();

// Placeholders para cada rota
clienteRoutes.post('/clientes', (req, res) => {
    res.send("POST /clientes - placeholder");
});

clienteRoutes.get('/clientes', (req, res) => {
    res.send("GET /clientes - placeholder");
});

clienteRoutes.get('/clientes/:cpfCliente', (req, res) => {
    res.send(`GET /clientes/${req.params.cpfCliente} - placeholder`);
});

clienteRoutes.put('/clientes/:idCliente', (req, res) => {
    res.send(`PUT /clientes/${req.params.idCliente} - placeholder`);
});

clienteRoutes.delete('/clientes/:idCliente', (req, res) => {
    res.send(`DELETE /clientes/${req.params.idCliente} - placeholder`);
});

module.exports = clienteRoutes;
