const express = require('express');
const app = express();
const PORT = 3000;
const agentesRouter = require("./routes/agentesRoutes");
const casosRouter = require("./routes/casosRoutes");
const errorHandler = require('./utils/errorHandler');

app.use(express.json()); //lida com JSON

const swaggerUi = require("swagger-ui-express");

app.use(agentesRouter);
app.use(casosRouter);

const swaggerDocs = require('./docs/swagger.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em localhost: http://localhost:${PORT}`);
});