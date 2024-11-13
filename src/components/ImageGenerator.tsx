import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';

type ImageExample = { prompt: string; imageUrl: string; }
type UploadedImage = { name: string; url: string; uploadedAt: string; size: number };

export const ImageGenerator = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]); // Store all uploaded images

  const examples: ImageExample[] = [
    { prompt: "A mysterious depiction of TAOXI under a full moon standing on mars with a grand planet in the background, wearing a formal blue shirt and gray vest and feeding cats", imageUrl: "https://replicate.delivery/xezq/nnHd28nLwuZMIhy4gw2vqeYOvwnUYoMGSHJ4iUXeWCaytkwTA/out-0.webp" },
    { prompt: "A melancholic moment of TAOXI, crouching in the rain while feeding a stray kitten, wearing a light vest over a blue shirt, a solemn expression, holding an open umbrella beside him, urban alleyway background, gentle rain effects, emotional anime art style. HDR, High Qulity.", imageUrl: "https://replicate.delivery/xezq/fIa61cMzxAXQXqwlFeFP5xaJBkUotYozwsimQwxtRu1FMiwTA/out-0.webp" },
    { prompt: "A dramatic confrontation of TAOXI, in a hooded cloak with sharp daggers in hand, standing tall in a threatening pose, a girl cowering in fear behind him, glowing red eyes from shadows, dark night sky with heavy clouds, intense anime action scene.", imageUrl: "https://replicate.delivery/xezq/nLPxf3zhGZQaJKOwfkpc11BUhSsWl94RT6gQRv8zFhLdLiwTA/out-0.webp" },
    { prompt: "A mysterious depiction of TAOXI under a full moon, with blue-black hair and piercing eyes, holding a mask in one hand, wearing a dark coat and high collar, a solemn and enigmatic expression, illuminated by soft moonlight, starry night sky, dramatic anime art style.", imageUrl: "https://replicate.delivery/xezq/FiWIRwfK9M13J6L5eX7aRmFBHGeJzDqeRRv1AFdGEFM9oICPB/out-0.webp" },
    { prompt: "A portrait of TAOXI with short blue hair reflecting vibrant highlights, wearing a soft white sweater layered over a collared shirt, a calm and confident smile, delicate hand gestures, clean white background, anime art style, soft lighting, gentle details in expression.", imageUrl: "https://replicate.delivery/xezq/ey1NVesQGOmtfpuQAePIf0zpNDDqs7JN33Bx3wNOHW4nOREeE/out-0.webp" },
    { prompt: "A melancholic moment of TAOXI, crouching in the rain while feeding a stray kitten, wearing a light vest over a blue shirt, a solemn expression, holding a sword to defeat the monsters, gentle rain effects, emotional anime art style. HDR, High Qulity.", imageUrl: "https://replicate.delivery/xezq/h58AvkmcVLIhP5kAKIBxyIoCvbwUppWTHKsGHfvCjHzdIT4JA/out-0.webp" }
  ];

  // Fetch uploaded images on component mount
  useEffect(() => {
    fetchUploadedImages();
  }, []);

  const fetchUploadedImages = async () => {
    try {
      const response = await axios.get('https://psyq-api.uuo.app/list-images');
      setUploadedImages(response.data); // Set the list of uploaded images
    } catch (error) {
      console.error("Error fetching uploaded images:", error);
    }
  };

  const handleExampleClick = (example: ImageExample) => {
    setPrompt(example.prompt);
    setCurrentImage(example.imageUrl);
  };

  const handleGenerateClick = async () => {
    if (!prompt) return;

    setLoading(true);
    setProgress(10);

    try {
      const response = await axios.post(
        'https://psyq-api.uuo.app/',
        { prompt },
        {
          timeout: 150000,
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percentCompleted);
            }
          }
        }
      );

      if (response.data && response.data.output) {
        const imageUrl = response.data.output[0];
        setCurrentImage(imageUrl);
        await uploadGeneratedImage(imageUrl); // Upload image to backend
        fetchUploadedImages(); // Refresh the uploaded images list
      } else {
        console.error("No output found in response");
      }
      
      setProgress(100);

    } catch (error) {
      console.error("Error generating image:", error);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Function to upload generated image data to the backend
  const uploadGeneratedImage = async (imageUrl: string) => {
    try {
      // Prepare URL with imageUrl as query parameter
      const url = new URL('https://psyq-api.uuo.app/upload-image');
      url.searchParams.append('img_url', imageUrl);  // Add image URL as query parameter
      url.searchParams.append('prompt', prompt);  // Add image URL as query parameter

      // Send the GET request with the image URL in query params
      const response = await axios.get(url.toString(), {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log("Image uploaded:", response.data);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div>
      {currentImage ? (
        <img src={currentImage} alt="Generated" className="w-full h-auto mt-4 rounded" />
      ) : (
        <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center">Generated image will appear here</div>
      )}

      {loading && <Progress value={progress} className="mt-2" />}

      <div className="space-y-2 mt-4">
        <Textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Please use English and start with 'A xxx of TAOXI'"
          className="min-h-[100px] bg-background"
        />
        <Button className="w-full" onClick={handleGenerateClick} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {examples.map((example, index) => (
          <Card 
            key={index}
            className="p-2 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleExampleClick(example)}
          >
            <div className="aspect-video relative overflow-hidden rounded-sm mb-2">
              <img 
                src={example.imageUrl} 
                alt={example.prompt}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-center">{example.prompt}</p>
          </Card>
        ))}
      </div>

      {/* Display all uploaded images in a table */}
      <div className="mt-6">
        <h2 className="text-lg font-bold">Uploaded Images</h2>
        <table className="table-auto w-full mt-2 border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">File Name</th>
              <th className="border border-gray-300 px-4 py-2">Image</th>
              <th className="border border-gray-300 px-4 py-2">Uploaded At</th>
              <th className="border border-gray-300 px-4 py-2">Size (KB)</th>
            </tr>
          </thead>
          <tbody>
            {uploadedImages.map((image, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{image.name}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <img src={image.url} alt={image.name} className="w-24 h-auto rounded" />
                </td>
                <td className="border border-gray-300 px-4 py-2">{new Date(image.uploadedAt).toLocaleString()}</td>
                <td className="border border-gray-300 px-4 py-2">{(image.size / 1024).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
