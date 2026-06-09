import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Formarka LMS';
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Listen for session changes to handle redirection after email confirmation
    this.authService.getSession().then(session => {
      if (session) {
        // If we are on login/register/verify but have a session, 
        // it means we just came back from email verification or already logged in.
        const currentUrl = this.router.url;
        if (currentUrl.includes('/auth/login') || 
            currentUrl.includes('/auth/register') || 
            currentUrl.includes('/auth/verify-email') ||
            currentUrl === '/') {
          
          // Check if we should go to complete profile or dashboard
          this.authService.checkProfileAndRedirect();
        }
      }
    });
  }
}
