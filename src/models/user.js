const { default: validator } = require('validator')
const bcrypt=require('bcryptjs')
const sharp=require('sharp')

const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const { response } = require('express')
const Task=require('./task')
const { deleteMany } = require('./task')
const userSchema=new mongoose.Schema({
    name:{type:String,
        required:true},
        email:{
            type:String,
            require:true,
            unique:true,
            trim:true,
            validate(value){
              if(!validator.isEmail(value))
              throw new Error('Not a valid email')
            }
        },
        password:{
            type:String,
            trim:true,
            validate(value){
                if(value.length<7&&value.includes('password'))
                throw new Error('Enter a password atleast seven characters long and not having string password')
            }
            
        },
        age:{type:Number,
        default:0},
        tokens:[{token:{
            type:String,
            required:true}
        }],avatar:{
            type:Buffer
        }
},{timestamps:true})
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'creator'
})
userSchema.pre('save',async function(next){
    const user=this
    if(user.isModified('password'))
    {
        user.password=await bcrypt.hash(user.password,8)
    }
    next()
})
 userSchema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({creator:user._id})
    next()
})
userSchema.statics.findByFields=async(email,password)=>
{
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch=await bcrypt.compare(password,user.password)
    console.log(isMatch)
    if(!isMatch)
    throw new Error('Enter a valid password')
    console.log(user)
    return user
}
userSchema.methods.generateToken=async function()
{   const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    
    return token
}

userSchema.methods.getProfile=function(){
    const user=this
    const userObj=user.toObject()
    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar
    return userObj
}

const User=mongoose.model('User',userSchema)


module.exports=User