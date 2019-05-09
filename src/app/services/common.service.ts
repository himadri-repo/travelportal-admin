import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private baseUrl = 'http://localhost:90/api';
  constructor(private httpClient: HttpClient) { }

  get_menus(token: string) {
    return this.httpClient.get(this.baseUrl + '/menus', {
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      // }
    });
  }
}
