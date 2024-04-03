const express = require('express')
const {connection , PORT} = require('./Config/db')

const app = express();

app.use(express.json())

app.get('/', (req,res) => {
    res.send({msg:'API Running!'})
})

app.listen(PORT, async () => {
    try {
        await connection
        console.log('Connected to DB')
    } catch (error) {
        console.log(error)
    }
    console.log(`listening on PORT: ${PORT}`)
})