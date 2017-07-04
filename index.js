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

const fs = require('fs');
const gm = require('gm');
const Jimp = require('jimp');
const dir = __dirname + '/img/';
const imageMagick = gm.subClass({imageMagick: true});

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

const numRegx = function(num,cb1,cb2){
    if(/\d[x]\d/.test(num)){
        cb1();
    }else if(/^\d+$/.test(num)){
        cb2();
    }
}


function *index(){
    let data = {};
    this.body = yield render('index',data)
}

function *resetImg(num){





    function jimpLoad(cb){

        Jimp.read(randomImg()).then(function(image){
            numRegx(num,function(){
                image.resize(Number(num.split('x')[0]),Number(num.split('x')[1]))
                    .quality(80)
                    .getBuffer(Jimp.MIME_JPEG,function(err,buffer){
                        if (err) throw err;
                        cb(null,buffer);
                    })
            },function(){
                image.resize(Number(num))
                    .quality(80)
                    .getBuffer(Jimp.MIME_JPEG,function(err,buffer){
                        if (err) throw err;
                        cb(null,buffer);
                    })
            })


        }).catch(function(err){
            console.error(err)
        });
    }

    this.type = 'image/jpeg';
    this.body = yield jimpLoad;
}


function *resetImgRandom(num){

    outputBySize(this,randomImg(),num,true)
}






function *drawImg(color,num){

    function jimpLoad(cb){
        Jimp.read(randomImg()).then(function(image){
            image.resize(Number(num),Number(num))
                .quality(80)
                .getBuffer(Jimp.MIME_JPEG,function(err,buffer){
                    if (err) throw err;
                    cb(null,buffer);
                })
        }).catch(function(err){
            console.error(err)
        });
    }


    this.type = 'image/jpeg';

    this.body = yield jimpLoad;

}

//router

app.use(route.get('/',index));
app.use(route.get('/@:color/:num',drawImg));
app.use(route.get('/:num',resetImg));
app.use(route.get('/r/:num',resetImgRandom));
