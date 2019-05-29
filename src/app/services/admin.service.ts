import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Wholesaler } from '../models/wholesaler';
import { Supplier } from '../models/supplier';
import { Customer } from '../models/customer';
import { Company } from '../models/company';
import { Communication } from '../models/communication';
import { CommnucationDetail } from '../models/communication_details';

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

  public getCustomersByCompany(companyid): any {
    return this.httpClient.post<Customer[]>(this.baseUrl + '/customers', {companyid});
  }

  public getCustomerById(companyid, customerid): any {
    return this.httpClient.get(this.baseUrl + `/customer/${companyid}/${customerid}`);
  }

  public getTicketsByCompany(companyid): any {
    return this.httpClient.post<Customer[]>(this.baseUrl + '/tickets', {companyid});
  }

  public searchWholesalers(): any {
    return this.httpClient.post<Company[]>(this.baseUrl + '/admin/wholesalers', {});
  }

  public searchSuppliers(): any {
    return this.httpClient.post<Company[]>(this.baseUrl + '/admin/suppliers', {});
  }

  public getCommunications(inviteeid, invitorid): any {
    return this.httpClient.post<Communication[]>(this.baseUrl + '/admin/communications', {inviteeid, invitorid});
  }

  public getCommunicationDetails(communicationid): any {
    return this.httpClient.get<CommnucationDetail[]>(this.baseUrl + `/admin/communications/${communicationid}`);
  }

  public getMessages(boxtype, communicationid): any {
    if (boxtype === 'inbox') {
      return this.httpClient.get<CommnucationDetail[]>(this.baseUrl + `/admin/messages/inbox/${communicationid}`);
    } else if (boxtype === 'outbox') {
      return this.httpClient.get<CommnucationDetail[]>(this.baseUrl + `/admin/messages/outbox/${communicationid}`);
    }
  }

  public readMessage(msgid, userid): any {
    return this.httpClient.post(this.baseUrl + '/admin/message/read', {msgid, userid}).subscribe(data => {
      const msg = 'POST Request is successful ';
      console.log(msg, data);
    }, error => {
      console.log('Error', error);
    });
  }

  public saveCustomer(customer: Customer, callback): any {
    return this.httpClient.post(this.baseUrl + '/customer/save', {customer}).subscribe(data => {
      const msg = 'POST Request is successful ';
      console.log(msg, data);
      if (callback) {
        callback(msg);
      }
    }, error => {
      console.log('Error', error);
      if (callback) {
        callback(error);
      }
    });
  }

  public saveMessage(communication: Communication, callback): any {
    return this.httpClient.post(this.baseUrl + '/admin/message', {communication}).subscribe(data => {
      const msg = 'POST Request is successful ';
      console.log(msg, data);
      if (callback) {
        callback(msg);
      }
    }, error => {
      console.log('Error', error);
      if (callback) {
        callback(error);
      }
    });
  }

  public is_valid(customer: Customer) {
    const email = customer.email;
    const mobile = customer.mobile;
    const compid = customer.companyid;
    const id = customer.id;

    return new Promise((resolve, reject) => {
      try {
        this.httpClient.post<Customer[]>(this.baseUrl + `/customers`, {email, mobile, compid, id}).subscribe(obsrv => {
          if (obsrv !== null && obsrv !== undefined && obsrv.length > 0) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }
}
