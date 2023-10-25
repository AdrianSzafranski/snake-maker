import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('menu') menu?: ElementRef;
  isMenuOpen = false;

  @HostListener('document:click', ['$event']) navOpen(event: Event) {
    let isMenuDefined = this.menu;
    let isClickedOutsideMenu = isMenuDefined && !this.menu!.nativeElement.contains(event.target);
    if (isClickedOutsideMenu) {
      this.isMenuOpen = false;
    } 
  }
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
}
