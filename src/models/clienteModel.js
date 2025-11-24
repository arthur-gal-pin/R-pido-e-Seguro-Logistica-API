const pool = require('../config/db');

const clienteModel = {
    selecionarCliente: async (idCliente) => {
        const sql = idCliente ? 'SELECT * FROM clientes WHERE idCliente=?;' : 'SELECT * FROM clientes;';
        const values = [idCliente];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    selecionarCpf: async (cpfCliente) => {
        const sql = 'SELECT * FROM clientes WHERE cpfCliente=?;';
        const values = [cpfCliente];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    selecionarPorCpfUpdate: async (cpfCliente, idCliente) => {
        const sql = 'SELECT * FROM clientes WHERE cpfCliente = ? AND idCliente <> ?;';
        const values = [cpfCliente, idCliente];
        const [rows] = await pool.query(sql, values);
        console.log(rows);
        return rows;
    },
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
            const sqlEndereco = 'INSERT INTO endereco (idClienteFK, logradouro, numero, bairro, cidade, estado, cep, complemento) VALUES(?,?,?,?,?,?,?,?);';
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
    selecionarNomeCliente: async (nomeCliente) => {
        const sql = `SELECT * FROM clientes WHERE nomeCliente LIKE ?;`;
        const values = [`%${nomeCliente}%`]
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    updateCliente: async (idCliente, cpfCliente, nomeCliente, sobrenomeCliente, emailCliente) => {
        const sql = 'UPDATE clientes SET nomeCliente = ?, cpfCliente = ?, sobrenomeCliente = ?, emailCliente = ? WHERE idCliente = ?;';
        const values = [nomeCliente, cpfCliente, sobrenomeCliente, emailCliente, idCliente];
        const [rows] = await pool.query(sql, values);
        console.log(rows);
        return rows;
    },
    deleteCliente: async (idCliente) => {
        const sqlEndereco = 'DELETE FROM endereco WHERE idClienteFK = ?;';
        const sqlTelefone = 'DELETE FROM telefones WHERE idClienteFK = ?;'
        const sqlClientes = 'DELETE FROM clientes WHERE idCliente = ?;';
        const [rowsEndereco] = await pool.query(sqlEndereco, [idCliente]);
        const [rowsTelefone] = await pool.query(sqlTelefone, [idCliente]);
        const [rowsClientes] = await pool.query(sqlClientes, [idCliente]);
        return {rowsClientes, rowsEndereco, rowsTelefone};
    }
}
const telefoneModel = {
    selecionarTelefoneId: async (idTelefone) => {
        const sql = idTelefone ? 'SELECT * FROM telefones WHERE idTelefone=?;' : 'SELECT * FROM telefones;';
        const values = [idTelefone];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    selecionarTelefoneCliente: async (idClienteFK) => {
        const sql = 'SELECT * FROM telefones WHERE idClienteFK=?;';
        const values = [idClienteFK];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    addTelefone: async (pIdClienteFK, pNumero, pTipoTelefone) => {
        const sql = 'INSERT INTO telefones (idClienteFK, numero, tipoTelefone) VALUES (?,?,?);';
        const values = [pIdClienteFK, pNumero, pTipoTelefone];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    updateTelefone: async (idTelefone, idClienteFK, numeroTelefoneCliente, tipoTelefone) => {
        const sql = 'UPDATE telefones SET numero = ?, tipoTelefone = ? WHERE idTelefone = ? AND idClienteFK = ?;';
        const values = [numeroTelefoneCliente, tipoTelefone, idTelefone, idClienteFK];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    deletarTelefone: async (idTelefone, idClienteFK) => {
        const sql = 'DELETE FROM telefones WHERE idTelefone = ? AND idClienteFK = ?;';
        const values = [idTelefone, idClienteFK];
        const [rows] = await pool.query(sql, values);;
        console.log(rows);
        return rows;
    }
}

const enderecoModel = {
    selecionarEnderecoId: async (idEndereco) => {
        const sql = idEndereco ? 'SELECT * FROM enderecos WHERE idEndereco=?;' : 'SELECT * FROM enderecos;';
        const values = [idEndereco];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    selecionarEnderecoCliente: async (idClienteFK) => {
        const sql = 'SELECT * FROM enderecos WHERE idClienteFK = ?;';
        const values = [idClienteFK];
        const [rows] = await pool.query(sql, values);
        return rows;
    },
    addEndereco: async (idClienteFK, logradouroCliente, numeroEnderecoCliente, bairro, cidade, estado, cep, complemento) => {
        const sql = 'INSERT INTO enderecos (idClienteFK, logradouro, numero, bairro, cidade, estado, cep, complemento) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
        const values = [idClienteFK, logradouroCliente, numeroEnderecoCliente, bairro, cidade, estado, cep, complemento];
        const [rows] = await pool.query(sql, values);
        console.log(rows);
        return rows;
    },
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
    deletarEndereco: async (idEndereco, idClienteFK) => {
        const sql = 'DELETE FROM enderecos WHERE idEndereco = ? AND idClienteFK = ?;';
        const values = [idEndereco, idClienteFK];
        const [rows] = await pool.query(sql, values);
        console.log(rows);
        return rows;
    }
}
module.exports = { clienteModel, enderecoModel, telefoneModel };