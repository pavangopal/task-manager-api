const express = require('express')

require('./db/mongoose') 

const { ObjectID } = require('mongodb')
const userRouter = require("./Routes/userRoute")
const taskRouter = require("./Routes/taskRoute")

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log("Server is up on port:" + port);
})
