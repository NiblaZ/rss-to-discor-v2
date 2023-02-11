const axios = require('axios');
const fs = require('fs');
const Parser = require('rss-parser');

const webhookURL = 'https://discord.com/api/webhooks/xxx';
const feedURL = 'https://example.com/feed';

setInterval(async () => {
  let previousFeeds = [];

  // Load previousFeeds from file
  try {
    previousFeeds = JSON.parse(fs.readFileSync('previousFeeds.json'));
  } catch (err) {
    // Create file if it does not exist
    if (err.code === 'ENOENT') {
      fs.writeFileSync('previousFeeds.json', '[]');
    } else {
      console.error(err);
    }
  }

  const parser = new Parser();

  // Fetch the RSS feed
  const feed = await parser.parseURL(feedURL);

  // Get the latest feed
  const latestFeed = feed.items[0];

  // Check if the latest feed is in previousFeeds
  if (!previousFeeds.includes(latestFeed.link)) {
    // Send the new feed to Discord
    try {
      await axios.post(webhookURL, {
        content: `**${latestFeed.title}**\n${latestFeed.link}`,
        username: `RSS Bot`,
        avatar_url: `https://example.com/rss-bot-avatar.png`,

      });

      console.log(`Sent to Discord: ${latestFeed.title}\n${latestFeed.link}`);
    } catch (err) {
      console.error(`Error sending to Discord: ${err}`);
    }

    // Add the latest feed to previousFeeds
    previousFeeds.push(latestFeed.link);

    // Save previousFeeds to file
    fs.writeFileSync('previousFeeds.json', JSON.stringify(previousFeeds));
  } else {
    console.log('No new RSS feed');
  }
}, 5000);
