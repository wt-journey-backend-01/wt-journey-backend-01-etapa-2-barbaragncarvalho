const express = require('express')
const app = express();
const PORT = 3000;
const agentesRouter = require("./routes/agentesRouter");
const casosRouter = require("./routes/casosRouter");

app.use(express.json()); //lida com JSON

app.use(agentesRouter);
app.use(casosRouter);

app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em localhost: http://localhost:${PORT}`);
});