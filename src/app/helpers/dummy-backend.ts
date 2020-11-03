import { Injectable } from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, dematerialize, materialize, mergeMap } from 'rxjs/operators';
import { User } from '../models/user';

let users: User[] = JSON.parse(localStorage.getItem('users')) || [];

@Injectable()
export class DummyBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize())
      .pipe(delay(500))
      .pipe(dematerialize());

    function handleRoute(): Observable<any> {
      switch (true) {
        case url.endsWith('/users/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/users/register') && method === 'POST':
          return register();
        case url.endsWith('/users') && method === 'GET':
          return getUsers();
        case url.endsWith('/getCurrentUser') && method === 'GET':
          return getCurrentUser();
        case url.match(/\/users\/\d+$/) && method === 'GET':
          return getUserById();
        case url.match(/\/users\/\d+$/) && method === 'PUT':
          return updateUser();
        case url.match(/\/todo\/\d+$/) && method === 'PUT':
          return updateUser();
        case url.match(/\/users\/\d+$/) && method === 'DELETE':
          return deleteUser();
        default:
          return next.handle(request);
      }
    }

    function authenticate(): Observable<any> {
      const { username, password } = body;
      const user = users.find(element => element.username === username && element.password === password);
      if (!user) {
        return error('Username or password is incorrect');
      }
      return success({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        todo: user.todo,
        token: 'fake-jwt-token'
      });
    }

    function register(): Observable<any> {
      const user = body;

      if (users.find(element => element.username === user.username)) {
        return error('Username "' + user.username + '" is already taken');
      }

      user.id = users.length ? Math.max(...users.map(element => element.id)) + 1 : 1;
      users.push(user);
      localStorage.setItem('users', JSON.stringify(users));
      return success();
    }

    function getUsers(): Observable<any> {
      if (!isLoggedIn()) {
        return unauthorized();
      }
      return success(users);
    }

    function getCurrentUser(): Observable<any> {
      if (!isLoggedIn()) {
        return unauthorized();
      }
      return success(JSON.parse(localStorage.getItem('user')));
    }

    function getUserById(): Observable<any> {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      const user = users.find(x => x.id === idFromUrl());
      return success(user);
    }

    function updateUser(): Observable<any> {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      const params = body;
      const user = users.find(element => element.id === idFromUrl());

      if (!params.password) {
        delete params.password;
      }

      Object.assign(user, params);
      localStorage.setItem('users', JSON.stringify(users));

      return success({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        todo: user.todo,
        token: 'fake-jwt-token'
      });
    }

    function deleteUser(): Observable<any> {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      users = users.filter(element => element.id !== idFromUrl());
      localStorage.setItem('users', JSON.stringify(users));
      return success();
    }

    function success(response?: any): Observable<any> {
      return of(new HttpResponse({ status: 200, body: response }));
    }

    function error(message): Observable<never> {
      return throwError({ error: { message } });
    }

    function unauthorized(): Observable<never> {
      return throwError({ status: 401, error: { message: 'Unauthorised' } });
    }

    function isLoggedIn(): boolean {
      return headers.get('Authorization') === 'Bearer fake-jwt-token';
    }

    function idFromUrl(): number {
      const urlParts = url.split('/');
      return parseInt(urlParts[urlParts.length - 1], 10);
    }
  }
}

export const DummyBackendProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: DummyBackendInterceptor,
  multi: true
};
