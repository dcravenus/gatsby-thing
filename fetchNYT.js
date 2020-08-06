const puppeteer = require("puppeteer");
const { JSDOM } = require("jsdom");

exports.getNYTData = async () => {
  const todaysDate = new Date();

  const year = String(todaysDate.getFullYear());
  const month = String(todaysDate.getMonth() + 1).padStart(2, 0);
  const date = String(todaysDate.getDate()).padStart(2, 0);

  const dateString = `${year}/${month}/${date}`;

  const url = `https://nytimes.com/issue/todayspaper/${dateString}/todays-new-york-times`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const text = await page.evaluate(() => document.documentElement.outerHTML);

  await browser.close();

  const dom = new JSDOM(text);
  const document = dom.window.document;

  const anchorTags = Array.prototype.slice.call(
    document.querySelectorAll("a[name]")
  );

  const sections = anchorTags.map((tag) => {
    const liArray = [];
    const ols = tag.parentElement.querySelectorAll("ol");
    ols.forEach((ol) => {
      ol.querySelectorAll("li").forEach((li) => {
        if (!li.querySelector("ol")) {
          liArray.push(li);
        }
      });
    });

    const links = liArray.map((li) => {
      const link = li.querySelector("a");
      if (!link) return null;
      let heading = link.querySelector("h2");

      // If there's no heading it might be an image. Try the next link
      if (!heading) {
        const links2 = li.querySelectorAll("a");
        links2.forEach((link2) => {
          // debugger;
          if (link2.textContent) {
            // debugger;
            heading = link2;
          }
        });
      }
      return {
        href: link.href,
        title: heading ? heading.textContent : link.href,
      };
    });

    const usedUrls = [];
    const filteredLinks = links.filter((link) => {
      if (link === null || usedUrls.includes(link.href)) {
        return false;
      } else {
        usedUrls.push(link.href);
      }
      return true;
    });

    return {
      heading: tag.nextSibling.textContent,
      links: filteredLinks,
    };
  });

  const fileContent = sections.reduce(
    (str, section) => {
      let sectionStr = "<h2>" + section.heading.trim() + "</h2>" + "\n";
      section.links.forEach((link) => {
        sectionStr +=
          '<a href="https://nytimes.com' +
          link.href +
          '">' +
          link.title +
          "</a>" +
          "<br>" +
          "\n";
      });

      return str + sectionStr;
    },
    `
    <!doctype html>
    <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href='nyt.css' rel='stylesheet'></style>
      </head>
      <body>
        <h1>The New York Times</h1>
  `
  );

  return (
    fileContent +
    `
    </body>
    </html>
  `
  );
};
