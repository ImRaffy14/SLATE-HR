import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface QRCodeDisplayProps {
  qrCode: string;
  qrCodeString?: string;
  expiresAt?: string;
  trainingTitle?: string;
}

export function QRCodeDisplay({ qrCode, qrCodeString, expiresAt, trainingTitle }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`;
    link.download = `${trainingTitle || 'training'}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyQRCodeString = async () => {
    if (!qrCodeString) {
      toast.error("QR code string not available");
      return;
    }

    try {
      await navigator.clipboard.writeText(qrCodeString);
      setCopied(true);
      toast.success("QR code data copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy QR code data");
      console.error("Copy error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{trainingTitle || 'Training QR Code'}</CardTitle>
        <CardDescription>Scan this QR code to mark attendance</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          {/* Display the QR code image directly since it's already a data URL */}
          <img 
            src={qrCode} 
            alt="QR Code" 
            className="w-64 h-64 object-contain"
          />
        </div>
        {expiresAt && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Expires: {new Date(expiresAt).toLocaleString()}</span>
          </div>
        )}
        <div className="flex gap-2 w-full">
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
          {qrCodeString && (
            <Button 
              onClick={handleCopyQRCodeString} 
              variant="outline" 
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Manual Code
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

