const fetch = require("node-fetch");

exports.getHackerNewsData = async () => {
  const topStoriesUrl = `https://hacker-news.firebaseio.com/v0/topstories.json`;
  const topStoriesResponse = await fetch(topStoriesUrl);
  let topStories = await topStoriesResponse.json();
  topStories = topStories.slice(0, 25);

  for (let i = 0; i < topStories.length; i++) {
    const storyId = topStories[i];
    const storyURL = `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`;
    const response = await fetch(storyURL);
    topStories[i] = await response.json();
  }

  const fileContent = topStories.reduce(
    (str, story) => {
      return str + `<a href="${story.url}">${story.title}</a><br>`;
    },
    `
    <!doctype html>
    <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href='nyt.css' rel='stylesheet'></style>
      </head>
      <body>
        <h1>Hacker News</h1>
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
