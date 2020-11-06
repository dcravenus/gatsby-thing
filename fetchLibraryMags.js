const puppeteer = require("puppeteer");
const { JSDOM } = require("jsdom");
const fs = require("fs");

const magazines = [
  { id: "6039", name: "The Paris Review" },
  { id: "5455", name: "Cook's Illustrated" },
  { id: "3078", name: "Harper's Magazine" },
  { id: "4604", name: "The New Yorker" },
  { id: "7107", name: "The New York Review of Books" },
];

const getPreviousMagsData = async () => {
  return new Promise((resolve) => {
    fs.readFile("mags.json", "utf8", (err, data) => {
      if (err) {
        console.error("Unable to read mags.json");
        resolve([]);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

const writeMagsData = async (fileData) => {
  fs.writeFile("mags.json", fileData, (err) => {
    if (err) {
      console.error("Unable to write mags.json");
      console.error(err);
    } else {
      console.log("Successfully wrote mags.json");
    }
  });
};

const getMagsChunk = (str, magData) => {
  return (
    str +
    `
  <a href="${magData.url}">
    <h2>${magData.name}</h2>
    <p>${magData.issueDate}</p>
  </a>
  <br>
  `
  );
};

const fetchMagazineData = async (magazine) => {
  const url = `https://oremut.rbdigital.com/all-issues/emagazine/${magazine.id}`;

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

  return { issueDate, url: magazineURL, ...magazine };
};

exports.getLibraryMagsData = async () => {
  const responses = await Promise.all(
    magazines.map((magazine) => {
      return fetchMagazineData(magazine);
    })
  );

  const previousMagsData = await getPreviousMagsData();
  writeMagsData(JSON.stringify(responses));

  const newMagsData = [];
  const oldMagsData = [];
  previousMagsData.forEach((previousMag) => {
    responses.forEach((currentMag) => {
      if (previousMag.id === currentMag.id) {
        if (previousMag.url === currentMag.url) {
          oldMagsData.push(currentMag);
        } else {
          newMagsData.push(currentMag);
        }
      }
    });
  });

  const newLibraryMagsChunk = newMagsData.reduce(getMagsChunk, "");
  const oldLibraryMagsChunk = oldMagsData.reduce(getMagsChunk, "");

  return { newLibraryMagsChunk, oldLibraryMagsChunk };
};
