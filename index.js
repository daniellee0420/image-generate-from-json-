const express = require('express');
const fs = require("fs");
const {fabric} = require("fabric");
const { registerFont,createCanvas } = require('canvas');
const test_template = require("./test_template.json");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
var installfont = require('installfont');
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.get("/test",function (req,res) {
   var fontNames = [];
   var i = 0;
   function generateImg(){
      const Canvas = createCanvas();                
      var canvasClone = new fabric.Canvas("c",{
         fireRightClick: true,
         stopContextMenu: true,
         controlsAboveOverlay: true,        
      });      
      canvasClone.loadFromJSON(test_template, async () => {
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
      });     
   }
   
   function generateFile(el) {
      i++;
      return new Promise((resolve, reject) => {
         const fontList = require('font-list');
         fontList.getFonts().then(async fonts => {
            if(fonts.includes(el.name) == false && fonts.includes('"' + el.name + '"' ) == false){
               console.log("new font")
               const charArray = el.ttf_base64.split('').map(function (char) {
                  return char.charCodeAt(0);
               });
               const uint8Array = new Uint8Array(charArray);
               const path = require('path');
               const directoryPath = 'test';
               const fileName = el.name+'.ttf';
               fontNames.push(fileName);
               const filePath = path.join(directoryPath, fileName);
               fs.writeFile(filePath, uint8Array, async (err) => {
                  if (err) {
                     console.error('Error creating file:', err);
                     return;
                  }
                  // Log the path of the newly created file
                  // console.log('File created:', filePath);
                  installfont(filePath,async function(err) {
                     if(err) console.log(err, err.stack);
                     console.log("fontinstall");
                     if(i==test_template.fontLists.length){
                        setTimeout(() => {
                           generateImg();
                        }, 2000);
                     }
                     return resolve('Font installed:', el.name);
                  });                  
               });     
                      
            }else{
               console.log("existed font");
               return resolve('Font installed:', el.name);
            }    
         })     
      });
   }

   function generateMultipleFiles() {
      const filePromises = [];
      test_template.fontLists.forEach((el)=>{
         filePromises.push(generateFile(el));
      });
      try {
         const messages = Promise.all(filePromises).then(()=>{
            console.log("ddddd");
         });
         } catch (error) {
            console.error(error); // Handle any errors that occurred during file generation
      }
   }
   generateMultipleFiles();
});

//get
app.listen(3000, function() {
   console.log('listening on 3000');
});
