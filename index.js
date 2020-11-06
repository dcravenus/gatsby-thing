const fs = require("fs");
const moment = require("moment");
const pretty = require("pretty");
const { getSLTribData } = require("./fetchSLTrib");
const { getSeriousEatsData } = require("./fetchSeriousEats");
const { getNYTData } = require("./fetchNYT");
const { getGastronomicaData } = require("./fetchGastronomica");
const { getEconomistData } = require("./fetchEconomist");
const { getHackerNewsData } = require("./fetchHackerNews");
const { getPodmassData } = require("./fetchPodmass");
const { getNeedleDropData } = require("./fetchNeedleDrop");
const { getNPRNewMusicData } = require("./fetchNPRNewMusic");
const { getAltLatinoData } = require("./fetchAltLatino");
const { getTVData } = require("./fetchTV");
const { getNewYorkerCrosswordData } = require("./fetchNewYorkerCrossword");
const { getLibraryMagsData } = require("./fetchLibraryMags");
const { getAtlanticData } = require("./fetchAtlantic");

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
  economistData,
  podmassData,
  needleDropData,
  allSongsData,
  altLatinoData,
  crosswordData,
  crypticData,
}) => {
  const previousIssues = await getPreviousIssueDate();

  const issues = {
    gastronomica: gastroData ? gastroData.title : previousIssues.gastronomica,
    economist: economistData,
    podmass: podmassData,
    needleDrop: needleDropData.title,
    allSongs: allSongsData.title,
    altLatino: altLatinoData.title,
    crossword: crosswordData.href,
    cryptic: crypticData.href,
  };
  writeIssueData(JSON.stringify(issues));

  const gastronomicaAsterisk =
    issues.gastronomica !== previousIssues.gastronomica ? "*" : "";
  const economistAsterisk =
    issues.economist !== previousIssues.economist ? "*" : "";
  const podmassAsterisk = issues.podmass !== previousIssues.podmass ? "*" : "";
  const needleDropAsterisk =
    issues.needleDrop !== previousIssues.needleDrop ? "*" : "";
  const allSongsAsterisk =
    issues.allSongs !== previousIssues.allSongs ? "*" : "";
  const altLatinoAsterisk =
    issues.altLatino !== previousIssues.altLatino ? "*" : "";
  const crosswordAsterisk =
    issues.crossword !== previousIssues.crossword ? "*" : "";
  const crypticAsterisk = issues.cryptic !== previousIssues.cryptic ? "*" : "";

  return {
    gastronomicaAsterisk,
    economistAsterisk,
    podmassAsterisk,
    needleDropAsterisk,
    allSongsAsterisk,
    altLatinoAsterisk,
    gastronomicaTitle: issues.gastronomica,
    crosswordAsterisk,
    crypticAsterisk,
  };
};

const generateIndexHTML = async () => {
  const tvChunk = await getTVData();
  generateHTMLFromData("nyt.html", await getNYTData());
  generateHTMLFromData("sltrib.html", await getSLTribData());

  const seriousEatsData = await getSeriousEatsData();
  if (seriousEatsData) {
    generateHTMLFromData("seriouseats.html", seriousEatsData);
  }

  generateHTMLFromData("hackernews.html", await getHackerNewsData());
  const gastroData = await getGastronomicaData();
  if (gastroData) {
    generateHTMLFromData("gastronomica.html", gastroData.fileData);
  }
  const economistData = await getEconomistData();
  const podmassData = await getPodmassData();

  const needleDropData = await getNeedleDropData();
  generateHTMLFromData("needledrop.html", needleDropData.fileData);

  const allSongsData = await getNPRNewMusicData();
  generateHTMLFromData("allsongs.html", allSongsData.fileData);

  const altLatinoData = await getAltLatinoData();

  const { crosswordData, crypticData } = await getNewYorkerCrosswordData();

  const {
    oldLibraryMagsChunk,
    newLibraryMagsChunk,
  } = await getLibraryMagsData();

  const {
    gastronomicaAsterisk,
    economistAsterisk,
    podmassAsterisk,
    needleDropAsterisk,
    allSongsAsterisk,
    altLatinoAsterisk,
    gastronomicaTitle,
    crosswordAsterisk,
    crypticAsterisk,
  } = await getAsterisks({
    gastroData,
    economistData,
    podmassData,
    needleDropData,
    allSongsData,
    altLatinoData,
    crosswordData,
    crypticData,
  });

  const economistChunk = `
      <a href="https://www.economist.com/weeklyedition">
        <h2>The Economist</h2>
        <p>${economistData}</p>
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
    <br>
  `;

  const crosswordChunk = `
    <a href="${crosswordData.href}">
      <h2>The New Yorker Crossword</h2>
      <p>${crosswordData.heading}</p>
    </a>
    <br>
  `;

  const crypticChunk = `
    <a href="${crypticData.href}">
      <h2>The New Yorker Cryptic Crossword</h2>
      <p>${crypticData.heading}</p>
    </a>
    <br>
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
          ${economistAsterisk ? economistChunk : ""}
          ${gastronomicaAsterisk ? gastronomicaChunk : ""}
          ${newLibraryMagsChunk}
          ${podmassAsterisk ? podmassChunk : ""}
          ${needleDropAsterisk ? needleDropChunk : ""}
          ${allSongsAsterisk ? allSongsChunk : ""}
          ${altLatinoAsterisk ? altLatinoChunk : ""}
          ${crosswordAsterisk ? crosswordChunk : ""}
          ${crypticAsterisk ? crypticChunk : ""}
          ${tvChunk}
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
        ${!economistAsterisk ? economistChunk : ""}
        ${!gastronomicaAsterisk ? gastronomicaChunk : ""}
        ${oldLibraryMagsChunk}
        ${!podmassAsterisk ? podmassChunk : ""}
        ${!needleDropAsterisk ? needleDropChunk : ""}
        ${!allSongsAsterisk ? allSongsChunk : ""}
        ${!altLatinoAsterisk ? altLatinoChunk : ""}
        ${!crosswordAsterisk ? crosswordChunk : ""}
        ${!crypticAsterisk ? crypticChunk : ""}
        <a href="tv.html">
          <h2>TV Episodes</h2>
        </a>
        <br>
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
