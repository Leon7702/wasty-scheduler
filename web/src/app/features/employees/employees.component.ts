import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeesService, Employee, EmployeeIn } from '../../core/employees.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card" style="margin-bottom: 16px;">
      <header class="card-header">
        <h2 class="card-title">Add Employee</h2>
      </header>
      <div class="card-body">
        <form (submit)="add($event)" class="emp-form">
          <div class="field">
            <label class="label">Name</label>
            <input class="input" placeholder="Jane Doe" [(ngModel)]="name" name="name">
          </div>
          <div class="field">
            <label class="label">Role</label>
            <select class="input" [(ngModel)]="role" name="role">
              <option value="" disabled selected>Select role</option>
              <option value="Operator">Operator</option>
              <option value="Manager">Manager</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Administrator">Administrator</option>
              <option value="Assistant">Assistant</option>
              <option value="Team Lead">Team Lead</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Analyst">Analyst</option>
              <option value="Consultant">Consultant</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Intern">Intern</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Support">Support</option>
              <option value="Technician">Technician</option>
            </select>
          </div>
          <div class="actions">
            <button class="btn btn-primary" [disabled]="!name || !role">Add</button>
          </div>
        </form>
      </div>
    </section>

    <section class="card">
      <header class="card-header">
        <h2 class="card-title">Employees</h2>
        <span class="muted">{{ employees().length }} total</span>
      </header>
      <div class="card-body">
        <ul class="table">
          @for (e of employees(); track e.id) {
            <li class="row" *ngIf="editId !== e.id; else editTpl">
              <div class="cell" style="flex:1 1 0;">
                <div style="font-weight:600;">{{ e.name }}</div>
                <div class="muted">ID {{ e.id }}</div>
              </div>
              <div class="cell" style="flex:0 0 220px;">
                <span class="chip">{{ e.role }}</span>
              </div>
              <div class="cell" style="margin-left:auto; display:flex; gap:8px;">
                <button class="btn btn-ghost" (click)="startEdit(e)">Edit</button>
                <button class="btn btn-ghost danger" (click)="del(e.id)">Delete</button>
              </div>
            </li>
            <ng-template #editTpl>
              <li class="row">
                <div class="cell" style="flex:1 1 0; display:grid; gap:6px;">
                  <label class="label">Name</label>
                  <input class="input" [(ngModel)]="editName" placeholder="Name">
                </div>
                <div class="cell" style="flex:0 0 260px; display:grid; gap:6px;">
                  <label class="label">Role</label>
                  <select class="input" [(ngModel)]="editRole" name="editRole-{{e.id}}">
                    <option value="" disabled>Select role</option>
                    <option value="Operator">Operator</option>
                    <option value="Manager">Manager</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Assistant">Assistant</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Intern">Intern</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Support">Support</option>
                    <option value="Technician">Technician</option>
                  </select>
                </div>
                <div class="cell" style="margin-left:auto; display:flex; gap:8px;">
                  <button class="btn btn-primary" (click)="saveEdit(e.id)">Save</button>
                  <button class="btn btn-ghost" (click)="cancelEdit()">Cancel</button>
                </div>
              </li>
            </ng-template>
          }
        </ul>
        <p class="muted" *ngIf="!employees().length">No employees yet. Add your first one above.</p>
      </div>
    </section>
  `,
  styles: [`
    .emp-form { display: grid; grid-template-columns: 1fr 260px auto; gap: 12px; align-items: end; }
    .field { display: grid; gap: 6px; }
    .actions { display: flex; justify-content: flex-end; }
  `]
})
export class EmployeesComponent {
  employees = signal<Employee[]>([]);
  name = '';
  role = '';
  editId: number | null = null;
  editName = '';
  editRole = '';

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

  startEdit(e: Employee) {
    this.editId = e.id;
    this.editName = e.name;
    this.editRole = e.role;
  }

  cancelEdit() {
    this.editId = null;
    this.editName = '';
    this.editRole = '';
  }

  saveEdit(id: number) {
    const payload: EmployeeIn = { name: this.editName.trim(), role: this.editRole.trim() };
    if (!payload.name || !payload.role) return;
    this.api.update(id, payload).subscribe(() => {
      this.cancelEdit();
      this.load();
    });
  }
}
