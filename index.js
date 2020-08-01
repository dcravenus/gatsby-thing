const fs = require("fs");
const moment = require("moment");
const { getNYTData } = require("./fetchNYT");
const { getSLTribData } = require("./fetchSLTrib");
const { getNewYorkerData } = require("./fetchNewYorker");

const generateIndexHTML = async () => {
  const nytData = await getNYTData();
  const sltribData = await getSLTribData();
  const newYorkerData = await getNewYorkerData();

  let fileData = "<link href='styles.css' rel='stylesheet'></style>";
  fileData += `<h1>${moment().format("dddd, MMMM Do, YYYY")}<h1>`;
  fileData += nytData;
  fileData += sltribData;
  fileData += newYorkerData;

  fs.writeFile("index.html", fileData, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("File saved");
  });
};

generateIndexHTML();
