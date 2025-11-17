CREATE DATABASE entregasdb;

USE entregasdb;

CREATE TABLE IF NOT EXISTS Clientes (
    idCliente INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nomeCliente VARCHAR(50) NOT NULL,
    cpfCliente CHAR(11) NOT NULL UNIQUE,
    emailCliente VARCHAR(200) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Telefones (
    idTelefone INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idClienteFK INT NOT NULL,
    numero VARCHAR(20) NOT NULL,
    tipoTelefone ENUM('fixo', 'movel') NOT NULL,
    CONSTRAINT fk_telefones_clientes FOREIGN KEY (idClienteFK) REFERENCES Clientes (idCliente)
);

CREATE TABLE IF NOT EXISTS Endereco (
	idEndereco INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idClienteFK INT NOT NULL,
    logradouro VARCHAR (50) NOT NULL,
    numero VARCHAR (5) NOT NULL,
    bairro VARCHAR (50) NOT NULL, 
    cidade VARCHAR (50) NOT NULL,
    estado VARCHAR (20) NOT NULL,
    cep CHAR(8) NOT NULL,
    complemento VARCHAR (30),
	CONSTRAINT fk_enderecos_clientes FOREIGN KEY (idClienteFK) REFERENCES Clientes (idCliente)
);

CREATE TABLE IF NOT EXISTS Pedidos (
    idPedido INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
	dataPedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    
    urgente BOOLEAN NOT NULL,
    distanciaKM DECIMAL(6,2) NOT NULL,
    pesoCargaKG DECIMAL(5,2) NOT NULL,
    valorKM DECIMAL(5,2) NOT NULL,
    valorKG DECIMAL(5,2) NOT NULL,
    CONSTRAINT fk_pedidos_clientes FOREIGN KEY (idCliente) REFERENCES Clientes(idCliente)
);

CREATE TABLE IF NOT EXISTS Entregas (
    idEntrega INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idPedido INT NOT NULL UNIQUE,
    valorDistancia DECIMAL(8,2) NOT NULL,
    valorPeso DECIMAL(8,2) NOT NULL,
    acrescimo DECIMAL(8,2) NOT NULL,
    desconto DECIMAL(8,2) NOT NULL,
    taxaExtra DECIMAL(8,2) NOT NULL,
    valorTotal DECIMAL (9,2) NOT NULL,
    statusEntrega ENUM('calculado', 'em transito', 'entregue', 'cancelado') NOT NULL,
    CONSTRAINT fk_entregas_pedidos FOREIGN KEY (idPedido) REFERENCES Pedidos(idPedido)
);