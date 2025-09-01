import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Input payload for creating/updating a schedule
export type ScheduleIn = {
  employee_id: number;
  date: string;   
  shift: string;
  note?: string;
};

export type Schedule = ScheduleIn & { id: number };

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // List schedules optionally filtered by date range (inclusive).
  list(start?: string, end?: string): Observable<Schedule[]> {
    const params: any = {};
    if (start) params.start = start;
    if (end)   params.end = end;
    return this.http.get<Schedule[]>(`${this.baseUrl}/schedule`, { params });
  }

  // Create a new schedule row
  create(payload: ScheduleIn): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.baseUrl}/schedule`, payload);
  }

  // Update an existing schedule row
  update(id: number, payload: ScheduleIn): Observable<Schedule> {
    return this.http.put<Schedule>(`${this.baseUrl}/schedule/${id}`, payload);
  }

  // Delete a schedule row by id
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/schedule/${id}`);
  }
}
