const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

exports.getNYBooksData = async () => {
  const url = `https://www.nybooks.com/issues/`;
  const response = await fetch(url);
  const text = await response.text();
  const dom = new JSDOM(text);
  const document = dom.window.document;
  const link = document.querySelector("time a");

  return { href: link.href, heading: link.textContent };
};
