import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { Supplier } from 'src/app/models/supplier';
import { Ticket } from 'src/app/models/ticket';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
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
    {headerName: '', field: 'id', sortable: true, filter: true, resizable: true, width: 50, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this)}},
    // {headerName: 'Ticket#', field: 'ticket_no', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Dept.City', field: 'source', sortable: true, filter: true, resizable: true, width: 100, cellRenderer: 'cityrenderer'},
    // {headerName: 'Arrv.City', field: 'destination', sortable: true, filter: true, resizable: true, width: 140},
    // {headerName: 'Trip.Type', field: 'trip_type', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Dept.Time', field: 'departure_date_time', sortable: true, filter: true, resizable: true, width: 110, cellRenderer: 'timerenderer'},
    // {headerName: 'Arrv.Time', field: 'arrival_date_time', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Flight#', field: 'flight_no', sortable: true, filter: true, resizable: true, width: 70},
    {headerName: 'Qty', field: 'no_of_person', sortable: true, filter: true, resizable: true, width: 55, cellRenderer: 'ticketcountrenderer'},
    // {headerName: 'Class', field: 'class', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'PNR', field: 'pnr', sortable: true, filter: true, resizable: true, width: 80, cellRenderer: 'pnrrenderer'},
    {headerName: 'Supplier', field: 'supplier', sortable: true, filter: true, resizable: true, width: 100},
    // {headerName: 'Airline', field: 'airline', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'Aircode', field: 'aircode', sortable: true, filter: true, resizable: true, width: 60},
    {headerName: 'Price', field: 'price', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Trans.Type', field: 'trans_type', sortable: true, filter: true, resizable: true, width: 100},
    // {headerName: 'Admin.Markup', field: 'admin_markup', sortable: true, filter: true, resizable: true, width: 75},
    // {headerName: 'Supplier', field: 'supplier', sortable: true, filter: true, resizable: true, width: 150},
    // {headerName: 'Markup', field: 'markup_rate', sortable: true, filter: true, resizable: true, width: 75},
    // {headerName: 'CGST', field: 'cgst_rate', sortable: true, filter: true, resizable: true, width: 50},
    // {headerName: 'SGST', field: 'sgst_rate', sortable: true, filter: true, resizable: true, width: 50},
    // {headerName: 'IGST', field: 'igst_rate', sortable: true, filter: true, resizable: true, width: 50},
    // {headerName: 'Tag', field: 'data_collected_from', sortable: true, filter: true, resizable: true, width: 75},
    // {headerName: 'Updated.On', field: 'updated_on', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'utcdaterenderer'},
    {headerName: 'Status', field: 'approved', sortable: true, filter: true, resizable: true, width: 50, cellRenderer: 'approverenderer'},
];

  public components = {
    timerenderer: this.timerenderer.bind(this),
    cityrenderer: this.cityrenderer.bind(this),
    actionrenderer: this.actionrenderer.bind(this),
    pnrrenderer: this.pnrrenderer.bind(this),
    utcdaterenderer: this.utcdaterenderer.bind(this),
    approverenderer: this.approverenderer.bind(this),
    ticketcountrenderer: this.ticketcountrenderer.bind(this)
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
  public ownTickets: Ticket[] = [];

  public tabindex = 0;

  public rowSelection = 'single';
  public currentUser: User;
  public selectedTicket: Ticket;
  public ticket: Ticket;
  public mode = 'noshow';
  public cities: City[] = [];
  public airlines: Airline[] = [];
  public is_supplier = false;
  public is_wholesaler = false;

  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService) {

  }

  ngOnInit() {
    this.commonService.setTitle('Inventory Management');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.is_supplier = (parseInt(this.authenticationService.currentCompany.type, 10) & 2) === 2; /* 2 means supplier */
    this.is_wholesaler = (parseInt(this.authenticationService.currentCompany.type, 10) & 4) === 4; /* 4 means wholesaler */

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

  addTicket() {
    const userid = this.currentUser.id;
    const companyid = this.currentUser.companyid;
    const parentObj = this;
    parentObj.mode = 'edit';
    parentObj.ticket = new Ticket();
  }

  handleEdit(operation, rowIndex, ticketId, ticket, companyId, companyName): any {
    // alert(`${company_name} - ${currentCompanyName}`);
    const parentObj = this;
    parentObj.ticket = new Ticket();
    parentObj.ticket.ticket_no = 'Loading ...';
    parentObj.ticket.supplier = 'Loading ...';
    parentObj.ticket.name = 'Loading ...';

    const rowNode = this.gridApi.getRowNode(rowIndex);
    // this.setSelectedTicket(this.selectedTicket, ticket);
    parentObj.mode = 'edit';
    this.adminService.getTicket(ticketId).subscribe((res: any) => {
      if (res && res.length > 0) {
        parentObj.ticket = res[0];
      } else {
        parentObj.ticket = new Ticket();
      }
    });

    // tslint:disable-next-line: deprecation
    event.stopPropagation();
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
        const ownTickets = [];
        const othersTickets = [];

        res.forEach(ticket => {
          if (ticket.companyid === companyid) {
            ownTickets.push(ticket);
          } else {
            othersTickets.push(ticket);
          }
        });

        self.rowData = othersTickets;
        self.ownTickets = ownTickets;
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

  ticketcountrenderer(params): any {
    const data = params.data;
    const inventoryCount = parseInt(params.value, 10);

    const action_container = document.createElement('span');

    if (inventoryCount === 0) {
      action_container.setAttribute('style', 'text-align: right; color: #ff0000;');
    } else {
      action_container.setAttribute('style', 'text-align: right; color: #109c20;');
    }

    action_container.appendChild(document.createTextNode(inventoryCount.toString()));

    return action_container;
  }

  cityrenderer(params): any {
    const data = params.data;
    const source = params.data.source.trim().substr(params.data.source.length - 3);
    const destination = params.data.destination.trim().substr(params.data.destination.length - 3);
    const value = params.value;
    let journey = '';

    if (params.data.trip_type === 'ONE') {
      journey = `${source} - ${destination}`;
    } else if (params.data.trim_type === 'ROUND') {
      journey = `${source} - ${destination} - ${source}`;
    }

    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: left');

    action_container.appendChild(document.createTextNode(journey));

    return action_container;
  }

  timerenderer(params): any {
    const data = params.data;
    const value = params.value;

    const datetimevalue = moment(value).format('DD-MM-YY HH:mm');

    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: left');

    action_container.appendChild(document.createTextNode(datetimevalue));

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
    let element = document.createElement('span');

    switch (approved) {
      case 0:
        element = document.createElement('span');
        approvedText = 'Pending'; // empty text for pending
        break;
      case 1:
        element = document.createElement('i');
        element.className = 'fa fa-thumbs-o-up';
        element.setAttribute('style', 'font-size: 22px; color: #109c20');
        element.title = `Approved ticket`;
        approvedText = 'Approved'; // <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>
        break;
      case 2:
        element = document.createElement('i');
        element.className = 'fa fa-thumbs-o-down';
        element.setAttribute('style', 'font-size: 22px; color: #b31c1c');
        element.title = `Rejected ticket`;
        approvedText = 'Rejected'; // <i class="fa fa-thumbs-o-down" aria-hidden="true"></i>
        break;
      case 3:
        element = document.createElement('i');
        element.className = 'fa fa-hand-paper-o';
        element.setAttribute('style', 'font-size: 22px; color: #007bff');
        element.title = `Hold ticket`;
        approvedText = 'Hold'; // <i class="fa fa-hand-paper-o" aria-hidden="true"></i>
        break;
      default:
          element = document.createElement('span');
          break;
    }

    // action_container.appendChild(document.createTextNode(approvedText));

    // return action_container;

    return element;
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
    // const action_container = document.createElement('span');
    // action_container.setAttribute('style', 'text-align: cneter');
    // const edit_element = document.createElement('i');
    // const id = parseInt(params.value, 10);

    // edit_element.className = 'fa fa-pencil-square-o';
    // edit_element.setAttribute('style', 'font-size: 18px; color: #000000; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');
    // edit_element.addEventListener('click', (ev) => {
    //   alert(`Id : ${id}`);
    // });

    // action_container.appendChild(edit_element);

    // return action_container;

    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: cneter');
    const id = parseInt(params.value, 10);
    const oneditclick = params.onEdit;
    const ticket_companyid = parseInt(params.data.companyid, 10);
    // const onrejectclick = params.onRejectInvitation;
    const data = params.data;
    const currentCompanyid = parseInt(this.currentUser.companyid.toString(), 10);
    const currentCompanyName = this.currentUser.cname;

    // Add action element for inviting to suppliers / wholesalers
    const edit_element = this.getInvitationLink(params, 'edit', (ev) => {
      // rateplanid:"1"
      // relationid:"1"
      const ticket = params.data;
      oneditclick('edit', params.rowIndex, parseInt(ticket.id, 10), ticket, currentCompanyid, currentCompanyName);
    });

    if (ticket_companyid === currentCompanyid) {
      action_container.appendChild(edit_element);
    }

    return action_container;
  }

  public getInvitationLink(params, actionName, callback) {
    const edit_element = document.createElement('i');

    if (actionName.toLowerCase() === 'edit') {
      edit_element.title = `Edit the record`;
      edit_element.className = 'fa fa-pencil-square-o actionicon actionicon-bl';
    } else if (actionName.toLowerCase() === 'reject') {
      edit_element.title = `Reject the invitation.`;
      edit_element.className = 'fa fa-thumbs-down actionicon actionicon-rd';
    }
    edit_element.setAttribute('style', 'font-size: 18px; color: #000000; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');

    if (callback !== null) {
      edit_element.addEventListener('click', callback);
    }
    return edit_element;
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

      // parentObj.selectedTicket = row.data;
      const tkt = row.data;

      this.setSelectedTicket(parentObj, tkt);

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
      this.mode = 'view';
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

  setSelectedTicket(parentObj, tkt) {
    // const parentObj: any = {};
    parentObj.selectedTicket = tkt;
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

    return parentObj;
  }

  onHandleChangeTicket(rowParams, mode, callback) {

  }

  onSelectedTabChanged(tabindex) {
    this.RefreshData(this.currentUser.companyid);
  }
}
