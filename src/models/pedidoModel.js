const pool = require('../config/db');

const pedidoModel = {
    inserirPedido: async (pIdCliente, pDataPedido, pTipo, pDistancia, pPeso, pValorItem, pValorDistancia) => {
        const sql = 'INSERT INTO pedidos (idPedido, dataPedido, idCliente, urgente, distanciaKM, pesoCargaKG, valorKM, valorKG) VALUES (?,?,?,?,?,?,?,?) ;';
        const values = [pIdCliente, pDataPedido, pTipo, pDistancia, pPeso, pValorItem, pValorDistancia];
        const [rows] = await connection.query(sql, values);
        return rows
    },
    selecionarTodosPedidos:async () => {
        const sql = 'SELECT * FROM pedidos;';
        const [rows] = await pool.query(sql);
        return rows;
    }
}

module.exports = { pedidoModel };