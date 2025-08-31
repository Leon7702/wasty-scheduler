import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeesService, Employee, EmployeeIn } from '../../core/employees.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Employees</h1>

<!-- ngModel provides two-way data binding -->
<form (submit)="add($event)">
  <input placeholder="Name" [(ngModel)]="name" name="name">
  <input placeholder="Role" [(ngModel)]="role" name="role">
  <button>Add</button>
</form>

<ul>
  @for (e of employees(); track e.id) {
    <li>
      {{ e.name }} — {{ e.role }}
      <button (click)="del(e.id)">Delete</button>
    </li>
  }
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

  // Calls backend via EmployeesService.list()
  // Updates employees signal with result
  load() {
    this.api.list().subscribe((data) => this.employees.set(data));
  }

  add(evt: Event) {
    evt.preventDefault(); // Stops reloading the page
    const payload: EmployeeIn = { name: this.name.trim(), role: this.role.trim() };
    if (!payload.name || !payload.role) return; // Check for empty fields
    // Call API to create employee
    this.api.create(payload).subscribe(() => {
      // Reset form fields
      this.name = ''; this.role = '';
      this.load();
    });
  }

  // Calls API to delete employee
  del(id: number) {
    this.api.remove(id).subscribe(() => this.load());
  }
}