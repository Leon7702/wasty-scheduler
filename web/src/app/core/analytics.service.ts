import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Shape of a single analytics row returned by the backend
export type AnalyticsItem = {
  employee_id: number;
  employee_name: string;
  total_shifts: number;
};

// Full analytics response (list + overall total)
export type AnalyticsResponse = {
  items: AnalyticsItem[];
  total_shifts_all: number;
};

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  // API root; consider moving to Angular environments for easy switching
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // GET analytics, optionally filtered by start/end date
  get(start?: string, end?: string): Observable<AnalyticsResponse> {
    let params = new HttpParams();
    if (start) params = params.set('start', start);
    if (end)   params = params.set('end', end);
    return this.http.get<AnalyticsResponse>(`${this.baseUrl}/analytics`, { params });
  }
}
