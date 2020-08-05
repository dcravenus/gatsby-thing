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

const getStringForSection = (section) => {
  return section.items.reduce((str, item) => {
    return str + `<a href=${item.link}>` + item.title + "</a><br>" + "\n";
  }, `<h3>${section.name}</h3>\n`);
};

exports.getSLTribData = async () => {
  const parser = new Parser();

  const feeds = {
    Religion:
      "https://www.sltrib.com/arcio/rss/category/religion/?summary=true",
  };

  const outputData = [];
  for (var i = 0; i < Object.keys(feeds).length; i++) {
    const feedName = Object.keys(feeds)[i];
    const feed = await parser.parseURL(feeds[feedName]);
    const filteredItems = feed.items.filter(filterItemsByDate);
    outputData.push({
      name: feedName,
      items: filteredItems,
    });
  }

  return outputData.reduce((str, section) => {
    return str + getStringForSection(section);
  }, `<h2>The Salt Lake Tribune</h2>`);
};
