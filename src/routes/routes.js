const express = require('express');
const router = express.Router();

//Referência ao arquivo de rotas
const {produtoRoutes} = require('./produtoRoutes');
const {clienteRoutes} = require('./clienteRoutes');
const {pedidoRoutes} = require('./pedidoRoutes');


router.use('/', produtoRoutes);
router.use('/', clienteRoutes);
router.use('/', pedidoRoutes);

module.exports = {router};