import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { User } from '../models/user';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl = (environment.apiUrl !== null && environment.apiUrl !== undefined) ? environment.apiUrl : 'http://localhost:90/api';

  constructor(private httpClient: HttpClient) { }

  public getUsersByCompany(companyid): any {
    return this.httpClient.post<User[]>(this.baseUrl + '/users', {companyid});
  }
}
