const express = require('express');
const router = express.Router();

const entregaRoutes = require('./entregaRoutes');
const clienteRoutes = require('./clienteRoutes');
const pedidoRoutes = require('./pedidoRoutes');

// Usa cada Router importado
router.use('/entregas', entregaRoutes);
router.use('/clientes', clienteRoutes);
router.use('/pedidos', pedidoRoutes);

module.exports = router; // Exporta direto o Router
