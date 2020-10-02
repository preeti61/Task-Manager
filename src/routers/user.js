const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const multer=require('multer')
 const auth=require('../middleware/auth')
const sharp = require('sharp')
const {sendwelcomeEmail,sendCancelEmail}=require('../email/account.js')
router.post('/users',async(req,res)=>{
    
  const user=new User(req.body)
  console.log(user)
    try{
      const token =await user.generateToken()
      user.tokens=user.tokens.concat({token})
   await user.save()
        sendwelcomeEmail(user.email,user.name)
        res.send({user:user.getProfile(),token})
    }catch(e){
        res.status(400).send(e)
    }
})
router.post('/users/login',async(req,res)=>{
  try{
  const user=await User.findByFields(req.body.email,req.body.password)
  const token=await user.generateToken()
  
  user.tokens=user.tokens.concat({token})
   
  res.send({user:user.getProfile(),token})}
  catch(e){
res.status(500).send(e)
  }
  
})
router.post('/users/logout',auth,async(req,res)=>{
  try{
    
    req.user.tokens=req.user.tokens.filter((token)=>{
      return token.token!==req.token
    })
    await req.user.save()
    res.send(req.user)
  }
  catch{
    res.status(500).send()
  }
})
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
      req.user.tokens = []
      await req.user.save()
      res.send()
  } catch (e) {
      res.status(500).send()
  }
})
router.get('/users/me',auth,async(req,res)=>{
  try{

      res.send(req.user)
  }catch(e){
 res.status(400).send(e)
  }

})
const avatar=multer({
 
  limits:{
    fileSize:1000000
  },
  fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpg|jpeg|PNG)$/))
    return cb( new Error('Please add a jpg file'))
    cb(undefined,true)
  }
})


router.post('/users/me/avatar',auth,avatar.single('avatar'),async(req,res)=>{
  const buf=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
  req.user.avatar=buf
  await req.user.save()
  res.send()},(error,req,res,next)=>{
     res.status(400).send(error.message)
  }
)
router.patch('/users/me',auth,async(req,res)=>{
  const updates=Object.keys(req.body)
  const allowed=['name','age','email','password']
 const isValid= updates.every((up)=>{
    return allowed.includes(up)
  })
  if(!isValid)
  return res.send('Invalid Field')
  try{
    
   
    updates.forEach((update)=>{
      req.user[update]=req.body[update]
     
    })
    await req.user.save()
     
     res.status(200).send(req.user)
  }
  catch(e){
    res.status(500).send(e)
  }
})
router.delete('/users/me/avatar',auth,async(req,res)=>{
  req.user.avatar=undefined
  await req.user.save()
  res.send()
})
router.get('/users/me/avatar/:id',async(req,res)=>{
  try{
  const user=await User.findById(req.params.id)
  if(!user||!user.avatar)
  throw new Error()
  res.set('Content-Type','image/png')
  res.send(user.avatar)
 }
  catch{
    res.status.send(404)
  }

})
router.delete('/users/me',auth,async(req,res)=>{
  try{
   await req.user.remove()
   sendCancelEmail(req.user.email,req.user.name)
 res.send(req.user)
}
 catch{
     res.status(500).send()
 }
})



  module.exports=router