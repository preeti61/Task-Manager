const mongoose=require('mongoose')
const validator=require('validator')

const TaskSchema=new mongoose.Schema({title:{type:String,
    required:true}
    ,completed:{type:Boolean,
    default:false},
creator:{
    type:mongoose.Schema.Types.ObjectId,
required:true,
ref:'User'}
},{timestamps:true})
const Task=mongoose.model('Task',TaskSchema)

    module.exports=Task
