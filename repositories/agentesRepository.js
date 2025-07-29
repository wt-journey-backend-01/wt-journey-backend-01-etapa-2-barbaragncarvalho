const { v4: uuidv4 } = require('uuid');
let agentes = []

function findById(id) {
    return agentes.find(agente => agente.id === id);
}

function findAll() {
    return agentes;
}

function create(dados) {
    const agenteNovo = { id: uuidv4(), ...dados };
    agentes.push(agenteNovo);
    return agenteNovo;
}

function update(id, dados) {
    const indice = agentes.findIndex(agente => agente.id === id);
    if (indice < 0) {
        return null;
    }
    agentes[indice] = { id, ...dados };
    return agentes[indice];
}

function remove(id) {
    agentes = agentes.filter(agente => agente.id !== id);
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
}