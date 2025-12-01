const pool = require('../config/db');

const pedidoModel = {
    /**
     * @function insertPedido
     * @async
     * @description Adiciona um pedido no Banco de Dados
     * @param {Number} idClienteFK 
     * @param {String} urgencia 
     * @param {String} distancia 
     * @param {String} peso 
     * @param {String} valorPeso 
     * @param {String} valorDistancia 
     * @returns {Promise<Object>}
     * @example
     * const resultado = await pedidoModel.insertPedido(1, 'nao urgente', '0km', '0kg', '0.00', '0.00');
     *  // Saída esperada
     * { message: "Registro incluído com sucesso!", 
     * "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
         }
        }
     */
    insertPedido: async (idClienteFK, urgencia, distancia, peso, valorPeso, valorDistancia) => {
        const connection = await pool.getConnection(); // Obtém a conexão do pool
        await connection.beginTransaction(); // Inicia a transação
        try {
            const pedidoSql = 'INSERT INTO pedidos (idCliente, urgencia, distanciaKM, pesoCargaKG, valorKM, valorKG) VALUES (?,?,?,?,?,?) ;';
            const pedidoValues = [idClienteFK, urgencia, distancia, peso, valorPeso, valorDistancia];
            const [pedidoRows] = await connection.query(pedidoSql, pedidoValues);
            const idPedidoNovo = pedidoRows.insertId;
            //Aplicação das operações da regra de negócio
            const precoPeso = valorPeso * peso;
            const precoDeslocamento = valorDistancia * distancia;
            const valorBase = precoPeso + precoDeslocamento;
            const taxaExtra = (peso > 50) ? 15 : 0;
            const acrescimoCru = (urgencia == 'urgente') ? (valorBase / 5) : 0;
            const acrescimo = parseFloat(acrescimoCru.toFixed(2));
            const descontoCru = ((valorBase + acrescimo) > 500) ? ((valorBase + acrescimo) / 10) : 0;
            const desconto = parseFloat(descontoCru.toFixed(2));
            const valorFinal = (valorBase + acrescimo + taxaExtra - desconto);
            //Detalhes SQL sobre a criacão dos registros de entrega.
            const entregaSql = 'INSERT INTO entregas (idPedido, valorDistancia, valorPeso, acrescimo, desconto, taxaExtra, valorTotal, statusEntrega) VALUES (?,?,?,?,?,?,?,?);';
            const entregaValues = [idPedidoNovo, precoDeslocamento, precoPeso, acrescimo, desconto, taxaExtra, valorFinal, "calculado"];
            const [entregaRows] = await connection.query(entregaSql, entregaValues);
            await connection.commit();
            return { pedidoRows, entregaRows };
        } catch (error) {
            connection.rollback();
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },
    /**
     * @function selectPedido
     * @async
     * @description Seleciona o pedido de acordo com seu ID.
     * @param {Number} pedidoId 
     * @returns {Promise<Array<Object>>}
     * @example
     * const resultado = await pedidoModel.selectPedido(1);
     *  // Saída esperada
     * {message: 'Lista dos pedidos', 
     * "idPedido": 1, 
     * "idCliente": 1,
     * "dataPedido": "27-11-2025",
     * "urgente": false,
     * "distanciaKM": '0km',
     * "pesoCargaKG": '0kg',
     * "valorKM": '0.00',
     * "valorKG": '0.00'
     * }
     */
    selectPedido: async (pedidoId) => {
        const sql = pedidoId ? 'SELECT * FROM pedidos WHERE idPedido=?;' : 'SELECT * FROM pedidos;';
        const values = [pedidoId];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
    * @function selectPedidoCliente
    * @async
    * @description Seleciona os pedidos de acordo com o ID do cliente.
    * @param {Number} idCliente 
    * @returns {Promise<Array<Object>>}
    * @example 
    * const resultado = await pedidoModel.selectPedidoCliente(1);
    *  // Saída esperada
    *  {message: 'Lista dos pedidos', 
     * "idPedido": 1, 
     * "idCliente": 1,
     * "dataPedido": "27-11-2025",
     * "urgente": false,
     * "distanciaKM": '0km',
     * "pesoCargaKG": '0kg',
     * "valorKM": '0.00',
     * "valorKG": '0.00'
     * }
     */
    selectPedidoCliente: async (idCliente) => {
        const sql = 'SELECT * FROM pedidos WHERE idCliente = ?;'; //Mudar a tabela para idClienteFK
        const values = [idCliente];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function updatePedido
     * @async
     * @description Atualiza os registros de um pedido feito através de seu ID
     * @param {Number} idPedido 
     * @param {String} urgencia 
     * @param {String} distancia 
     * @param {String} peso 
     * @param {String} valorPeso 
     * @param {String} valorDistancia 
     * @returns {Promise<Object>}
     * @example 
     * const resultado = await pedidoModel.updatePedido('urgente', '0.1km', '0.1kg', '0.01', '0.01', 1);
     *  // Saída esperada
     * { message: "Registro Atualizado com Sucesso.",
     * "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
        }
     * }
     */
    updatePedido: async (urgencia, distancia, peso, valorPeso, valorDistancia, idPedido) => {
        const connection = await pool.getConnection(); // Obtém a conexão do pool
        await connection.beginTransaction(); // Inicia a transação
        try {
            const pedidoSql = 'UPDATE pedidos SET  urgencia = ?, distanciaKM = ?, pesoCargaKG = ?, valorKG = ?, valorKM = ? WHERE idPedido = ?;';
            const pedidoValues = [urgencia, distancia, peso, valorPeso, valorDistancia, idPedido];
            const [pedidoRows] = await connection.query(pedidoSql, pedidoValues);
            //Operações básicas para formular o valorBase
            const precoPeso = peso * valorPeso;
            const precoDeslocamento = distancia * valorDistancia;
            const valorBase = precoPeso + precoDeslocamento;
            //Aplicação das operações da regra de negócio
            const taxaExtra = (peso > 50) ? 15 : 0;
            const acrescimoCru = (urgencia == 'urgente') ? (valorBase / 5) : 0;
            const acrescimo = parseFloat(acrescimoCru.toFixed(2));
            const descontoCru = ((valorBase + acrescimo) > 500) ? ((valorBase + acrescimo) / 10) : 0;
            const desconto = parseFloat(descontoCru.toFixed(2));
            const valorFinal = (valorBase + acrescimo + taxaExtra - desconto);
            const entregaSql = 'UPDATE entregas SET valorDistancia = ?, valorPeso = ?, acrescimo = ?, desconto = ?, taxaExtra = ?, valorTotal = ? WHERE idPedido = ?;'; const entregaValues = [precoDeslocamento, precoPeso, acrescimo, desconto, taxaExtra, valorFinal, idPedido];
            const [entregaRows] = await connection.query(entregaSql, entregaValues);
            await connection.commit();
            return { pedidoRows, entregaRows };
        } catch (error) {
            connection.rollback();
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },
    /**
     * @function deletePedido
     * @async
     * @description Cancela(Deleta) o registro de um pedido
     * @param {Number} pedidoId 
     * @returns {Promise<Object>}
     * @example
     * const resultado = await pedidoModel.deletePedido(1);
     *  // Saída esperada
     * { message: 'O pedido foi cancelado com sucesso', 
     * "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1 
        }
     }
     */
    deletePedido: async (pedidoId) => {
        const connection = await pool.getConnection(); // Obtém a conexão do pool
        await connection.beginTransaction(); // Inicia a transação
        try {
            const entregaSql = 'DELETE FROM entregas WHERE idPedido = ?;';
            const pedidoSql = 'DELETE FROM pedidos WHERE idPedido = ?;';
            const values = [pedidoId];
            const [entregaRows] = await pool.query(entregaSql, values);
            const [pedidoRows] = await pool.query(pedidoSql, values);
            return {entregaRows, pedidoRows};

        } catch (error) {
            connection.rollback();
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
}

module.exports = { pedidoModel };