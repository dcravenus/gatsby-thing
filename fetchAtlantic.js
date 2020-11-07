const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

exports.getAtlanticData = async () => {
  const url = "https://www.theatlantic.com/magazine/";

  const response = await fetch(url);
  const text = await response.text();

  const dom = new JSDOM(text);
  const document = dom.window.document;

  const heading = document.querySelector("h1").textContent;

  const articles = [];
  document.querySelectorAll("a h2").forEach((heading) => {
    articles.push({
      title: heading.textContent,
      href: "https://www.theatlantic.com" + heading.parentElement.href,
    });
  });

  const fileData =
    articles.reduce(
      (str, article) => {
        return (
          str +
          `
          <a href="${article.href}">
            ${article.title}
          </a>
          <br>
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
        <h1>The Atlantic</h1>
        <p>${heading.toUpperCase()}</p>
  `
    ) + "</body></html>";

  return { fileData, title: heading };
};
