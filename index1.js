const express = require('express');
const fs = require("fs");
const {fabric} = require("fabric");
const { registerFont, createCanvas } = require('canvas')
const opentype = require("opentype.js")
const demo_templates = require("./test_template.json");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
const path = require('path');

app.use(cors());

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.get("/test",function (req,res) {

   var canvasClone = new fabric.Canvas(null,{
      fireRightClick: true,
      stopContextMenu: true,
      controlsAboveOverlay: true,        
   });      

   const fontPath = path.join(__dirname, 'fonts', 'Bright Melody Personal Use Only.ttf');
   registerFont(fontPath, { fontFamily: 'Bright Melody Personal Use Only' });
   //    var fontLists = demo_templates.fontLists.forEach(el=>{
      // const fontList = require('font-list')
      // fontList.getFonts()
      // .then(fonts => {
      //     console.log(fonts.length);
      //     if(fonts.includes("FloppersDemoRegular") == false){
              
      //     }
      // })
      // .catch(err => {
      //   console.log(err)
      // });      
   //       if(el.ttf_base64 != ''){
   //          const charArray = el.ttf_base64.split('').map(function (char) {
   //             return char.charCodeAt(0);
   //          });
            
   //          console.log(charArray)
   //          const uint8Array = new Uint8Array(charArray);
   //          const fontBuffer = uint8Array.buffer;   
   //          const font = OpenType.parse(fontBuffer);
   //          var fontName = font.names.fontFamily.en;    
   //          //  var fontFace = new FontFace(fontName, fontBuffer);
   //          res.send("aaa")
   //          // //  canvasClone.addFont(fontFace);
   //       }
   //   });        

   canvasClone.loadFromJSON(demo_templates, async () => {
      canvasClone.renderAll.bind(canvasClone);
      const workspace = canvasClone.getObjects().find((item) => item.id === 'workspace');
      const { left, top, width, height } = workspace;                  
      const option = {
         name: 'New Image',
         format: 'png',
         quality: 1,
         left,
         top,
         width,
         height,
      };
      var oldViewport = canvasClone.viewportTransform;
      canvasClone.setViewportTransform([1, 0, 0, 1, 0, 0]);
      const imgUrl = canvasClone.toDataURL(option);
      canvasClone.setViewportTransform(oldViewport);  
      canvasClone.requestRenderAll();
      res.send(imgUrl);
      // document.getElementById("preview").src = imgUrl;
   });    
   // console.log(demo_templates)
   // return res.json(demo_templates);
 
   // res.json("test");
});

//get
app.listen(3000, function() {
   console.log('listening on 3000');
 });