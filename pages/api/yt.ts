import { NextApiRequest, NextApiResponse } from "next";
import ytdl from "ytdl-core";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // // check if request type is POST
  if (req.method === "POST") {
    const { url } = req.body;
    // create a function to convert the seconds to a readable format
    const convertSeconds = (seconds: number) => {
      const date = new Date(seconds * 1000);
      const hh = date.getUTCHours();
      const mm = date.getUTCMinutes();
      const ss = date.getSeconds();
      if (hh) {
        return `${hh}:${mm.toString().padStart(2, "0")}:${ss
          .toString()
          .padStart(2, "0")}`;
      }
      return `${mm}:${ss.toString().padStart(2, "0")}`;
    };

    if (!url) {
      res.status(400).json({ message: "No URL provided" });
      return;
    }

    // get the video info, handle error if id not found
    try {
      const info = await ytdl.getInfo(url as string);

      // get the last array of the info.videoDetails.thumbnails
      const thumbnail =
        info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1];

      // filter the formats to get the format that has the audio and video and container as mp4
      const format = ytdl
        .filterFormats(info.formats, "videoandaudio")
        .filter((format) => format.container === "mp4");

      res.status(200).json({
        title: info.videoDetails.title,
        thumbnail: thumbnail,
        length: convertSeconds(parseInt(info.videoDetails.lengthSeconds)),
        formats: format,
        url: info.videoDetails.video_url,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        res.status(400).json({ message: err.message });
      }
    }
  } else if (req.method === "GET") {
    const { url } = req.query;
    if (!url) {
      res.status(400).json({ message: "No URL provided" });
      return;
    }
    // create a download link
    const downloadLink = ytdl(url as string, {
      // format: "mp4",
      quality: "highestvideo",
    });
    // set the response header to download the file
    res.setHeader("Content-Disposition", "attachment; filename=video.mp4");
    res.setHeader("Content-Type", "video/mp4");
    // pipe the download link to the response
    downloadLink.pipe(res);
  }
}
