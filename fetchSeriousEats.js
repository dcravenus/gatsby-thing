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

  return (
    filteredItems.reduce(
      (str, item) => {
        let description = item.contentSnippet;
        const readMoreIdx = description.indexOf("Read More");
        if (readMoreIdx !== -1) {
          description = description.slice(0, readMoreIdx);
        }
        return (
          str +
          `
      <a href=${item.link}>
        <strong>${item.title}</strong><br>
        ${description}
      </a>
    `
        );
      },
      `
      <!doctype html>
      <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href='nyt.css' rel='stylesheet'></style>
        </head>
        <body>
          <h1>Serious Eats</h1>
  `
    ) + "</body></html>"
  );
};
