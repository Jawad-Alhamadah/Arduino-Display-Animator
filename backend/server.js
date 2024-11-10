

// PDFDocument = require('pdfkit');

// doc = new PDFDocument()
// const crypto = require("node:crypto");
// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const app = express();
// const fs = require('fs');
// const cors = require("cors")
// const sizeOf = require('image-size'); // import image-size library

// var archiver = require('archiver');
// var archive = archiver('zip');
// let { pdf } =import("pdf-to-img");

import PDFDocument from 'pdfkit';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const doc = new PDFDocument();
import crypto from "node:crypto";
import express from 'express';
import multer from 'multer';
import path from 'path';
const app = express();
import fs from 'fs';
import cors from 'cors';
import sizeOf from 'image-size'; // import image-size library

import archiver from 'archiver';
const archive = archiver('zip');
const { pdf } = await import("pdf-to-img");
const __dirname = dirname(fileURLToPath(import.meta.url)); // Define __dirname

app.use(express.json())
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let dir = `uploads/upload-${req.queueToken}`

    if (!fs.existsSync(dir)) {
      await fs.mkdirSync(dir)
    }
    console.log(cb)
    cb(null, dir); // specify the folder to store uploaded files
  },
  filename: async (req, file, cb) => {
    console.log(cb)
    cb(null, Date.now() + '-' + file.originalname); // save files with a timestamp to avoid conflicts
  }
});

async function generateUniqueToken(req, res, next) {
  const randText = await crypto.randomBytes(10).toString('hex')
  req.queueToken = randText
  next()
}
// Set up multer for handling multiple file uploads
const upload = multer({ storage: storage });


//Pipe its output somewhere, like to a file or HTTP response 
//See below for browser usage 

app.use(express.json())
app.use(cors())

let port = 3000


app.listen(port, () => { console.log("listening..." + port) })


app.post("/upload/PDF", generateUniqueToken, upload.single('images'), async (req, res) => {

  console.log("upload single")

  let counter = 1;
  const document = await pdf(req.file.path, { scale: 3 });
  for await (const image of document) {
    await fs.writeFile(`${req.file.destination}/page${counter}.png`, image, {}, (err) => { console.log(err) });
    counter++;
  }

  fs.unlinkSync(req.file.path)
  const randText = await crypto.randomBytes(10).toString('hex')
  const folder = path.join(__dirname, `/downloads/${randText}`)
  fs.mkdirSync(folder)
  let output = fs.createWriteStream(folder + '/target.zip')

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  // append files from a sub-directory, putting its contents at the root of archive

  archive.directory(req.file.destination, false);

  // append files from a sub-directory and naming it `new-subdir` within the archive
  archive.directory('subdir/', 'new-subdir');

  archive.finalize();

  return res.status(200).send({ downloadUrl: `http://localhost:${port}/download/${randText}` });
})


app.post("/upload/JPG", generateUniqueToken, upload.array('images', 200), async (req, res) => {

  console.log("upload array")
  try {

    // //Add an image, constrain it to a given size, and center it vertically and horizontally 
    console.log(req.files)
    

    console.time("functionTimer"); // Start the timer
    // doc.image(req.files[0].path, {
    //   fit: [100, 100],
    //   align: 'center',
    //   valign: 'center'
    // });
    const randText = await crypto.randomBytes(10).toString('hex')
    const folder = path.join(__dirname, `/downloads/${randText}`)
    await fs.mkdirSync(folder)
    await doc.pipe(fs.createWriteStream(folder + '/output.pdf'));

    try {

      addImage(req, 0);


      for (let i = 1; i < req.files.length; i++) {

        // Load image and get its dimensions
        addImage(req, i);

      }
    } catch (err) { console.log(err) }


    console.timeEnd("functionTimer"); // End the timer and log the elapsed time

    await doc.end()




    //const filePath = path.join(__dirname, `/downloads/${randText}/output.pdf`);
    // const file = `${__dirname}/output.pdf`;

    //  res.status(200).download(file, "output.pdf",(err) => {
    //   if (err) {
    //     console.error("Error sending file:", err);
    //     res.status(500).send("Error downloading file.");
    //   }
    //   else{console.log("no errors")}
    // }); // Set disposition and send it.

    res.status(200).send({ downloadUrl: `http://localhost:${port}/download/${randText}` });

  }
  catch (err) { console.log(err) }





})


app.get('/process-file/status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Simulate progress
  let progress = 0;
  for (let j = 0; j < 10; j++) {
    progress += 10;
    console.log(j)
    res.write(`data: ${JSON.stringify({ progress })}\n\n`);
    for (let i = 0; i < 1000000000; i++) {

      if (progress >= 100) {

        res.write(`data: ${JSON.stringify({ progress: 100 })}\n\n`);
        return res.end()

      }
    }
  }




});



app.get("/download/:folderName", async (req, res) => {
  console.log("downlaod hit")
  let { folderName } = req.params
  let files = fs.readdirSync(path.join(__dirname, `/downloads/${folderName}`))
  let numFiles = files.length

  if (numFiles <= 0) return res.status(404).send({ msg: "file not found" })
  if (numFiles === 1) {
    const filePath = path.join(__dirname, `/downloads/${folderName}/${files[0]}`);
    console.log(filePath)
    return res.download(filePath, files[0], (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res.status(500).send("Error downloading file.");
      }
    });

  }



});

function addImage(req, i) {
  const imagePath = req.files[i].path;
  const dimensions = sizeOf(imagePath);
  const imageWidth = dimensions.width;
  const imageHeight = dimensions.height;

  console.log(dimensions)
  // Define maximum width and height for the image based on PDF page size and margins
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50; // adjust as needed
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  // Calculate scale to fit image within maximum dimensions
  const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight);
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;

  // Center the image on the page
  const x = (pageWidth - displayWidth) / 2;
  const y = (pageHeight - displayHeight) / 2;

  // Add the image to the PDF with calculated dimensions
  console.log(imagePath,x,y,{ width: displayWidth, height: displayHeight })
  i === 0 ? doc.image(imagePath, x, y, { width: displayWidth, height: displayHeight })
    :
    doc.addPage().image(imagePath, x, y, { width: displayWidth, height: displayHeight })
}
