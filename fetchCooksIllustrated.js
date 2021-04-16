const fetch = require("node-fetch");

const fetchUrl =
  "https://beehive.overdrive.com/utahsonlinelibrary-orem/magazines/search?query=Cook%27s%20Illustrated&format=magazine-overdrive&sortBy=relevance";

exports.getCooksIllustratedData = async () => {
  const response = await fetch(fetchUrl);
  const text = await response.text();

  const edition = /"edition":"(.+?)"/.exec(text)[1];
  const id = /window\.OverDrive\.mediaItems = {"(\d+)"/.exec(text)[1];

  const url = `https://beehive.overdrive.com/utahsonlinelibrary-orem/magazines/media/${id}`;

  return { title: edition, url };
};
