import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, AnalyticsItem, AnalyticsResponse } from '../../core/analytics.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Summary / Analytics</h1>

    <form (submit)="apply($event)" class="filters">
      <label>Start:
        <input type="date" [(ngModel)]="start" name="start">
      </label>
      <label>End:
        <input type="date" [(ngModel)]="end" name="end">
      </label>
      <button>Apply</button>
      <button type="button" (click)="clear()">Clear</button>
    </form>

    <p><strong>Total shifts (all employees):</strong> {{ data()?.total_shifts_all ?? 0 }}</p>

    <table>
      <thead>
        <tr>
          <th>Employee</th>
          <th>Total Shifts</th>
        </tr>
      </thead>
      <tbody>
        @for (row of data()?.items ?? []; track row.employee_id) {
          <tr>
            <td>{{ row.employee_name }} (ID {{ row.employee_id }})</td>
            <td>{{ row.total_shifts }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: [`
    .filters { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    thead { background: #f5f5f5; }
  `],
})
export class SummaryComponent {
  data = signal<AnalyticsResponse | null>(null);

  start = '';
  end = '';

  constructor(private api: AnalyticsService) {
    this.load();
  }

  load() {
    const s = this.start || undefined;
    const e = this.end || undefined;
    this.api.get(s, e).subscribe((res) => this.data.set(res));
  }

  apply(evt: Event) {
    evt.preventDefault();
    this.load();
  }

  clear() {
    this.start = '';
    this.end   = '';
    this.load();
  }
}