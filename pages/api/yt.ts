import { NextApiRequest, NextApiResponse } from "next";
import ytdl from "ytdl-core";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.body;

  // check if request type is POST
  if (req.method === "POST") {
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

    // create a function to format the video format to a readable format
    const formatVideo = (format: any) => {
      const qualityLabel = format.qualityLabel || format.quality;
      return `${format.container} ${qualityLabel} ${
        format.audioBitrate ? format.audioBitrate : ""
      }`;
    };

    if (!url) {
      res.status(400).json({ message: "No URL provided" });
      return;
    }
    // get the video info, handle error if id not found
    try {
      const info = await ytdl.getInfo(url as string);

      res.status(200).json({
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[0].url,
        length: convertSeconds(parseInt(info.videoDetails.lengthSeconds)),
        url: info.videoDetails.video_url,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        res.status(400).json({ message: err.message });
      }
    }
  }
}
