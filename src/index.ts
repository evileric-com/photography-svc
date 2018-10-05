
import * as multer from 'multer';
const multerUpload = multer({dest: '/media/photos'});

import * as fs from 'fs';
import * as gm from 'gm';

import * as express from 'express';
import * as bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req,res,next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var router = express.Router();

router.post('/upload/:imgId', multerUpload.single('imgfile'), async (req,res) => {
  const imgId = req.params['imgId'];
  const imgFolder = `/media/photos/${imgId}`;
  const targetFileName = `${imgFolder}/${imgId}.main.jpg`;
  const thumbnailFileName = `${imgFolder}/${imgId}.thumb.jpg`;

  fs.mkdir(imgFolder, () => {
    const src = fs.createReadStream(req.file.path);
    const dest = fs.createWriteStream(targetFileName);

    src.pipe(dest);

    src.on('end', () => {
      gm(targetFileName).resize(400, 265).write(thumbnailFileName, (err) => {
          if(!err) {
            fs.unlink(req.file.path,()=>{});
            res.send('complete');
          } else res.send('resize error');
      });
    })
    src.on('error', () => {
      res.send('error');
    })
  });
});

router.get('/images/:imgId', async (req,res) => {
  const imgId = req.params['imgId'];
  const imgPath = `/media/photos/${imgId}`;
  fs.readdir(imgPath, (err,items) => {
    if(err) res.send(`${imgId} is not a valid image id`);
    let re = /\.(.*)\.jpg/;
    let output:any = {};
    for(let i of items) {
      let t = i.match(re)[1];
      output[t] = `/api/images/${imgId}/${t}`;
    }
    res.send(output);
  })
});

router.get('/images/:imgId/:type', async (req,res) => {
  const imgId = req.params['imgId'];
  const imgType = req.params['type'];

  const imgPath = `/media/photos/${imgId}/${imgId}.${imgType}.jpg`;
  fs.exists(imgPath, (exists) => {
    if(exists) res.sendFile(imgPath);
    else res.send(`Image ${imgId} could not be found with type ${imgType}`);
  });
});

router.get('/test', async (req, res) => {
    res.type('text/html; charset=utf-8')
    res.send('<form action="/api/upload/asdf" method="post" enctype="multipart/form-data"><input type="file" name="imgfile" /><input type="submit" /></form>')
});

app.use('/api', router);

app.listen(3001);