const puppeteer = require("puppeteer");
const { JSDOM } = require("jsdom");

exports.getCooksIllustratedData = async () => {
  const url = `https://oremut.rbdigital.com/all-issues/emagazine/5455`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(".title-card a");
  let text = await page.evaluate(() => document.documentElement.outerHTML);

  let dom = new JSDOM(text);
  let document = dom.window.document;

  const magazineURL =
    "https://oremut.rbdigital.com/" +
    document.querySelector(".title-card a").href;
  await page.goto(magazineURL);
  await page.waitForSelector(".product-detail-date p:last-of-type");
  text = await page.evaluate(() => document.documentElement.outerHTML);

  await browser.close();

  dom = new JSDOM(text);
  document = dom.window.document;

  const issueDate = document.querySelector(
    ".product-detail-date p:last-of-type"
  ).textContent;

  return { issueDate, url: magazineURL };
};
