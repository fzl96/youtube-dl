import { useState } from "react";

interface VideoData {
  title: string;
  url: string;
  thumbnail: string;
  length: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");

  const handleFetch = async (url: string) => {
    setLoading(true);
    const res = await fetch("/api/yt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const data = await res.json();
      setLoading(false);
      return setError(data.message);
    }
    const data = await res.json();
    setVideoData(data);
    setLoading(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!url) return;
    handleFetch(url);
  };

  const handlePaste = async (e: any) => {
    const paste = e.clipboardData.getData("text");
    if (paste.includes("youtube") || paste.includes("youtu.be")) {
      setUrl(paste);
      handleFetch(paste);
    }
  };

  const handleDownload = async () => {
    if (!videoData) return;
    if (!url) return;
    setLoading(true);
    const res = await fetch(`/api/yt?url=${url}`);
    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);
    setLink(downloadUrl);
    setLoading(false);
  };

  return (
    <div className="min-w-screen min-h-screen flex flex-col justify-center items-center bg-[#1e2336] text-white text-2xl">
      <h1 className="mb-5">Youtube Info</h1>
      <form className="flex flex-col gap-3 " onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter a Youtube URL"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          className="bg-transparent border-b-2 border-white text-white outline-none"
          onPaste={handlePaste}
        />
        <button
          className={`bg-transparent border rounded-lg py-2 px-3 ${
            !url || loading
              ? "cursor-not-allowed bg-slate-800 text-gray-400"
              : "hover:bg-slate-700"
          }`}
          disabled={loading || !url}
        >
          Submit
        </button>
        {videoData && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span>Title</span>
              <span>{videoData.title}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span>Length</span>
              <span>{videoData.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span>Thumbnail</span>
              <img src={videoData.thumbnail} alt="thumbnail" />
            </div>
          </div>
        )}

        <button
          className={` py-2 px-3 rounded-lg ${
            loading || !url
              ? "cursor-not-allowed bg-green-800 text-gray-400"
              : "bg-green-600"
          }`}
          disabled={loading || !url}
          onClick={handleDownload}
        >
          Download
        </button>
        {link && (
          <a href={link} download className="py-2 px-3 rounded-lg bg-green-600">
            Download
          </a>
        )}
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}
