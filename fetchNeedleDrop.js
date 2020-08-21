const puppeteer = require("puppeteer");
const { JSDOM } = require("jsdom");

exports.getNeedleDropData = async () => {
  const url = `https://www.youtube.com/playlist?list=PLP4CSgl7K7or84AAhr7zlLNpghEnKWu2c`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const text = await page.evaluate(() => document.documentElement.outerHTML);

  const dom = new JSDOM(text);
  const document = dom.window.document;

  const roundupUrl =
    `https://youtube.com` +
    document.querySelector("ytd-playlist-video-renderer a").href;

  const descSelector = "ytd-video-secondary-info-renderer #description";

  await page.goto(roundupUrl);
  await page.waitForSelector(descSelector);
  const roundUpText = await page.evaluate(
    () => document.documentElement.outerHTML
  );

  await browser.close();

  const roundUpDom = new JSDOM(roundUpText);
  const roundUpDocument = roundUpDom.window.document;

  const titleString = roundUpDocument.querySelector("h1").textContent;

  const descString = roundUpDocument.querySelector(descSelector).innerHTML;

  let outputString = descString.replace(/=+\n(.*\n)+=+/, "");
  outputString = outputString.replace(/(.*\n)+\!\!\!B/, "!!!B");
  outputString = outputString.replace(/Review: .+/g, "");
  outputString = outputString.replace(
    /Y'all know this is just my opinion, right\?.+/,
    ""
  );
  outputString = outputString.replace(
    /(.+\n)<\/span><a.+href="(.+?)".+/g,
    (match, p1, p2) => {
      const matches = p2.match(/q=(.+?)(&|$)/);
      if (matches && matches.length > 1) {
        return `<a href="${decodeURIComponent(matches[1])}">${p1}</a><br>`;
      }
      return `<a href="https://www.youtube.com${p2}">${p1}</a><br>`;
    }
  );

  outputString = outputString.replace(
    "!!!BEST TRACKS THIS WEEK!!!",
    "<h3>Best Tracks</h3>"
  );

  outputString = outputString.replace(
    "!!!WORST TRACKS THIS WEEK!!!",
    "<h3>Worst Tracks</h3>"
  );

  outputString = outputString.replace("...meh...", "<h3>...meh...</h3>");

  return {
    title: titleString,
    fileData: `
    <!doctype html>
    <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href='needledrop.css' rel='stylesheet'></style>
      </head>
      <body>
        <h1>The Needle Drop</h1>
        <h2>${titleString}</h2>
        ${outputString}
      </body>
      </html>
  `,
  };
};
