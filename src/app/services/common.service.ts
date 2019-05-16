import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private baseUrl = (environment.apiUrl !== null && environment.apiUrl !== undefined) ? environment.apiUrl : 'http://localhost:90/api';
  constructor(private httpClient: HttpClient) { }
  private dataObs$ = new Subject();

  getTitle() {
    return this.dataObs$;
  }

  setTitle(title: string) {
    this.dataObs$.next(title);
  }

  get_menus(token: string) {
    return this.httpClient.get(this.baseUrl + '/menus', {
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      // }
    });
  }
}
