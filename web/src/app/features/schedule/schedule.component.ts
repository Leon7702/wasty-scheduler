import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulesService, Schedule, ScheduleIn } from '../../core/schedules.service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Schedule</h1>

    <form (submit)="add($event)">
      <input type="date" [(ngModel)]="date" name="date">
      <input placeholder="Shift" [(ngModel)]="shift" name="shift">
      <input placeholder="Note" [(ngModel)]="note" name="note">
      <input placeholder="Employee ID" type="number" [(ngModel)]="employeeId" name="employeeId">
      <button>Add</button>
    </form>

    <ul>
      @for (s of schedules(); track s.id) {
        <li>
          {{s.date}} — {{s.shift}} (Emp {{s.employee_id}}) {{s.note}}
          <button (click)="del(s.id)">Delete</button>
        </li>
      }
    </ul>
  `,
})
export class ScheduleComponent {
  schedules = signal<Schedule[]>([]);
  date = '';
  shift = '';
  note = '';
  employeeId!: number;

  constructor(private api: SchedulesService) {
    this.load();
  }

  load() {
    this.api.list().subscribe((data) => this.schedules.set(data));
  }

  add(evt: Event) {
    evt.preventDefault();
    if (!this.date || !this.shift || !this.employeeId) return;
    const payload: ScheduleIn = {
      date: this.date,
      shift: this.shift,
      note: this.note,
      employee_id: this.employeeId,
    };
    this.api.create(payload).subscribe(() => {
      this.date = ''; this.shift = ''; this.note = ''; this.employeeId = 0;
      this.load();
    });
  }

  del(id: number) {
    this.api.remove(id).subscribe(() => this.load());
  }
}