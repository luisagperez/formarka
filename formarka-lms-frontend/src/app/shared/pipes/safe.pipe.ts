import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safe',
  standalone: true
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl(url);

    let embedUrl = url;

    // Convert standard YouTube watch/shorts/etc URLs to embed URLs if it's a YouTube link
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      
      // Case 1: youtu.be/VIDEO_ID
      if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        if (parts.length > 1) {
          videoId = parts[1].split(/[?#]/)[0];
        }
      }
      // Case 2: youtube.com/watch?v=VIDEO_ID
      else if (url.includes('v=')) {
        const parts = url.split('v=');
        if (parts.length > 1) {
          videoId = parts[1].split('&')[0];
        }
      }
      // Case 3: youtube.com/shorts/VIDEO_ID
      else if (url.includes('youtube.com/shorts/')) {
        const parts = url.split('youtube.com/shorts/');
        if (parts.length > 1) {
          videoId = parts[1].split(/[?#]/)[0];
        }
      }

      if (videoId && !url.includes('/embed/')) {
        // Retain query parameters from original URL if any, but filter out 'v'
        let queryParams = '';
        if (url.includes('?')) {
          const queryIndex = url.indexOf('?');
          const query = url.substring(queryIndex + 1);
          const params = query.split('&').filter(p => !p.startsWith('v='));
          if (params.length > 0) {
            queryParams = '?' + params.join('&');
          }
        }
        embedUrl = `https://www.youtube.com/embed/${videoId}${queryParams}`;
      }
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
