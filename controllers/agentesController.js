const agentesRepository = require("../repositories/agentesRepository");
const joi = require('joi');

const formatoValido = joi.object({
    nome: joi.string().min(1).required(), //deve ser string e é obrigatória
    dataDeIncorporacao: joi.date().iso().required(),
    cargo: joi.string().min(1).required()
});

function getAllAgentes(req, res) {
    const { cargo, ordenacao } = req.query;
    let agentes = agentesRepository.findAll();

    if (cargo) {
        agentes = agentes.filter(agente => agente.cargo === cargo);
    }

    if (ordenacao) {
        const ordem = ordenacao.startsWith('-') ? 'desc' : 'asc';
        const campo = ordenacao.replace('-', '');
        agentes.sort((a, b) => {
            if (a[campo] > b[campo]) return ordem === 'asc' ? 1 : -1;
            if (a[campo] < b[campo]) return ordem === 'asc' ? -1 : 1;
            return 0;
        });
    }
    res.status(200).json(agentes);
}

function getAgente(req, res) {
    const agenteProcurado = agentesRepository.findById(req.params.id);
    if (!agenteProcurado) {
        return res.status(404).send();
    }
    res.status(200).json(agenteProcurado);
}

function createAgente(req, res, next) {
    const { error } = formatoValido.validate(req.body, { abortEarly: false });
    if (error) {
        return next({ status: 400, message: "Dados mal formatados.", errors: error.details.map(d => d.message) });
    }
    const hoje = new Date();
    const dataIncorp = new Date(req.body.dataDeIncorporacao);
    if (dataIncorp > hoje) {
        return res.status(400).json({ message: "Data de incorporação não pode ser no futuro." });
    }
    const agenteNovo = agentesRepository.create(req.body);
    res.status(201).json(agenteNovo);
}

function putAgente(req, res, next) {
    const { erro } = formatoValido.validate(req.body, { abortEarly: false });
    if (erro) {
        return next({ status: 400, message: "Dados mal formatados.", errors: erro.details.map(d => d.message) });
    }
    const agenteAtualizado = agentesRepository.update(req.params.id, req.body);
    if (!agenteAtualizado) {
        return res.status(404).send();
    }
    res.status(200).json(agenteAtualizado);
}

function patchAgente(req, res, next) {
    const agenteProcurado = agentesRepository.findById(req.params.id);
    if (!agenteProcurado) {
        return res.status(404).send();
    }
    const dados = { ...agenteProcurado, ...req.body };
    const { erro } = formatoValido.validate(dados, { abortEarly: false });
    if (erro) {
        return next({ status: 400, message: "Dados mal formatados.", errors: erro.details.map(d => d.message) });
    }
    const agenteAtualizado = agentesRepository.update(req.params.id, dados);
    res.status(200).json(agenteAtualizado);
}

function removeAgente(req, res) {
    const agenteProcurado = agentesRepository.findById(req.params.id);
    if (!agenteProcurado) {
        return res.status(404).send();
    }
    agentesRepository.remove(req.params.id);
    res.status(204).send();
}

module.exports = {
    getAllAgentes,
    getAgente,
    createAgente,
    putAgente,
    patchAgente,
    removeAgente
}