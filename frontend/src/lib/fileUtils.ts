export function base64ToFile(
    base64String: string,
    filename: string,
    mimeType: string = 'image/png'
  ): File {
    if (!base64String) {
      throw new Error('base64String is required');
    }

    const mimeMatch = base64String.match(/^data:(image\/\w+);base64,/);
    const actualMimeType = mimeMatch?.[1] || mimeType;
    
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new File([bytes], filename, { type: actualMimeType });
  }