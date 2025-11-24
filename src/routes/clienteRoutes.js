const express = require('express');
const clienteRoutes = express.Router();
const telefoneRoutes = express.Router();
const enderecoRoutes = express.Router();

const { clienteController } = require('../controllers/clienteController');

clienteRoutes.post('/clientes', clienteController.adicionarCliente);
clienteRoutes.get('/clientes', clienteController.buscarClientes);
clienteRoutes.get('/clientes/:cpfParam', clienteController.buscarClientePorCpf);
clienteRoutes.put('/clientes/:idCliente', clienteController.atualizarCliente);
clienteRoutes.delete('/clientes/:idCliente', clienteController.excluirCliente);

const { telefoneController } = require('../controllers/clienteController');

telefoneRoutes.post('/telefones', telefoneController.adicionarTelefone);
telefoneRoutes.get('/telefones/:idClienteFK', telefoneController.buscarTelefoneCliente);
telefoneRoutes.get('/telefones/:idTelefone', telefoneController.buscarTelefoneId);
telefoneRoutes.put('/telefones/:idTelefone', telefoneController.atualizarTelefone);
telefoneRoutes.delete('telefones/:idTelefone', telefoneController.deletarTelefone);

const { enderecoController } = require('../controllers/clienteController');

enderecoRoutes.post('/endereco', enderecoController.adicionarEndereco);
enderecoRoutes.get('/enderdeco', enderecoController.buscarEnderecos);
enderecoRoutes.get('/enderdeco/:idEndereco', enderecoController.buscarEnderecoPorCliente);
enderecoRoutes.put('/endereco/:idClienteFK', enderecoController.atualizarEndereco);
enderecoRoutes.delete('endereco/:idEndereco', enderecoController.excluirEndereco);

module.exports = { clienteRoutes, telefoneController, enderecoController }