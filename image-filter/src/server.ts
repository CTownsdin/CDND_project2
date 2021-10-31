import express from "express";
import { Request, Response } from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // endpoint to filter an image from a public url
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file
  app.get("/filteredimage", async (req: Request, res: Response) => {
    const { image_url } = req.query;

    if (!image_url) {
      return res.status(400).send("An image_url query param is required.");
    }

    try {
      const filteredImageFilePath = await filterImageFromURL(image_url);

      res.status(200).sendFile(filteredImageFilePath);

      deleteLocalFiles([filteredImageFilePath]);
      return;
    } catch (err) {
      return res
        .status(500)
        .send(
          `Unable to filter the image from the url provided, which was: \n${image_url}`
        );
    }
  });

  app.get("/", async (req, res) => {
    return res.send(
      "try GET /filteredimage?image_url={{}}, because there's nothing on the root route here."
    );
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
