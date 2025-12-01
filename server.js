const express = require('express');
const app = express();
const routes = require('./src/routes/routes');
const PORT = 8081

app.use(express.json());
app.use('/', routes);

app.use('/', routes);

app.listen(PORT, ()=>{
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
