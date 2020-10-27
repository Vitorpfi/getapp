const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo:{
        //nome
        type:  String,
        required: true
    },
    slug:{
        //RG
        type:String,
        required:true
    },
    valor:{
        type:String,
        required:true
    },
    descricao:{
        //Descrição
        type: String,

    },
    conteudo:{
        //Serviço
        type:  String,
        required: true
    },
    categoria:{
        //Profissão
        type:  Schema.Types.ObjectId,
        ref: "categorias",
        require: true
    },
    data:{
        type:Date,
        default:Date.now()
    }
})

mongoose.model("postagens", Postagem)