import fs from "fs";
import Jimp from "jimp";

export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise((resolve, reject) => {
    Jimp.read(inputURL)
      .then((photo) => {
        const outpath =
          "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
        photo
          .resize(256, 256) // resize
          .quality(60) // set JPEG quality
          .greyscale() // set greyscale
          .write(__dirname + outpath, (img) => {
            resolve(__dirname + outpath);
          });
      })
      .catch((err) => {
        console.error(err);
        reject("Could not read image.");
      });
  });
}

// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}
