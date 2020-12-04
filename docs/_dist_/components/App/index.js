import React, {useState} from "../../../web_modules/react.js";
import {createFFmpeg, fetchFile} from "../../../web_modules/@ffmpeg/ffmpeg.js";
const App = () => {
  const [message, setMessage] = useState("Click Start to transcode!");
  const ffmpeg2 = createFFmpeg({
    progress: ({ratio}) => setMessage(`Complete: ${(ratio * 100).toFixed(2)}%`)
  });
  const downloadBlobAsFile = function(url, filename, contentType) {
    if (!url) {
      console.error(" No data");
      return;
    }
    if (!filename)
      filename = "filetodonwload.txt";
    let e = document.createEvent("MouseEvents"), a = document.createElement("a");
    a.download = filename;
    a.href = url;
    a.dataset.downloadurl = [
      contentType || "application/octet-stream",
      a.download,
      a.href
    ].join(":");
    e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
  };
  const transcode = async ({target: {files}}) => {
    const {name} = files[0];
    const outFileName = `openless_${name}.mp4`;
    if (!ffmpeg2.isLoaded()) {
      setMessage("Loading ffmpeg-core.js");
      await ffmpeg2.load();
    }
    setMessage("Start transcoding");
    ffmpeg2.FS("writeFile", name, await fetchFile(files[0]));
    await ffmpeg2.run("-i", name, "-vf", "scale=1280:-1", "-c:v", "libx264", "-preset", "veryslow", "-crf", "24", outFileName);
    setMessage("Complete transcoding");
    const url = URL.createObjectURL(new Blob([ffmpeg2.FS("readFile", outFileName).buffer], {
      type: "video/mp4"
    }));
    downloadBlobAsFile(url, outFileName, "video/mp4");
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: "App"
  }, /* @__PURE__ */ React.createElement("input", {
    type: "file",
    onChange: transcode
  }), /* @__PURE__ */ React.createElement("p", null, message));
};
export default App;