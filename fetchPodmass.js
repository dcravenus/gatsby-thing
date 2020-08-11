const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

exports.getPodmassData = async () => {
  const url = "https://www.avclub.com/c/podmass";
  const response = await fetch(url);
  const text = await response.text();

  const dom = new JSDOM(text);
  const document = dom.window.document;

  const link = document.querySelector("article figure a").href;

  return link;
};
