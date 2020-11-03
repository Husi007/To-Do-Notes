import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {Todo, User} from '../../models';
import {TO_DO} from '../../helpers/constants/todo';

@Injectable({providedIn: 'root'})
export class AccountService {
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;
  public todoTasks: Array<Todo> = TO_DO;
  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  login(username, password): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/authenticate`, {username, password})
      .pipe(map(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
        return user;
      }));
  }

  logout(): void {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  register(user: User): Observable<any> {
    user.todo = this.todoTasks;
    return this.http.post(`${environment.apiUrl}/users/register`, user);
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  update(id, params): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/${id}`, params)
      .pipe(map(x => {
        if (id === this.userValue.id) {
          const user = {...this.userValue, ...params};
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        }
        return x;
      }));
  }

  delete(id: number): Observable<object> {
    return this.http.delete(`${environment.apiUrl}/users/${id}`)
      .pipe(map(element => {
        if (id === this.userValue.id) {
          this.logout();
        }
        return element;
      }));
  }

  currentUser(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/getCurrentUser`);
  }
}
