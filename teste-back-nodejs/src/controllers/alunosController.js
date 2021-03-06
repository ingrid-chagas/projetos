const express = require('express'); 
const server = require('..');
const { create } = require('../models/Alunos');
const Alunos = require('../models/Alunos');

const gabarito = ["d","b","d","c","b","c","a","b","a","a"];

const router = express.Router();

router.post('/alunos', async (req, res) => {
    const {email} = req.body;
    try{
        if(await Alunos.findOne({email})){
            return res.status(400).send({error: 'Aluno já existe na base de dados'});
        }
        const aluno = await Alunos.create(req.body);
        console.log(aluno);
        return res.status(200).send({mensagem:'Aluno cadastrado com sucesso'});
    } catch (err) {
        return res.status(400).send({error: 'Erro no Registro'})
    }
});

router.post('/alunos/respostas', async (req, res) => {
    try {

        var notaInicial = 0;

        for(let i = 0; i < gabarito.length; i++){
            if(gabarito[i] === req.body.respostas[i]){
                notaInicial += 1;
            }
        }

        Alunos.findOneAndUpdate({_id: req.body._id}, {respostas: req.body.respostas, nota: notaInicial, aprovado: true}, function(
            err,
            result
        ){
            if(err) {
                res.status(400).send({error: 'Falhou aqui'});
            } else {
                res.status(201).send({
                    status: "created",
                    mensagem: "Respostas salvas com sucesso"
                });
            }
        });
        
        //return res.status(200).send({respostaAluno, mensagem:'Respostas salvas com sucesso'});
    } catch (error) {
        return res.status(400).send({error: 'Erro no Registro'})
    }
    
});

router.get('/alunos/:alunoId/status', async (req, res) => {
    try{
        const aluno = await Alunos.findById(req.params.alunoId);
        const build = buildViewJson(aluno);

        if(!aluno.respostas.length){
            return res.status(200).send(buildViewSemRespostas(aluno));
        }

        return res.status(200).send(build);
        
    } catch (err) {
        return res.status(400).send({error: 'Erro no Registro'})
    }
});

function buildViewJson(aluno){
    return obj = {
          nome: aluno.nome,
          email: aluno.email,
          data_do_teste: aluno.dataDoTeste,
          aprovado: aluno.aprovado,
          nota: aluno.nota
    };
};

function buildViewSemRespostas(aluno){
    return obj = {
        nome: aluno.nome,
        email: aluno.email,
        data_do_teste: null,
        aprovado: false,
        nota: 0
  };
}

router.get('/', async (req, res) => {
    try{
        const listaAlunos = await Alunos.find();
        return res.send({listaAlunos});
    } catch (err) {
        return res.status(400).send({error: 'Erro no Registro'})
    }
})

module.exports = server => server.use(router);
