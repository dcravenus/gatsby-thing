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
const { getPodmassData } = require("./fetchPodmass");
const { getNeedleDropData } = require("./fetchNeedleDrop");
const { getNPRNewMusicData } = require("./fetchNPRNewMusic");
const { getAltLatinoData } = require("./fetchAltLatino");

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
  podmassData,
  needleDropData,
  allSongsData,
  altLatinoData,
}) => {

  const previousIssues = await getPreviousIssueDate();

  const issues = {
    gastronomica: gastroData ? gastroData.title : previousIssues.gastronomica,
    cooksIllustrated: cooksIllustratedData.issueDate,
    economist: economistData,
    newYorker: newYorkerData,
    podmass: podmassData,
    needleDrop: needleDropData.title,
    allSongs: allSongsData.title,
    altLatino: altLatinoData.title,
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
  const podmassAsterisk = issues.podmass !== previousIssues.podmass ? "*" : "";
  const needleDropAsterisk =
    issues.needleDrop !== previousIssues.needleDrop ? "*" : "";
  const allSongsAsterisk =
    issues.allSongs !== previousIssues.allSongs ? "*" : "";
  const altLatinoAsterisk =
    issues.altLatino !== previousIssues.altLatino ? "*" : "";

  return {
    gastronomicaAsterisk,
    cooksIllustratedAsterisk,
    economistAsterisk,
    newYorkerAsterisk,
    podmassAsterisk,
    needleDropAsterisk,
    allSongsAsterisk,
    altLatinoAsterisk,
    gastronomicaTitle: issues.gastronomica
  };
};

const generateIndexHTML = async () => {
  generateHTMLFromData("nyt.html", await getNYTData());
  generateHTMLFromData("sltrib.html", await getSLTribData());

  const seriousEatsData = await getSeriousEatsData();
  if (seriousEatsData) {
    generateHTMLFromData("seriouseats.html", seriousEatsData);
  }

  generateHTMLFromData("hackernews.html", await getHackerNewsData());
  const gastroData = await getGastronomicaData();
  if(gastroData) {
    generateHTMLFromData("gastronomica.html", gastroData.fileData);
  }
  const cooksIllustratedData = await getCooksIllustratedData();
  const economistData = await getEconomistData();
  const newYorkerData = await getNewYorkerData();
  const podmassData = await getPodmassData();

  const needleDropData = await getNeedleDropData();
  generateHTMLFromData("needledrop.html", needleDropData.fileData);

  const allSongsData = await getNPRNewMusicData();
  generateHTMLFromData("allsongs.html", allSongsData.fileData);

  const altLatinoData = await getAltLatinoData();

  const {
    gastronomicaAsterisk,
    cooksIllustratedAsterisk,
    economistAsterisk,
    newYorkerAsterisk,
    podmassAsterisk,
    needleDropAsterisk,
    allSongsAsterisk,
    altLatinoAsterisk,
    gastronomicaTitle
  } = await getAsterisks({
    gastroData,
    cooksIllustratedData,
    economistData,
    newYorkerData,
    podmassData,
    needleDropData,
    allSongsData,
    altLatinoData,
  });

  const newYorkerChunk = `
      <a href="https://www.newyorker.com/magazine">
        <h2>The New Yorker</h2>
        <p>${newYorkerData}</p>
      </a>
      <br>
    `;

  const economistChunk = `
      <a href="https://www.economist.com/weeklyedition">
        <h2>The Economist</h2>
        <p>${economistData}</p>
      </a>
      <br>
    `;

  const cooksIllustratedChunk = `
      <a href="${cooksIllustratedData.url}">
        <h2>Cook's Illustrated${cooksIllustratedAsterisk}</h2>
        <p>${cooksIllustratedData.issueDate}</p>
      </a>
      <br>
    `;

  let seriousEatsChunk = "";
  if (seriousEatsData) {
    seriousEatsChunk = `
    <a href="seriouseats.html">
      <h2>Serious Eats</h2>
      <p>Last 24 Hours</p>
    </a>
    <br>
    `;
  }

  const gastronomicaChunk = `
    <a href="gastronomica.html">
      <h2>Gastronomica</h2>
      <p>${gastronomicaTitle}</p>
    </a>
    <br>
  `;

  const podmassChunk = `
    <a href="${podmassData}">
      <h2>Podmass</h2>
    </a>
    <br>
  `;

  const needleDropChunk = `
    <a href="needledrop.html">
      <h2>The Needle Drop</h2>
      <p>${needleDropData.title}</p>
    </a>
    <br>
  `;

  const allSongsChunk = `
    <a href="allsongs.html">
      <h2>All Songs Considered</h2>
      <p>${allSongsData.title}</p>
    </a>
    <br>
  `;

  const altLatinoChunk = `
    <a href="${altLatinoData.url}">
      <h2>Alt.Latino</h2>
      <p>${altLatinoData.title}</p>
    </a>
  `;

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
          ${seriousEatsChunk}
          <a href="hackernews.html">
            <h2>Hacker News</h2>
            <p>Best 25 Stories</p>
          </a>
          <br>
          ${newYorkerAsterisk ? newYorkerChunk : ""}
          ${economistAsterisk ? economistChunk : ""}
          ${cooksIllustratedAsterisk ? cooksIllustratedChunk : ""}
          ${gastronomicaAsterisk ? gastronomicaChunk : ""}
          ${podmassAsterisk ? podmassChunk : ""}
          ${needleDropAsterisk ? needleDropChunk : ""}
          ${allSongsAsterisk ? allSongsChunk : ""}
          ${altLatinoAsterisk ? altLatinoChunk : ""}
          <a href="older.html">Older</a>
          <br>
        </body>
      </html>
  `;

  fileData = pretty(fileData);

  let olderFileData = `
    <!doctype html>
    <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href='index.css' rel='stylesheet'></style>
      </head>
      <body>
        ${!newYorkerAsterisk ? newYorkerChunk : ""}
        ${!economistAsterisk ? economistChunk : ""}
        ${!cooksIllustratedAsterisk ? cooksIllustratedChunk : ""}
        ${!gastronomicaAsterisk ? gastronomicaChunk : ""}
        ${!podmassAsterisk ? podmassChunk : ""}
        ${!needleDropAsterisk ? needleDropChunk : ""}
        ${!allSongsAsterisk ? allSongsChunk : ""}
        ${!altLatinoAsterisk ? altLatinoChunk : ""}
      </body>
    </html>
  `;

  olderFileData = pretty(olderFileData);

  fs.writeFile("index.html", fileData, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("File saved");
  });

  fs.writeFile("older.html", olderFileData, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("Older file saved");
  });
};

generateIndexHTML();
