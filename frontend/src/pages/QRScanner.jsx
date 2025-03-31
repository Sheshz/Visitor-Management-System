import { useState, useEffect, useRef } from "react";
import { QrCode, Camera, CheckCircle, AlertCircle } from "lucide-react";
import "../CSS/QRScanner.css";

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Clean up function to stop the camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanner = async () => {
    setScanResult(null);
    setScanError(null);
    setScanning(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true); // required for iOS
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          requestAnimationFrame(scanQRCode);
        };
      }
      
      setHasCameraPermission(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setScanError("Couldn't access camera. Please make sure you've granted camera permissions.");
      setScanning(false);
      setHasCameraPermission(false);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  const scanQRCode = async () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    // Make sure video is playing
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanQRCode);
      return;
    }

    // Match canvas dimensions to video
    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, videoWidth, videoHeight);
    
    try {
      // Here you would integrate a QR code scanning library
      // This is a mock implementation - in a real app, you'd use a library like jsQR
      
      // Simulate QR code detection after 3 seconds (for demo purposes)
      setTimeout(() => {
        if (scanning) {
          const mockQRValue = "VISITOR-" + Math.floor(1000 + Math.random() * 9000);
          handleSuccessfulScan(mockQRValue);
        }
      }, 3000);
      
      // Continue scanning if no code is found yet
      requestAnimationFrame(scanQRCode);
    } catch (error) {
      console.error("QR scan error:", error);
      setScanError("Error processing the QR code. Please try again.");
      stopScanner();
    }
  };
  
  const handleSuccessfulScan = (value) => {
    // Play a success sound
    const successAudio = new Audio("/success-beep.mp3");
    successAudio.play().catch(e => console.log("Audio play failed:", e));
    
    // Process the scanned result
    setScanResult(value);
    stopScanner();
    
    // Here you would typically send the result to your API
    console.log("QR Code scanned:", value);
  };

  const handleManualEntry = () => {
    const code = prompt("Please enter the visitor code:");
    if (code && code.trim()) {
      handleSuccessfulScan(code.trim());
    }
  };

  return (
    <div className="qr-scanner-container">
      <div className="scanner-header">
        <h2><QrCode className="header-icon" /> QR Code Scanner</h2>
        <p>Scan a visitor's QR code to check them in</p>
      </div>
      
      <div className="scanner-content">
        {!scanning && !scanResult && (
          <div className="scanner-inactive">
            <div className="scanner-placeholder">
              <Camera size={64} />
              <p>Camera is currently inactive</p>
              <button className="primary-button" onClick={startScanner}>
                Start Scanner
              </button>
              <button className="secondary-button" onClick={handleManualEntry}>
                Manual Entry
              </button>
            </div>
          </div>
        )}
        
        {scanning && (
          <div className="scanner-active">
            <div className="video-container">
              <video ref={videoRef} className="scanner-video" />
              <div className="scan-overlay">
                <div className="scan-target"></div>
              </div>
              <canvas ref={canvasRef} className="scanner-canvas" />
            </div>
            <p className="scanning-text">Scanning for QR code...</p>
            <button className="cancel-button" onClick={stopScanner}>
              Cancel
            </button>
          </div>
        )}
        
        {scanResult && (
          <div className="scan-result success">
            <CheckCircle size={48} className="result-icon success" />
            <h3>QR Code Scanned!</h3>
            <p className="code-value">{scanResult}</p>
            <p className="result-message">Processing check-in...</p>
            <button className="primary-button" onClick={() => setScanResult(null)}>
              Scan Another
            </button>
          </div>
        )}
        
        {scanError && (
          <div className="scan-result error">
            <AlertCircle size={48} className="result-icon error" />
            <h3>Scanner Error</h3>
            <p className="error-message">{scanError}</p>
            <button className="primary-button" onClick={startScanner}>
              Try Again
            </button>
            <button className="secondary-button" onClick={handleManualEntry}>
              Manual Entry
            </button>
          </div>
        )}
        
        {hasCameraPermission === false && (
          <div className="permission-guide">
            <h3>Camera Access Required</h3>
            <p>To scan QR codes, please grant camera access in your browser settings:</p>
            <ol>
              <li>Click the camera/lock icon in your address bar</li>
              <li>Select "Allow" for camera access</li>
              <li>Refresh the page and try again</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}