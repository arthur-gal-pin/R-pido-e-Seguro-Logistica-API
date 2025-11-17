const express = require('express');
const app = express();
const {router} = require('./src/routes/routes');
const PORT = 8081

app.use(express.json());

app.use('/', router);

app.listen(PORT, ()=>{
    console.log(`Servidor rodando em http://localhost:${PORT}`);
})

