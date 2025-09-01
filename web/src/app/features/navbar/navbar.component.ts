import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="topbar">
      <div class="container bar">
        <div class="brand">Wasty Admin</div>
        <nav>
          <ul class="nav-links">
            <li><a routerLink="/employees" routerLinkActive="active">Employees</a></li>
            <li><a routerLink="/schedule" routerLinkActive="active">Schedule</a></li>
            <li><a routerLink="/summary" routerLinkActive="active">Summary</a></li>
          </ul>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .topbar { position: sticky; top: 0; z-index: 10; background: #fff; border-bottom: 1px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
    .bar { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; padding-bottom: 8px; }
    .brand { font-size: 16px; font-weight: 700; color: #111827; }
    .nav-links {
      list-style: none;
      display: flex; align-items: center;
      gap: 16px;
      margin: 0;
      padding: 0;
    }
    .nav-links a {
      color: #111827;
      text-decoration: none;
      font-size: 14px; font-weight: 600;
      padding: 6px 10px;
      border-radius: 8px;
      transition: background 0.15s, color 0.15s;
    }
    .nav-links a:hover {
      background: #f3f4f6;
    }
    .nav-links a.active {
      background: #2563eb; color: #fff;
    }
  `]
})
export class NavbarComponent {}
