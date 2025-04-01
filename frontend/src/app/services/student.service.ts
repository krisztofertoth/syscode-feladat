import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Student } from '../models/student';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:3000/api/students';
  private studentsSubject = new BehaviorSubject<Student[]>([]);
  students$ = this.studentsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (this.authService.isAuthenticated()) {
      headers['Authorization'] = this.authService.getAuthorizationHeader();
    }

    return new HttpHeaders(headers);
  }

  loadStudents(): Observable<Student[]> {
    const headers = this.getHeaders();
    return this.http.get<Student[]>(this.apiUrl, { headers }).pipe(
      tap(students => this.studentsSubject.next(students))
    );
  }

  createStudent(student: Omit<Student, 'id'>): Observable<Student> {
    const headers = this.getHeaders();
    return this.http.post<Student>(this.apiUrl, student, { headers }).pipe(
      tap(() => this.loadStudents().subscribe())
    );
  }

  updateStudent(id: string, student: Partial<Student>): Observable<Student> {
    const headers = this.getHeaders();
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student, { headers }).pipe(
      tap(() => this.loadStudents().subscribe())
    );
  }

  deleteStudent(id: string): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(() => this.loadStudents().subscribe())
    );
  }
} 