import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import Camera from "../assets/camera.svg";
const FaceCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [capturedFace, setCapturedFace] = useState<string | null>(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL =
          "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);

        startVideo();
        setLoading(false);
      } catch (error) {
        console.error("Error loading face-api models:", error);
      }
    };

    loadModels();
  }, []);

  // Start webcam stream
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Camera access denied:", err));
  };

  // Detect face in real-time
  const handleVideoPlay = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused) return;

      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      setFaceDetected(detections.length > 0);

      if (canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current;
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };

        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        const context = canvas.getContext("2d");
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  };

  // Capture face snapshot
  const captureFace = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/png");
      setCapturedFace(imageData);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full bg-[#2F2F2F] border-[18px] border-dashed border-[#F697F959] text-white">
      {/* <h1 className="text-2xl font-semibold mb-4">Face Capture (face-api.js)</h1> */}

      {loading ? (
        <img src={Camera} className="w-[236px] h-[236px]"/>
        // <p>Loading models...</p>
      ) : (
        <>
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              onPlay={handleVideoPlay}
              width={400}
              height={300}
              className="rounded-lg"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0"
              width={400}
              height={300}
            />
          </div>

          <p className="mt-4">
            {faceDetected ? "✅ Face detected!" : "😐 No face detected yet"}
          </p>

          <button
            onClick={captureFace}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            disabled={!faceDetected}
          >
            Capture Face
          </button>

          {capturedFace && (
            <div className="mt-6">
              <h2 className="text-lg mb-2">Captured Face:</h2>
              <img
                src={capturedFace}
                alt="Captured face"
                className="rounded-lg border border-gray-500"
                width={200}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FaceCapture;
