const { entregaModel } = require('../models/entregaModel');

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

const entregaController = {
    /**
     * @description Retorna todas as entregas que estão inseridas no Banco de Dados, ou, via query, retorna os dados específicos de uma entrega através do ID.
     * @function buscarEntrega
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Array<Object>>} Retorna como resposta da requisição, os dados com informações do select
     */
    buscarEntrega: async (req, res) => {
        try {
            const idEntrega = Number(req.query.id);
            if (!idEntrega || idEntrega == undefined || isNaN(idEntrega) || !Number.isInteger(idEntrega)) {
                const resultado = await entregaModel.selectEntrega();
                if (resultado.length === 0) {
                    return res.status(200).json({ message: 'Não há nenhuma entrega registrada no banco de dados no momento.' })
                } else {
                    return res.status(200).json({ message: "Resultado dos dados listados:", data: resultado });
                }
            }
            if (isNaN(idEntrega) || idEntrega <= 0 || !Number.isInteger(idEntrega)) {
                return res.status(400).json({ message: "O valor inserido para o ID é inválido." });
            }
            const resultado = await entregaModel.selectEntrega(idEntrega);

            if (resultado.length === 0) {
                return res.status(404).json({ message: "O ID em questão não possui entrega alguma cadastrada." });
            }
            return res.status(200).json({ message: "Resultado dos dados listados", data: resultado });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Atualiza a entrega através do envio do ID via parâmetro.
     * @function atualizarEntrega
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do update 
     */
    atualizarEntrega: async (req, res) => {
        try {
            const idEntrega = Number(req.params.idEntrega);
            const { statusEntrega } = req.body;

            const situacaoEntrega = padronizarTexto(statusEntrega);

            // 1. VALIDAÇÃO DO ID (Mais concisa)
            if (isNaN(idEntrega) || !Number.isInteger(idEntrega) || idEntrega <= 0) {
                // CORRIGIDO: Mensagem mais clara sobre qual ID está sendo validado.
                return res.status(400).json({ message: "O identificador da entrega (idEntrega) deve ser um número inteiro maior que zero." });
            }

            // 2. VALIDAÇÃO DO STATUS (Mais clara)
            const statusValidos = ["calculado", "transito", "entregue", "cancelado"];
            if (!statusEntrega || !statusValidos.includes(situacaoEntrega)) {
                return res.status(400).json({
                    message: `Status de entrega inválido. Por favor, insira um dos seguintes: ${statusValidos.join(', ')}.`
                });
            }

            // 3. VERIFICAÇÃO DE EXISTÊNCIA (Tratamento de 404)
            // É crucial verificar se a entrega existe antes de tentar atualizar
            const entregaAtual = await entregaModel.selectEntrega(idEntrega);

            if (!entregaAtual || entregaAtual.length === 0) {
                return res.status(404).json({ message: 'Entrega não encontrada para o ID fornecido.' });
            }

            // 4. ATUALIZAÇÃO
            const resultado = await entregaModel.updateEntrega(idEntrega, situacaoEntrega);

            // 5. RESPOSTA
            if (resultado.affectedRows > 0) {
                return res.status(200).json({ message: "Status da Entrega atualizado com sucesso!", data: resultado });
            } else {
                // Caso a operação SQL não altere nenhuma linha (e.g., status já era o mesmo)
                return res.status(200).json({ message: "Status não foi alterado (o status fornecido já era o status atual).", data: resultado });
            }

        } catch (error) {
            console.error(error);
            // Uso de return para garantir que a função se encerra após o erro
            return res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Adiciona os dados de uma entrega para o Banco de Dados
     * @function inserirEntrega
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do insert
     */
    inserirEntrega: async (req, res) => {
        try {
            const idPedidoFK = Number(req.params.idPedidoFK);
            const { statusEntrega } = req.body;
            const situacaoEntrega = padronizarTexto(statusEntrega);
            if (isNaN(idPedidoFK) || idPedidoFK == undefined || !idPedidoFK || idPedidoFK <= 0 || !Number.isInteger(idPedidoFK)) {
                return res.status(400).json({ message: "Você deve inserir um número inteiro maior que zero para o campo de idPedidoFK" });
            }
            if (situacaoEntrega !== "calculado" && situacaoEntrega !== "transito" && situacaoEntrega !== "entregue" && situacaoEntrega !== "cancelado") {
                return res.status(400).json({ message: "Você deve inserir um dos quatro possíveis status de entrega: calculado, transito, entregue e cancelado." });
            }
            const resultado = await entregaModel.addEntrega(idPedidoFK, situacaoEntrega);
            return res.status(200).json({ message: "Registro incluído com sucesso!", data: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Deleta os dados de um cliente de acordo com seu ID.
     * @function cancelarEntrega
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do delete
     */
    cancelarEntrega: async (req, res) => {
        try {
            const idEntrega = Number(req.params.idEntrega);
            if (!idEntrega || idEntrega <= 0 || isNaN(idEntrega) || !Number.isInteger(idEntrega)) {
                return res.status(400).json({ message: "Você deve inserir um número inteiro positivo para o campo de id." });
            }

            const entregaSelecionada = await entregaModel.selectEntrega(idEntrega);

            if (entregaSelecionada.length === 0) {
                return res.status(404).json({ message: "O ID em questão não possui cliente algum cadastrado." });
            }

            const resultado = await entregaModel.deleteEntrega(idEntrega);

            if (resultado && resultado.affectedRows === 1) {
                res.status(200).json({ message: 'Entrega excluída com sucesso', data: resultado });
            } else {
                // Lança um erro se a exclusão falhar no Model
                throw new Error("Não foi possível excluir a entrega (0 affectedRows).");
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    }
}

module.exports = { entregaController };