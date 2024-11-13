import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageGenerator } from './components/ImageGenerator';
import { VideoPlayer } from './components/VideoPlayer';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background transition-colors">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">图生成</TabsTrigger>
              <TabsTrigger value="music">音乐</TabsTrigger>
            </TabsList>
            <TabsContent value="image">
              <ImageGenerator />
            </TabsContent>
            <TabsContent value="music">
              <VideoPlayer />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;