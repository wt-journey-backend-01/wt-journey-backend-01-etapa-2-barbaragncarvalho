const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const joi = require('joi');

const formatoValido = joi.object({
    titulo: joi.string().required(),
    descricao: joi.string().required(),
    status: joi.string().valid('aberto', 'solucionado').required(),
    agente_id: joi.string().guid().required()
});

function getAllCasos(req, res) {
    const casos = casosRepository.findAll();
    res.json(casos);
}

function getCaso(req, res) {
    const casoProcurado = casosRepository.findById(req.params.id);
    if (!casoProcurado) {
        return res.status(404).send();
    }
    res.status(200).json(casoProcurado);
}

function createCaso(req, res, next) {
    const { erro } = formatoValido.validate(req.body, { abortEarly: false });
    if (erro) {
        return next({ status: 400, message: "Dados mal formatados.", errors: erro.details.map(d => d.message) });
    }
    if (!agentesRepository.findById(req.body.agente_id)) {
        return res.status(400).json({ message: "Agente não encontrado." })
    }
    const casoNovo = casosRepository.create(req.body);
    res.status(201).json(casoNovo);
}

function putCaso(req, res, next) {
    const { erro } = formatoValido.validate(req.body, { abortEarly: false });
    if (erro) {
        return next({ status: 400, message: "Dados mal formatados.", errors: erro.details.map(d => d.message) });
    }
    const casoAtualizado = casosRepository.update(req.params.id, req.body);
    if (!casoAtualizado) {
        return res.status(404).send();
    }
    res.status(200).json(casoAtualizado);
}

function patchCaso(req, res, next) {
    const casoProcurado = casosRepository.findById(req.params.id);
    if (!casoProcurado) {
        return res.status(404).send();
    }
    const dados = { ...casoProcurado, ...req.body };
    const { erro } = formatoValido.validate(dados, { abortEarly: false });
    if (erro) {
        return next({ status: 400, message: "Dados mal formatados.", errors: erro.details.map(d => d.message) });
    }
    const casoAtualizado = casosRepository.update(req.params.id, dados);
    res.status(200).json(casoAtualizado);
}

function removeCaso(req, res) {
    const casoProcurado = casosRepository.findById(req.params.id);
    if (!casoProcurado) {
        return res.status(404).send();
    }
    casosRepository.remove(req.params.id);
    res.status(204).send();
}

function getAgenteOfCaso(req, res) {
    const caso = casosRepository.findById(req.params.id);
    if (!caso) {
        return res.status(404).send();
    }
    const agente = agentesRepository.findById(caso.agente_id);
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