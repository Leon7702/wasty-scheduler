import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ScheduleIn = {
  employee_id: number;
  date: string;   // date format "YYYY-MM-DD"
  shift: string;
  note?: string;
};

export type Schedule = ScheduleIn & { id: number };

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  list(start?: string, end?: string): Observable<Schedule[]> {
  const params: any = {};
  if (start) params.start = start;
  if (end)   params.end = end;
  return this.http.get<Schedule[]>(`${this.baseUrl}/schedule`, { params });
}

  create(payload: ScheduleIn): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.baseUrl}/schedule`, payload);
  }

  update(id: number, payload: ScheduleIn): Observable<Schedule> {
    return this.http.put<Schedule>(`${this.baseUrl}/schedule/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/schedule/${id}`);
  }
}