import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AiOutlineThunderbolt, AiOutlinePlayCircle, AiOutlineYoutube } from 'react-icons/ai';

// Extract YouTube video ID from various URL formats
const extractYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Pixel person component
const PixelPerson = ({ x, energy, action, color, delay, isMobileView }) => {
  const getAnimation = () => {
    switch (action) {
      case 'jump':
        return 'animate-jump';
      case 'wave':
        return 'animate-wave';
      case 'headbang':
        return 'animate-headbang';
      case 'mosh':
        return 'animate-mosh';
      case 'lighter':
        return 'animate-sway';
      default:
        return energy > 50 ? 'animate-bounce-slow' : '';
    }
  };

  return (
    <div
      className={`absolute bottom-0 transition-all duration-300 ${getAnimation()}`}
      style={{
        left: `${x}%`,
        animationDelay: `${delay}ms`,
        transform: `scale(${isMobileView ? 0.5 + Math.random() * 0.3 : 0.6 + Math.random() * 0.4})`,
      }}
    >
      {action === 'lighter' && (
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg animate-flicker"
          style={{ color: '#ffa500' }}
        >
          🔥
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
        <div className="w-4 h-5 rounded-sm -mt-0.5" style={{ backgroundColor: color, opacity: 0.8 }} />
        {(action === 'wave' || action === 'lighter') && (
          <div className="absolute top-3 w-8 flex justify-between">
            <div className="w-1 h-3 rounded-sm animate-arm-wave" style={{ backgroundColor: color, opacity: 0.7 }} />
            <div className="w-1 h-3 rounded-sm animate-arm-wave" style={{ backgroundColor: color, opacity: 0.7, animationDelay: '150ms' }} />
          </div>
        )}
      </div>
    </div>
  );
};

const generateCrowd = (count, isMobile = false) => {
  const colors = [
    '#14f06e', '#f0a830', '#ff6b6b', '#4ecdc4', '#45b7d1',
    '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'
  ];
  const actualCount = isMobile ? Math.min(count, 15) : count;
  return Array.from({ length: actualCount }, (_, i) => ({
    id: i,
    x: 8 + (i / actualCount) * 84 + (Math.random() - 0.5) * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 500,
    baseEnergy: 30 + Math.random() * 40,
  }));
};

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 640;

const CROWD_ACTIONS = [
  { id: 'chill', label: 'Chill', icon: '😎', description: 'Low energy, just vibing' },
  { id: 'hype', label: 'Hype', icon: '🔥', description: 'Getting into it' },
  { id: 'jump', label: 'Jump', icon: '⬆️', description: 'Everyone jump!' },
  { id: 'wave', label: 'Wave', icon: '👋', description: 'Hands in the air' },
  { id: 'mosh', label: 'Mosh', icon: '💥', description: 'Pit opens up' },
  { id: 'lighter', label: 'Lighters', icon: '🔥', description: 'Phone flashlights & lighters' },
];

const PRESET_VIDEOS = [
  // Rock
  { id: 'n0H3RlaQVrM', title: 'Coheed and Cambria - Welcome Home', genre: 'rock' },
  { id: '_wY7Gjf0yXQ', title: 'Hot Mulligan - *Equip Sunglasses*', genre: 'rock' },
  { id: 'JJJ27NxYamY', title: 'Foo Fighters - Everlong', genre: 'rock' },
  { id: 'VOyYwzkQB98', title: 'Neck Deep - In Bloom', genre: 'rock' },
  // Indie
  { id: 'MpSTBFGbKrY', title: 'Ethel Cain - American Teenager', genre: 'indie' },
  { id: 'VGvHnDeS12o', title: 'Arctic Monkeys - R U Mine?', genre: 'indie' },
  { id: '8UVNT4wvIGY', title: 'Tame Impala - The Less I Know', genre: 'indie' },
  // Pop
  { id: 'fJ9rUzIMcZQ', title: 'Queen - Bohemian Rhapsody', genre: 'pop' },
  { id: 'btPJPFnesV4', title: 'Ed Sheeran - Sing', genre: 'pop' },
  { id: 'nfWlot6h_JM', title: 'Taylor Swift - Shake It Off', genre: 'pop' },
  // Metal
  { id: 'WM8bTdBs-cw', title: 'Metallica - One', genre: 'metal' },
  { id: 'aAXgVWuEYZo', title: 'System of a Down - Toxicity', genre: 'metal' },
  { id: 'CSvFpBOe8eY', title: 'Slipknot - Psychosocial', genre: 'metal' },
  // Punk
  { id: 'Soa3gO7tL-c', title: 'Green Day - Basket Case', genre: 'punk' },
  { id: 'z5OXON8vIaA', title: 'Blink-182 - All The Small Things', genre: 'punk' },
  { id: 'jrxI_euTX4A', title: 'Paramore - Misery Business', genre: 'punk' },
  // EDM
  { id: '60ItHLz5WEA', title: 'Avicii - Levels', genre: 'edm' },
  { id: 'IxxstCcJlsc', title: 'Deadmau5 - Ghosts n Stuff', genre: 'edm' },
  { id: 'y6120QOlsfU', title: 'Sandstorm - Darude', genre: 'edm' },
];

function ConcertCrowdSim() {
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [crowd, setCrowd] = useState(() => generateCrowd(30, isMobile()));
  const [energy, setEnergy] = useState(50);
  const [currentAction, setCurrentAction] = useState('chill');
  const [isPlaying, setIsPlaying] = useState(true);
  const [genre, setGenre] = useState('rock');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const energyRef = useRef(energy);
  const [crowdSize, setCrowdSize] = useState(isMobileView ? 15 : 30);

  useEffect(() => {
    const handleResize = () => {
      const mobile = isMobile();
      if (mobile !== isMobileView) {
        setIsMobileView(mobile);
        setCrowd(generateCrowd(30, mobile));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileView]);

  useEffect(() => {
    energyRef.current = energy;
  }, [energy]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setEnergy(prev => {
        const target = currentAction === 'chill' ? 30 :
                      currentAction === 'hype' ? 60 :
                      currentAction === 'mosh' ? 90 :
                      currentAction === 'lighter' ? 40 : 70;
        const diff = target - prev;
        return prev + diff * 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, currentAction]);

  const getCrowdAction = useCallback((personIndex) => {
    const currentEnergy = energyRef.current;
    if (currentAction === 'lighter') return 'lighter';
    if (currentAction === 'mosh' && currentEnergy > 70) return 'mosh';
    if (currentAction === 'wave') return 'wave';
    if (currentAction === 'jump' && currentEnergy > 50) return 'jump';
    if (currentEnergy > 80) return Math.random() > 0.5 ? 'jump' : 'headbang';
    if (currentEnergy > 60) return 'wave';
    return 'idle';
  }, [currentAction]);

  const handleActionChange = (actionId) => {
    setCurrentAction(actionId);
    if (!isPlaying) setIsPlaying(true);
  };

  const resetCrowd = () => {
    setCrowd(generateCrowd(crowdSize, isMobileView));
    setEnergy(50);
    setCurrentAction('chill');
    setIsPlaying(false);
  };

  const handleCrowdSizeChange = (newSize) => {
    const size = Math.max(5, Math.min(50, newSize));
    setCrowdSize(size);
    setCrowd(generateCrowd(size, isMobileView));
  };

  const handleLoadVideo = () => {
    const id = extractYouTubeId(youtubeUrl);
    if (id) {
      setVideoId(id);
      setShowVideo(true);
      setIsPlaying(true);
      setCurrentAction('hype');
    }
  };

  const handlePresetSelect = (preset) => {
    setVideoId(preset.id);
    setGenre(preset.genre);
    setShowVideo(true);
    setIsPlaying(true);
    setCurrentAction('hype');
    setYoutubeUrl(`https://youtube.com/watch?v=${preset.id}`);
  };

  const handleSurpriseMe = () => {
    const randomPreset = PRESET_VIDEOS[Math.floor(Math.random() * PRESET_VIDEOS.length)];
    handlePresetSelect(randomPreset);
  };

  const filteredPresets = PRESET_VIDEOS.filter(p => p.genre === genre);

  return (
    <div className="space-y-6">
      {/* YouTube Input */}
      <div className="p-4 bg-dark rounded-lg border border-dark-border">
        <div className="flex items-center gap-2 mb-3">
          <AiOutlineYoutube className="text-red-500 text-xl" />
          <span className="text-sm font-medium text-gray-300">Play Music</span>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Paste YouTube URL..."
            className="flex-1 px-3 py-2 bg-dark-card border border-dark-border rounded text-sm text-white placeholder-gray-500"
          />
          <button
            onClick={handleLoadVideo}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-2 transition-colors"
          >
            <AiOutlinePlayCircle />
            Play
          </button>
        </div>

        {/* Genre selector and Surprise Me */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="px-3 py-1.5 bg-dark-card border border-dark-border rounded text-sm text-primary"
          >
            <option value="rock">Rock</option>
            <option value="metal">Metal</option>
            <option value="pop">Pop</option>
            <option value="edm">EDM</option>
            <option value="indie">Indie</option>
            <option value="punk">Punk</option>
          </select>
          <button
            onClick={handleSurpriseMe}
            className="px-3 py-1.5 bg-primary/20 border border-primary text-primary hover:bg-primary/30 rounded text-sm transition-colors"
          >
            🎲 Surprise Me
          </button>
        </div>

        {/* Filtered presets */}
        <div className="flex flex-wrap gap-2">
          {filteredPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`px-2 py-1 text-xs rounded border transition-all ${
                videoId === preset.id
                  ? 'border-red-500 bg-red-500/20 text-red-400'
                  : 'border-dark-border hover:border-gray-600 text-gray-400 hover:text-white'
              }`}
              title={preset.title}
            >
              {preset.title.split(' - ')[1] || preset.title.split(' - ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Stage/Crowd Area */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          height: showVideo ? '400px' : '256px',
        }}
      >
        {showVideo && videoId && (
          <div className="absolute top-0 left-0 w-full h-48 z-10">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* String lights */}
        <div
          className="absolute left-0 w-full flex justify-around z-20 pointer-events-none"
          style={{ top: showVideo ? '190px' : '8px' }}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-3 rounded-full animate-twinkle"
              style={{
                backgroundColor: ['#ff6b6b', '#14f06e', '#ffd93d', '#6bcfff', '#ff9ff3'][i % 5],
                boxShadow: `0 0 8px ${['#ff6b6b', '#14f06e', '#ffd93d', '#6bcfff', '#ff9ff3'][i % 5]}`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Stage lights */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ top: showVideo ? '192px' : '0' }}>
          <div
            className="absolute top-0 left-1/4 w-32 h-full opacity-20"
            style={{
              background: `radial-gradient(ellipse at top, ${energy > 70 ? '#ff0000' : '#14f06e'} 0%, transparent 70%)`,
              animation: isPlaying ? 'pulse 1s ease-in-out infinite' : 'none',
            }}
          />
          <div
            className="absolute top-0 right-1/4 w-32 h-full opacity-20"
            style={{
              background: `radial-gradient(ellipse at top, ${energy > 70 ? '#0000ff' : '#f0a830'} 0%, transparent 70%)`,
              animation: isPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
        </div>

        {!showVideo && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
            <div className="text-2xl mb-1">🎸🎤🥁</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              {genre} night
            </div>
          </div>
        )}

        <div className="absolute right-4 flex items-center gap-2 z-20" style={{ top: showVideo ? '200px' : '16px' }}>
          <AiOutlineThunderbolt className="text-yellow-400" />
          <div className="w-20 h-2 bg-dark rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${energy}%`,
                background: energy > 70 ? '#ff4444' : energy > 40 ? '#f0a830' : '#14f06e',
              }}
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32">
          {crowd.map((person) => (
            <PixelPerson
              key={person.id}
              x={person.x}
              color={person.color}
              delay={person.delay}
              energy={energy}
              action={isPlaying ? getCrowdAction(person.id) : 'idle'}
              isMobileView={isMobileView}
            />
          ))}
        </div>

        <div
          className="absolute bottom-0 left-0 w-full h-8"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(20, 240, 110, 0.1))',
          }}
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {showVideo && (
          <div className="flex justify-end">
            <button
              onClick={() => { setShowVideo(false); setVideoId(null); }}
              className="px-3 py-1 text-xs border border-dark-border hover:border-gray-600 text-gray-400 rounded transition-colors"
            >
              Hide Video
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CROWD_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionChange(action.id)}
              className={`p-3 rounded-lg border transition-all text-center ${
                currentAction === action.id
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-dark-border hover:border-gray-600 text-gray-400 hover:text-white'
              }`}
              title={action.description}
            >
              <div className="text-xl mb-1">{action.icon}</div>
              <div className="text-xs">{action.label}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={resetCrowd}
            className="px-4 py-2 text-sm border border-dark-border hover:border-gray-600 text-gray-400 rounded-lg transition-colors"
          >
            New Crowd
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 text-sm border border-primary text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            {isPlaying ? 'Pause Show' : 'Start Show'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div className="p-3 bg-dark rounded-lg border border-dark-border">
          <div className="text-2xl mb-1">🎤</div>
          <div className="text-gray-500 mb-2">Crowd Size</div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleCrowdSizeChange(crowdSize - 5)}
              className="w-6 h-6 rounded border border-dark-border hover:border-primary hover:text-primary text-gray-400 transition-colors"
            >
              -
            </button>
            <span className="text-primary font-bold w-8">{crowd.length}</span>
            <button
              onClick={() => handleCrowdSizeChange(crowdSize + 5)}
              className="w-6 h-6 rounded border border-dark-border hover:border-primary hover:text-primary text-gray-400 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="p-3 bg-dark rounded-lg border border-dark-border">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-gray-500 mb-2">Energy Level</div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setEnergy(Math.max(0, energy - 10))}
              className="w-6 h-6 rounded border border-dark-border hover:border-primary hover:text-primary text-gray-400 transition-colors"
            >
              -
            </button>
            <span className="text-primary font-bold w-8">{Math.round(energy)}%</span>
            <button
              onClick={() => setEnergy(Math.min(100, energy + 10))}
              className="w-6 h-6 rounded border border-dark-border hover:border-primary hover:text-primary text-gray-400 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="p-3 bg-dark rounded-lg border border-dark-border">
          <div className="text-2xl mb-1">🔊</div>
          <div className="text-gray-500">Vibe</div>
          <div className="text-primary font-bold capitalize mt-2">{currentAction}</div>
        </div>
      </div>
    </div>
  );
}

export default ConcertCrowdSim;
