const express = require('express')
const auth = require("../middleware/auth")
const User = require("../models/user")
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail } = require('../emails/account')

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload image of formate jpg,jepg,png'))
        }

        return cb(undefined,true)
    }

})

const userRouter = new express.Router()

userRouter.post('/users', async (req,res)=>{
    const newUser = new User(req.body)
    try {
        const user = await newUser.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.send({user,token})

    }catch(error) {
        res.send(400).send(error)
    }
})

userRouter.post("/users/login", async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})

    } catch(e) {
        console.log(e);
        res.status(400).send(e)
    }
})


userRouter.get("/users", auth, async (req,res)=>{
    try{
        const user = await User.find({})
        res.send(user)
    }catch(error) {
        res.status(500).send(error)
    }
})

userRouter.get("/users/:id", async (req,res)=>{
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    }catch(error) {
        res.status(500).send(error)
    }
})

userRouter.patch("/users/me", auth, async (req,res)=>{

    const keys = Object.keys(req.body)
    const toUpdateKeys = ['name','age','password','email']

    const canUpdate = keys.every((key)=> toUpdateKeys.includes(key))

    if (!canUpdate) {
        return res.status(400).send({'error': 'update not possible'})
    }

    try {
        keys.forEach((key)=>{
            req.user[key] = req.body[key]
        })

        await req.user.save()
        res.send(req.user)

    }catch (e) {
        res.status(500).send(e)
    }

})

userRouter.post('/users/me/avatar', auth, upload.single('avator'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    req.user.avator = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{

})


userRouter.post('/users/logout', auth, async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    }catch (e) {
        console.log(e);
    }
})


userRouter.post('/users/logoutAll', auth, async(req,res)=>{
    try {
        req.user.tokens = []

        await req.user.save()
        res.send()
    }catch (e) {
        console.log(e);
    }
})

userRouter.delete('/users/me', auth, async (req,res)=>{
    try {
        const user = await User.findOne({_id: req.user._id})

        if (!user) {
            return res.status(404).send()
        }

        await user.remove()

        res.send(user)

    }catch (e){
        res.status(500).send(e)
    }
})

userRouter.delete('/users/me/avator', auth, async (req,res)=>{
    req.user.avator = undefined
    await req.user.save()
    res.status(200).send()
})

userRouter.get('/users/:id/avator', async (req,res)=>{
    try {
        const user  = await User.findById(req.params.id)

        if(!user || !user.avator) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avator)

    }catch (e) {
        res.status(404).send()
    }
})

module.exports = userRouter