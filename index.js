const fs = require("fs");
const moment = require("moment");
const { getNytRssData } = require("./fetchNytRss");
const { getSLTribData } = require("./fetchSLTrib");

const generateIndexHTML = async () => {
  const nytData = await getNytRssData();
  const sltribData = await getSLTribData();

  let fileData = `
    <!doctype html>
      <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href='styles.css' rel='stylesheet'></style>
        </head>
        <body>
  `;
  fileData += `<h1>${moment().format("dddd, MMMM Do, YYYY")}<h1><hr>`;
  fileData += nytData;
  fileData += "<hr>";
  fileData += sltribData;

  fileData += `</body></html>`;

  fs.writeFile("index.html", fileData, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("File saved");
  });
};

generateIndexHTML();
