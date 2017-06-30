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
    map: {html:'ejs'}
});


const gm = require('gm');
const dir = __dirname + '/img/';


const randomImg = () => dir + 'img'+ Math.ceil(Math.random()*9)+'.jpg';
const randomNum = (width) => Math.ceil(Math.random()*Number(width) + Number(width)/2);


function *index(){
    let data = {};
    this.body = yield render('index',data)
}

function *resetImg(num){
    this.type =  'image/jpg';
    let inputW,inputH;

    if(/\d[x]\d/.test(num)){
        inputW = num.split('x')[0];
        inputH = num.split('x')[1];
        if(Number(inputW) > Number(inputH)){
            this.body = gm(randomImg()).resize(inputW).crop(inputW,inputH,0,(inputW-inputH)/2).stream();
        }else {
            this.body = gm(randomImg()).resize(null,inputH).crop(inputW,inputH,(inputH-inputW)/2,0).stream();
        }

    }else if(/^\d+$/.test(num)){
        this.body = gm(randomImg()).resize(num).stream();
    }else{
        this.throw('Must be number,like [300x200] or [500]', 404);
    }

}

function *resetImgRandom(num){
    //console.log(11111)
    //this.set({
    //    'Expires': 'Thu, 20 Jun 2017 02:31:31 GMT',
    //    'Last-Modified': 'Thu, 20 Jun 2017 02:31:31 GMT',
    //    'Cache-Control': 'no-cache'
    //});
    //if(JSON.stringify(this.query) === '{}'){
    //    this.redirect(this.url+'?'+ Date.now())
    //}

    this.type =  'image/jpg';
    let inputW,inputH;

    if(/\d[x]\d/.test(num)){
        inputW = num.split('x')[0];
        inputH = num.split('x')[1];
        let rW = randomNum(inputW),
            rH = randomNum(inputH);
        if(Number(inputW) > Number(inputH)){
            this.body = gm(randomImg())
                .resize(rW)
                .crop(rW,rH,0,(rW-rH)/2)
                .stream();
        }else {
            this.body = gm(randomImg())
                .resize(null,rH)
                .crop(rW,rH,(rH-rW)/2,0)
                .stream();
        }
    }else if(/^\d+$/.test(num)){
        this.body = gm(randomImg()).resize(randomNum(num)).stream();
    }else{
        this.throw('Must be number,like [300x200] or [500]', 404);
    }

}

//router

app.use(route.get('/',index));
app.use(route.get('/:num',resetImg));
app.use(route.get('/r/:num',resetImgRandom));