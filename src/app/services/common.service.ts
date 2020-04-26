import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { Company } from '../models/company';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private baseUrl = (environment.apiUrl !== null && environment.apiUrl !== undefined) ? environment.apiUrl : 'http://localhost:90/api';
  constructor(private httpClient: HttpClient) { }
  private dataObs$ = new Subject();
  private authenticated = new Subject();
  private company: Company;

  getTitle() {
    return this.dataObs$;
  }

  setTitle(title: string) {
    try
    {
      setTimeout(() => {
        this.dataObs$.next(title);
      });
    }
    catch(ex) {
      console.log(`Error => ${ex.message}`);
    }
  }

  getAuthenticated() {
    return this.authenticated;
  }

  setAuthenticated(payload: any) {
    if (payload !== null && payload.company !== null && payload.company !== '') {
      this.company = payload.company;
    }
    return this.authenticated.next(this.company);
  }

  get_menus(token: string) {
    return this.httpClient.get(this.baseUrl + '/menus', {
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      // }
    });
  }
}
