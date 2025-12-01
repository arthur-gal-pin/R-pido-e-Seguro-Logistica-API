const pool = require('../config/db');

const pedidoModel = {
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
    selectPedido: async (pedidoId) => {
        const sql = pedidoId ? 'SELECT * FROM pedidos WHERE idPedido=?;' : 'SELECT * FROM pedidos;';
        const values = [pedidoId];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    selectPedidoCliente: async (idCliente) => {
        const sql = 'SELECT * FROM pedidos WHERE idCliente = ?;'; //Mudar a tabela para idClienteFK
        const values = [idCliente];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
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