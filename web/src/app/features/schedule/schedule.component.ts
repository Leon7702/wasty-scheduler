import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SchedulesService, Schedule, ScheduleIn } from '../../core/schedules.service';
import { EmployeesService, Employee } from '../../core/employees.service';

type CellShift = Schedule & { employee_name?: string };

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <section class="card">
        <header class="card-header">
          <div class="toolbar">
            <div class="nav">
              <button class="btn btn-ghost" (click)="prev()">«</button>
              <button class="btn btn-ghost" (click)="today()">Today</button>
              <button class="btn btn-ghost" (click)="next()">»</button>
            </div>

            <div class="view">
              <select class="input" [(ngModel)]="viewMode" (ngModelChange)="refreshView()">
                <option value="month">Month</option>
                <option value="week">Week</option>
              </select>
              <strong>{{ title }}</strong>
            </div>
          </div>
          <div class="legend">
            <span class="legend-item"><span class="cal-chip is-day"></span> Day</span>
            <span class="legend-item"><span class="cal-chip is-morning"></span> Morning</span>
            <span class="legend-item"><span class="cal-chip is-afternoon"></span> Afternoon</span>
            <span class="legend-item"><span class="cal-chip is-evening"></span> Evening</span>
            <span class="legend-item"><span class="cal-chip is-night"></span> Night</span>
          </div>
        </header>

        <div class="card-body">
          <!-- Calendar Headers -->
          <div class="cal-grid cal-head">
            <div class="cal-cell head" *ngFor="let d of weekDays">{{ d }}</div>
          </div>

          <!-- Month View -->
          <div class="cal-grid cal-body" *ngIf="viewMode==='month'">
            <div
              class="cal-cell"
              [class.other-month]="d.getMonth() !== currentMonth"
              [class.today]="isToday(d)"
              *ngFor="let d of calendarDates"
            >
              <div class="cal-cell-head">
                <button type="button" class="add-btn" title="Add shift" (click)="$event.stopPropagation(); openModalForDate(d)">+</button>
                <div class="cal-date" [class.is-today]="isToday(d)">{{ d.getDate() }}</div>
              </div>
              <div class="cal-items">
                <div class="cal-item" title="Edit shift" role="button" *ngFor="let s of getShiftsForDate(d)" (click)="$event.stopPropagation(); openModalForExisting(s)">
                  <span class="avatar">{{ getInitials(s.employee_name) }}</span>
                  <span class="cal-chip" [ngClass]="shiftClass(s.shift)">{{ s.shift }}</span>
                  <span class="cal-note" *ngIf="s.note">{{ s.note }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Week View -->
          <div class="cal-grid cal-body" *ngIf="viewMode==='week'">
            <div
              class="cal-cell"
              [class.today]="isToday(d)"
              *ngFor="let d of weekDates"
            >
              <div class="cal-cell-head">
                <button type="button" class="add-btn" title="Add shift" (click)="$event.stopPropagation(); openModalForDate(d)">+</button>
                <div class="cal-date" [class.is-today]="isToday(d)">{{ d.getDate() }}</div>
              </div>
              <div class="cal-items">
                <div class="cal-item" title="Edit shift" role="button" *ngFor="let s of getShiftsForDate(d)" (click)="$event.stopPropagation(); openModalForExisting(s)">
                  <span class="avatar">{{ getInitials(s.employee_name) }}</span>
                  <span class="cal-chip" [ngClass]="shiftClass(s.shift)">{{ s.shift }}</span>
                  <span class="cal-note" *ngIf="s.note">{{ s.note }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Inline Modal -->
      <div class="editor-backdrop" *ngIf="modalOpen" (click)="closeModal()"></div>
      <div class="editor-panel" *ngIf="modalOpen" (click)="$event.stopPropagation()">
        <header class="editor-header">
          <h3 class="title">{{ editing ? 'Edit shift' : 'Schedule shift' }}</h3>
          <button class="btn btn-ghost" (click)="closeModal()">✕</button>
        </header>

        <div class="editor-body">
          <div class="muted" style="margin-bottom:6px"><strong>Date:</strong> {{ selectedDate | date:'fullDate' }}</div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <div class="field">
              <label class="label">Employee</label>
              <select class="input" formControlName="employee_id" (change)="maybeDefaultRole()">
                <option value="">Select employee</option>
                <option *ngFor="let e of employees()" [value]="e.id">{{ e.name }} ({{ e.role }})</option>
              </select>
            </div>

            <div class="field">
              <label class="label">Shift</label>
              <select class="input" formControlName="shift">
                <option value="">Select shift</option>
                <option>Day</option>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
                <option>Night</option>
              </select>
            </div>

            <div class="field">
              <label class="label">Role for this shift</label>
              <select class="input" formControlName="role_for_shift">
                <option value="">Select role</option>
                <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
              </select>
            </div>

            <div class="field">
              <label class="label">Note (optional)</label>
              <input class="input" formControlName="note" placeholder="e.g., covering morning shift">
            </div>

            <div class="actions">
              <button type="button" class="btn btn-ghost danger" *ngIf="editing" (click)="deleteShift()">Delete</button>
              <button type="submit" class="btn btn-primary" [disabled]="!form.valid">{{ editing ? 'Update' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>

      <section class="card">
        <header class="card-header">
          <h2 class="section-title">Shifts</h2>
        </header>
        <div class="card-body">
          <ul class="table">
            @for (s of schedules(); track s.id) {
              <li class="row">
                <div class="cell date">
                  <div class="name-text">{{ formatDateDMY(s.date) }}</div>
                  <div class="muted">Date</div>
                </div>
                <div class="cell shift"><span class="chip" [ngClass]="shiftClass(s.shift)">{{ s.shift }}</span></div>
                <div class="cell emp">
                  <div class="name-text">{{ employeeName(s.employee_id) || ('Emp ' + s.employee_id) }}</div>
                  <div class="muted">Employee</div>
                </div>
                <div class="cell note"><div class="muted">{{ s.note || '—' }}</div></div>
                <div class="cell actions-col">
                  <button class="btn btn-ghost" (click)="openModalForExisting(s)">Edit</button>
                  <button class="btn btn-ghost danger" (click)="del(s.id)">Delete</button>
                </div>
              </li>
            }
          </ul>
          <p class="empty" *ngIf="!schedules().length">No shifts yet. Click a calendar cell to add one.</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .page { max-width: 1000px; margin: 0 auto; padding: 16px; display: grid; gap: 16px; }
    .toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .nav { display:flex; gap:8px; }
    .view { display:flex; gap:8px; align-items:center; }

    .legend { display:flex; gap:12px; flex-wrap:wrap; margin-top:8px; }
    .legend-item { display:flex; align-items:center; gap:6px; color:#6b7280; font-size:12px; }
    .legend .cal-chip { width: 10px; height: 10px; padding:0; display:inline-block; border-radius:999px; }

    .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:8px; }
    .cal-cell { min-height:120px; border:1px solid #e5e7eb; border-radius:10px; padding:6px; background:#fff; cursor:pointer; transition:background .12s ease, border-color .12s ease, box-shadow .12s ease; display:grid; grid-template-rows:auto 1fr; }
    .cal-cell.head { background:#f8fafc; border:1px solid #eef2f7; text-align:center; font-weight:600; min-height:auto; padding:8px; }
    .cal-cell:hover { background:#f9fafb; border-color:#d1d5db; box-shadow:0 1px 0 rgba(0,0,0,0.02); }
    .cal-cell.other-month { opacity:.55; }
    .cal-cell.today { box-shadow: inset 0 0 0 2px #2563eb44; }
    .cal-cell-head { display:flex; align-items:center; justify-content:space-between; }
    .add-btn { width:20px; height:20px; padding:0; border:1px solid #e5e7eb; border-radius:6px; background:#fff; color:#6b7280; font-size:14px; line-height:18px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; }
    .add-btn:hover { background:#f3f4f6; }
    .cal-date { width:24px; height:24px; line-height:24px; text-align:center; border-radius:999px; font-size:12px; color:#6b7280; }
    .cal-date.is-today { background:#2563eb; color:#fff; font-weight:700; }
    .cal-items { display:grid; gap:6px; }
    .cal-item { display:flex; align-items:center; justify-content:center; gap:8px; padding:3px 6px; border-radius:6px; cursor:pointer; transition: background .12s ease; }
    .cal-item:hover { background:#f3f4f6; }
    .avatar { width:18px; height:18px; line-height:18px; border-radius:50%; background:#f3f4f6; border:1px solid #e5e7eb; text-align:center; font-size:10px; color:#475569; font-weight:700; }
    /* name removed from UI; keep layout compact */
    .cal-note { font-size:11px; color:#6b7280; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cal-chip { display:inline-block; padding:2px 8px; border-radius:999px; background:#eef2ff; color:#3730a3; font-size:11px; font-weight:700; }
    .cal-chip.is-morning { background:#FEF3C7; color:#92400E; }
    .cal-chip.is-day { background:#DCFCE7; color:#166534; }
    .cal-chip.is-afternoon { background:#FFEDD5; color:#9A3412; }
    .cal-chip.is-evening { background:#DBEAFE; color:#1E40AF; }
    .cal-chip.is-night { background:#EDE9FE; color:#5B21B6; }
    .chip.is-morning { background:#FEF3C7; color:#92400E; }
    .chip.is-day { background:#DCFCE7; color:#166534; }
    .chip.is-afternoon { background:#FFEDD5; color:#9A3412; }
    .chip.is-evening { background:#DBEAFE; color:#1E40AF; }
    .chip.is-night { background:#EDE9FE; color:#5B21B6; }

    .form-grid { display:grid; gap:12px; }
    .field { display:grid; gap:6px; }
    .actions { display:flex; justify-content:flex-end; gap:8px; margin-top:6px; }

    .cell.id { flex:0 0 80px; color:#6b7280; font-variant-numeric:tabular-nums; }
    .cell.date { flex:1 1 0; }
    .cell.shift { flex:0 0 180px; }
    .cell.emp { flex:0 0 160px; }
    .cell.note { flex:1 1 0; }
    .cell.actions-col { flex:0 0 200px; display:flex; justify-content:flex-end; gap:8px; }

    .editor-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.25); z-index:1000; }
    .editor-panel { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:min(520px, calc(100% - 32px)); background:#fff; border-radius:12px; border:1px solid #e5e7eb; box-shadow:0 12px 40px rgba(0,0,0,.18); z-index:1001; display:grid; grid-template-rows:auto 1fr; }
    .editor-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #f1f5f9; }
    .editor-body { padding:16px; }
  `]
})
export class ScheduleComponent implements OnInit {
 
  employees = signal<Employee[]>([]);
  schedules = signal<Schedule[]>([]);

  viewMode: 'month' | 'week' = 'month';
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  calendarDates: Date[] = [];
  weekDates: Date[] = [];
  weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  viewDate: Date = new Date();

  // Modal + form state for the inline editor
  modalOpen = false;
  selectedDate: Date | null = null;
  editing: CellShift | null = null;
  form: FormGroup;

  roles = [
    'Operator','Manager','Supervisor','Administrator','Assistant','Team Lead',
    'Developer','Designer','Analyst','Consultant','Coordinator','Intern','HR',
    'Finance','Marketing','Sales','Support','Technician'
  ];

  constructor(
    private api: SchedulesService,
    private empApi: EmployeesService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      employee_id: ['', Validators.required],
      shift: ['', Validators.required],
      role_for_shift: [''],
      note: [''],
    });
  }

  // Initial data load: employees + current month
  ngOnInit() {
    this.empApi.list().subscribe(e => this.employees.set(e));
    this.generateMonth();
    this.loadRange();
  }

  // title for the current month/week
  get title(): string {
    const m = this.currentMonth;
    const y = this.currentYear;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if (this.viewMode==='month') return `${months[m]} ${y}`;
    const [start, end] = this.computeWeekRange(new Date(y, m, this.currentDate.getDate()));
    return `${months[start.getMonth()]} ${start.getDate()} – ${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  }

  // Go to previous month/week and reload
  prev() {
    if (this.viewMode==='month') {
      this.currentMonth--; if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
      this.generateMonth(); this.loadRange();
    } else {
      const monday = this.weekDates[0] ?? this.computeWeekRange(this.currentDate)[0];
      const prevWeek = new Date(monday); prevWeek.setDate(prevWeek.getDate() - 7);
      this.generateWeek(prevWeek); this.loadRange();
    }
  }
  // Go to next month/week and reload 
  next() {
    if (this.viewMode==='month') {
      this.currentMonth++; if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
      this.generateMonth(); this.loadRange();
    } else {
      const monday = this.weekDates[0] ?? this.computeWeekRange(this.currentDate)[0];
      const nextWeek = new Date(monday); nextWeek.setDate(nextWeek.getDate() + 7);
      this.generateWeek(nextWeek); this.loadRange();
    }
  }
  //Jump to today for the active view and reload
  today() {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    if (this.viewMode==='month') { this.generateMonth(); } else { this.generateWeek(this.currentDate); }
    this.loadRange();
  }

  // Rebuild grid when switching view mode and refresh data
  refreshView() {
    if (this.viewMode==='month') this.generateMonth();
    else this.generateWeek(this.currentDate);
    this.loadRange();
  }

  // Build a full month grid
  generateMonth() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay  = new Date(this.currentYear, this.currentMonth + 1, 0);
    const start = new Date(firstDay); start.setDate(start.getDate() - ((firstDay.getDay() + 6) % 7)); // Monday start
    const end   = new Date(lastDay);  end.setDate(end.getDate() + (6 - ((lastDay.getDay() + 6) % 7)));
    this.calendarDates = [];
    const cur = new Date(start);
    while (cur <= end) {
      this.calendarDates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    // also prepare the current week dates
    this.weekDates = this.computeWeek(this.currentDate);
  }

  // Build a 7-day week based on a reference date
  generateWeek(ref: Date) {
    this.weekDates = this.computeWeek(ref);
    this.currentDate = new Date(ref);
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  computeWeek(ref: Date): Date[] {
    const [start, end] = this.computeWeekRange(ref);
    const days: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }

  // Compute Monday–Sunday range for a reference date
  computeWeekRange(ref: Date): [Date, Date] {
    const mondayOffset = ((ref.getDay() + 6) % 7);
    const start = new Date(ref); start.setDate(ref.getDate() - mondayOffset);
    const end   = new Date(start); end.setDate(start.getDate() + 6);
    return [start, end];
  }

  // True if d matches today in local time
  isToday(d: Date) {
    const t = new Date();
    return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate();
  }

  // Fetch schedules for the inclusive visible range
  loadRange() {
    const start = this.viewMode==='month'
      ? new Date(this.currentYear, this.currentMonth, 1)
      : (this.weekDates[0] ?? this.computeWeekRange(this.currentDate)[0]);
    const end = this.viewMode==='month'
      ? new Date(this.currentYear, this.currentMonth + 1, 0)
      : (this.weekDates[6] ?? this.computeWeekRange(this.currentDate)[1]);

    const startIso = this.isoLocal(start);
    const endIso   = this.isoLocal(end);

    this.api.list(startIso, endIso).subscribe(rows => {
      this.schedules.set(rows);
    });
  }

  private pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
  // Build YYYY-MM-DD from local date parts 
  private isoLocal(d: Date) { return `${d.getFullYear()}-${this.pad(d.getMonth()+1)}-${this.pad(d.getDate())}`; }

  // Map and sort shifts for a given day 
  getShiftsForDate(d: Date): CellShift[] {
    const iso = this.isoLocal(d);
    const items = this.schedules().filter(s => s.date === iso);
    const mapped = items.map(s => ({
      ...s,
      employee_name: this.employees().find(e => e.id === s.employee_id)?.name
    }));
    const order: Record<string, number> = { day: 0, morning: 1, afternoon: 2, evening: 3, night: 4 };
    return mapped.sort((a, b) => {
      const pa = order[(a.shift || '').toLowerCase()] ?? 99;
      const pb = order[(b.shift || '').toLowerCase()] ?? 99;
      if (pa !== pb) return pa - pb;
      const na = (a.employee_name || '').toLowerCase();
      const nb = (b.employee_name || '').toLowerCase();
      if (na !== nb) return na.localeCompare(nb);
      return a.employee_id - b.employee_id;
    });
  }

  // presentation helpers
  shiftClass(shift: string): string {
    const s = (shift || '').toLowerCase();
    return ['day','morning','afternoon','evening','night'].includes(s) ? `is-${s}` : '';
    }

  getInitials(name?: string | null): string {
    if (!name) return 'E';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // helpers for list rendering
  formatDateDMY(iso: string): string {
    // iso is YYYY-MM-DD -> return DD-MM-YYYY
    const [y, m, d] = iso.split('-');
    return `${d}-${m}-${y}`;
  }
  employeeName(id: number): string | undefined {
    return this.employees().find(e => e.id === id)?.name;
  }

  // Open modal for creating a shift on date d
  openModalForDate(d: Date) {
    this.selectedDate = d;
    this.editing = null;
    this.form.reset();
    this.modalOpen = true;
  }
  // Open modal populated with an existing shift
  openModalForExisting(s: Schedule) {
    this.selectedDate = new Date(s.date + 'T00:00:00');
    this.editing = s;
    this.form.reset({
      employee_id: s.employee_id,
      shift: s.shift,
      role_for_shift: '', // UI-only; default below
      note: s.note || ''
    });
    this.maybeDefaultRole();
    this.modalOpen = true;
  }
  // Close modal and clear selection/edit state
  closeModal() {
    this.modalOpen = false;
    this.selectedDate = null;
    this.editing = null;
    this.form.reset();
  }

  // Default role_for_shift to the employee's role when empty
  maybeDefaultRole() {
    const eid = this.form.value.employee_id;
    if (!eid) return;
    if (!this.form.value.role_for_shift) {
      const emp = this.employees().find(e => e.id === +eid);
      if (emp) this.form.patchValue({ role_for_shift: emp.role }, { emitEvent: false });
    }
  }

  // Submit handler: create vs update based on editing state
  onSubmit() {
    if (!this.form.valid || !this.selectedDate) return;
    if (this.editing) this.updateShift();
    else this.createShift();
  }

  // Create a new shift then refresh range
  createShift() {
    const payload: ScheduleIn = {
      date: this.isoLocal(this.selectedDate!),
      employee_id: +this.form.value.employee_id,
      shift: this.form.value.shift,
      note: this.form.value.note || undefined,
    };
    this.api.create(payload).subscribe(() => {
      this.closeModal();
      this.loadRange();
    });
  }

  // Update existing shift then refresh range
  updateShift() {
    if (!this.editing) return;
    const payload: ScheduleIn = {
      date: this.isoLocal(this.selectedDate!),
      employee_id: +this.form.value.employee_id,
      shift: this.form.value.shift,
      note: this.form.value.note || undefined,
    };
    this.api.update(this.editing.id, payload).subscribe(() => {
      this.closeModal();
      this.loadRange();
    });
  }

  // Delete existing shift then refresh range
  deleteShift() {
    if (!this.editing) return;
    this.api.remove(this.editing.id).subscribe(() => {
      this.closeModal();
      this.loadRange();
    });
  }

  // Delete a shift by id from the list view
  del(id: number) {
    this.api.remove(id).subscribe(() => this.loadRange());
  }
}
