const express = require('express');
const cors = require('cors'); // Import the cors package
const { google } = require('googleapis');
const app = express();

// Use CORS middleware
app.use(cors()); // This will allow all origins
// You can also customize CORS options, for example:
// app.use(cors({ origin: 'http://example.com' })); // Allow only example.com

// YouTube Data API client
const youtube = google.youtube('v3');

// Your YouTube Data API key (replace this with your actual key)
const apiKey = 'AIzaSyA2N1xiFRr8w4bty-POzaAjSGkOWSJqAv0';

// Endpoint for fetching the latest video(s) from a YouTube channel
app.get('/ytlatestvideo', async (req, res) => {
  const { pid, limit } = req.query;

  // Check if 'pid' (channel ID) and 'limit' are provided
  if (!pid || !limit) {
    return res.status(400).json({ error: 'Missing parameters: "pid" or "limit".' });
  }

  try {
    // Make a request to the YouTube API to fetch the latest videos
    const response = await youtube.search.list({
      key: apiKey,
      channelId: pid,
      part: 'snippet,id',
      order: 'date',
      maxResults: parseInt(limit),
    });

    // Extract the video data from the API response
    const videoData = response.data.items.map(item => {
      if (item.id.videoId) {
        return {
          contentDetails: {
            videoId: item.id.videoId,
          },
        };
      }
    }).filter(Boolean); // Remove undefined items if any

    // If there are videos, return them as a JSON response
    if (videoData.length > 0) {
      res.json({ items: videoData });
    } else {
      res.status(404).json({ error: 'No videos found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching data from YouTube API.' });
  }
});

// Start the server on port 3000 (or another port)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});