<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para barbaragncarvalho:

Nota final: **62.3/100**

Olá, barbaragncarvalho! 👋🚀

Antes de tudo, parabéns pelo esforço e pelo que você já conseguiu entregar nessa API para o Departamento de Polícia! 🎉 Você estruturou bem seu projeto, organizou rotas, controladores e repositórios, e implementou várias funcionalidades importantes com cuidado. Isso mostra que você está no caminho certo e já domina muitos conceitos essenciais de Node.js e Express.js. Vamos juntos destrinchar seu código para que você possa evoluir ainda mais! 💪✨

---

## 🎯 O que deu muito certo — Bora celebrar!

- Sua **estrutura de pastas e arquivos** está alinhada com o que o desafio pede. Você separou direitinho `routes`, `controllers`, `repositories`, `utils` e `docs`. Isso deixa seu projeto organizado e escalável, parabéns! 📂✅
- Implementou todos os métodos HTTP (GET, POST, PUT, PATCH, DELETE) para os recursos `/agentes` e `/casos`. Isso é fundamental e você fez direitinho! 👏
- Usou o **Joi** para validação de dados, o que é uma ótima prática para garantir integridade e segurança nas requisições.
- Tratamento de erros com status HTTP corretos está presente em vários pontos, como 404 para recursos não encontrados, 201 para criação e 204 para deleção.
- Implementou o endpoint especial `/casos/:id/agente` para buscar o agente responsável pelo caso, isso mostra que você pensou além do básico! 🌟
- Alguns filtros e ordenações simples para agentes já estão funcionando, o que indica que você entendeu bem manipulação de query params.
- Parabéns também por implementar mensagens de erro personalizadas e usar middlewares para isso (vi o `errorHandler` no `server.js`), isso deixa a API mais profissional.

---

## 🔍 Onde podemos melhorar juntos — Vamos entender o que está acontecendo?

### 1. Validação de dados: o ponto mais crítico que impacta vários erros!

Vi que você está usando o Joi para validar os dados, o que é ótimo. Mas encontrei alguns detalhes que estão fazendo com que dados inválidos passem pela validação, gerando problemas e falhas no comportamento esperado da API.

Por exemplo, no seu `controllers/agentesController.js`, você declarou o esquema assim:

```js
const formatoValido = joi.object({
    nome: joi.string().required(),
    dataDeIncorporacao: joi.date().iso().required(),
    cargo: joi.string().required()
});
```

E no método `createAgente`, você faz uma validação manual simples:

```js
function createAgente(req, res) {
    const { nome, dataDeIncorporacao, cargo } = req.body;
    if (!nome) {
        res.status(400).json({ message: "O Nome é obrigatório." });
    }
    if (!dataDeIncorporacao) {
        res.status(400).json({ message: "A Data é obrigatória." });
    }
    if (!cargo) {
        res.status(400).json({ message: "O Cargo é obrigatório." });
    }
    const agenteNovo = agentesRepository.create(req.body);
    res.status(201).json(agenteNovo);
}
```

Aqui, percebo dois problemas importantes:

- Você não está **interrompendo a execução** após enviar o status 400. Isso faz com que, mesmo que falte algum dado obrigatório, o código continue e crie o agente! Para corrigir, deve usar `return res.status(400).json(...)` para garantir que o fluxo pare ali.
- A validação manual aqui é inconsistente com o Joi. Seria melhor usar o Joi também para validar no `createAgente`, assim como fez no `putAgente` e `patchAgente`. Isso evita erros de formatação, como datas inválidas ou formatos errados.

Além disso, no Joi, o campo `dataDeIncorporacao` está validando com `.date().iso()`, que aceita datas no formato ISO completo, mas o desafio espera um formato mais específico (provavelmente `YYYY-MM-DD`). E não há validação para impedir datas futuras, que não fazem sentido para data de incorporação.

**Sugestão para melhorar sua validação no createAgente:**

```js
function createAgente(req, res, next) {
    const { error } = formatoValido.validate(req.body, { abortEarly: false });
    if (error) {
        return next({ status: 400, message: "Dados mal formatados.", errors: error.details.map(d => d.message) });
    }
    // Validação extra para data futura
    const hoje = new Date();
    const dataIncorp = new Date(req.body.dataDeIncorporacao);
    if (dataIncorp > hoje) {
        return res.status(400).json({ message: "Data de incorporação não pode ser no futuro." });
    }
    const agenteNovo = agentesRepository.create(req.body);
    res.status(201).json(agenteNovo);
}
```

Recomendo fortemente assistir este vídeo para entender melhor como fazer validação de dados em APIs com Node.js e Express:  
▶️ https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

---

### 2. Permissão para alterar o ID dos recursos

Outro ponto que gerou problemas foi a possibilidade de alterar o `id` dos agentes e casos via PUT ou PATCH. No seu `agentesController.js`, por exemplo, no método `putAgente`:

```js
const agenteAtualizado = agentesRepository.update(req.params.id, req.body);
```

E no repositório:

```js
function update(id, dados) {
    const indice = agentes.findIndex(agente => agente.id === id);
    if (indice < 0) {
        return null;
    }
    agentes[indice] = { id, ...dados };
    return agentes[indice];
}
```

Aqui você está sobrescrevendo o objeto inteiro com `{ id, ...dados }`, mas `dados` pode conter um campo `id` diferente do original! Isso permite que o ID seja alterado, o que não é desejado.

**Como evitar?** Antes de atualizar, remova o campo `id` do `dados` para garantir que o ID não seja alterado:

```js
function update(id, dados) {
    const indice = agentes.findIndex(agente => agente.id === id);
    if (indice < 0) {
        return null;
    }
    // Remove o campo id se existir no dados
    const { id: idDoPayload, ...resto } = dados;
    agentes[indice] = { id, ...resto };
    return agentes[indice];
}
```

Faça o mesmo para `casosRepository.js` para manter a consistência.

---

### 3. Validação incompleta dos campos dos casos

No seu `casosController.js`, você fez um esquema Joi legal para validar:

```js
const formatoValido = joi.object({
    titulo: joi.string().required(),
    descricao: joi.string().required(),
    status: joi.string().valid('aberto', 'solucionado').required(),
    agente_id: joi.string().guid().required()
});
```

Porém, segundo suas penalidades, ainda é possível criar casos com título ou descrição vazios, e atualizar casos com status inválido.

Isso acontece porque `joi.string().required()` aceita strings vazias como válidas. Para garantir que não sejam strings vazias, você pode usar `.min(1)` ou `.not('').required()`.

Por exemplo:

```js
const formatoValido = joi.object({
    titulo: joi.string().min(1).required(),
    descricao: joi.string().min(1).required(),
    status: joi.string().valid('aberto', 'solucionado').required(),
    agente_id: joi.string().guid().required()
});
```

Assim você garante que o título e descrição tenham ao menos um caractere e não sejam vazios.

---

### 4. Validação do agente_id na criação de casos

Você está validando se o `agente_id` enviado realmente existe:

```js
if (!agentesRepository.findById(req.body.agente_id)) {
    return res.status(400).json({ message: "Agente não encontrado." })
}
```

Isso é excelente! 👍 Só que, para manter consistência, seria legal usar o middleware de tratamento de erros também, ou retornar o erro no formato que você usa no `next()` para erros de validação, para que o cliente receba uma resposta uniforme.

---

### 5. Middleware de tratamento de erros e fluxo das funções

No seu `server.js` você fez:

```js
app.use(express.json()); //lida com JSON
app.use(require('./utils/errorHandler'));
```

O ideal é que o middleware de tratamento de erros seja registrado **após** todas as rotas, para capturar erros que acontecem nelas. Assim:

```js
app.use(express.json());
app.use(agentesRouter);
app.use(casosRouter);
app.use(require('./utils/errorHandler'));
```

Se o `errorHandler` ficar antes das rotas, ele não vai capturar os erros lançados por elas.

---

### 6. Pequeno ajuste nos status code e respostas

No seu `createAgente`, como comentei, você não está usando `return` nas validações, o que pode fazer a função continuar mesmo após enviar resposta. Isso pode causar erros difíceis de debugar.

Sempre que enviar uma resposta, use `return` para interromper a execução:

```js
if (!nome) {
    return res.status(400).json({ message: "O Nome é obrigatório." });
}
```

---

## 📚 Recursos que recomendo para você dar aquele upgrade:

- Para entender mais sobre validação com Joi e tratamento de erros na API:  
  https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

- Para evitar alteração indevida do ID no update:  
  https://youtu.be/RSZHvQomeKE (vídeo geral de API REST com Express, que mostra boas práticas)

- Para entender o fluxo correto de middlewares e tratamento de erros no Express:  
  https://expressjs.com/pt-br/guide/error-handling.html

- Para garantir que strings não sejam vazias no Joi, veja a documentação oficial:  
  https://joi.dev/api/?v=17.13.1#stringminlimit

---

## 📝 Resumo rápido do que focar para melhorar:

- [ ] Use Joi para validar os dados no método `createAgente` (e não só validação manual simples).
- [ ] Impeça a alteração do campo `id` nos métodos de atualização (`update`) nos repositories, removendo o `id` do payload antes de salvar.
- [ ] Ajuste o esquema Joi para impedir strings vazias em `titulo` e `descricao` dos casos.
- [ ] Valide que `dataDeIncorporacao` não seja uma data futura.
- [ ] Use `return` para interromper a execução após enviar uma resposta com erro.
- [ ] Coloque o middleware de tratamento de erros (`errorHandler`) **depois** das rotas no `server.js`.
- [ ] Uniformize as respostas de erro para manter consistência na API.

---

Você já tem uma base muito sólida, barbaragncarvalho! 🎉 Com esses ajustes, sua API vai ficar ainda mais robusta, confiável e alinhada com as boas práticas de desenvolvimento. Continue praticando, revisando seu código e explorando os recursos que te indiquei — o aprendizado é contínuo! 🚀💙

Se precisar, estou aqui para ajudar! Vamos juntos nessa jornada de código! 😉

Um abraço forte,  
Seu Code Buddy 👨‍💻✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>