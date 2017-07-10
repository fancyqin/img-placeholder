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
const jimp = require('jimp');
const dir = __dirname + '/img/';
const imageMagick = gm.subClass({imageMagick: true});

const randomImg = () => dir + 'img'+ Math.ceil(Math.random()*9)+'.jpg';
const randomNum = (width) => Math.ceil(Math.random()*Number(width) + Number(width)/2);

const numRegx = function(num,cb1,cb2){
    if(/\d[x]\d/.test(num)){

        cb1(Number(num.split('x')[0]),Number(num.split('x')[1]));
    }else if(/^\d+$/.test(num)){
        cb2();
    }
};


function *index(){
    let data = {};
    this.body = yield render('index',data)
}

function *resetImg(num){

    function jimpLoad(cb){
        jimp.read(randomImg()).then(function(image){
            numRegx(num,
                function(w,h){
                let rW,rH,x = 0,y = 0;
                if (w > h){
                    rW = w;
                    rH = jimp.AUTO;
                    y = (w - h)/2;
                }else{
                    rW = jimp.AUTO;
                    rH = h;
                    x = (h - w)/2;
                }
                image.resize(rW,rH)
                    .crop(x,y,w,h)
                    .getBuffer(jimp.MIME_JPEG,function(err,buffer){
                        if (err) throw err;
                        cb(null,buffer);
                    })
            },
                function(){
                image.resize(Number(num),Number(num))
                    .getBuffer(jimp.MIME_JPEG,function(err,buffer){
                        if (err) throw err;
                        cb(null,buffer);
                    })
            }
            )
        }).catch(function(err){
            console.error(err)
        });
    }

    this.type = 'image/jpeg';
    this.body = yield jimpLoad;
}


function *resetImgRandom(num){

    function jimpLoad(cb){
        jimp.read(randomImg()).then(function(image){
            numRegx(num,
                function(w,h){
                    w = randomNum(w);
                    h = randomNum(h);
                    let rW,rH,x = 0,y = 0;
                    if (w > h){
                        rW = w;
                        rH = jimp.AUTO;
                        y = (w - h)/2;
                    }else{
                        rW = jimp.AUTO;
                        rH = h;
                        x = (h - w)/2;
                    }

                    image.resize(rW,rH)
                        .crop(x,y,w,h)
                        .getBuffer(jimp.MIME_JPEG,function(err,buffer){
                            if (err) throw err;
                            cb(null,buffer);
                        })
                },
                function(){
                    image.resize(randomNum(num),randomNum(num))
                        .getBuffer(jimp.MIME_JPEG,function(err,buffer){
                            if (err) throw err;
                            cb(null,buffer);
                        })
                }
            )
        }).catch(function(err){
            console.error(err)
        });
    }

    this.type = 'image/jpeg';
    this.body = yield jimpLoad;

}






function *drawImg(color,num){




    function jimpLoad(cb){


        let colorNum = Number('0x'+color+'FF');

        let fontPath = colorNum > Number('0x'+808080+'FF') ?  jimp.FONT_SANS_16_BLACK: jimp.FONT_SANS_16_WHITE;
        numRegx(num,
            function(w,h){
                new jimp(w,h,colorNum,function(err,image){
                    jimp.loadFont(fontPath).then(function(font){
                        image.print(font,w/2-32,h/2-8,w+'x'+h,w).getBuffer(jimp.MIME_JPEG,function(err,buffer){
                            if (err) throw err;
                            cb(null,buffer);
                        })
                    })
                })
            },
            function(){
                new jimp(num-0, num-0, colorNum, function (err, image) {
                    jimp.loadFont(fontPath).then(function(font){
                        image.print(font,num/2-32,num/2-8,num+'x'+num,num-0).getBuffer(jimp.MIME_JPEG,function(err,buffer){
                            if (err) throw err;
                            cb(null,buffer);
                        })
                    })
                });
            }
        );

    }

    this.type = 'image/jpeg';
    this.body = yield jimpLoad;

}

//router

app.use(route.get('/',index));
app.use(route.get('/@:color/:num',drawImg));
app.use(route.get('/:num',resetImg));
app.use(route.get('/r/:num',resetImgRandom));
