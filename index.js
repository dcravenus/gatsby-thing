const fs = require("fs");
const moment = require("moment");
const pretty = require("pretty");
const { getSLTribData } = require("./fetchSLTrib");
const { getSeriousEatsData } = require("./fetchSeriousEats");
const { getNYTData } = require("./fetchNYT");
const { getGastronomicaData } = require("./fetchGastronomica");
const { getCooksIllustratedData } = require("./fetchCooksIllustrated");
const { getEconomistData } = require("./fetchEconomist");
const { getNewYorkerData } = require("./fetchNewYorker");
const { getHackerNewsData } = require("./fetchHackerNews");

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

const getPreviousIssueDate = async () => {
  return new Promise((resolve) => {
    fs.readFile("issues.json", "utf8", (err, data) => {
      if (err) {
        console.error("Unable to read issues.json");
        resolve([]);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

const writeIssueData = async (fileData) => {
  fs.writeFile("issues.json", fileData, (err) => {
    if (err) {
      console.error("Unable to write issues.json");
      console.error(err);
    } else {
      console.log("Successfully wrote issues.json");
    }
  });
};

const getAsterisks = async ({
  gastroData,
  cooksIllustratedData,
  economistData,
  newYorkerData,
}) => {
  const previousIssues = await getPreviousIssueDate();

  const issues = {
    gastronomica: gastroData.title,
    cooksIllustrated: cooksIllustratedData.issueDate,
    economist: economistData,
    newYorker: newYorkerData,
  };
  writeIssueData(JSON.stringify(issues));

  const gastronomicaAsterisk =
    issues.gastronomica !== previousIssues.gastronomica ? "*" : "";
  const cooksIllustratedAsterisk =
    issues.cooksIllustrated !== previousIssues.cooksIllustrated ? "*" : "";
  const economistAsterisk =
    issues.economist !== previousIssues.economist ? "*" : "";
  const newYorkerAsterisk =
    issues.newYorker !== previousIssues.newYorker ? "*" : "";

  return {
    gastronomicaAsterisk,
    cooksIllustratedAsterisk,
    economistAsterisk,
    newYorkerAsterisk,
  };
};

const generateIndexHTML = async () => {
  generateHTMLFromData("nyt.html", await getNYTData());
  generateHTMLFromData("sltrib.html", await getSLTribData());
  generateHTMLFromData("seriouseats.html", await getSeriousEatsData());
  generateHTMLFromData("hackernews.html", await getHackerNewsData());
  const gastroData = await getGastronomicaData();
  generateHTMLFromData("gastronomica.html", gastroData.fileData);
  const cooksIllustratedData = await getCooksIllustratedData();
  const economistData = await getEconomistData();
  const newYorkerData = await getNewYorkerData();

  const {
    gastronomicaAsterisk,
    cooksIllustratedAsterisk,
    economistAsterisk,
    newYorkerAsterisk,
  } = await getAsterisks({
    gastroData,
    cooksIllustratedData,
    economistData,
    newYorkerData,
  });

  let newYorkerChunk = "";
  if (newYorkerAsterisk) {
    newYorkerChunk = `
      <a href="https://www.newyorker.com/magazine">
        <h2>The New Yorker</h2>
        <p>${newYorkerData}</p>
      </a>
      <br>
    `;
  }

  let economistChunk = "";
  if (economistAsterisk) {
    economistChunk = `
      <a href="https://www.economist.com/weeklyedition">
        <h2>The Economist</h2>
        <p>${economistData}</p>
      </a>
      <br>
    `;
  }

  let cooksIllustratedChunk = "";
  if (cooksIllustratedAsterisk) {
    cooksIllustratedChunk = `
      <a href="${cooksIllustratedData.url}">
        <h2>Cook's Illustrated${cooksIllustratedAsterisk}</h2>
        <p>${cooksIllustratedData.issueDate}</p>
      </a>
      <br>
    `;
  }

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
          <a href="hackernews.html">
            <h2>Hacker News</h2>
            <p>Best 25 Stories</p>
          </a>
          <br>
          ${newYorkerChunk}
          ${economistChunk}
          ${cooksIllustratedChunk}
          <a href="gastronomica.html">
            <h2>Gastronomica${gastronomicaAsterisk}</h2>
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
