import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type ImageExample = {
  prompt: string;
  imageUrl: string;
}

export const ImageGenerator = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  const examples: ImageExample[] = [
    {
      prompt: "A photo of TAOXI feeding cats",
      imageUrl: "/example1.jpg" // Replace with your actual image URLs
    },
    {
      prompt: "A photo of TAOXI playing guitar",
      imageUrl: "/example2.jpg"
    },
    {
      prompt: "A photo of TAOXI reading books",
      imageUrl: "/example3.jpg"
    }
  ];

  const handleExampleClick = (example: ImageExample) => {
    setPrompt(example.prompt);
    setCurrentImage(example.imageUrl);
  };

  return (
    <div className="space-y-4">
      <div className="max-w-3xl mx-auto">
        <div className="aspect-square relative rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Generated" 
              className="w-full h-full object-cover"
            />
          ) : (
            <p className="text-muted-foreground">Generated image will appear here</p>
          )}
        </div>
        
        <div className="space-y-2 mt-4">
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="请使用纯英语进行描述，描述以 A xxx of TAOXI 开头" 
            className="min-h-[100px] bg-background"
          />
          <Button className="w-full">Generate</Button>
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
      </div>
    </div>
  );
};