const {pedidoModel} = require ('../models/pedidoModel');
const pedidoController = {
    addPedido:async (req, res) => {
        try {
            const {idCliente, urgencia, distancia, peso, valorItem, valorDistancia} = req.body;
            if (!idCliente || !urgencia || !distancia || !peso || !valorItem || !valorDistancia ) {
                return res.status(400).json({message: 'Por favor, verifique os dados adicionados e envie novamente'});
            }

            const resultado = await pedidoModel.inserirPedido(idCliente, urgencia, distancia, peso, valorItem, valorDistancia)
            res.status(201).json({message: 'Pedido incluído com sucesso', data: resultado});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    },
    selecionarPedido:async (req, res) => {
        try {
            const resultado = pedidoModel.selecionarTodosPedidos();
            if (resultado.length === 0) {
                return res.status(200).json({ message: 'A tabela não contém dados'});
            }

            res.status(200).json({message: 'Lista de todos os pedidos inseridos', data: resultado});

        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    },
    selecionarPedidoId:async (req, res) => {
        try {
            const pedidoId = Number(req.params.pedidoId);
            if (!pedidoId || Number.isInteger(pedidoId)) {
                return res.status(400).json({message: 'Por favor, forneça um id válido'});
            }
            const resultado = await pedidoModel.selecionarPedidosId(pedidoId);
            res.status(200).json({message: 'Lista dos pedidos', data: resultado});

        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    },
    atualizarPedido:async (req, res) => {
        try {
            const idCliente = Number(req.params.idCliente);
            let {urgencia, distancia, peso, valorItem, valorDistancia} = req.body;

            if (!idCliente || !Number.isInteger(idCliente)  || !urgencia || !distancia || !peso || !valorItem || !valorDistancia) {
                
            }
        } catch (error) {
            
        }
    },
    deletePedido:async (req, res) => {
        const pedidoId = Number(req.params.pedidoId);
        if (!pedidoId || !Number.isInteger(pedidoId)) {
            return res.status(400).json({message: 'Por favor, forneça um ID válido'})
        }
        const pedidoSelecionado = await pedidoModel.selecionarPedidosId(pedidoId);
        if (pedidoSelecionado.length === 0) {
            throw new Error('O pedido não foi encontrado');
        } else {
            const resultado = await pedidoModel.cancelarPedido(pedidoId);
            if (resultado.affectedrows == 1) {
                res.status(200).json({message: 'O pedido foi cancelado com sucesso', data: resultado})
            } else {
                throw new Error('Não foi possível cancelar o pedido.');
                
            }
        }
    }
}
module.exports = {pedidoController};