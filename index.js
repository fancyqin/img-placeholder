const koa = require('koa')
const logger = require('koa-logger')
const route = require('koa-route')
const views = require('co-views')
const serve = require('koa-static')

const app = koa()
app.use(logger())

app.listen(2333)

console.log('listening 2333')

app.use(serve(__dirname +'/src'))

let render = views(__dirname + '/page',{
    map: {html:'mustache'}
});

//router

app.use(route.get('/',index))
app.use(route.get('/new',newImg))

function *index(){
    let data = {};
    this.body = yield render('index',data)
}

const fs = require('fs')
const path = require('path')
const gm = require('gm')

let dir = __dirname + '/img/'



//todo
function *newImg(ctx){

    this.body = yield gm(dir + 'banner2.jpg').crop(140,140).stream()

}

