import { Routes } from '@angular/router';
// Update the import path below to the correct location of EmployeesComponent
import { EmployeesComponent } from './features/employees/employees.component';
import { ScheduleComponent } from './features/schedule/schedule.component';
import { SummaryComponent } from './features/summary/summary.component';

export const routes: Routes = [
  { path: '', component: EmployeesComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'summary', component: SummaryComponent },
];