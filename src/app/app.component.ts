import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('hamburgerMenu') hamburgerMenu?: ElementRef;
  isHamburgerMenuOpen = false;

  @HostListener('document:click', ['$event']) navOpen(event: Event) {
    let isHamburgerMenuDefined = this.hamburgerMenu;
    let isClickedOutsideHamburgerMenu = isHamburgerMenuDefined && !this.hamburgerMenu!.nativeElement.contains(event.target);
    if (isClickedOutsideHamburgerMenu) {
      this.isHamburgerMenuOpen = false;
    } 
  }
  
  onCloseHamburgerMenu() {
    this.isHamburgerMenuOpen = false;
  }
}
