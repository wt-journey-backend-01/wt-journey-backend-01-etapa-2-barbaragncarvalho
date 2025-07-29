const express = require('express')
const router = express.Router();
const agentesController = require('../controllers/agentesController');

// define a rota para /agentes usando o método GET
router.get('/agentes', agentesController.seuMetodo)
router.get('/agentes/:id', agentesController.seuMetodo)
router.post('/agentes', agentesController.seuMetodo)
router.put('/agentes/:id', agentesController.seuMetodo)
router.patch('/agentes/:id', agentesController.seuMetodo)
router.delete('/agentes/:id', agentesController.seuMetodo)

module.exports = router