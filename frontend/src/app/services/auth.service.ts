import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly DEFAULT_USERNAME = 'admin';
  private readonly DEFAULT_PASSWORD = 'admin123';
  private tokenSubject = new BehaviorSubject<string | null>(null);
  isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor() {
    const storedAuth = localStorage.getItem('basicAuth');
    
    if (!storedAuth || storedAuth.trim() === '') {
      this.isAuthenticated$.next(false);
    } else {
      this.tokenSubject.next(storedAuth);
      this.isAuthenticated$.next(true);
    }
  }
  

  login(username: string, password: string): void {
    const basicAuth = btoa(`${username}:${password}`);
    setTimeout(() => {
      localStorage.setItem('basicAuth', basicAuth);
      this.tokenSubject.next(basicAuth);
      this.isAuthenticated$.next(true);
    });
  }

  logout(): void {
    localStorage.removeItem('basicAuth'); //  Token törlése
    this.tokenSubject.next(null); //Token nullázása
    this.isAuthenticated$.next(false);
    window.location.reload();
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticated$.value;
  }

  getAuthorizationHeader(): string {
    return `Basic ${this.getToken()}`;
  }
} 