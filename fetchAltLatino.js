const Parser = require("rss-parser");

exports.getAltLatinoData = async () => {
  const rssUrl = `https://feeds.npr.org/510305/podcast.xml`;

  const parser = new Parser();
  const feed = await parser.parseURL(rssUrl);
  let item = feed.items[0];

  return {
    title: item.title,
    url: item.link,
  };
};
