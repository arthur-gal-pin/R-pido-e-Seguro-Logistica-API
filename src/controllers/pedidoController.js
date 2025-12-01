const { pedidoModel } = require('../models/pedidoModel');

/**
 * @function padronizarTexto
 * @param {String} texto 
 * @returns {texto}
 * @example
 * const padronizarTexto = (texto) => {
    // Garante que o texto existe antes de tentar normalizar
    if (!texto) return '';

    return texto
        .toLowerCase() // 1. Converte para minúsculas
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // 2. Remove acentos e caracteres diacríticos
}
        // Saída esperada
        Texto original: 'Não olhe.'

        Texto padronizado: 'nao olhe'
 */
const padronizarTexto = (texto) => {
    // Garante que o texto existe antes de tentar normalizar
    if (!texto) return '';

    return texto
        .toLowerCase() // 1. Converte para minúsculas
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // 2. Remove acentos e caracteres diacríticos
}
const pedidoController = {

    /**
         * @description Adiciona (executa um create) um novo pedido ao Banco de Dados
         * @function addPedido
         * @async
         * @param {Request} req Requisição HTTP
         * @param {Response} res Resposta HTTP
         * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do insert
         */
    addPedido: async (req, res) => {
        try {
            let { idCliente, urgencia, distancia, peso, valorItem, valorDistancia } = req.body;
            if (!idCliente || !urgencia || !distancia || !peso || !valorItem || !valorDistancia) {
                return res.status(400).json({ message: 'Por favor, verifique os dados adicionados e envie novamente' });
            }
            urgencia = padronizarTexto(urgencia);
            console.log(urgencia);

             // const consultaIdCliente = await clienteModel.selecionarCliente
            
            if (!urgencia || typeof urgencia !== 'string' && urgencia !== "urgente" && urgencia !== 'nao urgente') {
                return res.status(400).json({ message: "Valores para registro inválidos (urgência deve ser apenas 'urgente' ou 'nao urgente')." });
            }
            if (isNaN(distancia) || isNaN(peso) || isNaN(valorItem) || isNaN(valorDistancia)) {
                return res.status(400).json({ message: "Valores para registro inválidos (valores que precisam ser números não são)." });
            };

            const resultado = await pedidoModel.insertPedido(idCliente, urgencia, distancia, peso, valorItem, valorDistancia)
            res.status(201).json({ message: 'Pedido incluído com sucesso', data: resultado });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
    /**
     * @description Retorna todos os pedidos que estão inseridas no Banco de Dados.
     * @function selecionarPedido
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Array<Object>>} Retorna como resposta da requisição, os dados com informações do select
     */
    selecionarPedido: async (req, res) => {
        try {
            // Se req.query.id for undefined, Number(req.query.id) resulta em NaN, que é falsy.
            // Se for string vazia, resulta em 0, que é falsy.
            const id = Number(req.query.id);

            // Bloco para buscar todos os clientes (ID não fornecido ou inválido)
            if (!id || isNaN(id) || id <= 0 || !Number.isInteger(id)) {
                const resultado = await pedidoModel.selectPedido();

                if (resultado.length === 0) {
                    return res.status(200).json({ message: "Não há nenhum pedido cadastrado na base de dados no momento." });
                }
                return res.status(200).json({ message: "Resultado dos dados listados:", data: resultado });
            }

            // Bloco para buscar cliente por ID específico (ID válido)
            const resultado = await pedidoModel.selectPedido(id);

            if (resultado.length === 0) {
                return res.status(404).json({ message: "O ID em questão não possui pedido algum cadastrado." });
            }
            return res.status(200).json({ message: "Resultado dos dados listados", data: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /** 
     * @description Retorna os pedidos que estão inseridas no Banco de Dados de acordo com o ID do cliente.
     * @function selecionarPedidoCliente
     * @param {Request} req 
     * @param {Response} res 
     * @returns {Promise<Array<Object>>} Retorna como resposta da requisição, os dados com informações do select
     */
    selecionarPedidoCliente: async (req, res) => {
        try {
            const clienteId = Number(req.params.idCliente);
            console.log(req.params.idPedido);
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
    /**
     * @description Atualiza o pedido através do ID via parâmetro
     * @function atualizarPedido
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do update
     */
    atualizarPedido: async (req, res) => {
        try {
            const idPedido = Number(req.params.idPedido);

            // 1. F: FETCH (Busca e Validação Inicial)
            if (isNaN(idPedido) || !Number.isInteger(idPedido) || idPedido <= 0) {
                return res.status(400).json({ message: "Forneça um identificador (idPedido) válido." });
            }

            const pedidoAtualArr = await pedidoModel.selectPedido(idPedido);

            if (!pedidoAtualArr || pedidoAtualArr.length === 0) {
                return res.status(404).json({ message: 'Registro não localizado para o ID fornecido.' });
            }
            const pedidoAtual = pedidoAtualArr[0]; // Pega o primeiro e único pedido

            // 2. M: MERGE (Fusão dos Dados Antigos e Novos)
            // Desestrutura os novos valores, que podem ser undefined, null, "" ou valores válidos
            let { urgencia, distancia, peso, valorItem, valorDistancia } = req.body;

            // Tratamento da urgência (texto)
            const urgenciaRecebida = (urgencia !== undefined) ? padronizarTexto(urgencia) : undefined;

            // Lógica de MERGE para cada campo:
            // Se o campo for enviado (não é undefined), usa o novo valor.
            // Se não foi enviado (é undefined), usa o valor atual do banco.

            // Merge para Urgência (Texto)
            const novaUrgencia = (urgenciaRecebida !== undefined && urgenciaRecebida !== '')
                ? urgenciaRecebida
                : pedidoAtual.urgencia;

            // Merge para campos Numéricos
            const novaDistancia = (distancia !== undefined)
                ? Number(distancia)
                : pedidoAtual.distanciaKM;

            const novoPeso = (peso !== undefined)
                ? Number(peso)
                : pedidoAtual.pesoCargaKG;

            // CORRIGIDO: Usando 'valorItem' para consistência (no banco é valorKG)
            const novoValorItem = (valorItem !== undefined)
                ? Number(valorItem)
                : pedidoAtual.valorKG;

            const novoValorDistancia = (valorDistancia !== undefined)
                ? Number(valorDistancia)
                : pedidoAtual.valorKM;

            // 3. V: VALIDATE (Validação da Nova Estrutura Mesclada)
            const tiposValidos = ['urgente', 'nao urgente'];

            if (!tiposValidos.includes(novaUrgencia)) {
                return res.status(400).json({
                    message: `Urgência inválida: ${novaUrgencia}. Deve ser 'urgente' ou 'nao urgente'.`
                });
            }

            // Valida se os valores mesclados são, de fato, números válidos
            if (isNaN(novaDistancia) || isNaN(novoPeso) || isNaN(novoValorItem) || isNaN(novoValorDistancia)) {
                return res.status(400).json({
                    message: "Distância, peso e valores devem ser números válidos (verifique se os campos foram deixados vazios ou com texto)."
                });
            }

            // 4. U: UPDATE (Atualização no Model)
            const resultado = await pedidoModel.updatePedido(
                novaUrgencia,
                novaDistancia,
                novoPeso,
                novoValorItem, // Renomeado para consistência
                novoValorDistancia,
                idPedido
            );
            return res.status(200).json({ message: "Registro Atualizado com Sucesso.", result: resultado });

        } catch (error) {
            console.error(error);
            // Uso de res.status().json() para garantir que a resposta seja enviada
            return res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Cancela o pedido através do ID via parâmetro.
     * @function cancelarPedido
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados dom informações do delete.
     */
    cancelarPedido: async (req, res) => {
        try {
            const pedidoId = Number(req.params.idPedido);
            if (!pedidoId || !Number.isInteger(pedidoId) || isNaN(pedidoId) || pedidoId <= 0) {
                return res.status(400).json({ message: 'Por favor, forneça um ID válido' })
            }
            const pedidoSelecionado = await pedidoModel.selectPedido(pedidoId);
            if (pedidoSelecionado.length === 0) {
                throw new Error('O pedido não foi encontrado');
            } else {
                const resultado = await pedidoModel.deletePedido(pedidoId);
                if (resultado.pedidoRows.affectedRows === 1) {
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