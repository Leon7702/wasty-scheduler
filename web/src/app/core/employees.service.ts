// bridge between the API and the Angular UI
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Employee = { id: number; name: string; role: string };
export type EmployeeIn = { name: string; role: string };

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private baseUrl = 'http://localhost:8000'; // API root

  constructor(private http: HttpClient) {}

  // GET a list of employees
  list(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees`);
  }

  // POST a new employee
  create(payload: EmployeeIn): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/employees`, payload);
  }

  // PUT (update) an existing employee
  update(id: number, payload: EmployeeIn): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/employees/${id}`, payload);
  }

  // DELETE an existing employee
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/employees/${id}`);
  }
}