import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeesService, Employee, EmployeeIn } from '../core/employees.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Employees</h1>

    <form (submit)="add($event)">
      <input placeholder="Name" [(ngModel)]="name" name="name">
      <input placeholder="Role" [(ngModel)]="role" name="role">
      <button>Add</button>
    </form>

    <ul>
      <li *ngFor="let e of employees()">
        {{e.name}} — {{e.role}}
        <button (click)="del(e.id)">Delete</button>
      </li>
    </ul>
  `,
})
export class EmployeesComponent {
  employees = signal<Employee[]>([]);
  name = '';
  role = '';

  constructor(private api: EmployeesService) {
    this.load();
  }

  load() {
    this.api.list().subscribe((data) => this.employees.set(data));
  }

  add(evt: Event) {
    evt.preventDefault();
    const payload: EmployeeIn = { name: this.name.trim(), role: this.role.trim() };
    if (!payload.name || !payload.role) return;
    this.api.create(payload).subscribe(() => {
      this.name = ''; this.role = '';
      this.load();
    });
  }

  del(id: number) {
    this.api.remove(id).subscribe(() => this.load());
  }
}