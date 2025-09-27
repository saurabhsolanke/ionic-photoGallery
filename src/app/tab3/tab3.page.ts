import { Component, OnInit, OnDestroy } from '@angular/core';

declare var YT: any;

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  artwork: string;
  url?: string;
  videoId?: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {
  
  // Music player state
  isPlaying = false;
  currentSongIndex = 0;
  currentTime = 0;
  duration = 0;
  volume = 70;
  
  // YouTube player
  private player: any = null;
  private progressInterval: any;
  
  // Screen navigation state
  currentScreen: 'main' | 'music' | 'songs' | 'now-playing' = 'main';
  previousScreen: 'main' | 'music' | 'songs' | 'now-playing' = 'main';
  isTransitioning = false;
  
  // Main menu items
  mainMenuItems = ['Music', 'Photos', 'Videos', 'Extras', 'Settings', 'Shuffle Songs'];
  selectedMainMenuItem = 0;
  
  // Music menu items
  musicMenuItems = ['Playlists', 'Artists', 'Albums', 'Songs', 'Genres', 'Composers', 'Audiobooks'];
  selectedMusicMenuItem = 0;
  
  // Songs list
  selectedSongIndex = 0;
  
  // Sample music library with YouTube video IDs and realistic album artwork
  songs: Song[] = [
    {
      id: 1,
      title: "Bohemian Rhapsody",
      artist: "Queen",
      album: "A Night at the Opera",
      duration: "5:55",
      artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
      url: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
      videoId: "fJ9rUzIMcZQ"
    },
    {
      id: 2,
      title: "Hotel California",
      artist: "Eagles",
      album: "Hotel California",
      duration: "6:30",
      artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop&crop=center",
      url: "https://www.youtube.com/watch?v=BciS5krYL80",
      videoId: "BciS5krYL80"
    },
    {
      id: 3,
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      album: "Led Zeppelin IV",
      duration: "8:02",
      artwork: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center",
      url: "https://www.youtube.com/watch?v=QkF3oxziUI4",
      videoId: "QkF3oxziUI4"
    },
    {
      id: 4,
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      album: "Appetite for Destruction",
      duration: "5:56",
      artwork: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop&crop=center",
      url: "https://www.youtube.com/watch?v=1w7OgIMMRc4",
      videoId: "1w7OgIMMRc4"
    },
    {
      id: 5,
      title: "Imagine",
      artist: "John Lennon",
      album: "Imagine",
      duration: "3:07",
      artwork: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&h=300&fit=crop&crop=center",
      url: "https://www.youtube.com/watch?v=YkgkThdzX-8",
      videoId: "YkgkThdzX-8"
    },
    {
      id: 6,
      title: "Summer",
      artist: "Calvin Harris",
      album: "Summer",
      duration: "4:54",
      artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
      url: "https://www.youtube.com/watch?v=ebXbLfLACGM",
      videoId: "ebXbLfLACGM"
    }
  ];

  get currentSong(): Song {
    return this.songs[this.currentSongIndex];
  }

  constructor() {}

  ngOnInit() {
    this.initializeYouTubePlayer();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initializeYouTubePlayer() {
    // Wait for YouTube API to load
    if (typeof YT !== 'undefined' && YT.Player) {
      this.createPlayer();
    } else {
      // Wait for API to load
      setTimeout(() => this.initializeYouTubePlayer(), 100);
    }
  }

  private createPlayer() {
    if (this.currentSong.videoId) {
      this.player = new YT.Player('youtube-player', {
        height: '0', // Hidden player
        width: '0',
        videoId: this.currentSong.videoId,
        playerVars: {
          'autoplay': 0,
          'controls': 0,
          'disablekb': 1,
          'enablejsapi': 1,
          'fs': 0,
          'iv_load_policy': 3,
          'modestbranding': 1,
          'playsinline': 1,
          'rel': 0,
          'showinfo': 0,
          'loop': 0
        },
        events: {
          'onReady': (event: any) => this.onPlayerReady(event),
          'onStateChange': (event: any) => this.onPlayerStateChange(event),
          'onError': (event: any) => this.onPlayerError(event)
        }
      });
    }
  }

  private onPlayerReady(event: any) {
    console.log('YouTube player ready');
    this.player.setVolume(this.volume);
    // Get duration from YouTube
    this.duration = this.player.getDuration();
    if (this.duration === 0) {
      // Fallback to duration from song data
      this.duration = this.parseTimeToSeconds(this.currentSong.duration);
    }
  }

  private onPlayerStateChange(event: any) {
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        this.isPlaying = true;
        this.startProgressTracking();
        break;
      case YT.PlayerState.PAUSED:
        this.isPlaying = false;
        this.stopProgressTracking();
        break;
      case YT.PlayerState.ENDED:
        this.nextSong();
        break;
    }
  }

  private onPlayerError(event: any) {
    console.error('YouTube player error:', event.data);
    // Fallback to duration from song data
    this.duration = this.parseTimeToSeconds(this.currentSong.duration);
  }

  private cleanup() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  // Smooth screen transition method
  private transitionToScreen(newScreen: 'main' | 'music' | 'songs' | 'now-playing') {
    if (this.isTransitioning || this.currentScreen === newScreen) {
      return;
    }
    
    this.isTransitioning = true;
    this.previousScreen = this.currentScreen;
    
    // Add a small delay for smooth transition
    setTimeout(() => {
      this.currentScreen = newScreen;
      this.isTransitioning = false;
    }, 150);
  }

  // Click wheel navigation with smooth transitions
  onWheelClick() {
    if (this.isTransitioning) return;
    
    switch (this.currentScreen) {
      case 'main':
        if (this.mainMenuItems[this.selectedMainMenuItem] === 'Music') {
          this.transitionToScreen('music');
          this.selectedMusicMenuItem = 0;
        }
        break;
      case 'music':
        if (this.musicMenuItems[this.selectedMusicMenuItem] === 'Songs') {
          this.transitionToScreen('songs');
          this.selectedSongIndex = 0;
        }
        break;
      case 'songs':
        this.currentSongIndex = this.selectedSongIndex;
        this.transitionToScreen('now-playing');
        setTimeout(() => this.loadNewSong(), 200);
        break;
      case 'now-playing':
        this.togglePlayPause();
        break;
    }
  }

  onWheelScroll(direction: 'up' | 'down') {
    switch (this.currentScreen) {
      case 'main':
        if (direction === 'up') {
          this.selectedMainMenuItem = (this.selectedMainMenuItem - 1 + this.mainMenuItems.length) % this.mainMenuItems.length;
        } else {
          this.selectedMainMenuItem = (this.selectedMainMenuItem + 1) % this.mainMenuItems.length;
        }
        break;
      case 'music':
        if (direction === 'up') {
          this.selectedMusicMenuItem = (this.selectedMusicMenuItem - 1 + this.musicMenuItems.length) % this.musicMenuItems.length;
        } else {
          this.selectedMusicMenuItem = (this.selectedMusicMenuItem + 1) % this.musicMenuItems.length;
        }
        break;
      case 'songs':
        if (direction === 'up') {
          this.selectedSongIndex = (this.selectedSongIndex - 1 + this.songs.length) % this.songs.length;
        } else {
          this.selectedSongIndex = (this.selectedSongIndex + 1) % this.songs.length;
        }
        break;
    }
  }

  // Menu button to go back with smooth transitions
  goBack() {
    if (this.isTransitioning) return;
    
    switch (this.currentScreen) {
      case 'music':
        this.transitionToScreen('main');
        break;
      case 'songs':
        this.transitionToScreen('music');
        break;
      case 'now-playing':
        this.transitionToScreen('songs');
        break;
    }
  }

  // Music player controls
  togglePlayPause() {
    if (this.player) {
      if (this.isPlaying) {
        this.pausePlayback();
      } else {
        this.startPlayback();
      }
    }
  }

  previousSong() {
    this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
    this.loadNewSong();
  }

  nextSong() {
    this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
    this.loadNewSong();
  }

  private loadNewSong() {
    if (this.player && this.currentSong.videoId) {
      this.player.loadVideoById(this.currentSong.videoId);
      this.currentTime = 0;
      console.log('Loading new song:', this.currentSong.title);
    }
  }

  private startPlayback() {
    if (this.player) {
      this.player.playVideo();
      console.log('Starting playback:', this.currentSong.title);
    }
  }

  private pausePlayback() {
    if (this.player) {
      this.player.pauseVideo();
      console.log('Pausing playback');
    }
  }

  private startProgressTracking() {
    this.stopProgressTracking(); // Clear any existing interval
    this.progressInterval = setInterval(() => {
      if (this.player && this.duration > 0) {
        this.currentTime = this.player.getCurrentTime();
      }
    }, 100); // Update every 100ms for smooth progress
  }

  private stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private parseTimeToSeconds(timeString: string): number {
    const parts = timeString.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getProgressPercentage(): number {
    return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
  }

  // Method to handle progress bar clicks for seeking
  seekTo(event: any) {
    if (this.player && this.duration > 0) {
      const rect = event.target.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * this.duration;
      
      this.player.seekTo(newTime);
      this.currentTime = newTime;
    }
  }
}
