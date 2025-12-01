const mysql = require('mysql2/promise')
//Limitar as conexoes e quando estão cheias ele vai aguardar uma conexão ficar livre para colocar outra.
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'entregasdb',
    port: 3308,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//testar o pool

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conectado ao MySQL')
        connection.release()
    } catch (error) {
        console.error(`Erro ao conectar ao MySQL: ${error}`);
    }
})();



module.exports = pool;