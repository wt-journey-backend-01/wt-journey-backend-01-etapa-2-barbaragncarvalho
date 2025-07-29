const express = require('express')
const app = express();
const PORT = 3000;
const agentesRouter = require("./routes/agentesRoutes");
const casosRouter = require("./routes/casosRoutes");

app.use(express.json()); //lida com JSON

const swaggerUi = require("swagger-ui-express");

app.use(agentesRouter);
app.use(casosRouter);

const swaggerDocs = require('./docs/swagger');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(require('./utils/errorHandler'));

app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em localhost: http://localhost:${PORT}`);
});