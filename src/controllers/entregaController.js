const { entregaModel } = require('../models/entregaModel');


const padronizarTexto = (texto) => {
    // Garante que o texto existe antes de tentar normalizar
    if (!texto) return '';

    return texto
        .toLowerCase() // 1. Converte para minúsculas
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // 2. Remove acentos e caracteres diacríticos
        .replace(/ /g, ""); // 3. Remove todos os espaços
}

const entregaController = {
    buscarEntrega: async (req, res) => {
        try {
            const idEntrega = Number(req.query.id);
            if (!idEntrega || idEntrega == undefined) {
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
    atualizarEntrega: async (req, res) => {
        try {
            const idEntrega = Number(req.params.idEntrega);
            const { statusEntrega } = req.body;
            const situacaoEntrega = padronizarTexto(statusEntrega);
            if (isNaN(idEntrega) || idEntrega == undefined || !idEntrega || idEntrega <= 0 || !Number.isInteger(idEntrega)) {
                return res.status(400).json({ message: "Você deve inserir um número inteiro maior que zero para o campo de idPedidoFK" });
            }
            if (situacaoEntrega !== "calculado" && situacaoEntrega !== "transito" && situacaoEntrega !== "entregue" && situacaoEntrega !== "cancelado") {
                return res.status(400).json({ message: "Você deve inserir um dos quatro possíveis status de entrega: calculado, transito, entregue e cancelado." });
            }
            const resultado = await entregaModel.updateEntrega(idEntrega, situacaoEntrega);
            return res.status(200).json({ message: "Registro incluído com sucesso!", data: resultado });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
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
    excluirEntrega: async (req, res) => {
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