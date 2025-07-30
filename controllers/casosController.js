const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const joi = require('joi');

const formatoValido = joi.object({
    titulo: joi.string().min(1).required(),
    descricao: joi.string().min(1).required(),
    status: joi.string().valid('aberto', 'solucionado').required(),
    agente_id: joi.string().guid().required(),
    id: joi.forbidden()
});

function getAllCasos(req, res) {
    const { status, agente_id, busca } = req.query;
    let casos = casosRepository.findAll();

    if (status) {
        casos = casos.filter(caso => caso.status === status);
    }
    if (agente_id) {
        casos = casos.filter(caso => caso.agente_id === agente_id);
    }
    if (busca) {
        const termo = busca.toLowerCase();
        casos = casos.filter(caso =>
            caso.titulo.toLowerCase().includes(termo) ||
            caso.descricao.toLowerCase().includes(termo)
        );
    }

    res.status(200).json(casos);
}

function getCaso(req, res) {
    const casoProcurado = casosRepository.findById(req.params.id);
    if (!casoProcurado) {
        return res.status(404).json({ message: "Caso não encontrado." });
    }
    res.status(200).json(casoProcurado);
}

function createCaso(req, res, next) {
    const { error } = formatoValido.validate(req.body, { abortEarly: false });
    if (error) {
        return next({ status: 400, message: "Dados mal formatados.", errors: error.details.map(d => d.message) });
    }
    if (!agentesRepository.findById(req.body.agente_id)) {
        return next({ status: 404, message: "Agente não encontrado." });
    }
    const casoNovo = casosRepository.create(req.body);
    res.status(201).json(casoNovo);
}

function putCaso(req, res, next) {
    const { error } = formatoValido.validate(req.body, { abortEarly: false });
    if (error) {
        return next({ status: 400, message: "Dados mal formatados.", errors: error.details.map(d => d.message) });
    }
    const casoAtualizado = casosRepository.update(req.params.id, req.body);
    if (!casoAtualizado) {
        return res.status(404).json({ message: "Não foi possível atualizar o caso." });
    }
    res.status(200).json(casoAtualizado);
}

function patchCaso(req, res, next) {
    const original = casosRepository.findById(req.params.id);
    if (!original) {
        return res.status(404).json({ message: "Caso não encontrado." });
    }

    delete req.body.id;
    const dados = { ...original, ...req.body };
    
    const { error } = formatoValido.validate(dados, { abortEarly: false });
    if (error) {
        return next({
            status: 400,
            message: 'Dados mal formatados.',
            errors: error.details.map(d => d.message)
        });
    }

    const casoAtualizado = casosRepository.update(req.params.id, dados);
    res.status(200).json(casoAtualizado);
}

function removeCaso(req, res) {
    const casoProcurado = casosRepository.findById(req.params.id);
    if (!casoProcurado) {
        return res.status(404).json({ message: "Caso não encontrado." });
    }
    casosRepository.remove(req.params.id);
    res.status(204).send();
}

function getAgenteOfCaso(req, res) {
    const caso = casosRepository.findById(req.params.id);
    if (!caso) {
        return res.status(404).json({ message: "Caso não encontrado." });
    }
    const agente = agentesRepository.findById(caso.agente_id);
    if (!agente) {
        return res.status(404).json({ message: "Agente responsável não encontrado." });
    }
    res.status(200).json(agente);
}

module.exports = {
    getAllCasos,
    getCaso,
    createCaso,
    putCaso,
    patchCaso,
    removeCaso,
    getAgenteOfCaso
}