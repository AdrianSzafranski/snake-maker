import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
    ) {}

  onSignIn(form: NgForm) {
    if(!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.isLoading = true;
    this.authService.signIn(email, password)
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
