
const express=require('express')
 const userRouter=require('./routers/user.js')
const taskRouter=require('./routers/task.js')
require('./db/mongoose')
const port=process.env.PORT
const multer=require('multer')


 const User = require('./models/user.js')

const app=express()


const Task=require('./models/task')
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log('Server is up at port '+port)
})

