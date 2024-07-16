const mongoose = require('mongodb')
const {MongoClient} = require("mongodb");

const start = async () => {
    const url = 'mongodb+srv://manne:manne1337@stream-service.v5lsxsc.mongodb.net/app?retryWrites=true&w=majority&appName=stream-service'
    console.log('connected')

    const client = new MongoClient(url)
    await client.connect()
    // const db = client.db('app')['User'].
    // const collection = db.collection('User').findOne({login: 'flazed'})

    // setTimeout(() => {
    //     client.db('app').collection('User').find().forEach((item, index) => console.log(index+1))
    // }, 10000)
    // collection.forEach((item) => {
    //     console.log(item)
    // })
    const function1 = () => {
        return console.log(1 + 1)
    }
    const function2 = () => {
        client.db('app').collection('User').find().forEach((item) => console.log(item))
    }
    const function3 = () => {
        return console.log(1 + 2)
    }
    function2()
    function1()
    function3()

    // console.log(user)
}

start()