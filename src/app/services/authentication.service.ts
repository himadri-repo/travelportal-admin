import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user';

const apiUrl = (environment.apiUrl !== null && environment.apiUrl !== undefined) ? environment.apiUrl : 'http://localhost:90/api';
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  public currentCompany;

  constructor(private http: HttpClient) {
    // const user = {
    //   id: 110,
    //   user_id: 'OXY007',
    //   name: 'Himadri Majumdar',
    //   profile_image: '',
    //   email: 'himadri_75@yahoo.com',
    //   mobile: '9874550200',
    //   password: 'hm28011975',
    //   is_supplier: 1,
    //   is_customer: 1,
    //   active: 1,
    //   type: 'B2C',
    //   credit_ac: 1,
    //   doj: '2019-03-16'
    // };

    // this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentuser')));
    // this.currentUserSubject = new BehaviorSubject<User>(user);
    // this.currentUser = this.currentUserSubject.asObservable();

    // this.getCurrentUser().subscribe(obsrv => {
    //   const usr = obsrv;
    // });
  }

  public get currentLoggedInUser(): User {
    // return this.currentUserSubject.value;

    return JSON.parse(localStorage.getItem('currentuser'));
  }

  public getCurrentUser(uuid) {
    // if (environment.production) {
    if (!uuid) { return; }
    const usr: User = JSON.parse(localStorage.getItem('currentuser'));
    if (usr !== null && usr !== undefined) {
      if (usr.uid === uuid) {
        return new Observable<any>(obsrv => {
          obsrv.next(usr);
          obsrv.complete();
        });
      }
    }

    if (true) {
      return this.http.get<any>(`${apiUrl}/users/currentuser/${uuid}`)
        .pipe(map(user => {
          if (user) {
            localStorage.setItem('currentuser', JSON.stringify(user));
            return user;
            // this.currentUserSubject.next(user);
          }
        }))
        .pipe(catchError(err => {
          console.log('Handling error locally and rethrowing it...', err);
          return throwError(err);
        }));
    } else {
      return new Observable<any>(observer => {
        const user = {
          id: 110,
          user_id: 'OXY007',
          name: 'Himadri Majumdar',
          profile_image: '',
          email: 'himadri_75@yahoo.com',
          mobile: '9874550200',
          password: 'hm28011975',
          is_supplier: 1,
          is_customer: 1,
          active: 1,
          type: 'B2C',
          credit_ac: 1,
          doj: '2019-03-16',
          companyid: 4,
          created_by: 0,
          created_on: '2019-04-26 09:34:58',
          updated_by: null,
          updated_on: null,
          permission: 4294967295,
          is_admin: 1
        };
        localStorage.setItem('currentUser', JSON.stringify(user));

        observer.next(user);
        observer.complete();
      });
    }
  }

  public getCompany(companyid) {
    const url = `${apiUrl}/company/${companyid}`;
    return this.http.get<any>(url).pipe(map(company => {
      if (company) {
        localStorage.setItem('currentcompany', JSON.stringify(company));
        this.currentCompany = company;
        return company;
      }
    }));
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/login`, {username, password})
      .pipe(map(user => {
        if (user && user.token) {
          localStorage.setItem('currentuser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      }));
  }

  logout() {
    localStorage.removeItem('currentuser');
    localStorage.removeItem('currentcompany');
    this.currentUserSubject.next(null);
  }
}
