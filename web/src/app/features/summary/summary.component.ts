import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, AnalyticsItem, AnalyticsResponse } from '../../core/analytics.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card" style="margin-bottom: 16px;">
      <header class="card-header">
        <h2 class="card-title">Analytics</h2>
        <div class="muted">Quick summary of shifts</div>
      </header>
      <div class="card-body">
        <form (submit)="apply($event)" class="filters">
          <div class="field">
            <label class="label">Start</label>
            <input class="input" type="date" [(ngModel)]="start" name="start">
          </div>
          <div class="field">
            <label class="label">End</label>
            <input class="input" type="date" [(ngModel)]="end" name="end">
          </div>
          <div class="actions">
            <button class="btn btn-primary">Apply</button>
            <button class="btn btn-ghost" type="button" (click)="clear()">Clear</button>
          </div>
        </form>

        <p><strong>Total shifts (all employees):</strong> {{ data()?.total_shifts_all ?? 0 }}</p>
      </div>
    </section>

    <section class="card">
      <header class="card-header">
        <h3 class="card-title">Shifts per Employee</h3>
      </header>
      <div class="card-body">
        <table class="sum-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Total Shifts</th>
            </tr>
          </thead>
          <tbody>
            @for (row of data()?.items ?? []; track row.employee_id) {
              <tr>
                <td>{{ row.employee_name }} <span class="muted">(ID {{ row.employee_id }})</span></td>
                <td style="font-variant-numeric: tabular-nums;">{{ row.total_shifts }}</td>
              </tr>
            }
          </tbody>
        </table>
        <p class="muted" *ngIf="!(data()?.items?.length)">No data for the selected range.</p>
      </div>
    </section>
  `,
  styles: [`
    .filters { display: grid; grid-template-columns: repeat(2, 1fr) auto; gap: 12px; align-items: end; margin-bottom: 0.5rem; }
    .field { display: grid; gap: 6px; }
    .actions { display: flex; gap: 8px; }
    .sum-table { border-collapse: collapse; width: 100%; }
    .sum-table th, .sum-table td { border: 1px solid #eef2f7; padding: 10px; text-align: left; }
    .sum-table thead { background: #f8fafc; }
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
