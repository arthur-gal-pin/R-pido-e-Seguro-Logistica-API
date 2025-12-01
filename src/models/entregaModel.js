const pool = require('../config/db');

const entregaModel = {
    /**
     * @function selectEntrega
     * @async
     * @description Seleciona todas as entregas registradas no Banco de Dados, ou de uma entrega em específico, sendo ela, dada via query.
     * @param {Number} idEntrega 
     * @returns {Promise<Array<Object>>}
     * @example
     * const resultado = await entregaModel.selectEntrega();
     *  // Saída esperada
     * [ message: "Resultado dos dados listados:", 
     *  {
     *  "idPedido": 1,
     *  "idEntrega": 1,
     *  "valorDistancia": 0.00,
     *  "valorPeso": 0.00,
     *  "acrescimo": 0.00,
     *  "desconto": 0.00,
     *  "taxaExtra": 0.00,
     *  "valorTotal": 0.00,
     *  "statusEntrega": 'calculado'
     *  }
     *  {
     *  "idPedido": 2,
     *  "idEntrega": 2,
     *  "valorDistancia": 0.00,
     *  "valorPeso": 0.00,
     *  "acrescimo": 0.00,
     *  "desconto": 0.00,
     *  "taxaExtra": 0.00,
     *  "valorTotal": 0.00,
     *  "statusEntrega": 'entregue'
     *  } 
     * ]
     * 
     *  ou
     * 
     * const resultado = await entregaModel.selectEntrega(1);
     *  // Saída esperada
     * { message: "Resultado dos dados listados:", 
     *  {
     *  "idPedido": 1,
     *  "idEntrega": 1,
     *  "valorDistancia": 0.00,
     *  "valorPeso": 0.00,
     *  "acrescimo": 0.00,
     *  "desconto": 0.00,
     *  "taxaExtra": 0.00,
     *  "valorTotal": 0.00,
     *  "statusEntrega": 'calculado'
     *  }
     * }
     */
    selectEntrega: async (idEntrega) => {
        const sql = idEntrega ? "SELECT * FROM entregas WHERE idEntrega = ?;" : "SELECT * FROM entregas;";
        const values = [idEntrega];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function addEntrega
     * @async
     * @description Adiciona um registro de entrega no banco de dados
     * @param {Number} idPedidoFK 
     * @param {String} statusEntrega 
     * @returns {Promise<Object>}
     * @example 
     * const resultado = await entregaModel.addEntrega(1, 'transito');
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
    addEntrega: async (idPedidoFK, statusEntrega) => {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            //Requerimento para precoDeslocamento
            const [rowsSelect] = await connection.query(
                'SELECT distanciaKM, valorKM, pesoVargaKG, valorKG, urgencia FROM pedidos WHERE idPedidoFK =',
                [idPedidoFK]
            );
            // Obter os valores da primeira linha do resultado
            if (rowsSelect.length === 0) {
                throw new Error('Pedido não encontrado.');
            }
            //Definição das variáveis básicas
            const pDistanciaKM = rowsSelect[0].distanciaKM;
            const pValorKM = rowsSelect[0].valorKM;
            const pPesoKG = rowsSelect[0].pesoVargaKG;
            const pValorKG = rowsSelect[0].valorKG;
            const pUrgencia = rowsSelect[0].urgencia;
            //Operações básicas para formular o valorBase
            const precoPeso = pValorKG * pPesoKG;
            const precoDeslocamento = pDistanciaKM * pValorKM;
            const valorBase = precoPeso + precoDeslocamento;
            //Aplicação das operações da regra de negócio
            const taxaExtra = (pPesoKG > 50) ? 15 : 0;
            const acrescimoCru = (pUrgencia == 'urgente') ? (valorBase / 5) : 0;
            const acrescimo = parseFloat(acrescimoCru.toFixed(2));
            const descontoCru = ((valorBase + acrescimo) > 500) ? ((valorBase + acrescimo) / 10) : 0;
            const desconto = parseFloat(descontoCru.toFixed(2));
            const valorFinal = (valorBase + acrescimo + taxaExtra - desconto);
            //Comando query do SQL
            const sql = "INSERT INTO entregas (idPedidoFK, valorDistancia, valorPeso, acrescimo, desconto, taxaExtra, valorTotal, statusEntrega) VALUES (?,?,?,?,?,?,?,?)";
            const values = [idPedidoFK, precoDeslocamento, precoPeso, acrescimo, desconto, taxaExtra, valorFinal, statusEntrega];
            const [rows] = await connection.query(sql, values);
            await connection.commit();
            return rows;

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
     * @function updateEntrega
     * @async
     * @description Atualiza um registro de entrega
     * @param {Number} idEntrega 
     * @param {String} statusEntrega 
     * @returns {Promise<Object>}
     * @example
     * const resultado = await entregaModel.updateEntrega(1, 'cancelado');
     *  // Saída esperada
     * { message: "Registro atualizado com sucesso!", 
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
    updateEntrega: async (idEntrega, statusEntrega) => {
        const sql = "UPDATE entregas SET statusEntrega = ? WHERE idEntrega = ? AND idPedidoFK = ?;";
        const values = [statusEntrega, idEntrega, idPedidoFK];
        const rows = await pool.query(sql, values);
        return rows;
    },
    /**
     * @function deleteEntrega
     * @async
     * @description
     * @param {Number} idEntrega 
     * @returns {Promise<Object>}
     * @example
     * const resultado = await entregaModel.deleteEntrega(1);
     *  // Saída esperada
     * { message: 'Entrega cancelada com sucesso',
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
    deleteEntrega: async (idEntrega) => {
        const sql = "DELETE FROM entregas WHERE idEntrega = ?;";
        const values = [idEntrega];
        const rows = await pool.query(sql, values);
        return rows;
    }
}

module.exports = { entregaModel };