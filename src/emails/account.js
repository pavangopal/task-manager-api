const sgMail = require('@sendgrid/mail')

const sendGridApiKey = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sendGridApiKey)
        
const sendWelcomeEmail = (emailId, name) => {
  const msg = {
    to: emailId, // Change to your recipient
    from: 'pavangopal39@gmail.com', // Change to your verified sender
    subject: 'Welcome to ChepTech Pvt Ltd.',
    text: `Welcome to the app ${name}.`
  }

  sgMail.send(msg).then(()=>{

  }).catch((e)=>{

  })
}

module.exports = {sendWelcomeEmail}