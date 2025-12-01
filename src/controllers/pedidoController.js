const { pedidoModel } = require('../models/pedidoModel');

const padronizarTexto = (texto) => {
    // Garante que o texto existe antes de tentar normalizar
    if (!texto) return '';

    return texto
        .toLowerCase() // 1. Converte para minúsculas
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // 2. Remove acentos e caracteres diacríticos
}

const pedidoController = {
    addPedido: async (req, res) => {
        try {
            const { idCliente, urgencia, distancia, peso, valorItem, valorDistancia } = req.body;
            if (!idCliente || !urgencia || !distancia || !peso || !valorItem || !valorDistancia) {
                return res.status(400).json({ message: 'Por favor, verifique os dados adicionados e envie novamente' });
            }

            if (!urgencia || typeof urgencia !== 'string' && urgencia !== "urgente" && urgencia !== 'nao urgente') {
                return res.status(400).json({ message: "Valores para registro inválidos (urgência deve ser apenas 'urgente' ou 'nao urgente')." });
            }
            if (isNaN(distancia) || isNaN(peso) || isNaN(valorItem) || isNaN(valorDistancia)) {
                return res.status(400).json({ message: "Valores para registro inválidos (valores que precisam ser números não são.)." });
            };

            const resultado = await pedidoModel.insertPedido(idCliente, urgencia, distancia, peso, valorItem, valorDistancia)
            res.status(201).json({ message: 'Pedido incluído com sucesso', data: resultado });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
    selecionarPedido: async (req, res) => {
        try {
            const pedidoId = Number(req.query.pedidoId);
            if (!pedidoId || !Number.isInteger(pedidoId) || pedidoId <= 0) {
                return res.status(400).json({ message: 'Por favor, forneça um id válido' });
            }
            const resultado = await pedidoModel.selectPedido(pedidoId);
            res.status(200).json({ message: 'Lista dos pedidos', data: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
    selecionarPedidoCliente: async (req, res) => {
        try {
            const clienteId = Number(req.params.pedidoId);
            if (!clienteId || !Number.isInteger(clienteId) || clienteId <= 0) {
                return res.status(400).json({ message: 'Por favor, forneça um id válido' });
            }
            const resultado = await pedidoModel.selectPedidoCliente(clienteId);
            res.status(200).json({ message: 'Lista dos pedidos', data: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
    atualizarPedido: async (req, res) => {
        try {
            const idPedido = Number(req.params.idPedido);
            if (isNaN(idPedido) || !Number.isInteger(idPedido) || idPedido <= 0) {
                return res.status(400).json({ message: "Forneça um identificador (idPedido) válido." });
            }

            const pedidoAtual = await pedidoModel.selectPedido(idPedido);

            if (!pedidoAtual || pedidoAtual.length === 0) {
                return res.status(404).json({ message: 'Registro não localizado para o ID fornecido.' });
            }

            let { urgencia, distancia, peso, valorPeso, valorDistancia } = req.body;
            urgencia = padronizarTexto(urgencia);
            // Pré-processamento e validação básica dos campos

            if (!urgencia || typeof urgencia !== 'string' && urgencia !== "urgente" && urgencia !== 'nao urgente') {
                return res.status(400).json({ message: "Valores para registro inválidos (urgência deve ser apenas 'urgente' ou 'nao urgente')." });
            }

            const novaUrgencia = urgencia ?? pedidoAtual[0].urgencia;
            const novaDistancia = distancia ?? pedidoAtual[0].distanciaKM;
            const novoPeso = peso ?? pedidoAtual[0].pesoVargaKG;
            const novoValorPeso = valorPeso ?? pedidoAtual[0].valorKG;
            const novoValorDistancia = valorDistancia ?? pedidoAtual[0].valorKM;
            const resultado = await pedidoModel.updatePedido(novaUrgencia, novaDistancia, novoPeso, novoValorPeso, novoValorDistancia, idPedido);
            return res.status(200).json({ message: "Registro Atualizado com Sucesso.", result: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    cancelarPedido: async (req, res) => {
        try {
            const pedidoId = Number(req.params.pedidoId);
            if (!pedidoId || !Number.isInteger(pedidoId) || isNaN(pedidoId) || pedidoId <= 0) {
                return res.status(400).json({ message: 'Por favor, forneça um ID válido' })
            }
            const pedidoSelecionado = await pedidoModel.selectPedido(pedidoId);
            if (pedidoSelecionado.length === 0) {
                throw new Error('O pedido não foi encontrado');
            } else {
                const resultado = await pedidoModel.deletePedido(pedidoId);
                if (resultado.affectedRows == 1) {
                    res.status(200).json({ message: 'O pedido foi cancelado com sucesso', data: resultado })
                } else {
                    throw new Error('Não foi possível cancelar o pedido.');

                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    }
}
module.exports = { pedidoController };