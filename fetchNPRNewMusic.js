const puppeteer = require("puppeteer");
const { JSDOM } = require("jsdom");
const Parser = require("rss-parser");

const getYouTubeUrlForSearchString = async (page, query) => {
  const url = `https://youtube.com/results?search_query=${encodeURIComponent(
    query
  )}`;

  await page.goto(url);
  await page.waitForSelector("#video-title");

  const text = await page.evaluate(() => document.documentElement.outerHTML);

  const dom = new JSDOM(text);
  const document = dom.window.document;

  return "https://youtube.com" + document.querySelector("#video-title").href;
};

exports.getNPRNewMusicData = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const rssUrl = `https://feeds.npr.org/510019/podcast.xml`;

  const parser = new Parser();
  const feed = await parser.parseURL(rssUrl);
  let items = feed.items.filter((item) => {
    return item.title.indexOf("New Music Friday") !== -1;
  });

  const titleString = items[0].title;
  items = items.map((item) => {
    const regex = /\d\. (.+?) — (.+?)<br\/>Featured Songs?: (.+?)<br\/>/g;

    const outputArray = [];
    let regexResponseArray;
    while ((regexResponseArray = regex.exec(item.content)) !== null) {
      outputArray.push({
        artist: regexResponseArray[1],
        album: regexResponseArray[2],
        titles: [...regexResponseArray[3].matchAll(/"(.+?),?"/g)].map(
          (resp) => resp[1]
        ),
      });
    }
    return outputArray;
  });

  items = items[0];
  let songsStr = "";
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    songsStr += `<h3>${item.artist} - ${item.album}</h3>`;
    for (let j = 0; j < item.titles.length; j++) {
      const title = item.titles[j];
      const url = await getYouTubeUrlForSearchString(
        page,
        `${item.artist} ${title}`
      );
      if (url) {
        songsStr += `<a href="${url}">${title}</a><br>`;
      } else {
        songsStr += `${title}<br>`;
      }
    }
  }

  await browser.close();

  return {
    title: titleString,
    fileData: `
    <!doctype html>
    <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href='allsongs.css' rel='stylesheet'></style>
      </head>
      <body>
        <h1>All Songs Considered</h1>
        <h2>${titleString}</h2>
        ${songsStr}
      </body>
      </html>
  `,
  };
};
