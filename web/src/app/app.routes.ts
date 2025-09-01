import { Routes } from '@angular/router';
import { EmployeesComponent } from './features/employees/employees.component';
import { ScheduleComponent } from './features/schedule/schedule.component';
import { SummaryComponent } from './features/summary/summary.component';

export const routes: Routes = [
  { path: 'employees', component: EmployeesComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'summary', component: SummaryComponent },
  { path: '', redirectTo: 'employees', pathMatch: 'full' }
];