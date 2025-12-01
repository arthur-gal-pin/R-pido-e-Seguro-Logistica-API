const express = require('express');
const clienteRoutes = express.Router();

const { clienteController } = require('../controllers/clienteController');

clienteRoutes.post('/clientes', clienteController.adicionarCliente);
clienteRoutes.get('/clientes', clienteController.buscarClientes);
clienteRoutes.get('/clientes/:cpfCliente', clienteController.buscarClientePorCpf);
clienteRoutes.put('/clientes/:idCliente', clienteController.atualizarCliente);
clienteRoutes.delete('/clientes/:idCliente', clienteController.excluirCliente);

const { telefoneController } = require('../controllers/clienteController');

clienteRoutes.post('/telefones', telefoneController.adicionarTelefone);
clienteRoutes.get('/telefones/:idClienteFK', telefoneController.buscarTelefoneCliente);
clienteRoutes.get('/telefones', telefoneController.buscarTelefoneId);
clienteRoutes.put('/telefones/:idTelefone', telefoneController.atualizarTelefone);
clienteRoutes.delete('/telefones/:idTelefone', telefoneController.deletarTelefone);

const { enderecoController } = require('../controllers/clienteController');

clienteRoutes.get('/enderecos', enderecoController.buscarEnderecos);
clienteRoutes.get('/enderecos/:idClienteFK', enderecoController.buscarEnderecoPorCliente); 
clienteRoutes.post('/enderecos', enderecoController.adicionarEndereco);
clienteRoutes.put('/enderecos/:idEndereco', enderecoController.atualizarEndereco); 
clienteRoutes.delete('/enderecos/:idEndereco', enderecoController.excluirEndereco);


module.exports = {clienteRoutes}; 