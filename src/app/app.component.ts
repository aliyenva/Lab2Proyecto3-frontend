import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavMenuComponent } from './shared/nav-menu/nav-menu.component';
import { NotificationComponent } from './shared/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavMenuComponent, NotificationComponent],
  template: `
    <app-notification></app-notification>
    <app-nav-menu></app-nav-menu>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'crud-frontend-angular';
}
