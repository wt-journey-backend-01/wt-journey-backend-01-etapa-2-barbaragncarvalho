const agentesRepository = require("../repositories/agentesRepository")
function getAllAgentes(req, res) {

    const casos = agentesRepository.findAll();
    res.json(casos);
}

module.exports = {
    getAllAgentes
}