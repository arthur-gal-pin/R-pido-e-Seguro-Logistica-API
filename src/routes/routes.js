const express = require('express');
const router = express.Router();

const entregaRoutes = require('./entregaRoutes'); 
const clienteRoutes = require('./clienteRoutes');
const pedidoRoutes = require('./pedidoRoutes'); 

router.use('/', entregaRoutes);
router.use('/', clienteRoutes);
router.use('/', pedidoRoutes);

module.exports = router;