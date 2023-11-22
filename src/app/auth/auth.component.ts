import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isSignInMode = true;
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
    ) {}

  onSwitchMode() {
    this.isSignInMode = !this.isSignInMode;
    this.error = null;
  }

  onSubmit(form: NgForm) {
    if(!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.isLoading = true;
    this.authService.auth(email, password, this.isSignInMode)
    .subscribe({
      next: resData => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: errorMessage => {
        this.error = errorMessage.message;
        this.isLoading = false;
      }
    });

    form.reset();
  }
}
