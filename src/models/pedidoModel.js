const pool = require('../config/db');

const pedidoModel = {
    inserirPedido: async (idCliente, urgencia, distancia, peso, valorItem, valorDistancia) => {
        const sql = 'INSERT INTO pedidos (idCliente, urgencia, distanciaKM, pesoCargaKG, valorKM, valorKG) VALUES (?,?,?,?,?,?) ;';
        const values = [idCliente, urgencia, distancia, peso, valorItem, valorDistancia];
        const [rows] = await connection.query(sql, values);
        return rows;
    },
    selecionarTodosPedidos:async () => {
        const sql = 'SELECT * FROM pedidos;';
        const [rows] = await pool.query(sql);
        return rows;
    },
    selecionarPedidosId:async (pedidoId) => {
        const sql =pedidoId ? 'SELECT * FROM pedidos WHERE idPedido=?;' : 'SELECT * FROM pedidos;';
        const values = [pedidoId];
        const [rows] = await connection.query(sql, values);
        return rows;
    },
    updatePedidos:async (urgencia, distancia, peso, valorItem, valorDistancia, idCliente) => {
        const sql = 'UPDATE Pedidos SET  urgencia = ?, distanciaKM = ?, pesoCargaKG = ?, valorKG = ?, valorKM = ? WHERE idPedido = ? AND idCliente = ?;';
        const values = [urgencia, distancia, peso, valorItem, valorDistancia, idCliente];
        const [rows] = await connection.query(sql, values);
        return rows;
    },
    cancelarPedido:async (pedidoId) => {
        const sql = 'DELETE FROM Pedidos WHERE idPedido = ?;';
        const values = [pedidoId];
        const [rows] = await connection.query(sql, values);
        return rows;
    }
}

module.exports = { pedidoModel };