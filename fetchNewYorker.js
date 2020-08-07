const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

exports.getNewYorkerData = async () => {
  const url = `https://www.newyorker.com/magazine`;
  const response = await fetch(url);
  const text = await response.text();
  const dom = new JSDOM(text);
  const document = dom.window.document;
  const heading = document.querySelector("h2").textContent;
  return heading ? heading : "";
};
