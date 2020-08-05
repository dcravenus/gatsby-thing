const Parser = require("rss-parser");
const dayInMs = 1000 * 60 * 60 * 24;

const now = new Date();
const filterItemsByDate = (item) => {
  const itemDate = new Date(item.pubDate);
  const timeDifference = now - itemDate;
  if (timeDifference < dayInMs) {
    return true;
  }
  return false;
};

exports.getSeriousEatsData = async () => {
  const parser = new Parser();
  const feedUrl = "http://feeds.feedburner.com/seriouseatsfeaturesvideos";
  const feed = await parser.parseURL(feedUrl);
  const filteredItems = feed.items.filter(filterItemsByDate);

  return filteredItems.reduce((str, item) => {
    return str + `<a href=${item.link}>` + item.title + "</a><br>" + "\n";
  }, `<h2>Serious Eats</h2>`);
};
