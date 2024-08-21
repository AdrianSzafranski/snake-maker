import { Component } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../auth.service';
import { AUTH_ERROR_MESSAGES, ERROR_PRIORITIES } from '../auth-error-messages';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  isLoading = false;
  error: Record<string, string> = {};

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
          this.error = JSON.parse(errorMessage.message);
          this.isLoading = false;
        }
      });

    //form.reset();

 
  }

  getErrorMessage(controlName: string, control: NgModel): string {
    if (control.errors) {
      // Pobierz klucze błędów i przypisz im priorytety
      const errorKeys = Object.keys(control.errors);

      if (errorKeys.length === 0) {
        return 'An unknown error occurred!';
      }

      // Znajdź błąd o najwyższym priorytecie
      const highestPriorityError = errorKeys.reduce((highest, errorKey) => {
        const errorPriority = ERROR_PRIORITIES[errorKey] || Number.MAX_VALUE;
        const highestPriority = ERROR_PRIORITIES[highest] || Number.MAX_VALUE;
        return errorPriority < highestPriority ? errorKey : highest;
      }, errorKeys[0]);
      
      // Mapuj kod błędu na komunikat
      const messageTemplate = AUTH_ERROR_MESSAGES[controlName + "." + highestPriorityError];
      if (messageTemplate) {
        return this.formatErrorMessage(messageTemplate, control.errors[highestPriorityError]);
      }
    }
    return this.error?.[controlName] || 'An unknown error occurred!';
  }

  getServerErrorMessage() {
    return this.error?.['account'] || this.error?.['error'] || null;
  }

  // Funkcja do formatowania komunikatu błędu
  private formatErrorMessage(template: string, params: any): string {
    // Przykład: formatowanie komunikatu błędu z parametrami
    return template.replace(/{(.*?)}/g, (_, key) => params[key] || '');
  }
}
