const express=require('express')
const auth=require('../middleware/auth')
const router=new express.Router()
 require('../db/mongoose')

const Task=require('../models/task')
router.post('/tasks',auth,async(req,res)=>{
    const task=new Task({
        ...req.body,
        creator:req.user._id
    })
    task.save()
    res.send(task)
})

router.get('/tasks',auth,async(req,res)=>{
      const match={}
      const sort={}

      if(req.query.completed)
      match.completed=req.query.completed==='true'
      if(req.query.sortBy)
    {  const splt=req.query.sortBy.split('_')
      sort[splt[0]]=splt[1]==='desc'?-1:1}
    try{
        await req.user.populate({path:'tasks',match,options:{limit:parseInt(req.query.limit)
        ,skip:parseInt(req.query.skip),sort}}).execPopulate()
        res.send(req.user.tasks)}

    catch(e){res.status(500).send()}})




router.get('/tasks/:id',auth,async(req,res)=>{
  
//    const task=await Task.findById(req.params.id)
const task=await Task.findOne({_id:req.params.id,creator:req.user._id})
   console.log(task)
   try{
    if(!task)
    return res.status(404).send()
    res.send(task)
   }
   catch{
       res.status(500).send()
    } })

router.patch('/tasks/:id',auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    console.log(updates)
    const allowedUpdate=['title','completed']
    const isValid=updates.every((up)=>{
        return allowedUpdate.includes(up)
    })
    console.log(isValid)
    if(!isValid)
    return res.status(400).send({Error:'Invalid field'})

    try{
       const task=await Task.findOne({creator:req.user,_id:req.params.id})
       if(!task)
       return res.status(404).send()
       console.log(task)
       updates.forEach((update)=>{
          task[update]=req.body[update]
       })
       await task.save()
       res.send(task)
    }
    catch{
        res.status(500).send()
    }
})

router.delete('/tasks/:id',auth,async(req,res)=>{
    try{
    const task=await Task.findOneAndDelete({_id:req.params.id,creator:req.user._id})
    
    if(!task)
    return res.status(404).send()
    res.send(task)
}
catch{
    res.status(500).send()
}
})



module.exports=router