import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private baseUrl = (environment.apiUrl !== null && environment.apiUrl !== undefined) ? environment.apiUrl : 'http://localhost:90/api';
  constructor(private httpClient: HttpClient) { }

  get_menus(token: string) {
    return this.httpClient.get(this.baseUrl + '/menus', {
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      // }
    });
  }
}
