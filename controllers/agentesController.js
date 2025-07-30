const agentesRepository = require("../repositories/agentesRepository");
const joi = require('joi');

const formatoValido = joi.object({
    nome: joi.string().min(1).required(), //deve ser string e é obrigatória
    dataDeIncorporacao: joi.date().iso().required(),
    cargo: joi.string().min(1).required(),
    id: joi.forbidden()
});

function getAllAgentes(req, res) {
    const { cargo, ordenacao, dataInicio, dataFim } = req.query;
    let agentes = repoAgentes.findAll();

    if (cargo) {
        agentes = agentes.filter(a => a.cargo === cargo);
    }
    if (dataInicio || dataFim) {
        agentes = agentes.filter(a => {
            const dt = new Date(a.dataDeIncorporacao);
            if (dataInicio && dt < new Date(dataInicio)) return false;
            if (dataFim && dt > new Date(dataFim)) return false;
            return true;
        });
    }
    if (ordenacao) {
        const dir = ordenacao.startsWith('-') ? -1 : 1;
        const campo = ordenacao.replace('-', '');
        agentes.sort((a, b) => {
            let va = a[campo];
            let vb = b[campo];
            if (campo === 'dataDeIncorporacao') {
                va = new Date(va);
                vb = new Date(vb);
            }
            if (va > vb) return dir;
            if (va < vb) return -dir;
            return 0;
        });
    }
    res.status(200).json(agentes);
}

function getAgente(req, res) {
    const agenteProcurado = agentesRepository.findById(req.params.id);
    if (!agenteProcurado) {
        return res.status(404).json({ message: "Agente não encontrado." });
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
    const { error } = formatoValido.validate(req.body, { abortEarly: false });
    if (error) {
        return next({ status: 400, message: "Dados mal formatados.", errors: error.details.map(d => d.message) });
    }
    const agenteAtualizado = agentesRepository.update(req.params.id, req.body);
    if (!agenteAtualizado) {
        return res.status(404).json({ message: "Não foi possível atualizar o agente." });
    }
    res.status(200).json(agenteAtualizado);
}

function patchAgente(req, res, next) {
    const original = agentesRepository.findById(req.params.id);
    if (!original) {
        return res.status(404).json({ message: "Agente não encontrado." });
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

    const agenteAtualizado = agentesRepository.update(req.params.id, dados);
    res.status(200).json(agenteAtualizado);
}

function removeAgente(req, res) {
    const agenteProcurado = agentesRepository.findById(req.params.id);
    if (!agenteProcurado) {
        return res.status(404).json({ message: "Agente não encontrado." });
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