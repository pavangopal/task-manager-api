const express = require('express')
const taskRouter = new express.Router()
const auth = require("../middleware/auth")
const Task = require("../models/task")

taskRouter.post("/tasks", auth, async (req,res)=>{
    
    const newTask = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        const task = await newTask.save()
        res.send(task)
    }catch(error) {
        res.send(400).send(error)
    }
})

taskRouter.get('/tasks', auth, async (req,res)=>{
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
         await req.user.populate({
             path: "tasks",
             match,
             options:{
                 limit: parseInt(req.query.limit),
                 skip: parseInt(req.query.skip),
                 sort
             }
         }).execPopulate()
        res.send(req.user.tasks)
    }catch(error) {
        res.status(500).send(error)
    }
})

taskRouter.get('/tasks/:id', auth, async (req,res)=>{
    const taskId = req.params.id
    try {
        const task = await Task.findOne({_id: taskId, owner: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    }catch(error) {
        res.status(500).send(error)
    }
})

taskRouter.patch('/tasks/:id', auth, async (req,res)=>{
    const updateKeys = Object.keys(req.body)
    const excludedKeys = ['email']
    const isAllowed =  updateKeys.every((updateKey) => excludedKeys.includes(updateKey))
    
    if (isAllowed) {
        return res.status(400).send({'error':'invalid updates'})
    }

    try{

        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }
        updateKeys.forEach((key) => task[key] = req.body[key])
        await task.save()

        res.send(task)
    }catch (error){
        res.status(500).send(error)
    }
})

taskRouter.delete('/tasks/:id', auth, async (req,res)=>{
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        await task.deleteOne()

        res.send(task)

    }catch (e){
        res.status(500).send(e)
    }
})

module.exports = taskRouter