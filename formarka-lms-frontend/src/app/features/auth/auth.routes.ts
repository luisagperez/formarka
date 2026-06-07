import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthDemoComponent } from './auth-demo/auth-demo.component';
import { CompleteProfileComponent } from './complete-profile/complete-profile.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'complete-profile', component: CompleteProfileComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'demo', component: AuthDemoComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
