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
  if (!section.items.length) {
    return "";
  }
  return section.items.reduce((str, item) => {
    return (
      str +
      `
      <a href=${item.link}>
        ${item.title}
      </a>
    `
    );
  }, `<h3>${section.name}</h3>\n`);
};

exports.getSLTribData = async () => {
  const parser = new Parser();

  const feeds = {
    News: "https://www.sltrib.com/arcio/rss/category/news/?summary=true",
    Religion:
      "https://www.sltrib.com/arcio/rss/category/religion/?summary=true",
    "Bagley Cartoon":
      "https://www.sltrib.com/arcio/rss/category/opinion/bagley/?summary=true",
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

  return (
    outputData.reduce(
      (str, section) => {
        return str + getStringForSection(section);
      },
      `
    <!doctype html>
    <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href='nyt.css' rel='stylesheet'></style>
      </head>
      <body>
        <h1>The Salt Lake Tribune</h1>
  `
    ) + "</body></html>"
  );
};
