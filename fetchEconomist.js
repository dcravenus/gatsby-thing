const fetch = require("node-fetch");

exports.getEconomistData = async () => {
  const url = `https://www.economist.com/weeklyedition`;
  const response = await fetch(url);
  const redirectedURL = response.url;
  const match = redirectedURL.match(/\/(\d\d\d\d-\d\d-\d\d)/);
  if (match && match.length > 1) {
    return match[1];
  } else {
    return "";
  }
};
