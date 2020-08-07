const puppeteer = require("puppeteer");
const { JSDOM } = require("jsdom");

exports.getCooksIllustratedData = async () => {
  const url = `https://oremut.rbdigital.com/magazine/5455/468177`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(".product-detail-date p:last-of-type");
  const text = await page.evaluate(() => document.documentElement.outerHTML);

  await browser.close();

  const dom = new JSDOM(text);
  const document = dom.window.document;

  const issueDate = document.querySelector(
    ".product-detail-date p:last-of-type"
  ).textContent;

  return { issueDate, url };
};
