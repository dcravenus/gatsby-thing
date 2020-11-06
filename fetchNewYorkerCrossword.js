const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

const getCrypticData = async () => {
  const url = `https://www.newyorker.com/puzzles-and-games-dept/cryptic-crossword`;
  const response = await fetch(url);
  const text = await response.text();
  const dom = new JSDOM(text);
  const document = dom.window.document;
  const link = document.querySelector("header+div a");
  return {
    href: "https://www.newyorker.com" + link.href,
    heading: link.textContent,
  };
};

exports.getNewYorkerCrosswordData = async () => {
  const url = `https://www.newyorker.com/puzzles-and-games-dept/crossword`;
  const response = await fetch(url);
  const text = await response.text();
  const dom = new JSDOM(text);
  const document = dom.window.document;
  const link = document.querySelector("header+div a");

  const crypticData = await getCrypticData();

  return {
    crosswordData: {
      href: "https://www.newyorker.com" + link.href,
      heading: link.textContent,
    },
    crypticData,
  };
};
