const { clienteModel, telefoneModel, enderecoModel } = require('../models/clienteModel');

const removerAcentos = (texto) => {
    // Garante que o texto existe antes de tentar normalizar
    if (!texto) return '';
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
const clienteController = {
    /**
         * @description Retorna todos os clientes listados inseridos no Banco de Dados
         * @function buscarClientes
         * @async
         * @param {Request} req Requisição HTTP
         * @param {Response} res Resposta HTTP
         * @returns {Promise<Array<Object>>} Retorna o conteúdo dos dados da requisição
         */
    buscarClientes: async (req, res) => {
        try {
            // Se req.query.id for undefined, Number(req.query.id) resulta em NaN, que é falsy.
            // Se for string vazia, resulta em 0, que é falsy.
            const id = Number(req.query.id);

            // Bloco para buscar todos os clientes (ID não fornecido ou inválido)
            if (!id || isNaN(id) || id <= 0 || !Number.isInteger(id)) {
                const resultado = await clienteModel.selecionarCliente();

                if (resultado.length === 0) {
                    return res.status(200).json({ message: "Não há nenhum cliente cadastrado na base de dados no momento." });
                }
                return res.status(200).json({ message: "Resultado dos dados listados:", data: resultado });
            }

            // Bloco para buscar cliente por ID específico (ID válido)
            const resultado = await clienteModel.selecionarCliente(id);

            if (resultado.length === 0) {
                return res.status(404).json({ message: "O ID em questão não possui cliente algum cadastrado." });
            }
            return res.status(200).json({ message: "Resultado dos dados listados", data: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Retorna os os dados de cada cliente com a requisição por CPF
     * @function buscarClientePorCpf
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Array<Object>>} Retorna o conteúdo dos dados da requisição
     */
    buscarClientePorCpf: async (req, res) => {
        try {
            const cpfParam = req.params.cpfCliente;
            console.log(cpfParam);
            const cpf = (cpfParam || "").replace(/\./g, "").replace(/-/g, "").trim();

            if (!cpf || cpf.length !== 11) {
                return res.status(400).json({ message: "Forneça um identificador (CPF) válido (11 dígitos, apenas números)." });
            }

            const resultado = await clienteModel.selecionarCpf(cpf);

            if (resultado.length === 0) {
                return res.status(404).json({ message: "O CPF em questão não possui cliente algum cadastrado." });
            }

            return res.status(200).json({ message: "Resultado dos dados listados", data: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Adiciona os dados de cada cliente para o Banco de Dados
     * @function adicionarCliente
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do insert
     */
    adicionarCliente: async (req, res) => {
        try {
            let {
                cpfCliente, nomeCliente, sobrenomeCliente, emailCliente,
                numeroTelefoneCliente, tipoTelefone,
                logradouroCliente, numeroEnderecoCliente, bairro, cidade, estado, cep, complemento
            } = req.body;

            // --- Validação do Cliente ---
            cpfCliente = cpfCliente ? cpfCliente.replace(/\./g, "").replace(/-/g, "").trim() : '';
            if (!cpfCliente || cpfCliente.length !== 11) {
                return res.status(400).json({ message: "CPF inválido (11 dígitos)." });
            }
            if (!nomeCliente || nomeCliente.trim().length < 3 || !sobrenomeCliente || sobrenomeCliente.trim().length < 3) {
                return res.status(400).json({ message: "Nome e Sobrenome são obrigatórios (mín 3 caracteres)." });
            }
            if (!emailCliente || emailCliente.trim().length < 10) {
                return res.status(400).json({ message: "E-mail inválido (mín 10 caracteres)." });
            }

            // --- Validação do Telefone ---
            if (!numeroTelefoneCliente || numeroTelefoneCliente.trim().length === 0) {
                return res.status(400).json({ message: "Número de telefone é obrigatório." });
            }
            tipoTelefone = tipoTelefone ? tipoTelefone.toLowerCase().trim() : '';
            tipoTelefone = removerAcentos(tipoTelefone);
            if (tipoTelefone !== 'fixo' && tipoTelefone !== 'movel') {
                return res.status(400).json({ message: "Tipo de telefone deve ser 'fixo' ou 'movel'." });
            }

            // --- Validação do Endereço ---
            if (!logradouroCliente || !numeroEnderecoCliente || !bairro || !cidade || !estado || !cep) {
                return res.status(400).json({ message: "Dados de endereço incompletos (logradouro, numero, bairro, cidade, estado, cep são obrigatórios)." });
            } else if (cep.length != 8) {
                return res.status(400).json({ message: "O CEP deve conter exatamente 8 dígitos." })
            }

            // --- Checagem de Duplicidade ---
            const consultaCpf = await clienteModel.selecionarCpf(cpfCliente);

            if (consultaCpf.length > 0) {
                return res.status(409).json({ message: 'Ocorreu um erro. O CPF inserido já está cadastrado.' });
            }

            console.log();

            // --- Chamada da Transação ---
            const resultado = await clienteModel.addCliente(
                cpfCliente,
                nomeCliente.trim(),
                sobrenomeCliente,
                emailCliente.trim(),
                numeroTelefoneCliente.trim(),
                tipoTelefone,
                logradouroCliente,
                numeroEnderecoCliente,
                bairro,
                cidade,
                estado,
                cep,
                complemento ? complemento : null
            );

            return res.status(201).json({ message: "Cliente, Telefone e Endereço incluídos com sucesso via transação.", data: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Atualiza os dados do cliente através do ID
     * @function atualizarCliente
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do update 
     */
    atualizarCliente: async (req, res) => {
        try {
            const idCliente = Number(req.params.idCliente);
            if (isNaN(idCliente) || !Number.isInteger(idCliente) || idCliente <= 0) {
                return res.status(400).json({ message: "Forneça um identificador (idCliente) válido." });
            }

            // 1. BUSCAR o cliente atual PRIMEIRO
            const clienteAtualArr = await clienteModel.selecionarCliente(idCliente);
            if (!clienteAtualArr || clienteAtualArr.length === 0) {
                return res.status(404).json({ message: 'Registro não localizado para o ID fornecido.' });
            }
            const clienteAtual = clienteAtualArr[0];

            // 2. Pegar os dados do body
            const { nomeCliente, cpfCliente, sobrenomeCliente, emailCliente } = req.body;

            // 3. Fazer o MERGE (usando o valor do body SE existir, senão o valor atual)
            //    (Usando (var !== undefined) para mais segurança com .trim())
            const novoNome = (nomeCliente !== undefined) ? nomeCliente.trim() : clienteAtual.nomeCliente;
            const novoSobrenome = (sobrenomeCliente !== undefined) ? sobrenomeCliente.trim() : clienteAtual.sobrenomeCliente;
            const novoEmail = (emailCliente !== undefined) ? emailCliente.trim() : clienteAtual.emailCliente;
            const novoCpf = (cpfCliente !== undefined) ? cpfCliente.replace(/\./g, "").replace(/-/g, "").trim() : clienteAtual.cpfCliente;

            if (!novoCpf || novoCpf.length !== 11 ||
                typeof novoNome !== 'string' || novoNome.length < 3 ||
                typeof novoSobrenome !== 'string' || novoSobrenome.length < 3 ||
                typeof novoEmail !== 'string' || novoEmail.length < 10) {
                return res.status(400).json({ message: "Valores para registro inválidos (CPF, Nome, Sobrenome ou E-mail incorretos)." });
            }

            // 5. Verificar duplicidade de CPF
            const consultaCpf = await clienteModel.selecionarPorCpfUpdate(novoCpf, idCliente);

            if (consultaCpf.length === 0) {
                const resultado = await clienteModel.updateCliente(idCliente, novoCpf, novoNome, novoSobrenome, novoEmail);
                return res.status(200).json({ message: "Registro Atualizado com Sucesso.", result: resultado });
            } else {
                return res.status(409).json({ message: 'Ocorreu um erro. O CPF inserido já pertence a outro cliente.' });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Deleta os dados de um cliente de acordo com seu ID
     * @function excluirCliente
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do delete
     */
    excluirCliente: async (req, res) => {
        try {
            const id = Number(req.params.idCliente);
            if (!id || id <= 0 || isNaN(id) || !Number.isInteger(id)) {
                return res.status(400).json({ message: "Você deve inserir um número inteiro positivo para o campo de ID." });
            }

            const clienteSelecionado = await clienteModel.selecionarCliente(id);

            if (clienteSelecionado.length === 0) {
                return res.status(404).json({ message: "O ID em questão não possui cliente algum cadastrado." });
            }

            const resultado = await clienteModel.deleteCliente(id);
            console.log(resultado);

            if (resultado && resultado.rowsClientes.affectedRows === 1) {
                res.status(200).json({ message: 'Cliente excluído com sucesso', data: resultado });
            } else {
                // Lança um erro se a exclusão falhar no Model
                throw new Error("Não foi possível excluir o cliente (0 affectedRows).");
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    }
}

const telefoneController = {
    /**
     * @description Retorna os dados de todos os telefones que estão inseridos no Banco de Dados, além de listar o telefone por ID através de uma query 
     * @function buscarTelefoneId
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Array<Object>>} Retorna o conteúdo com os dados da requisição 
     */
    buscarTelefoneId: async (req, res) => {
        try {
            const idTelefone = Number(req.query.id);

            // Bloco para buscar todos os telefones (ID não fornecido ou inválido)
            if (!idTelefone || idTelefone <= 0 || isNaN(idTelefone) || !Number.isInteger(idTelefone)) {

                const resultado = await telefoneModel.selecionarTelefoneId();

                if (resultado.length === 0) {
                    return res.status(200).json({ message: "Não há nenhum telefone cadastrado na base de dados no momento." });
                }

                return res.status(200).json({ message: "Resultado dos dados de todos os telefones listados:", data: resultado });

            } else {
                // Bloco para buscar telefone por ID específico (ID válido)
                const resultado = await telefoneModel.selecionarTelefoneId(idTelefone);

                if (resultado.length === 0) {
                    return res.status(404).json({ message: "O ID em questão não possui telefone algum cadastrado." });
                }

                return res.status(200).json({ message: "Resultado dos dados do telefone listados", data: resultado });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Retorna os dados do(s) telefone(s) do cliente via parâmetro, ou seja, exibe o(s) telefone(s) através do ID do cliente respectivo
     * @function buscarTelefoneCliente
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP 
     * @returns {Promise<Array<Object>>} Retorna o conteúdo com os dados da requisição
     */
    buscarTelefoneCliente: async (req, res) => {
        try {
            const idClienteFK = Number(req.params.idClienteFK);

            if (!idClienteFK || idClienteFK <= 0 || isNaN(idClienteFK) || !Number.isInteger(idClienteFK)) {
                return res.status(400).json({ message: "Você deve inserir um número inteiro positivo para o campo de ID do cliente." });
            }

            const resultado = await telefoneModel.selecionarTelefoneCliente(idClienteFK);

            if (resultado.length === 0) {
                return res.status(404).json({ message: "O ID de cliente em questão não possui telefone(s) cadastrado(s)." });
            }
            return res.status(200).json({ message: "Resultado dos dados listados", data: resultado });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Adiciona um telefone relacionado à um cliente através de uma requisição feita pelo corpo da página
     * @function adicionarTelefone
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do create
     */
    adicionarTelefone: async (req, res) => {
        try {
            let { idClienteFK, tipoTelefone, numeroTelefone } = req.body;

            // Validação idClienteFK
            idClienteFK = Number(idClienteFK);
            if (!idClienteFK || idClienteFK <= 0 || isNaN(idClienteFK) || !Number.isInteger(idClienteFK)) {
                return res.status(400).json({ message: "Você deve inserir um número inteiro positivo para o campo de ID do cliente." });
            }

            consultaCliente = await telefoneModel.selecionarTelefoneCliente(idClienteFK);
            if (consultaCliente.length === 0) {
                return res.status(404).json({ message: "Não foi encontrado nenhum cliente com esse ID no banco de dados." })
            }

            // Validação tipoTelefone
            tipoTelefone = removerAcentos(tipoTelefone ? tipoTelefone.toLowerCase() : '');
            if (!tipoTelefone || (tipoTelefone !== "fixo" && tipoTelefone !== "movel")) {
                return res.status(400).json({ message: "Você deve inserir na região 'tipoTelefone' apenas os valores 'móvel' ou 'fixo'." });
            }

            // Validação numeroTelefone 
            // Validar tamanho do telefone
            if (!numeroTelefone || typeof numeroTelefone !== 'string' || numeroTelefone.trim().length === 0) {
                return res.status(400).json({ message: "Você deve inserir na região 'numeroTelefone' um valor em string não vazio." })
            }

            const resultado = await telefoneModel.addTelefone(idClienteFK, numeroTelefone.trim(), tipoTelefone);
            return res.status(200).json({ message: "Registro Incluído com Sucesso.", result: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Atualiza os dados do telefone relacionado à um cliente através de uma requisição feita pelo corpo da página
     * @function atualizarTelefone
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do update
     */
    atualizarTelefone: async (req, res) => {
        try {
            // 1. FETCH & Validação do ID 
            const idTelefone = Number(req.params.idTelefone);
            if (isNaN(idTelefone) || !Number.isInteger(idTelefone) || idTelefone <= 0) {
                return res.status(400).json({ message: "Forneça um identificador (idTelefone) válido na rota." });
            }

            const telefoneAtualArr = await telefoneModel.selecionarTelefoneId(idTelefone);

            if (!telefoneAtualArr || telefoneAtualArr.length === 0) {
                return res.status(404).json({ message: 'Registro de telefone não localizado.' });
            }

            // Desestrutura o objeto atual para facilitar o acesso (CORREÇÃO 2)
            const telefoneAtual = telefoneAtualArr[0];

            // 2. MERGE (Fusão dos dados)
            let { numeroTelefone, tipoTelefone } = req.body;

            // Limpeza dos dados de entrada
            const tipoRecebido = (tipoTelefone !== undefined) ? tipoTelefone.trim().toLowerCase() : undefined;

            // Os IDs (PK e FK) são mantidos, apenas os dados do corpo são atualizados.
            const idClienteFK = telefoneAtual.idClienteFK; // Obtendo a FK do registro atual

            const novoNumero = (numeroTelefone !== undefined) ? numeroTelefone : telefoneAtual.numeroTelefone;
            const novoTipoTelefone = (tipoRecebido !== undefined) ? tipoRecebido : telefoneAtual.tipoTelefone;

            // 3. VALIDAÇÃO Pós-Merge (CORREÇÃO 3)
            const tiposValidos = ['fixo', 'movel'];

            if (!novoNumero || novoNumero.length < 8 || novoNumero.length > 20) {
                return res.status(400).json({ message: "Número de telefone inválido ou ausente." });
            }

            if (!tiposValidos.includes(novoTipoTelefone)) {
                return res.status(400).json({ message: `Tipo de telefone inválido: '${novoTipoTelefone}'. Use 'fixo' ou 'movel'.` });
            }

            // 4. UPDATE
            // Atenção: A função updateTelefone deve ter a assinatura correta: (idTelefone, idClienteFK, numeroTelefone, tipoTelefone)
            const resultado = await telefoneModel.updateTelefone(idTelefone, idClienteFK, novoNumero, novoTipoTelefone);

            return res.status(200).json({ message: "Registro Atualizado com Sucesso.", result: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },
    /**
     * @description Deleta os dados do(s) telefone(s) através de seu ID
     * @function deletarTelefone
     * @async
     * @param {Request} req Requisição HTTP
     * @param {Response} res Resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do delete
     */
    deletarTelefone: async (req, res) => {
        try {
            const idTelefone = Number(req.params.idTelefone);

            if (isNaN(idTelefone) || !Number.isInteger(idTelefone) || idTelefone <= 0) {
                return res.status(400).json({ message: 'Por favor, forneça um ID válido' });
            }
            const idTelefoneSelecionado = await telefoneModel.selecionarTelefoneId(idTelefone);
            if (!idTelefone || idTelefoneSelecionado.length === 0) {
                throw new Error('O telefone não foi localizado');
            } else {
                const resultado = await telefoneModel.deletarTelefone(idTelefone);
                if (resultado && resultado.affectedRows > 0) {
                    res.status(200).json({ message: 'Registro do telefone excluído com sucesso', data: resultado });
                } else {
                    throw new Error('Não foi possível excluir o produto');
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    }
}

const enderecoController = {
    /**
     * @description Busca todos os endereços ou um endereço por ID.
     * @function buscarEnderecos
     * @async
     * @param {Request} req Objeto da requisição HTTP
     * @param {Response} res Objeto de resposta HTTP
     * @returns {Promise<Array<Object>>} Retorna um Objeto JSON contendo todos os endereços inseridos no Banco de Dados
     */
    buscarEnderecos: async (req, res) => {
        try {
            const idEndereco = Number(req.query.id);

            // Bloco para buscar TODOS os endereços
            if (!idEndereco || isNaN(idEndereco) || !Number.isInteger(idEndereco) || idEndereco <= 0) {
                const resultado = await enderecoModel.selecionarEnderecoId(); // Chama sem ID

                if (resultado.length === 0) {
                    return res.status(200).json({ message: "Não há nenhum endereço cadastrado na base de dados." });
                }
                return res.status(200).json({ message: "Resultado de todos os endereços listados:", data: resultado });
            }

            // Bloco para buscar por ID específico
            const resultado = await enderecoModel.selecionarEnderecoId(idEndereco);

            if (resultado.length === 0) {
                return res.status(404).json({ message: "O ID em questão não possui endereço algum cadastrado." });
            }
            return res.status(200).json({ message: "Resultado do endereço listado", data: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },

    /**
     * @description Busca todos os endereços de um cliente específico.
     * @function buscarEnderecoPorCliente
     * @async
     * @param {Request} req Objeto da requisição HTTP
     * @param {Response} res Objeto de resposta HTTP
     * @returns {Promise<Array<Object>>} Retorna um Objeto JSON contendo todos os endereços inseridos no Banco de Dados de acordo com o cliente
     */
    buscarEnderecoPorCliente: async (req, res) => {
        try {
            const idClienteFK = Number(req.params.idClienteFK);

            if (!idClienteFK || idClienteFK <= 0 || isNaN(idClienteFK) || !Number.isInteger(idClienteFK)) {
                return res.status(400).json({ message: "Você deve inserir um ID de cliente (número inteiro positivo) válido." });
            }

            const resultado = await enderecoModel.selecionarEnderecoCliente(idClienteFK);

            if (resultado.length === 0) {
                return res.status(404).json({ message: "O ID de cliente em questão não possui endereço(s) cadastrado(s)." });
            }
            return res.status(200).json({ message: "Endereços do cliente listados", data: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },

    /**
     * @description Adiciona um novo endereço a um cliente.
     * @function adicionarEndereco
     * @async
     * @param {Request} req Objeto da requisição HTTP
     * @param {Response} res Objeto de resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do create
     */
    adicionarEndereco: async (req, res) => {
        try {
            let { idClienteFK, logradouro, numero, bairro, cidade, estado, cep, complemento } = req.body;

            // 1. Validar o ID do Cliente
            idClienteFK = Number(idClienteFK);
            if (!idClienteFK || idClienteFK <= 0 || isNaN(idClienteFK) || !Number.isInteger(idClienteFK)) {
                return res.status(400).json({ message: "Você deve inserir um 'idClienteFK' (número inteiro positivo) válido." });
            }

            // 2. Verificar se o Cliente existe (Evita erro de Foreign Key)
            const cliente = await clienteModel.selecionarCliente(idClienteFK);
            if (cliente.length === 0) {
                return res.status(404).json({ message: "Não é possível adicionar endereço. O cliente (idClienteFK) não foi encontrado." });
            }

            // 3. Validar campos obrigatórios (strings)
            if (!logradouro || typeof logradouro !== 'string' || logradouro.trim().length === 0 ||
                !numero || typeof numero !== 'string' || numero.trim().length === 0 || // 'numero' como string é comum
                !bairro || typeof bairro !== 'string' || bairro.trim().length === 0 ||
                !cidade || typeof cidade !== 'string' || cidade.trim().length === 0 ||
                !estado || typeof estado !== 'string' || estado.trim().length === 0 ||
                !cep || typeof cep !== 'string' || cep.trim().length === 0 || cep.trim().length != 8) {
                return res.status(400).json({ message: "Valores inválidos. Os campos 'logradouro', 'numero', 'bairro', 'cidade', 'estado' e 'cep' são obrigatórios." });
            }

            // 4. Limpar dados
            const pLogradouro = logradouro.trim();
            const pNumero = numero.trim();
            const pBairro = bairro.trim();
            const pCidade = cidade.trim();
            const pEstado = estado.trim();
            const pCep = cep.trim();
            // Complemento é opcional
            const pComplemento = complemento ? complemento.trim() : null;

            // 5. Chamar o Model
            const resultado = await enderecoModel.addEndereco(
                idClienteFK, pLogradouro, pNumero, pBairro, pCidade, pEstado, pCep, pComplemento
            );

            return res.status(201).json({ message: "Endereço incluído com sucesso.", result: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },

    /**
     * @description Atualiza um endereço por completo.
     * @function atualizarEndereco
     * @async
     * @param {Request} req Objeto da requisição HTTP
     * @param {Response} res Objeto de resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do update
     */
    atualizarEndereco: async (req, res) => {
        try {
            const idEndereco = Number(req.params.idEndereco);
            if (isNaN(idEndereco) || !Number.isInteger(idEndereco) || idEndereco <= 0) {
                return res.status(400).json({ message: "Forneça um identificador (idEndereco) válido." });
            }

            // 1. Busca o endereço atual
            const enderecoAtualArr = await enderecoModel.selecionarEnderecoId(idEndereco);
            if (!enderecoAtualArr || enderecoAtualArr.length === 0) {
                return res.status(404).json({ message: 'Registro de endereço não localizado.' });
            }
            const enderecoAtual = enderecoAtualArr[0];

            // 2. Lógica de Merge (igual fizemos no atualizarCliente)
            const { logradouro, numero, bairro, cidade, estado, cep, complemento } = req.body;

            const novoLogradouro = (logradouro !== undefined) ? logradouro.trim() : enderecoAtual.logradouro;
            const novoNumero = (numero !== undefined) ? numero.trim() : enderecoAtual.numero;
            const novoBairro = (bairro !== undefined) ? bairro.trim() : enderecoAtual.bairro;
            const novoCidade = (cidade !== undefined) ? cidade.trim() : enderecoAtual.cidade;
            const novoEstado = (estado !== undefined) ? estado.trim() : enderecoAtual.estado;
            const novoCep = (cep !== undefined) ? cep.trim() : enderecoAtual.cep;
            const novoComplemento = (complemento !== undefined) ? complemento.trim() : enderecoAtual.complemento;

            // 3. Validação dos dados finais (após o merge)
            if (!novoLogradouro || !novoNumero || !novoBairro || !novoCidade || !novoEstado || !novoCep) {
                return res.status(400).json({ message: "Valores inválidos. Os campos 'logradouro', 'numero', 'bairro', 'cidade', 'estado' e 'cep' não podem ser nulos." });
            }

            // 4. Chamar o Model
            const resultado = await enderecoModel.updateEndereco(
                idEndereco,
                enderecoAtual.idClienteFK, // idClienteFK (do objeto atual)
                novoLogradouro,
                novoNumero,
                novoBairro,
                novoCidade,
                novoEstado,
                novoCep,
                novoComplemento
            );

            return res.status(200).json({ message: "Endereço atualizado com sucesso.", result: resultado });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    },

    /**
     * @description Exclui um endereço.
     * @function excluirEndereco
     * @async
     * @param {Request} req Objeto da requisição HTTP
     * @param {Response} res Objeto de resposta HTTP
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do delete
     */
    excluirEndereco: async (req, res) => {
        try {
            const idEndereco = Number(req.params.idEndereco);
            if (!idEndereco || idEndereco <= 0 || isNaN(idEndereco) || !Number.isInteger(idEndereco)) {
                return res.status(400).json({ message: "Você deve inserir um ID de endereço (número inteiro positivo) válido." });
            }

            // 1. Verificar se o endereço existe
            const enderecoAtual = await enderecoModel.selecionarEnderecoId(idEndereco);
            if (enderecoAtual.length === 0) {
                return res.status(404).json({ message: "O ID de endereço em questão não foi encontrado." });
            }

            // 2. Obter o idClienteFK (necessário para o delete no seu model)
            const idClienteFK = enderecoAtual[0].idClienteFK;

            // 3. Chamar o Model
            const resultado = await enderecoModel.deletarEndereco(idEndereco, idClienteFK);

            if (resultado && resultado.affectedRows === 1) {
                res.status(200).json({ message: 'Endereço excluído com sucesso', data: resultado });
            } else {
                throw new Error("Não foi possível excluir o endereço (0 affectedRows).");
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro no servidor.", errorMessage: error.message });
        }
    }
}

module.exports = { clienteController, telefoneController, enderecoController };