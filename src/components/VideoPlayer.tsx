import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface Video {
  id: number;
  title: string;
  videoUrl: string;
}

const videoList: Video[] = [
  {
    id: 1,
    title: "面具之下",
    videoUrl: "https://psyqimg.talecraft.site/mjzx.mp4",
  },
  {
    id: 2,
    title: "救赎之路",
    videoUrl: "https://psyqimg.talecraft.site/jszl.mp4",
  },
  {
    id: 3,
    title: "永远的守护",
    videoUrl: "https://psyqimg.talecraft.site/yydsh.mp4",
  },
];

export const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(videoList[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([75]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    // 重置播放器状态当视频变化时
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  }, [currentVideo]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = videoList.findIndex(v => v.id === currentVideo.id);
    if (currentIndex > 0) {
      setCurrentVideo(videoList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = videoList.findIndex(v => v.id === currentVideo.id);
    if (currentIndex < videoList.length - 1) {
      setCurrentVideo(videoList[currentIndex + 1]);
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-background">
      <div className="w-[300px] h-auto relative mx-auto">
        <video
          ref={videoRef}
          src={currentVideo.videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onEnded={handleNext}
          className="w-full h-auto rounded object-cover"
          controls={false} // 隐藏默认控件以使用自定义控件
        />
      </div>


      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{currentVideo.title}</h2>
        </div>

        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <Slider
              className="w-24"
              value={volume}
              max={100}
              step={1}
              onValueChange={setVolume}
            />
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={videoList.findIndex(v => v.id === currentVideo.id) === 0}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button size="icon" onClick={handlePlayPause}>
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={videoList.findIndex(v => v.id === currentVideo.id) === videoList.length - 1}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">播放列表</h3>
        <div className="space-y-2">
          {videoList.map((video) => (
            <Card
              key={video.id}
              className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                currentVideo.id === video.id ? 'bg-accent' : ''
              }`}
              onClick={() => setCurrentVideo(video)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{video.title}</p>
                </div>
                {currentVideo.id === video.id && isPlaying && (
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
};
