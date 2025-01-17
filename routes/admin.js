const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")




router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/posts', (req, res) => {
    res.send("Pagina de posts")
})



router.get("/categorias", eAdmin, (req,res)=>{
    Categoria.find().sort({date:"desc"}).then((categorias)=>{
        res.render("admin/categorias", {categorias:categorias.map(categorias => categorias.toJSON())})
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})
router.get('/categorias/add',  eAdmin,  (req, res) => {
    res.render("admin/addcategoria")
})

router.post('/categorias/nova',  (req, res) => {
    
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.nome.lenght <= 2){
        erros.push({texto:"Nome da categoria é muito pequeno"})
        
    }

    if(erros.length > 0){
        res.render("admin/addcategoria", {erros: erros})

    }else{

        const novaCategoria = {
            nome : req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() =>{
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria")
            res.redirect("/admin")
        })
    }
})


router.get("/categorias/edit/:id",  eAdmin, (req,res) =>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategorias', {categoria:categoria})
    }).catch((err) =>{
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit",  eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) =>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("success_msg", "Categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err)=> {
            req.flash("error_msg", "Houve um erro ao salvar")
        })
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao editar a categoria" + err)
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/deletar/:id',  eAdmin, (req,res) => {
    Categoria.findOneAndDelete({_id: req.params.id}).then(()=> {
        req.flash('success_msg','Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg','Houve um erro ao deletar a categoria')
        res.redirect('/admin/categorias')
    })
})



router.get('/postagens', eAdmin,  (req, res) => {
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    }).catch( (err) => {
        req.flash('error_msg', 'Erro ao listar os posts')
        res.render('/admin')
    })
})

router.get('/add',  (req, res) => {
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('add', {postagens: postagens})
    }).catch( (err) => {
        req.flash('error_msg', 'Erro ao listar os posts')
        res.render('/admin')
    })
})



router.get("/postagens/add", (req,res) =>{
    Categoria.find().lean().then((categorias) =>{
        res.render("admin/addpostagem", {categorias: categorias})

    }).catch((err) =>{
        req.flash("error_msg", "erroooooooooou" )
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", (req,res) =>{
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto:"Categoria  invalida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})

    }else{
        const NovaPostagem = {
            titulo: req.body.titulo,
            descricao:  req.body.descricao,
            conteudo:  req.body.conteudo,
            categoria:  req.body.categoria,
            slug:  req.body.slug,
            valor: req.body.valor
        }
        new Postagem(NovaPostagem).save().then(() =>{
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect("/admin/add")
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro durante o salvamento")
            res.redirect("/admin/add")
        })
    }

})

router.get("/postagens/edit/:id",  eAdmin, (req,res) =>{
    Postagem.findOne({_id:req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias) =>{
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})

        }).catch((err)=>{
            req.flash("error_msg" , "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })
}).catch((err) =>{
            req.flash("error_msg", "Erro ao carregar o formulario de edição")
            res.redirect("/admin/postagens")
        })
     })

router.post("/postagem/edit",  eAdmin, (req,res) =>{
    Postagem.findOne({_id: req.body.id}).then((postagem) =>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.valor = req.body.valor
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() =>{
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })


    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })
})


router.get("/postagens/deletar/:id",  eAdmin, (req,res) =>{
    Postagem.remove({_id: req.params.id}).then(() =>{
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg", "Deu erro!")
        res.redirect("/admin/postagens")
    })
})


module.exports = router