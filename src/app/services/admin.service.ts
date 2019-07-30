import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Wholesaler } from '../models/wholesaler';
import { Supplier } from '../models/supplier';
import { Customer } from '../models/customer';
import { Company } from '../models/company';
import { Communication } from '../models/communication';
import { CommunicationDetail } from '../models/communication_details';
import { Rateplan } from '../models/rateplan';
import { RateplanDetail } from '../models/rateplandetail';
import { Service } from '../models/service';
import { Metadata } from '../models/metadata';

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
    return this.httpClient.get<CommunicationDetail[]>(this.baseUrl + `/admin/communications/${communicationid}`);
  }

  public getCommunicationDetail(commdetailid): any {
    return this.httpClient.get<CommunicationDetail[]>(this.baseUrl + `/admin/communication_detail/${commdetailid}`);
  }

  public getMetadata(object_type, companyid): any {
    // api/metadata/(:any)/(:num)
    return this.httpClient.get<Metadata[]>(this.baseUrl + `/metadata/${object_type}/${companyid}`);
  }

  public getMessages(boxtype, communicationid): any {
    if (boxtype === 'inbox') {
      return this.httpClient.get<CommunicationDetail[]>(this.baseUrl + `/admin/messages/inbox/${communicationid}`);
    } else if (boxtype === 'outbox') {
      return this.httpClient.get<CommunicationDetail[]>(this.baseUrl + `/admin/messages/outbox/${communicationid}`);
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

  public getRatePlans(companyid): any {
    return this.httpClient.post<Rateplan[]>(this.baseUrl + '/admin/rateplans', {companyid});
  }

  public getRatePlansDetails(rateplanid): any {
    return this.httpClient.get<RateplanDetail[]>(this.baseUrl + `/admin/rateplans/${rateplanid}`);
  }

  public acceptInvitation(acceptationObject: any): any {
    const msgid = acceptationObject.msgid;
    const message = acceptationObject.message;
    const rateplan = acceptationObject.rateplan;
    const userid = parseInt(acceptationObject.userid, 10);
    let communicationDetail: CommunicationDetail = null;
    this.getCommunicationDetail(msgid).subscribe((res: CommunicationDetail[]) => {
      if (res !== null && res !== undefined && res.length > 0) {
        communicationDetail = res[0];
        const commDetail = new CommunicationDetail();
        commDetail.active = 1;
        commDetail.created_by = userid;
        commDetail.from_companyid = communicationDetail.to_companyid;
        commDetail.pid = communicationDetail.pid;
        commDetail.to_companyid = communicationDetail.from_companyid;
        commDetail.type = 2; // accepted invitation
        commDetail.message = message; // accepted invitation
        commDetail.invitation_type = communicationDetail.invitation_type;
        commDetail.serviceid = communicationDetail.serviceid;

        // transform CommunicationDetail and save it.
        this.saveMessageDetails(commDetail);

        // since invitation accepted then we need to insert record into wholesalers_tbl or suppliers_tbl
        if (parseInt(commDetail.invitation_type.toString(), 10) === 1) {
          // wholesaler
          // transform wholesaler object
          const transformWholesaler = this.transformWholesaler(commDetail, {rateplan, userid, msgid});
          let ws_tracking_id = 0;

          this.saveAsWholesaler(transformWholesaler, status => {
            console.log(status);
            ws_tracking_id = parseInt(status.detail_id, 10);
            transformWholesaler.id = ws_tracking_id;

            const transformSupplier = this.transformSupplier(commDetail, {rateplan, userid, msgid, ws_tracking_id});
            this.saveAsSupplier(transformSupplier, status1 => {
              console.log(status1);
              const ws_tracking_id1 = parseInt(status1.detail_id, 10);
            });
          });
        } else if (parseInt(commDetail.invitation_type.toString(), 10) === 2) {
          // supplier
          // transform supplier object
          const transformSupplier = this.transformSupplier(commDetail, {rateplan, userid, msgid});
          // let ws_tracking_id = 0;

          this.saveAsSupplier(transformSupplier, status => {
            console.log(status);
            const ws_tracking_id = parseInt(status.detail_id, 10);
            transformSupplier.id = ws_tracking_id;

            const transformWholesaler = this.transformWholesaler(commDetail, {rateplan, userid, msgid, ws_tracking_id});
            // const transformSupplier = this.transformSupplier(commDetail, {rateplan, userid, msgid, ws_tracking_id});
            this.saveAsWholesaler(transformWholesaler, status1 => {
              console.log(status1);
              const ws_tracking_id1 = parseInt(status1.detail_id, 10);
            });
          });
        }
      }
    });
  }

  public rejectInvitation(rejectionObject: any): any {
    const msgid = rejectionObject.msgid;
    const message = rejectionObject.message;
    const rateplan = rejectionObject.rateplan;
    const userid = parseInt(rejectionObject.userid, 10);
    let communicationDetail: CommunicationDetail = null;
    this.getCommunicationDetail(msgid).subscribe((res: CommunicationDetail[]) => {
      if (res !== null && res !== undefined && res.length > 0) {
        communicationDetail = res[0];
        const commDetail = new CommunicationDetail();
        commDetail.active = 1;
        commDetail.created_by = userid;
        commDetail.from_companyid = communicationDetail.to_companyid;
        commDetail.pid = communicationDetail.pid;
        commDetail.to_companyid = communicationDetail.from_companyid;
        commDetail.type = 3; // rejected invitation
        commDetail.message = message; // rejected invitation
        commDetail.invitation_type = communicationDetail.invitation_type;
        commDetail.serviceid = communicationDetail.serviceid;

        // transform CommunicationDetail and save it.
        this.saveMessageDetails(commDetail);
      }
    });
  }

  public transformSupplier(commDetail: CommunicationDetail, config) {
    const supplier: any = {};
    const invitationType = parseInt(commDetail.invitation_type.toString(), 10);
    supplier.code = `SPL-00${commDetail.from_companyid}`;
    supplier.primary_user_id = config.userid;
    if (invitationType === 1) {
      supplier.supplierid = commDetail.to_companyid;
      supplier.companyid = commDetail.from_companyid;
    } else {
      supplier.supplierid = commDetail.from_companyid;
      supplier.companyid = commDetail.to_companyid;
    }
    supplier.created_by = config.userid;
    supplier.active = 1;
    // supplier.companyid = commDetail.from_companyid;
    supplier.details = new Array();
    const supplierDetail: any = {};
    supplierDetail.serviceid = commDetail.serviceid;
    supplierDetail.active = 1;
    if (invitationType === 1) {
      supplierDetail.companyid = commDetail.from_companyid;
    } else {
      supplierDetail.companyid = commDetail.to_companyid;
    }
    if (config.rate_plan_id !== null && config.rate_plan_id !== undefined) {
      supplierDetail.allowfeed = 1; // temporary suspend the feed. Let him approve it and assign rate plan.
      supplierDetail.rate_plan_id = config.rateplan;
    } else {
      supplierDetail.allowfeed = 0; // temporary suspend the feed. Let him approve it and assign rate plan.
    }
    supplierDetail.status = 1; // accepted invitation (unused)
    supplierDetail.created_by = config.userid;
    supplierDetail.communicationid = config.msgid;
    supplierDetail.tracking_id = config.ws_tracking_id; // this value will be corrosponding supplier_services_tbl's primary id. this record's primary id will be same into wholesaler_services_tbl's tracking_id
    supplier.details.push(supplierDetail);

    return supplier;
  }

  public transformWholesaler(commDetail: CommunicationDetail, config) {
    const wholesaler: any = {};
    const invitationType = parseInt(commDetail.invitation_type.toString(), 10);
    wholesaler.code = `WS-00${commDetail.from_companyid}`;
    wholesaler.primary_user_id = config.userid;
    if (invitationType === 1) {
      wholesaler.salerid = commDetail.from_companyid;
      wholesaler.companyid = commDetail.to_companyid;
    } else {
      wholesaler.salerid = commDetail.to_companyid;
      wholesaler.companyid = commDetail.from_companyid;
    }
    wholesaler.created_by = config.userid;
    wholesaler.active = 1;
    // wholesaler.companyid = commDetail.to_companyid;
    wholesaler.details = new Array();
    const wholesalerDetail: any = {};
    wholesalerDetail.serviceid = commDetail.serviceid;
    wholesalerDetail.active = 1;
    if (invitationType === 1) {
      wholesalerDetail.companyid = commDetail.to_companyid;
    } else {
      wholesalerDetail.companyid = commDetail.from_companyid;
    }

    if (config.rateplan !== null && config.rateplan !== undefined) {
      wholesalerDetail.allowfeed = 1;
      wholesalerDetail.rate_plan_id = config.rateplan;
    } else {
      wholesalerDetail.allowfeed = 0;
    }

    wholesalerDetail.status = 1; // accepted invitation (unused)
    wholesalerDetail.created_by = config.userid;
    wholesalerDetail.communicationid = config.msgid;
    wholesalerDetail.tracking_id = config.ws_tracking_id; // this value will be corrosponding supplier_services_tbl's primary id. this record's primary id will be same into wholesaler_services_tbl's tracking_id
    wholesaler.details.push(wholesalerDetail);

    return wholesaler;
  }

  public saveAsWholesaler(wholesaler: any, callback) {
    return this.httpClient.post(this.baseUrl + '/admin/wholesaler/save', {wholesaler}).subscribe(data => {
      const msg = 'POST Request is successful ';
      console.log(msg, data);
      if (callback !== null) {
        callback(data);
      }
    }, error => {
      console.log('Error', error);
    });
  }

  public saveAsSupplier(supplier: any, callback) {
    return this.httpClient.post(this.baseUrl + '/admin/supplier/save', {supplier}).subscribe(data => {
      const msg = 'POST Request is successful ';
      console.log(msg, data);
      if (callback !== null) {
        callback(data);
      }
    }, error => {
      console.log('Error', error);
    });
  }

  // api/admin/messagedetails
  public saveMessageDetails(communicationDetail: CommunicationDetail): any {
    // tslint:disable-next-line: object-literal-key-quotes
    return this.httpClient.post(this.baseUrl + '/admin/messagedetails', {'communicationdetail': communicationDetail}).subscribe(data => {
      const msg = 'POST Request is successful ';
      console.log(msg, data);
    }, error => {
      console.log('Error', error);
    });
  }

  public getServicesByCompany(companyid): any {
    // tslint:disable-next-line: object-literal-key-quotes
    return this.httpClient.get(this.baseUrl + `/company/${companyid}/services`);
  }

  public deleteBookingCustomer(bookingid, customerid): any {
    // tslint:disable-next-line: object-literal-key-quotes
    return this.httpClient.get(this.baseUrl + `/company/delete_booking_customer/${bookingid}/${customerid}`);
  }

  public changeFeed(vendorType, feedValue, targetCompanyid, sourceCompanyid): any {
    if (vendorType === 'supplier') {
      // tslint:disable-next-line: object-literal-key-quotes
      return this.httpClient.post(this.baseUrl + `/admin/supplier/${targetCompanyid}/wholesaler/${sourceCompanyid}`, {'detail': {'allowFeed': feedValue}});
    } else if (vendorType === 'wholesaler') {
      // tslint:disable-next-line: object-literal-key-quotes
      return this.httpClient.post(this.baseUrl + `/admin/wholesaler/${targetCompanyid}/supplier/${sourceCompanyid}`, {'detail': {'allowFeed': feedValue}});
    }
  }

  public saveLinkDetail(linkDetail: any): any {
    const vendorType = linkDetail.vendorType;
    const relationid = parseInt(linkDetail.relationid, 10);
    const allowFeed = linkDetail.allowFeed ? 1 : 0;
    const rateplanid = parseInt(linkDetail.rateplanid, 10);
    const transactiontype = parseInt(linkDetail.transactiontype, 10);
    const walletid = linkDetail.walletid;
    const targetCompanyid = parseInt(linkDetail.supplierid, 10);
    const sourceCompanyid = parseInt(linkDetail.wholesalerid, 10);

    const payload = {
      'detail': {
        'id': relationid,
        'allowfeed': allowFeed,
        'rate_plan_id': rateplanid,
        'transaction_type': transactiontype
      }
    };

    if (vendorType === 'supplier') {
      // tslint:disable-next-line: object-literal-key-quotes
      return this.httpClient.post(this.baseUrl + `/admin/supplier/${targetCompanyid}/wholesaler/${sourceCompanyid}`, payload);
    } else if (vendorType === 'wholesaler') {
      // tslint:disable-next-line: object-literal-key-quotes
      return this.httpClient.post(this.baseUrl + `/admin/wholesaler/${targetCompanyid}/supplier/${sourceCompanyid}`, payload);
    }
  }

  // api/admin/rateplan/save
  public saveRateplan(rateplan: Rateplan): any {
    // tslint:disable-next-line: object-literal-key-quotes
    return this.httpClient.post(this.baseUrl + '/admin/rateplan/save', {'rateplan': rateplan});
  }

  public getBookings(companyid = 0, userid = 0): any {
    // tslint:disable-next-line: object-literal-key-quotes
    if (userid === undefined || userid === null || userid === 0) {
      return this.httpClient.get(this.baseUrl + `/bookings/${companyid}`);
    } else if (companyid === undefined || companyid === null || companyid === 0) {
      return this.httpClient.get(this.baseUrl + `/bookings/-1/${userid}`);
    }
  }

  public getBookingsByQuery(query: any): any {
    // tslint:disable-next-line: object-literal-key-quotes
    return this.httpClient.get(this.baseUrl + `/bookings`, query);
  }

  public getTickets(query: any): any {
    return this.httpClient.post(this.baseUrl + `/company/open_tickets`, query);
  }

  public getTicket(ticketid: number): any {
    return this.httpClient.get(this.baseUrl + `/company/ticket/${ticketid}`);
  }

  public getAssignedSuppliers(query: any): any {
    return this.httpClient.post(this.baseUrl + `/query/bookings`, query);
  }

  public saveBooking(bookings: any): any {
    return this.httpClient.post(this.baseUrl + `/save/bookings`, bookings);
  }

  public getCities(): any {
    return this.httpClient.get(this.baseUrl + `/admin/cities`);
  }

  public getAirlines(): any {
    return this.httpClient.get(this.baseUrl + `/admin/airlines`);
  }
}
