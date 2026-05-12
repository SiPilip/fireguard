
const dotenv = require('dotenv');
const fs = require('fs');

// Load env
dotenv.config({ path: '.env' });

async function testUpload() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  console.log('--- Cloudinary Test ---');
  console.log('Cloud Name:', cloudName);
  console.log('Upload Preset:', uploadPreset);

  if (!cloudName || !uploadPreset) {
    console.error('Missing credentials');
    return;
  }

  // Create a dummy image (1x1 transparent pixel)
  const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(base64Image, 'base64');
  
  const formData = new FormData();
  const fileBlob = new Blob([new Uint8Array(buffer)], { type: 'image/png' });
  
  formData.append('file', fileBlob, 'test.png');
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'fireguard/test');

  try {
    console.log('Sending request to Cloudinary...');
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const status = response.status;
    const text = await response.text();
    console.log('Status:', status);
    console.log('Response:', text);

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('Success URL:', data.secure_url);
    } else {
      console.error('Upload failed');
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testUpload();
