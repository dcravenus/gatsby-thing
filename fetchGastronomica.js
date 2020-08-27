const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

exports.getGastronomicaData = async () => {
  const url = "https://gastronomica.org/";

  const response = await fetch(url);
  const text = await response.text();

  const dom = new JSDOM(text);
  const document = dom.window.document;

  const articles = document.querySelectorAll("article");
  let latestArticle = null;
  articles.forEach((article) => {
    const articleTitle = article.querySelector(".entry-title").textContent;
    if (
      articleTitle.indexOf("Volume") !== -1 &&
      articleTitle.indexOf("Number") !== -1 &&
      !latestArticle
    ) {
      latestArticle = article;
    }
  });
  
  if(!latestArticle) {
    return null;
  }

  const title = latestArticle.querySelector(".entry-title").textContent;
  const coverImgUrl = latestArticle.querySelector("p img").src;

  let str = "";
  const pTags = latestArticle.querySelectorAll("p");
  pTags.forEach((tag, idx) => {
    if (idx !== 0) {
      let pContent = tag.innerHTML;
      //Node.TEXT_NODE
      if (tag.firstChild.nodeType === 3) {
        str += `<h3>${tag.firstChild.textContent}</h3>`;
        pContent = pContent.slice(tag.firstChild.textContent.length);
        //Remove inital <br> tag
        pContent = pContent.slice(4);
      }
      //Replace | character
      const idx = pContent.indexOf("|");
      if (idx !== -1) {
        pContent = pContent.slice(0, idx) + "<br>" + pContent.slice(idx + 1);
      }

      //Wrap content after <br> in <span>
      const brIdx = pContent.indexOf("<br>");
      if (brIdx !== -1) {
        let postBrChunk = pContent.slice(brIdx + 4);
        const extraBrIdx = postBrChunk.indexOf("<br>");
        if (extraBrIdx !== -1) {
          postBrChunk = postBrChunk.slice(extraBrIdx + 4);
        }

        pContent =
          pContent.slice(0, brIdx) + "<br><span>" + postBrChunk + "</span>";
      }

      str += `<p>${pContent}</p>`;
    }
  });

  const indexTitleString = title.slice(0, title.indexOf(","));

  return {
    title: indexTitleString,
    fileData: `
      <!doctype html>
      <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href='gastro.css' rel='stylesheet'></style>
        </head>
        <body>
          <img src="${coverImgUrl}" />
          <h1>Gastronomica</h1>
          <h2>${title}</h2>
          ${str}
        </body>
      </html>
  `,
  };
};
