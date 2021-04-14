const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

exports.getNYTCookingData = async () => {
  const url =
    "https://cooking.nytimes.com/68861692-nyt-cooking/1640510-sam-siftons-suggestions";

  const response = await fetch(url);
  const text = await response.text();

  const dom = new JSDOM(text);
  const document = dom.window.document;

  const recipes = [];
  document
    .querySelector(".recipes")
    .querySelectorAll("article")
    .forEach((node) => {
      const recipe = {};
      recipe.title = node.querySelector("h3").textContent.trim();
      recipe.url = `https://cooking.nytimes.com${node.dataset.url}`;
      recipe.img = node.dataset.seoImageUrl;
      recipes.push(recipe);
    });

  const fileContent = recipes.reduce(
    (str, recipe) => {
      let recipeStr = `<div><a href="${recipe.url}"><p>${recipe.title}</p><img src="${recipe.img}" /></a></div>`;
      return str + recipeStr;
    },
    `
      <!doctype html>
      <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href='nytCooking.css' rel='stylesheet'></style>
        </head>
        <body>
          <h1>NYT Cooking</h1>
          <h2>Sam Sifton's Suggestions</h2>
          <div id="recipes-wrapper">
    `
  );

  return (
    fileContent +
    `
      </div>
      </body>
      </html>
    `
  );
};
