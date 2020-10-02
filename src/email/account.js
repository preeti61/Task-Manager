const sgMail=require('@sendgrid/mail')
const { getMaxListeners } = require('../models/task')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendwelcomeEmail=(email,name)=>{
    sgMail.send(
        {
            to:email,
            from:'preetirautela61@gmail.com',
            subject:'You are Welcome',
            text:`Welcome to the task Manager App,${name}.We are happy to have you`
        }
    )
}


const sendCancelEmail=(email,name)=>{
    sgMail.send(
        {
            to:email,
            from:'preetirautela61@gmail.com',
            subject:'Cancellation ',
            text:`GoodBye,${name}.We feel bad to see you go`
        }
    )
}
module.exports={
    sendwelcomeEmail,
    sendCancelEmail

}