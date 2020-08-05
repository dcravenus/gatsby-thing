const Parser = require("rss-parser");
const dayInMs = 1000 * 60 * 60 * 24;

const now = new Date();

const getDateFromURL = (url) => {
  const matches = url.match(/nytimes\.com\/(\d\d\d\d\/\d\d\/\d\d)/);
  if (matches && matches.length > 1) {
    return new Date(matches[1]);
  }
  return null;
};

const filterItemsByDate = (item) => {
  const itemDate = new Date(item.pubDate);
  const timeDifference = now - itemDate;
  if (timeDifference < dayInMs) {
    //check if the link is for today or yesterday
    const realPubDate = getDateFromURL(item.link);
    if (!realPubDate) {
      console.error("Unable to get date from " + item.link);
      return false;
    }
    if (now - realPubDate < dayInMs * 2) {
      return true;
    }
  }
  return false;
};

const sortItemsByDate = (a, b) => {
  const aDate = getDateFromURL(a.link);
  const bDate = getDateFromURL(b.link);

  return bDate - aDate;
};

const getStringForSection = (section) => {
  return section.items.reduce((str, item) => {
    return str + `<a href=${item.link}>` + item.title + "</a><br>" + "\n";
  }, `<h3>${section.name}</h3>\n`);
};

exports.getNytRssData = async () => {
  const parser = new Parser();

  const feeds = {
    Books: "https://rss.nytimes.com/services/xml/rss/nyt/Books.xml",
    Movies: "https://rss.nytimes.com/services/xml/rss/nyt/Movies.xml",
    Music: "https://rss.nytimes.com/services/xml/rss/nyt/Music.xml",
    Television: "https://rss.nytimes.com/services/xml/rss/nyt/Television.xml",
    Food: "https://rss.nytimes.com/services/xml/rss/nyt/DiningandWine.xml",
    Science: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
    Well: "https://rss.nytimes.com/services/xml/rss/nyt/Well.xml",
  };

  const outputData = [];
  for (var i = 0; i < Object.keys(feeds).length; i++) {
    const feedName = Object.keys(feeds)[i];
    const feed = await parser.parseURL(feeds[feedName]);
    const filteredItems = feed.items.filter(filterItemsByDate);
    outputData.push({
      name: feedName,
      items: filteredItems.sort(sortItemsByDate),
    });
  }

  return outputData.reduce((str, section) => {
    return str + getStringForSection(section);
  }, `<h2>The New York Times</h2>`);
};
