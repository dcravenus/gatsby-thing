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
  }, `<h3>${section.category}</h3>\n`);
};

exports.getNewYorkerData = async () => {
  const parser = new Parser();
  const url = "https://www.newyorker.com/feed/magazine/rss";

  const feed = await parser.parseURL(url);

  //feed.title

  const filteredItems = feed.items.filter((item) => {
    let foundMagazineCategory = false;
    item.categories.forEach((category) => {
      if (category.includes("Magazine")) {
        foundMagazineCategory = true;
      }
    });
    return foundMagazineCategory;
  });

  let categories = filteredItems.map((item) => {
    return item.categories.flat();
  });

  categories = categories.flat();
  categories = categories.filter((category) => {
    return category.includes("Magazine");
  });

  const categoriesNoDuplicates = [];
  categories.forEach((category) => {
    if (!categoriesNoDuplicates.includes(category)) {
      categoriesNoDuplicates.push(category);
    }
  });

  const parsedData = [];
  filteredItems.forEach((item) => {
    let itemCategory = item.categories.find((category) => {
      return category.includes("Magazine");
    });

    itemCategory = itemCategory.replace("Magazine / ", "");

    const idx = parsedData.findIndex((obj) => {
      return obj.category === itemCategory;
    });

    if (idx === -1) {
      parsedData.push({
        category: itemCategory,
        items: [item],
      });
    } else {
      parsedData[idx].items.push(item);
    }
  });

  return parsedData.reduce((str, section) => {
    return str + getStringForSection(section);
  }, `<h2>${feed.title}</h2>`);
};
