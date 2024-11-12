import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface Song {
  id: number;
  title: string;
  artist: string;
  audioUrl: string;
  lyrics: string[];
  timestamps: number[]; // timestamps in seconds for each lyric line
}

const songs: Song[] = [
  {
    id: 1,
    title: "Song 1",
    artist: "Artist 1",
    audioUrl: "https://psyqimg.uuo.app/%E9%9B%A8%E5%A4%9C%E7%9A%84%E5%AE%88%E5%80%99.mp3", // Replace with actual audio URL
    lyrics: [
      "Verse 1 line 1",
      "Verse 1 line 2",
      "Chorus line 1",
      "Chorus line 2"
    ],
    timestamps: [0, 15, 30, 45] // Example timestamps in seconds
  },
  {
    id: 2,
    title: "Song 2",
    artist: "Artist 2",
    audioUrl: "https://psyqimg.uuo.app/%E9%9B%A8%E5%A4%9C%E7%9A%84%E5%AE%88%E5%80%99.mp3", // Replace with actual audio URL
    lyrics: [
      "Different verse 1",
      "Different verse 2",
      "Different chorus 1",
      "Different chorus 2"
    ],
    timestamps: [0, 20, 40, 60]
  }
];

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(songs[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    // Reset player state when song changes
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentLyricIndex(0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [currentSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Update current lyric index based on timestamps
      const newIndex = currentSong.timestamps.findIndex((timestamp, index) => {
        const nextTimestamp = currentSong.timestamps[index + 1] || Infinity;
        return audioRef.current!.currentTime >= timestamp && audioRef.current!.currentTime < nextTimestamp;
      });
      
      if (newIndex !== -1 && newIndex !== currentLyricIndex) {
        setCurrentLyricIndex(newIndex);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      setCurrentSong(songs[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    if (currentIndex < songs.length - 1) {
      setCurrentSong(songs[currentIndex + 1]);
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-background">
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={handleNext}
      />

      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{currentSong.title}</h2>
          <p className="text-muted-foreground">{currentSong.artist}</p>
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
            <Button variant="ghost" size="icon" onClick={handlePrevious}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button size="icon" onClick={handlePlayPause}>
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext}>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Lyrics</h3>
        <div className="space-y-2 h-48 overflow-y-auto">
          {currentSong.lyrics.map((line, index) => (
            <p
              key={index}
              className={`transition-colors ${
                index === currentLyricIndex
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Playlist</h3>
        <div className="space-y-2">
          {songs.map((song) => (
            <Card 
              key={song.id}
              className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                currentSong.id === song.id ? 'bg-accent' : ''
              }`}
              onClick={() => setCurrentSong(song)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>
                {currentSong.id === song.id && isPlaying && (
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