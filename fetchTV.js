const fs = require("fs");
const fetch = require("node-fetch");

const showIds = [
  46849,
  43776,
  107,
  49,
  979,
  38785,
  40899,
  28893,
  28278,
  216,
  7522,
  1864,
  44789,
  35073,
];

const getOldTVData = async () => {
  return new Promise((resolve) => {
    fs.readFile("tv.json", "utf8", (err, data) => {
      if (err) {
        console.error("Unable to read tv.json");
        resolve([]);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

const writeOldTvData = async (fileData) => {
  fs.writeFile("tv.json", fileData, (err) => {
    if (err) {
      console.error("Unable to write tv.json");
      console.error(err);
    } else {
      console.log("Successfully wrote tv.json");
    }
  });
};

const writeTVHTML = async (fileData) => {
  fs.writeFile("tv.html", fileData, (err) => {
    if (err) {
      console.error("Unable to write tv.html");
      console.error(err);
    } else {
      console.log("Successfully wrote tv.html");
    }
  });
};

exports.getTVData = async () => {
  const urls = showIds.map(
    (id) => `http://api.tvmaze.com/shows/${id}?embed[]=previousepisode`
  );

  const newData = [];
  for (const url of urls) {
    const response = await fetch(url);
    const data = await response.json();

    const previousEpisodeData = data["_embedded"].previousepisode;

    newData.push({
      name: data.name,
      latestEpisode: {
        name: previousEpisodeData.name,
        season: previousEpisodeData.season,
        number: previousEpisodeData.number,
        airdate: previousEpisodeData.airdate,
      },
    });
  }

  const oldData = await getOldTVData();

  const changedShows = [];
  for (const newShow of newData) {
    for (const oldShow of oldData) {
      if (
        JSON.stringify(newShow) !== JSON.stringify(oldShow) &&
        newShow.name === oldShow.name
      ) {
        changedShows.push(newShow);
      }
    }
  }

  writeOldTvData(JSON.stringify(newData));

  let tvHTMLString = newData.reduce(
    (str, show) => {
      return (
        str +
        `<h2>${show.name}</h2><p>S${show.latestEpisode.season}E${show.latestEpisode.number} ${show.latestEpisode.name} - ${show.latestEpisode.airdate}</p>`
      );
    },
    `
    <!doctype html>
    <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href='nyt.css' rel='stylesheet'></style>
      </head>
      <body>
        <h1>TV Episodes</h1>
  `
  );

  tvHTMLString += "</body></html>";
  writeTVHTML(tvHTMLString);

  if (changedShows.length) {
    const changedShowsReducedString = changedShows.reduce((str, show) => {
      return (
        str +
        `<p>${show.name} - S${show.latestEpisode.season}E${show.latestEpisode.number} ${show.latestEpisode.name} - ${show.latestEpisode.airdate}</p>`
      );
    }, "");

    return `
    <a href="tv.html">
      <h2>TV Episodes</h2>
      ${changedShowsReducedString}
    </a>
    <br>
  `;
  } else {
    return "";
  }
};
