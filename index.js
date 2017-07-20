const koa = require('koa');
const logger = require('koa-logger');
const route = require('koa-route');
const views = require('co-views');
const serve = require('koa-static');
const _ = require('lodash');
const app = koa();
app.use(logger());

app.listen(2333);

app.use(serve(__dirname +'/src'));

const render = views(__dirname + '/page',{
    map: {html:'ejs'}
});

const fs = require('fs');
const jimp = require('jimp');
const dir = __dirname + '/img/';
let imgNums,court = 0,imgRoaded = [];

fs.readdir(dir,(err,files) => {
    imgNums = files.length;
    console.log('image loading...');
    for ( let i = 0; i< imgNums; i++ ){
        jimp.read(dir+ files[i]).then(image => {
            court++;
            imgRoaded.push(image);
            if (court === imgNums){
                console.log('All image loaded over! And listening 2333')
            }
        }).catch(err => {console.error(err)})
    }
});

const randomNum = (width) => Math.ceil(Math.random()*Number(width) + Number(width)/2);

const numRegx = (num,cb1,cb2) => {
    if(/\d[x]\d/.test(num)){
        cb1(Number(num.split('x')[0]),Number(num.split('x')[1]));
    }else if(/^\d+$/.test(num)){
        cb2();
    }
};

const imgRandom = () => _.cloneDeep(imgRoaded[Math.ceil(Math.random()*(imgNums-1))]);

function *index(){
    this.body = yield render('index',{})
}

function imgResizeCrop(w,h,image,cb){
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
    .getBuffer(jimp.MIME_JPEG,(err,buffer) => {
        if (err) throw err;
        cb(null,buffer);
    })
}

function *resetImg(num){
    this.type = 'image/jpeg';
    this.body = yield cb => {
        let image = imgRandom();
        numRegx(num,(w,h) => imgResizeCrop(w,h,image,cb)
        ,() => {
            image.resize(Number(num),Number(num))
                .getBuffer(jimp.MIME_JPEG,function(err,buffer){
                    if (err) throw err;
                    cb(null,buffer);
                })
        })
    };
}


function *resetImgRandom(num){
    this.type = 'image/jpeg';
    this.body = yield cb => {
        let image = imgRandom();
        numRegx(num,(w,h) => imgResizeCrop(randomNum(w),randomNum(h),image,cb),
            () => imgResizeCrop(randomNum(num),randomNum(num),image,cb)
        )
    };
}

function drawSolidColorImg(w,h,colorNum,cb){
    let fontPath = colorNum > Number('0x'+808080+'FF') ?  jimp.FONT_SANS_16_BLACK: jimp.FONT_SANS_16_WHITE;
    new jimp(w,h,colorNum,(err,image) => {
        jimp.loadFont(fontPath).then(font => {
            image.print(font,w/2-28,h/2-8,w+'x'+h,w).getBuffer(jimp.MIME_JPEG,(err,buffer) => {
                if (err) throw err;
                cb(null,buffer);
            })
        })
    })
}

function *drawImg(color,num){
    this.type = 'image/jpeg';
    this.body = yield cb => {
        let colorNum = Number('0x'+color+'FF');
        numRegx(num,(w,h) => drawSolidColorImg(w,h,colorNum,cb),
            () => drawSolidColorImg(num-0,num-0,colorNum,cb)
        );
    };
}

function *drawImgRandom(color,num){
    this.type = 'image/jpeg';
    this.body = yield cb => {
        let colorNum = Number('0x'+color+'FF');
        numRegx(num,(w,h) => drawSolidColorImg(randomNum(w),randomNum(h),colorNum,cb),
            () => drawSolidColorImg(randomNum(num),randomNum(num),colorNum,cb)
        )
    };
}

//router
app.use(route.get('/',index));
app.use(route.get('/r@:color/:num',drawImgRandom));
app.use(route.get('/@:color/:num',drawImg));
app.use(route.get('/:num',resetImg));
app.use(route.get('/r/:num',resetImgRandom));
