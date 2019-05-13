import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Wholesaler } from '../models/wholesaler';
import { Supplier } from '../models/supplier';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = (environment.apiUrl !== null && environment.apiUrl !== undefined) ? environment.apiUrl : 'http://localhost:90/api';

  constructor(private httpClient: HttpClient) { }

  public getSuppliersByCompany(companyid): any {
    return this.httpClient.post<Supplier[]>(this.baseUrl + '/suppliers', {companyid});
  }

  public getWholesalersByCompany(companyid): any {
    return this.httpClient.post<Wholesaler[]>(this.baseUrl + '/wholesalers', {companyid});
  }
}