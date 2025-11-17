const { clienteModel, telefoneModel, enderecoModel } = require('../models/clienteModel');

const removerAcentos = (texto) => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const clienteController = {
    buscarClientes: async (req, res) => {
        try {
            const id = Number(req.query.id);
            if (!id) {
                const resultado = await clienteModel.selecionarCliente(id);
                if (resultado.length === 0 || !resultado) {
                    return res.status(200).json({ message: "Não há nenhum cliente cadastrado na base de dados no momento." });
                }
                return res.status(200).json({ message: "Resultado dos dados listados:", data: resultado });
            } else {
                if (!Number.isInteger(id) || id <= 0) {
                    return res.status(400).json({ message: "Forneça um identificador (id) válido." });
                }
                const resultado = await clienteModel.selecionarCliente(id);
                if (resultado.length === 0) {
                    return res.status(404).json({ message: "O ID em questão não possui cliente algum cadastrado." });
                }
                return res.status(200).json({ message: "Resultado dos dados listados", data: resultado });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    buscarClientePorCpf: async (req, res) => {
        try {
            const cpf = (req.params.cpfCliente).replace(/\./g, "");
            if (!cpf || cpf.length != 11) {
                return res.status(400).json({ message: "Forneça um identificador (CPF) válido." });
            }
            const resultado = await clienteModel.selecionarCpf(cpf);
            if (resultado.length === 0) {
                throw new Error({ message: "O ID em questão não possui cliente algum cadastrado." });
            }
            return res.status(200).json({ message: "Resultado dos dados listados", data: resultado });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    adicionarCliente: async (req, res) => {
        try {
            let { cpfCliente, nomeCliente } = req.body;
            cpfCliente = cpfCliente.replace(/\./g, "");
            if (!cpfCliente || cpfCliente.length != 11 || !String(nomeCliente) || nomeCliente.length < 3) {
                return res.status(400).json({ message: "Valores para registro inválidos." });
            }

            const consultaCpf = await clienteModel.selecionarCpf(cpfCliente);

            if (consultaCpf.length === 0) {
                const resultado = await clienteModel.addCliente(cpfCliente, nomeCliente);
                return res.status(200).json({ message: "Registro Incluído com Sucesso.", result: resultado });
            } else {
                res.status(409).json({ message: 'Ocorreu um erro ao incluir o registro. O CPF inserido foi igual a um já cadastrado na base de dados.' });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    atualizarCliente: async (req, res) => {
        try {
            const idCliente = Number(req.params.idCliente);
            let { cpfCliente, nomeCliente } = req.body;
            cpfCliente = cpfCliente.replace(/\./g, "");
            if (!cpfCliente || cpfCliente.length != 11 || !String(nomeCliente) || nomeCliente.length < 3) {
                return res.status(400).json({ message: "Valores para registro inválidos." });
            }
            const clienteAtual = await clienteModel.selecionarCliente(idCliente);

            if (!clienteAtual || clienteAtual.length === 0) {
                throw new Error('Registro não localizado.');
            }

            const novoNome = nomeCliente.trim() ?? clienteAtual[0].cpfCliente;
            const novoCpf = cpfCliente.trim() ?? clienteAtual[0].nomeCliente;

            const consultaCpf = await clienteModel.selecionarPorCpfUpdate(cpfCliente, idCliente);

            if (consultaCpf.length === 0) {
                const resultado = await clienteModel.updateCliente(idCliente, novoCpf, novoNome);
                return res.status(200).json({ message: "Registro Atualizado com Sucesso.", result: resultado });
            } else {
                throw new Error('Ocorreu um erro ao incluir o registro. O CPF inserido  foi igual a um já cadastrado na base de dados.');
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    excluirCliente: async (req, res) => {
        try {
            const id = Number(req.params.idCliente);
            if (!id || id <= 0 || isNaN(id) || !Number.isInteger(id)) {
                res.status(400).json({ message: "Você deve inserir um número inteiro para campo de ID." });
            }
            const clienteSelecionado = await clienteModel.selecionarCliente(id);

            if (clienteSelecionado.length === 0) {
                throw new Error("O ID em questão não possui cliente algum cadastrado.");
            } else {
                const resultado = await clienteModel.deleteCliente(id);
                if (resultado.affectedRows === 1) {
                    res.status(200).json({ message: 'Cliente excluído com sucesso', data: resultado });
                } else {
                    throw new Error("Não foi possível excluir o cliente.");
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    }
}

const telefoneController = {
    buscarTelefoneId: async (req, res) => {
        try {
            // 1. Tenta obter o ID do telefone da rota (req.params)
            // Se req.params.idTelefone não existir ou for inválido, idTelefone será 0 ou NaN.
            const idTelefone = Number(req.params.idTelefone);

            // Se o ID não for fornecido ou for inválido, busca todos.
            // O `req.params` geralmente sempre tem um valor (mesmo que seja uma string vazia se a rota for mal definida),
            if (!idTelefone || idTelefone <= 0 || isNaN(idTelefone) || !Number.isInteger(idTelefone)) {

                // 2. Busca Todos os Telefones (idTelefone é inválido/ausente)
                // O modelo `selecionarTelefoneId` deve ser capaz de lidar com um ID inválido/nulo
                // para retornar todos, assim como o `selecionarCliente` faz.
                const resultado = await telefoneModel.selecionarTelefoneId(); // Passa sem ID (ou undefined)

                if (resultado.length === 0) {
                    // Retorna 200 OK, mas sem conteúdo de telefone
                    return res.status(200).json({ message: "Não há nenhum telefone cadastrado na base de dados no momento." });
                }

                return res.status(200).json({ message: "Resultado dos dados de todos os telefones listados:", data: resultado });

            } else {
                // 3. Busca Telefone Específico por ID Válido

                // Note: A validação de ID foi simplificada/movida. Se chegou aqui, idTelefone é um número inteiro > 0.

                const resultado = await telefoneModel.selecionarTelefoneId(idTelefone);

                if (resultado.length === 0) {
                    // Retorna 404 se o ID foi fornecido, mas não encontrou o recurso
                    return res.status(404).json({ message: "O ID em questão não possui telefone algum cadastrado." });
                }

                return res.status(200).json({ message: "Resultado dos dados do telefone listados", data: resultado });
            }

        } catch (error) {
            console.error(error);
            // Garante que o erro do servidor seja retornado com status 500
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    buscarTelefoneCliente: async (req, res) => {
        try {
            const idClienteFK = Number(req.params.idClienteFK);
            if (!idClienteFK || idClienteFK <= 0 || isNaN(idClienteFK) || !Number.isInteger(idClienteFK)) {
                res.status(400).json({ message: "Você deve inserir um número natural maior que zero para o campo de ID." });
            }
            const resultado = await telefoneModel.selecionarTelefoneCliente(idClienteFK);
            if (resultado.length === 0 || !resultado) {
                return res.status(404).json({ message: "O ID em questão não possui cliente algum cadastrado." });
            }
            return res.status(200).json({ message: "Resultado dos dados listados", data: resultado });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    adicionarTelefone: async (req, res) => {
        try {
            let { idClienteFK, tipoTelefone, numeroTelefone } = req.body;
            if (!idClienteFK || idClienteFK <= 0 || isNaN(idClienteFK) || !Number.isInteger(idClienteFK)) {
                res.status(400).json({ message: "Você deve inserir um número natural maior que zero para o campo de ID." });
            }
            tipoTelefone = removerAcentos(tipoTelefone.toLowerCase());
            if (!tipoTelefone || tipoTelefone !== "fixo" || tipoTelefone !== "movel") {
                res.status(400).json({ message: "Você deve inserir na região 'tipoTelefone' apenas os valores 'móvel' ou 'fixo'" });
            }
            if (!numeroTelefone || !(typeof numeroTelefone === 'string')) {
                res.status(400).json({ message: "Você deve inserir na região 'numeroTelefone' apenas valores em 'string'." })
            }
            const resultado = await telefoneModel.addTelefone(idClienteFK, numeroTelefone, tipoTelefone);
            return res.status(200).json({ message: "Registro Incluído com Sucesso.", result: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    atualizarTelefone: async (req, res) => {
        try {
            const idTelefone = Number(req.params.idTelefone);
            let { numeroTelefone, tipoTelefone } = req.body;
            tipoTelefone = removerAcentos(tipoTelefone.toLowerCase());
            if (!tipoTelefone || tipoTelefone !== "fixo" || tipoTelefone !== "movel") {
                res.status(400).json({ message: "Você deve inserir na região 'tipoTelefone' apenas os valores 'móvel' ou 'fixo'" });
            }
            if (!numeroTelefone || !(typeof numeroTelefone === 'string')) {
                res.status(400).json({ message: "Você deve inserir na região 'numeroTelefone' apenas valores em 'string'." })
            }
            const telefoneAtual = await telefoneModel.selecionarTelefoneId(idTelefone);

            if (!clienteAtual || clienteAtual.length === 0) {
                throw new Error('Registro não localizado.');
            }

            const novoNome = nomeCliente.trim() ?? clienteAtual[0].cpfCliente;
            const novoCpf = cpfCliente.trim() ?? clienteAtual[0].nomeCliente;

            const consultaCpf = await clienteModel.selecionarPorCpfUpdate(cpfCliente, idCliente);

            if (consultaCpf.length === 0) {
                const resultado = await clienteModel.updateCliente(idCliente, novoCpf, novoNome);
                return res.status(200).json({ message: "Registro Atualizado com Sucesso.", result: resultado });
            } else {
                throw new Error('Ocorreu um erro ao incluir o registro. O CPF inserido  foi igual a um já cadastrado na base de dados.');
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    }
}

const enderecoController = {}

module.exports = { clienteController, telefoneController, enderecoController };