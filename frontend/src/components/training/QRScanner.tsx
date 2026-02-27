import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

type QRScannerProps = {
  onScanSuccess: (qrData: string) => void;
  onScanError?: (message: string) => void;
  onPermissionDenied?: (message: string) => void;
};

export function QRScanner({ onScanSuccess, onScanError, onPermissionDenied }: QRScannerProps) {
  const containerIdRef = useRef<string>(
    `qr-scanner-${Math.random().toString(36).slice(2, 10)}`
  );

  useEffect(() => {
    let scanner: any | null = null;
    let isCancelled = false;

    const setupScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (isCancelled) return;

        scanner = new Html5Qrcode(containerIdRef.current);

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 250,
          },
          (decodedText: string) => {
            onScanSuccess(decodedText);
          },
          (errorMessage: string) => {
            if (onScanError) {
              onScanError(errorMessage);
            }
          }
        );
      } catch (error: any) {
        const msg =
          error?.name === "NotAllowedError"
            ? "Camera permission was denied."
            : "Unable to access camera for QR scanning.";

        if (onPermissionDenied) {
          onPermissionDenied(msg);
        } else {
          toast.error(msg);
        }
      }
    };

    setupScanner();

    return () => {
      isCancelled = true;
      if (!scanner || typeof scanner.stop !== "function") return;

      try {
        const result = scanner.stop();

        if (result && typeof result.then === "function") {
          result
            .then(() => {
              if (typeof scanner.clear === "function") {
                scanner.clear();
              }
            })
            .catch(() => {
              // ignore cleanup errors (including \"Cannot stop\" when not running)
            });
        }
      } catch {
        // Swallow synchronous errors from stop(), e.g. \"Cannot stop, scanner is not running or paused.\"
      }
    };
  }, [onScanSuccess, onScanError, onPermissionDenied]);

  return <div id={containerIdRef.current} className="w-full h-full" />;
}

