const fs = require("fs");
const moment = require("moment");
const pretty = require("pretty");
const { getSLTribData } = require("./fetchSLTrib");
const { getSeriousEatsData } = require("./fetchSeriousEats");
const { getNYTData } = require("./fetchNYT");
const { getGastronomicaData } = require("./fetchGastronomica");

const generateHTMLFromData = async (filename, fileData) => {
  fs.writeFile(filename, pretty(fileData), (err) => {
    if (err) {
      console.error("Unable to write " + filename);
      console.error(err);
    } else {
      console.log("Successfully wrote " + filename);
    }
  });
};

const generateIndexHTML = async () => {
  generateHTMLFromData("nyt.html", await getNYTData());
  generateHTMLFromData("sltrib.html", await getSLTribData());
  generateHTMLFromData("seriouseats.html", await getSeriousEatsData());
  const gastroData = await getGastronomicaData();
  generateHTMLFromData("gastronomica.html", gastroData.fileData);

  let fileData = `
    <!doctype html>
      <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href='index.css' rel='stylesheet'></style>
        </head>
        <body>
          <h1>${moment().format("dddd, MMMM Do, YYYY")}</h1>
          <a href="nyt.html">
            <h2>The New York Times</h2>
            <p>Today's Paper</p>
          </a>
          <br>
          <a href="sltrib.html">
            <h2>The Salt Lake Tribune</h2>
            <p>Last 24 Hours</p>
          </a>
          <br>
          <a href="seriouseats.html">
            <h2>Serious Eats</h2>
            <p>Last 24 Hours</p>
          </a>
          <br>
          <a href="gastronomica.html">
            <h2>Gastronomica</h2>
            <p>${gastroData.title}</p>
          </a>
          <br>
        </body>
      </html>
  `;

  fileData = pretty(fileData);

  fs.writeFile("index.html", fileData, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("File saved");
  });
};

generateIndexHTML();
