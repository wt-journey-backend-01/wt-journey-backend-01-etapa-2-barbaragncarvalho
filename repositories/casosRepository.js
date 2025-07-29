const { v4: uuidv4 } = require('uuid');
let casos = []

function findById(id) {
    return casos.find(caso => caso.id === id);
}

function findAll() {
    return casos
}

function create(dados) {
    const casoNovo = { id: uuidv4(), ...dados };
    casos.push(casoNovo);
    return casoNovo;
}

function update(id, dados) {
    const indice = casos.findIndex(caso => caso.id === id);
    if (indice < 0) {
        return null;
    }
    casos[indice] = { id, ...dados };
    return casos[indice];
}

function remove(id) {
    casos = casos.filter(caso => caso.id !== id);
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
}