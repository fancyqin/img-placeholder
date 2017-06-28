const koa = require('koa');
const logger = require('koa-logger');
const route = require('koa-route');
const views = require('co-views');
const serve = require('koa-static');

const app = koa();
app.use(logger());

app.listen(2333);

console.log('listening 2333');

app.use(serve(__dirname +'/src'));

let render = views(__dirname + '/page',{
    map: {html:'mustache'}
});


const gm = require('gm');
const dir = __dirname + '/img/';


const randomImg = () => dir + 'img'+ Math.ceil(Math.random()*3)+'.jpg';
const randomNum = (width) => Math.ceil(Math.random()*Number(width) + Number(width)/2);


function *index(){
    let data = {};
    this.body = yield render('index',data)
}

function *resetImg(number){
    this.type =  'image/jpg';
    let inputW,inputH;

    if(/\d[x]\d/.test(number)){
        inputW = number.split('x')[0];
        inputH = number.split('x')[1];
        this.body = gm(randomImg()).resize(inputW,inputH,'!').stream();
    }else if(/^\d+$/.test(number)){
        this.body = gm(randomImg()).resize(number).stream();
    }else{
        this.throw('Must be number,like [300x200] or [500]', 404);
    }

}

function *resetImgRandom(number){
    this.type =  'image/jpg';
    let inputW,inputH;

    if(/\d[x]\d/.test(number)){
        inputW = number.split('x')[0];
        inputH = number.split('x')[1];
        this.body = gm(randomImg()).resize(randomNum(inputW),randomNum(inputH),'!').stream();
    }else if(/^\d+$/.test(number)){
        this.body = gm(randomImg()).resize(randomNum(number)).stream();
    }else{
        this.throw('Must be number,like [300x200] or [500]', 404);
    }

}

//router

app.use(route.get('/',index));
app.use(route.get('/:number',resetImg));
app.use(route.get('/r/:number',resetImgRandom));