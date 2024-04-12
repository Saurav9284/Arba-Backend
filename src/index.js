const express = require('express')
const {connection , PORT} = require('./Config/db')
const cors = require('cors')

const UserController = require('./Controllers/user.controller')
const ProductController = require('./Controllers/product.controller')
const CategoryController = require('./Controllers/category.controller')
const CartContoller = require('./Controllers/cart.controller')

const app = express();

app.use(express.json())
app.use(cors('*'))

app.get('/', (req,res) => {
    res.send({msg:'API Running!'})
})

app.use('/user', UserController)
app.use('/api',ProductController)
app.use('/url',CategoryController)
app.use('/uri',CartContoller)

app.listen(PORT, async () => {
    try {
        await connection
        console.log('Connected to DB')
    } catch (error) {
        console.log(error)
    }
    console.log(`listening on PORT: ${PORT}`)
})