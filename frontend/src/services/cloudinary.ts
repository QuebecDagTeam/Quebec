async function uploadToCloudinary(base64Image: string): Promise<string> {
  const cloudName = "dtsiyyvu1"; // Replace with your Cloudinary cloud name
  const uploadPreset = "your-upload-preset"; // Replace with your unsigned preset

  const formData = new FormData();
  formData.append("file", base64Image);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const data = await response.json();
  return data.secure_url; // ✅ This is the URL you will encrypt
}

export default uploadToCloudinary