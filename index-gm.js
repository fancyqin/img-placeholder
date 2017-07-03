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

const outputBySize = function(that,img,num,isRandom){
    that.type =  'image/jpg';
    let inputW,inputH;

    if(/\d[x]\d/.test(num)){
        inputW = num.split('x')[0];
        inputH = num.split('x')[1];
        let rW = isRandom ? randomNum(inputW):inputW,
            rH = isRandom ? randomNum(inputH):inputH;
        if(Number(inputW) > Number(inputH)){
            that.body = gm(img)
                .resize(rW)
                .crop(rW,rH,0,(rW-rH)/2)
                .stream();
        }else {
            that.body = gm(img)
                .resize(null,rH)
                .crop(rW,rH,(rH-rW)/2,0)
                .stream();
        }
    }else if(/^\d+$/.test(num)){

        that.body = gm(img).resize(isRandom? randomNum(num):num).stream();
    }else{
        that.throw('Must be number,like [300x200] or [500]', 404);
    }
};

function *index(){
    let data = {};
    this.body = yield render('index',data)
}

function *resetImg(num){
    outputBySize(this,randomImg(),num,false)
}


function *resetImgRandom(num){

    outputBySize(this,randomImg(),num,true)
}

function *drawImg(color,num){
    this.type = 'image/jpg';
    let inputW,inputH;

    if(/\d[x]\d/.test(num)){
        inputW = num.split('x')[0];
        inputH = num.split('x')[1];
        this.body = gm(dir + 'img1.jpg')
            .crop(1,1)
            .background('#'+color)
            .extent(inputW,inputH)
            .stream();
    }else if(/^\d+$/.test(num)){

        this.body = gm(dir + 'img1.jpg')
            .crop(1,1)
            .background('#'+color)
            .extent(num,num)
            .stream();
    }else{
        this.throw('Must be number,like [300x200] or [500]', 404);
    }





}

//router

app.use(route.get('/',index));
app.use(route.get('/@:color/:num',drawImg));
app.use(route.get('/:num',resetImg));
app.use(route.get('/r/:num',resetImgRandom));
