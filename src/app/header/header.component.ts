import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @ViewChild('menu') menu?: ElementRef;
  isMenuOpen = false;

  isAuthenticated = false;
  private userSub!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  @HostListener('document:click', ['$event']) navOpen(event: Event) {
    let isMenuDefined = this.menu;
    let isClickedOutsideMenu = isMenuDefined && !this.menu!.nativeElement.contains(event.target);
    if (isClickedOutsideMenu) {
      this.isMenuOpen = false;
    } 
  }
}
