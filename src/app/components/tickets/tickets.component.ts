import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { Supplier } from 'src/app/models/supplier';
import { Ticket } from 'src/app/models/ticket';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material';
import * as moment from 'moment';
import { City } from 'src/app/models/city';
import { Airline } from 'src/app/models/airline';

import * as $ from 'jquery';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {
  public title = 'app';
  menuTitle = 'inventory';
  message = '';
  public handleticketform: FormGroup;
  public gridApi: any;
  public gridColumnApi: any;
  public overlayLoadingTemplate = '<span class="ag-overlay-loading-center" style="font-weight: 600; color: #0000ff">Please wait while your tickets are getting loaded ...</span>';
  public overlayNoRowsTemplate = '<span style=\"padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;\">No records found</span>';

  public columnDefs = [
    {headerName: 'Ticket#', field: 'ticket_no', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Dept.City', field: 'source', sortable: true, filter: true, resizable: true, width: 140},
    {headerName: 'Arrv.City', field: 'destination', sortable: true, filter: true, resizable: true, width: 140},
    {headerName: 'Trip.Type', field: 'trip_type', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Dept.Time', field: 'departure_date_time', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Arrv.Time', field: 'arrival_date_time', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Flight#', field: 'flight_no', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Seats', field: 'no_of_person', sortable: true, filter: true, resizable: true, width: 75},
    // {headerName: 'Class', field: 'class', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'PNR', field: 'pnr', sortable: true, filter: true, resizable: true, width: 80, cellRenderer: 'pnrrenderer'},
    {headerName: 'Supplier', field: 'supplier', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'Airline', field: 'airline', sortable: true, filter: true, resizable: true, width: 80},
    // {headerName: 'Aircode', field: 'aircode', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'Price', field: 'price', sortable: true, filter: true, resizable: true, width: 75},
    // {headerName: 'Admin.Markup', field: 'admin_markup', sortable: true, filter: true, resizable: true, width: 75},
    // {headerName: 'Supplier', field: 'supplier', sortable: true, filter: true, resizable: true, width: 150},
    // {headerName: 'Markup', field: 'markup_rate', sortable: true, filter: true, resizable: true, width: 75},
    // {headerName: 'CGST', field: 'cgst_rate', sortable: true, filter: true, resizable: true, width: 50},
    // {headerName: 'SGST', field: 'sgst_rate', sortable: true, filter: true, resizable: true, width: 50},
    // {headerName: 'IGST', field: 'igst_rate', sortable: true, filter: true, resizable: true, width: 50},
    // {headerName: 'Tag', field: 'data_collected_from', sortable: true, filter: true, resizable: true, width: 75},
    // {headerName: 'Updated.On', field: 'updated_on', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'utcdaterenderer'},
    {headerName: 'Approved', field: 'approved', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'approverenderer'},
];

  public components = {
    pnrrenderer: this.pnrrenderer.bind(this),
    utcdaterenderer: this.utcdaterenderer.bind(this),
    approverenderer: this.approverenderer.bind(this)
  };

  // [loadingOverlayComponent]="customLoadingOverlay"
  // [noRowsOverlayComponent]="customNoRowsOverlay"

  // public rowClassRules = {
  //   'matched-row': (params) => {
  //     const toberead = params.data.departure_date_time;
  //     // this.booking.departure_date_time

  //     return toberead === 0;
  //   }
  //   // 'sick-days-breach': 'data.sickDays > 8'
  // };

  public rowData: Ticket[] = [];

  public rowSelection = 'single';
  public currentUser: User;
  public selectedTicket: Ticket;
  public ticket: Ticket;
  public mode = 'noshow';
  public cities: City[] = [];
  public airlines: Airline[] = [];

  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService) {

  }

  ngOnInit() {
    this.commonService.setTitle('Inventory Management');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.selectedTicket = new Ticket();
    this.ticket = new Ticket();

    setTimeout( () => {
      this.RefreshData(this.currentUser.companyid);
    }, 300);
  }

  loadCities() {
    this.adminService.getCities().subscribe((res: any) => {
      this.cities = res;
    });
  }

  loadAirlines() {
    this.adminService.getAirlines().subscribe((res: any) => {
      this.airlines = res;
    });
  }

  RefreshData(companyid) {
    const self = this;

    // self.rowData = [];
    if (this.gridApi !== null && this.gridApi !== undefined) {
      this.gridApi.showLoadingOverlay();
    }

    this.adminService.getTicketsByCompany(companyid).subscribe((res: Ticket[]) => {
      if (res !== null && res !== undefined && res.length > 0) {
        this.gridApi.hideOverlay();
        self.rowData = res;
      } else {
        this.gridApi.showNoRowsOverlay();
      }
    });
  }

  onBack(ev) {
    this.mode = 'noshow';
    setTimeout( () => {
      this.RefreshData(this.currentUser.companyid);
    }, 300);
  }

  UploadTickets(companyid) {
    alert('Feature coming soon!!');
  }

  emailrenderer(params): any {
    const element = document.createElement('a');
    element.href = 'mailto: ' + params.value;
    element.appendChild(document.createTextNode(params.value));
    return element;
  }

  pnrrenderer(params): any {
    const data = params.data;
    let value = params.value;

    if (data.companyid !== this.currentUser.companyid) {
      value = 'XXXXXX';
    }
    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: cneter');

    action_container.appendChild(document.createTextNode(value));

    return action_container;
  }

  utcdaterenderer(params): any {
    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: cneter');
    const updated_on = moment(new Date(params.value + ' UTC')).format('DD-MM-YYYY HH:mm:ss');

    action_container.appendChild(document.createTextNode(updated_on));

    return action_container;
  }

  approverenderer(params): any {
    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: cneter');
    const approved = parseInt(params.value, 10);
    let approvedText = '';

    switch (approved) {
      case 0:
        approvedText = 'Pending';
        break;
      case 1:
        approvedText = 'Approved';
        break;
      case 2:
        approvedText = 'Reject';
        break;
      case 2:
        approvedText = 'Hold';
        break;
      default:
        break;
    }

    action_container.appendChild(document.createTextNode(approvedText));

    return action_container;
  }

  typerenderer(params): any {
    // const element = document.createElement('span');
    // const imageElement = document.createElement('img');
    // imageElement.width = 32;
    // imageElement.height = 32;
    // // visually indicate if this months value is higher or lower than last months value
    const element = document.createElement('i');

    if (params.value === 'B2C') {
      element.className = 'fa fa-male fa-female';
      element.setAttribute('style', 'font-size: 22px; color: #00ff00');
    } else if (params.value === 'B2B') {
      element.className = 'fa fa-user-o';
      element.setAttribute('style', 'font-size: 22px; color: #ff0000');
    } else if (params.value === 'EMP') {
      element.className = 'fa fa-address-book-o';
      element.setAttribute('style', 'font-size: 22px; color: #ff0000');
    }
    // element.appendChild(imageElement);
    // // element.appendChild(document.createTextNode(params.value));
    // element.appendChild(document.createTextNode(params.value));
    return element;
  }

  chkrenderer(params): any {
    const element = document.createElement('i');

    if (parseInt(params.value, 10) === 1) {
      element.className = 'fa fa-check';
      element.setAttribute('style', 'font-size: 22px; color: #00ff00');
    } else {
      element.className = 'fa fa-close';
      element.setAttribute('style', 'font-size: 22px; color: #ff0000');
    }
    return element;
  }

  actionrenderer(params): any {
    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: cneter');
    const edit_element = document.createElement('i');
    const id = parseInt(params.value, 10);

    edit_element.className = 'fa fa-pencil-square-o';
    edit_element.setAttribute('style', 'font-size: 18px; color: #000000; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');
    edit_element.addEventListener('click', (ev) => {
      alert(`Id : ${id}`);
    });

    action_container.appendChild(edit_element);

    return action_container;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.hideOverlay();
  }

  onRowSelected(mode, row) {
    if (row.node.selected) {
      const parentObj = this;
      parentObj.ticket = new Ticket();
      parentObj.ticket.ticket_no = 'Loading ...';
      parentObj.ticket.supplier = 'Loading ...';
      parentObj.ticket.name = 'Loading ...';

      parentObj.selectedTicket = row.data;
      const tkt = row.data;

      parentObj.selectedTicket.cost = {};
      parentObj.selectedTicket.sale = {};
      parentObj.selectedTicket.cost.price = parseInt(tkt.price, 10) + parseInt(tkt.markup_rate, 10);
      parentObj.selectedTicket.cost.markup = 0;
      parentObj.selectedTicket.cost.srvchg = parseInt(tkt.srvchg_rate, 10);
      parentObj.selectedTicket.cost.cgst = Math.round(parseInt(tkt.srvchg_rate, 10) * parseFloat(tkt.cgst_rate));
      parentObj.selectedTicket.cost.sgst = Math.round(parseInt(tkt.srvchg_rate, 10) * parseFloat(tkt.sgst_rate));
      parentObj.selectedTicket.cost.gst = parentObj.selectedTicket.cost.cgst + parentObj.selectedTicket.cost.sgst;
      parentObj.selectedTicket.cost.total = parentObj.selectedTicket.cost.price + parentObj.selectedTicket.cost.markup + parentObj.selectedTicket.cost.srvchg + parentObj.selectedTicket.cost.gst;

      parentObj.selectedTicket.sale.price = parseInt(tkt.price, 10) + parseInt(tkt.markup_rate, 10);
      parentObj.selectedTicket.sale.markup = parseInt(tkt.wsl_markup_rate, 10);
      parentObj.selectedTicket.sale.srvchg = parseInt(tkt.wsl_srvchg_rate, 10) + parentObj.selectedTicket.cost.srvchg;
      parentObj.selectedTicket.sale.cgst = parentObj.selectedTicket.cost.cgst + Math.round(parseInt(tkt.wsl_srvchg_rate, 10) * parseFloat(tkt.wsl_cgst_rate));
      parentObj.selectedTicket.sale.sgst = parentObj.selectedTicket.cost.sgst + Math.round(parseInt(tkt.wsl_srvchg_rate, 10) * parseFloat(tkt.wsl_sgst_rate));
      parentObj.selectedTicket.sale.gst = parentObj.selectedTicket.sale.cgst + parentObj.selectedTicket.sale.sgst;
      parentObj.selectedTicket.sale.total = parentObj.selectedTicket.sale.price + parentObj.selectedTicket.sale.markup + parentObj.selectedTicket.sale.srvchg + parentObj.selectedTicket.sale.gst;

      // parentObj.init(row.data, parentObj.tickets);

      // const query = {
      //   'companyid': this.currentUser.companyid,
      //   'source': parseInt(this.booking.ticket.source, 10),
      //   'destination': parseInt(this.booking.ticket.destination, 10),
      //   'from_date': moment(this.booking.departure_date_time).format('YYYY-MM-DD'),
      //   'to_date': moment(this.booking.arrival_date_time).format('YYYY-MM-DD'),
      //   'trip_type': 'ONE',
      //   'approved': 1,
      //   'available': 'YES',
      //   'no_of_person': 1,
      // };

      this.mode = 'edit';
      this.adminService.getTicket(row.data.id).subscribe((res: any) => {
        if (res && res.length > 0) {
          parentObj.ticket = res[0];
        } else {
          parentObj.ticket = new Ticket();
        }
      });

      // alert(inboxMessage.message);
    }
  }

  onHandleChangeTicket() {

  }
}
