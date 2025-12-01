const pool = require('../config/db');

const clienteModel = {
    /**
     * @function selecionarCliente
     * @async
     * @description Seleciona todos os clientes cadastrados no Banco de Dados ou seleciona um cliente através do ID via param.
     * @param {Number} idCliente 
     * @returns {Promise<Array<Object>>} Retorna o conteúdo dos dados da requisição
     * @example 
     * const resultado = await clienteModel.selecionarCliente();
     *  // Saída esperada
     * [
     * message: "Resultado dos dados listados",
     *  {
        * "idCliente": 1
        * "nomeCliente": 'Fulano',
        * "sobrenomeCliente:" 'Da Silva',
        * "emailCliente": 'fulano@teste.com', 
        * "cpfCliente": '12345678900', 
        * "numero": '(19)9999-99999',
        * "tipoTelefone": 'movel',
        * "logradouro": 'Av. Teste',
        * "numero": '000',
        * "bairro": 'Algum lugar',
        * "cidade": 'Um canto',
        * "estado": 'Teste',
        * "cep": '00999-999',
        * "complemento": 'Bloco x'
        }
        {    
        * "idCliente": 2
        * "nomeCliente": 'Fulano',
        * "sobrenomeCliente:" 'De Souza',
        * "emailCliente": 'fulano2@teste.com', 
        * "cpfCliente": '12345678911', 
        * "numero": '(00)9999-99999',
        * "tipoTelefone": 'fixo',
        * "logradouro": 'Av. Teste II',
        * "numero": '001',
        * "bairro": 'Não sei',
        * "cidade": 'Rancho',
        * "estado": 'Teste2',
        * "cep": '11000-000',
        * "complemento": ''
        }
    * ]
    * 
    * ou
    * 
    * const resultado = await clienteModel.selecionarCliente(1);
    *  // Saída esperada
    * 
    * {message: "Resultado dos dados listados",
       * "idCliente": 1
       * "nomeCliente": 'Fulano',
       * "sobrenomeCliente:" 'Da Silva',
       * "emailCliente": 'fulano@teste.com', 
       * "cpfCliente": '12345678900', 
       * "numero": '(19)9999-99999',
       * "tipoTelefone": 'movel',
       * "logradouro": 'Av. Teste',
       * "numero": '000',
       * "bairro": 'Algum lugar',
       * "cidade": 'Um canto',
       * "estado": 'Teste',
       * "cep": '00999-999',
       * "complemento": 'Bloco x'
       * }
    */
    selecionarCliente: async (idCliente) => {
        const sql = idCliente ? 'SELECT * FROM clientes WHERE idCliente=?;' : 'SELECT * FROM clientes;';
        const values = [idCliente];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function selecionarCpf
     * @async
     * @description Seleciona o cliente através de seu CPF via param.
     * @param {String} cpfCliente 
     * @returns {Promise<Array<Object>>} Retorna o conteúdo dos dados da requisição
     * @example
     * const resultado = await clienteModel.selecionarCpf('12345678900');
     *  //Saída esperada
     * {message: "Resultado dos dados listados",
        * "cpfCliente": '12345678900', 
        * "nomeCliente": 'Fulano',
        * "sobrenomeCliente:" 'Da Silva',
        * "emailCliente": 'fulano@teste.com', 
        * "numero": '(19)9999-99999',
        * "tipoTelefone": 'movel',
        * "logradouro": 'Av. Teste',
        * "numero": '000',
        * "bairro": 'Algum lugar',
        * "cidade": 'Um canto',
        * "estado": 'Teste',
        * "cep": '00999-999',
        * "complemento": 'Bloco x'
     * }
     */
    selecionarCpf: async (cpfCliente) => {
        const sql = 'SELECT * FROM clientes WHERE cpfCliente=?;';
        const values = [cpfCliente];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function selecionarPorCpfUpdate
     * @async
     * @description Verifica a duplicidade de um CPF no momento em que se atualiza os dados do Cliente
     * @param {String} cpfCliente 
     * @param {Number} idCliente 
     * @returns 
     * @example 
     * const consultaCpf = await clienteModel.selecionarPorCpfUpdate(12345678007, 1);
     */
    selecionarPorCpfUpdate: async (cpfCliente, idCliente) => {
        const sql = 'SELECT * FROM clientes WHERE cpfCliente = ? AND idCliente <> ?;';
        const values = [cpfCliente, idCliente];
        const [rows] = await pool.query(sql, values);
        console.log(rows);
        return rows;
    },
    /**
     * @function addCliente
     * @async
     * @description Adiciona os dados de um cliente através do corpo da página (JSON).
     * @param {String} cpfCliente 
     * @param {String} nomeCliente 
     * @param {String} sobrenomeCliente 
     * @param {String} emailCliente 
     * @param {String} numeroTelefoneCliente 
     * @param {String} tipoTelefone 
     * @param {String} logradouroCliente 
     * @param {String} numeroEnderecoCliente 
     * @param {String} bairro 
     * @param {String} cidade 
     * @param {String} estado 
     * @param {String} cep 
     * @param {String} complemento 
     * @returns {Promise<Object>} Retorna como resposta da requisição, os dados com informações do insert
     * @example
     * const resultado = await clienteModel.addCliente('12345678900', 'Fulano', 'Da Silva', 'fulano@teste.com', '(19)9999-99999', 'movel', 'Av. Teste', '000', 'Algum lugar', 'Um canto', 'Teste', '00999-999', 'Bloco x');
        // Saída esperada
        { message: "Cliente, Telefone e Endereço incluídos com sucesso via transação.",
        "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": ,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 0
        }
    }
     */
    addCliente: async (cpfCliente, nomeCliente, sobrenomeCliente, emailCliente, numeroTelefoneCliente, tipoTelefone, logradouroCliente, numeroEnderecoCliente, bairro, cidade, estado, cep, complemento) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            //Primeira etapa: adicionar as informações do cliente na tabela de clientes.
            const sqlClientes = 'INSERT INTO clientes (nomeCliente, sobrenomeCliente, cpfCliente, emailCliente) VALUES (?,?,?,?);';
            const valuesCliente = [nomeCliente, sobrenomeCliente, cpfCliente, emailCliente];
            const [rowsCliente] = await connection.query(sqlClientes, valuesCliente);

            //Segunda etapa: adicionar as informações do telfone do cliente na tabela de telefones.
            const sqlTelefone = 'INSERT INTO telefones (idClienteFK, numero, tipoTelefone) VALUES (?,?,?);';
            const valuesTelefone = [rowsCliente.insertId, numeroTelefoneCliente, tipoTelefone]
            const [rowsTelefone] = await connection.query(sqlTelefone, valuesTelefone);

            //Terceira etapa: adicionar as informações do endereço do cliente na tabela de endereços.
            const sqlEndereco = 'INSERT INTO enderecos (idClienteFK, logradouro, numero, bairro, cidade, estado, cep, complemento) VALUES(?,?,?,?,?,?,?,?);';
            const valuesEndereco = [rowsCliente.insertId, logradouroCliente, numeroEnderecoCliente, bairro, cidade, estado, cep, complemento];
            const [rowsEndereco] = await connection.query(sqlEndereco, valuesEndereco);
            connection.commit();
            return { rowsCliente, rowsEndereco, rowsTelefone };
        } catch (error) {
            connection.rollback();
            throw error;
        } finally {
            //Sempre liberar a conexão, com erro ou sem
            if (connection) {
                connection.release();
            }
        }
    },
    /**
    * @function selecionarNomeCliente
    * @async
    * @description Seleciona o cliente pelo nome
    * @param {Number} nomeCliente 
    * @returns {Promise<Array<Object>>} Retorna o conteúdo dos dados da requisição
    * @example
    * const resultado = await clienteModel.selecionarNomeCliente(Fulano);
   *  // Saída esperada
   * 
   * {message: "Resultado dos dados listados",
      * "idCliente": 1
      * "nomeCliente": 'Fulano',
      * "sobrenomeCliente:" 'Da Silva',
      * "emailCliente": 'fulano@teste.com', 
      * "cpfCliente": '12345678900', 
      * "numero": '(19)9999-99999',
      * "tipoTelefone": 'movel',
      * "logradouro": 'Av. Teste',
      * "numero": '000',
      * "bairro": 'Algum lugar',
      * "cidade": 'Um canto',
      * "estado": 'Teste',
      * "cep": '00999-999',
      * "complemento": 'Bloco x'
      * }
    */
    selecionarNomeCliente: async (nomeCliente) => {
        const sql = `SELECT * FROM clientes WHERE nomeCliente LIKE ?;`;
        const values = [`%${nomeCliente}%`]
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function updateCliente
     * @async
     * @description Atualiza os dados de um clienteatravés do corpo da página (JSON)
     * @param {Number} idCliente 
     * @param {String} cpfCliente 
     * @param {String} nomeCliente 
     * @param {String} sobrenomeCliente 
     * @param {String} emailCliente 
     * @returns {Promise<Object>}
     * @example
     * const clienteAtual = await clienteModel.selecionarCliente(1);
     *  // Saída esperada
     * "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
        }
     */
    updateCliente: async (idCliente, cpfCliente, nomeCliente, sobrenomeCliente, emailCliente) => {
        const sql = 'UPDATE clientes SET nomeCliente = ?, cpfCliente = ?, sobrenomeCliente = ?, emailCliente = ? WHERE idCliente = ?;';
        const values = [nomeCliente, cpfCliente, sobrenomeCliente, emailCliente, idCliente];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function deleteCliente
     * @async
     * @description Deleta toos os dados de um respectivo cliente através do ID via param
     * @param {Number} idCliente 
     * @returns {Promise<Object>}
     * @example
     * const clienteSelecionado = await clienteModel.selecionarCliente(2);
     *  // Saída esperada
     * { message: 'Cliente excluído com sucesso',
     * "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 0
        }
    }
     */
    deleteCliente: async (idCliente) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const sqlEndereco = 'DELETE FROM enderecos WHERE idClienteFK = ?;';
            const sqlTelefone = 'DELETE FROM telefones WHERE idClienteFK = ?;'
            const sqlClientes = 'DELETE FROM clientes WHERE idCliente = ?;';
            const sqlPedidos = 'DELETE FROM pedidos WHERE idCliente = ?;';
            const sqlEntregas = 'DELETE FROM entregas WHERE idPedido = IN (?);';
            const sqlSelectEntrega = 'SELECT idPedido FROM pedidos WHERE idCliente = ?';
            const [rowsSelectEntrega] = await connection.query(sqlSelectEntrega, [idCliente]);
            const idPedido = rowsSelectEntrega.map(row => row.idPedido);
            const [rowsEntrega] = await connection.query(sqlEntregas, [idPedido]);
            const [rowsPedido] = await connection.query(sqlPedidos, [idCliente])
            const [rowsEndereco] = await connection.query(sqlEndereco, [idCliente]);
            const [rowsTelefone] = await connection.query(sqlTelefone, [idCliente]);
            const [rowsClientes] = await connection.query(sqlClientes, [idCliente]);
            return { rowsClientes, rowsEndereco, rowsTelefone, rowsPedido, rowsEntrega };
        } catch (error) {
            connection.rollback();
            throw error;
        } finally {
            //Sempre liberar a conexão, com erro ou sem
            if (connection) {
                connection.release();
            }
        }
    }
}

const telefoneModel = {
    /**
     * @function selecionarTelefoneId
     * @async
     * @description Seleciona todos os telefones de todos os clientes ou seleciona o(s) telefone(s) de um cliente em específico de acordo com seu ID, que é enviado via query
     * @param {Number} idTelefone 
     * @returns {Promise<Array<Object>>}
     * @example
     * const resultado = await telefoneModel.selecionarTelefoneId();
     * // Saída esperada
     * [message: "Resultado dos dados de todos os telefones listados:",
     *  {
     *  "idTelefone": 1,
     *  "idClienteFK": 1,
     *  "numero": '(19)9999-99999',
     *  "tipoTelefone": 'movel'
     *  }
     *  {
     *  "idTelefone": 2,
     *  "idClienteFK": 2,
     *  "numero": '(00)9999-99999',
     *  "tipoTelefone": 'fixo'
     *  }
     * ]
     * ou
     * 
     * const resultado = await telefoneModel.selecionarTelefoneId(1);
     * // Saída esperada
     * {message: "Resultado dos dados do telefone listados:",
     * "idTelefone": 1,
     * "idClienteFK": 1,
     * "numero": '(19)9999-99999',
     * "tipoTelefone": 'movel'
     * }
     */
    selecionarTelefoneId: async (idTelefone) => {
        const sql = idTelefone ? 'SELECT * FROM telefones WHERE idTelefone=?;' : 'SELECT * FROM telefones;';
        const values = [idTelefone];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function selecionarTelefoneCliente
     * @async
     * @description Seleciona o(s) telefone(s) do cliente ao enviar o ID do mesmo via param
     * @param {Number} idClienteFK 
     * @returns {Promise<Array<Object>>}
     * @example 
     * const resultado = await telefoneModel.selecionarTelefoneCliente(1);
     *  // Saída esperada
     * 
     * {message: "Resultado dos dados listados", 
     * "idTelefone": 1,
     * "idClienteFK": 1,
     * "numero": '(19)9999-99999',
     * "tipoTelefone": 'movel'
     * } 
     */
    selecionarTelefoneCliente: async (idClienteFK) => {
        const sql = 'SELECT * FROM telefones WHERE idClienteFK=?;';
        const values = [idClienteFK];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function addTelefone
     * @async
     * @description Adiciona um novo telefone à um repectivo cliente
     * @param {Number} pIdClienteFK 
     * @param {String} pNumero 
     * @param {String} pTipoTelefone 
     * @returns {Promise<Object>}
     * @example
     * const resultado = await telefoneModel.addTelefone(1, '(18)8888-88888', 'fixo');
     * // Saída esperada
     * { message: 'Registro Incluído com Sucesso.',
     * "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 2,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
        }
    }
     * 
     */
    addTelefone: async (pIdClienteFK, pNumero, pTipoTelefone) => {
        const sql = 'INSERT INTO telefones (idClienteFK, numero, tipoTelefone) VALUES (?,?,?);';
        const values = [pIdClienteFK, pNumero, pTipoTelefone];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function updateTelefone
     * @async
     * @description Atualiza os dados de um telefone
     * @param {Number} idTelefone 
     * @param {Number} idClienteFK 
     * @param {String} numeroTelefoneCliente 
     * @param {String} tipoTelefone 
     * @returns {Promise<Object>}
     * @example
     * const resultado = await telefoneModel.updateTelefone(1, 1, '(19)8888-88888', 'movel');
     *  //Saída esperada
     * {message: "Registro Atualizado com Sucesso.", 
     *  result:{
     *  "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
        }
    }
     */
    updateTelefone: async (idTelefone, idClienteFK, numeroTelefoneCliente, tipoTelefone) => {
        const sql = 'UPDATE telefones SET numero = ?, tipoTelefone = ? WHERE idTelefone = ? AND idClienteFK = ?;';
        const values = [numeroTelefoneCliente, tipoTelefone, idTelefone, idClienteFK];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function deletarTelefone
     * @async
     * @description Deleta um rgistro de telefone no Banco de Dados
     * @param {Number} idTelefone 
     * @param {Number} idClienteFK 
     * @returns {Promise<Object>}
     * @example 
     * const idTelefoneSelecionado = await telefoneModel.deletarTelefone(idTelefone);
     *  // Saída esperada
     * {message: 'Registro do telefone excluído com sucesso', 
     * result:{
     * "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 0
     *  }
     * }
     */
    deletarTelefone: async (idTelefone) => {
        const sql = 'DELETE FROM telefones WHERE idTelefone = ?;';
        const values = [idTelefone];
        const [rows] = await pool.query(sql, values);;
        console.log(rows);
        return rows;
    }
}

const enderecoModel = {
    /**
     * @function selecionarEnderecoId
     * @async
     * @description Seleciona todos os endereços, ou um endereço por ID, via query.
     * @param {Number} idEndereco 
     * @returns {Promise<Array<Object>>} 
     * @example
     * const resultado = await enderecoModel.selecionarEnderecoId(); // Chama sem ID
     * // Saída esperada
     * [ message: "Resultado de todos os endereços listados:"
     *  {
     * "idEndereco": 1,
     * "idClienteFK": 1,
     * "logradouro": 'Av. Teste',
     * "numero": '000',
     * "bairro": 'Algum lugar',
     * "cidade": 'Um canto',
     * "estado": 'Teste',
     * "cep": '00999-999',
     * "complemento": 'Bloco x'
     *  }
     *  {
     *   "idEndereco": 2,
     *   "idClienteFK": 2,
     *   "logradouro": 'Av. Teste II',
     *   "numero": '001',
     *   "bairro": 'Não sei',
     *   "cidade": 'Rancho',
     *   "estado": 'Teste2',
     *   "cep": '11000-000',
     *    "complemento": ''
     *  }
     * ]
     * 
     * ou
     * const resultado = await enderecoModel.selecionarEnderecoId(2);
     * 
     *  // Saída esperada
     * {
     *   "idEndereco": 2,
     *   "idClienteFK": 2,
     *   "logradouro": 'Av. Teste II',
     *   "numero": '001',
     *   "bairro": 'Não sei',
     *   "cidade": 'Rancho',
     *   "estado": 'Teste2',
     *   "cep": '11000-000',
     *    "complemento": ''
     *  }
    */
    selecionarEnderecoId: async (idEndereco) => {
        const sql = idEndereco ? 'SELECT * FROM enderecos WHERE idEndereco=?;' : 'SELECT * FROM enderecos;';
        const values = [idEndereco];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function selecionarEnderecoCliente
     * @async
     * @description Seleciona o endereço de um cliente em específico através de seu ID, via param
     * @param {Number} idClienteFK 
     * @returns {Promise<Object>}
     * @example
     * const resultado = await enderecoModel.selecionarEnderecoCliente(2);
     *  // Saída esperada
     * { message: "Endereços do cliente listados",
     *   "idEndereco": 2,
     *   "idClienteFK": 2,
     *   "logradouro": 'Av. Teste II',
     *   "numero": '001',
     *   "bairro": 'Não sei',
     *   "cidade": 'Rancho',
     *   "estado": 'Teste2',
     *   "cep": '11000-000',
     *    "complemento": ''
     * }
     */
    selecionarEnderecoCliente: async (idClienteFK) => {
        const sql = 'SELECT * FROM enderecos WHERE idClienteFK = ?;';
        const values = [idClienteFK];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function addEndereco
     * @async
     * @description Adiciona um novo endereço à um cliente no Banco de Dados
     * @param {Number} idClienteFK 
     * @param {String} logradouroCliente 
     * @param {String} numeroEnderecoCliente 
     * @param {String} bairro 
     * @param {String} cidade 
     * @param {String} estado 
     * @param {String} cep 
     * @param {String} complemento 
     * @returns {Promise<Object>}
     * @example 
     * const resultado = await enderecoModel.addEndereco(
                3, 'Rua Testando', '002', 'Enésima', 'Esprício', 'Maia', '11000-001', ''
            );
     *  // Saída esperada
     *  { message: 'Endereço incluído com sucesso.', 
     * result:{
     * "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 2,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
     *  }
     * }
     */
    addEndereco: async (idClienteFK, logradouroCliente, numeroEnderecoCliente, bairro, cidade, estado, cep, complemento) => {
        const sql = 'INSERT INTO enderecos (idClienteFK, logradouro, numero, bairro, cidade, estado, cep, complemento) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
        const values = [idClienteFK, logradouroCliente, numeroEnderecoCliente, bairro, cidade, estado, cep, complemento];
        const [rows] = await pool.query(sql, values);
        console.log(rows);
        return rows;
    },
    /**
     * @function updateEndereco
     * @async
     * @description Atualiza os valores de um endereço conforme seu ID
     * @param {Number} idEndereco 
     * @param {Number} idClienteFK 
     * @param {String} logradouro 
     * @param {String} numero 
     * @param {String} bairro 
     * @param {String} cidade 
     * @param {String} estado 
     * @param {String} cep 
     * @param {String} complemento 
     * @returns 
     * @example
     * const resultado = await enderecoModel.updateEndereco(
            2,
            2,
            'Rua Teste III',
            '007',
            'Inexistente',
            Lugar Nenhum,
            'Desconhecido',
            '00007-007',
            ''
            );
     *  // Saída esperada
     * { message: "Endereço atualizado com sucesso.",
     *  result:{
     * "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
     * }
    }
     */
    updateEndereco: async (idEndereco, idClienteFK, logradouro, numero, bairro, cidade, estado, cep, complemento) => {
        const sql = `UPDATE enderecos SET 
                    logradouro = ?, 
                    numero = ?, 
                    bairro = ?, 
                    cidade = ?, 
                    estado = ?, 
                    cep = ?, 
                    complemento = ? 
                 WHERE idEndereco = ? AND idClienteFK = ?;`;

        const values = [logradouro, numero, bairro, cidade, estado, cep, complemento, idEndereco, idClienteFK];

        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function deletarEndereco
     * @async
     * @description Deleta todos os dados do endereço que foram inseridos no Banco de Dados.
     * @param {Number} idEndereco 
     * @param {Number} idClienteFK 
     * @returns {Promise<Object>}
     * @example
     * const resultado = await enderecoModel.deletarEndereco(1, 1);
     *  // Saída esperada
     * { message: 'Endereço excluído com sucesso',
     * result:{
     * "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
         }
        }
     */
    deletarEndereco: async (idEndereco, idClienteFK) => {
        const sql = 'DELETE FROM enderecos WHERE idEndereco = ? AND idClienteFK = ?;';
        const values = [idEndereco, idClienteFK];
        const [rows] = await pool.query(sql, values);
        console.log(rows);
        return rows;
    }
}
module.exports = { clienteModel, enderecoModel, telefoneModel };