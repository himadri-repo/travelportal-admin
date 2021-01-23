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
import { GoogleSheet } from 'src/app/models/googlesheet';
import { isArray } from 'ngx-bootstrap';
import { ConfirmationComponent } from 'src/app/components/shared/confirmation/confirmation.component';

@Component({
  selector: 'app-gsheet',
  templateUrl: './gsheet.component.html',
  styleUrls: ['./gsheet.component.scss']
})
export class GsheetComponent implements OnInit {
  public title = 'app';
  menuTitle = 'gsheet';
  message = '';
  public handleticketform: FormGroup;
  public gridApi: any;
  public gridColumnApi: any;
  public overlayLoadingTemplate = '<span class="ag-overlay-loading-center" style="font-weight: 600; color: #0000ff">Please wait while your integration sheets are getting loaded ...</span>';
  public overlayNoRowsTemplate = '<span style=\"padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;\">No records found</span>';

  public columnDefs = [
    {headerName: '', field: 'id', sortable: true, filter: true, resizable: true, width: 50, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this)}},
    // {headerName: 'Ticket#', field: 'ticket_no', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Name', field: 'name', sortable: true, filter: true, resizable: true, width: 350, cellRenderer: 'sheetnamerenderer'},
    // {headerName: 'Arrv.City', field: 'destination', sortable: true, filter: true, resizable: true, width: 140},
    // {headerName: 'Trip.Type', field: 'trip_type', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Sheet Id', field: 'sheetid', sortable: true, filter: true, resizable: true, width: 310},
    // {headerName: 'Arrv.Time', field: 'arrival_date_time', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Status', field: 'status', sortable: true, filter: true, resizable: true, width: 100, cellRenderer: 'feedrenderer', cellRendererParams: {onFeedChange: this.handleFeedChange.bind(this)}},
    {headerName: 'Code', field: 'sourcecode', sortable: true, filter: true, resizable: true, width: 100}
    // {headerName: 'Updated.On', field: 'updated_on', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'utcdaterenderer'},
    // {headerName: 'Status', field: 'approved', sortable: true, filter: true, resizable: true, width: 50, cellRenderer: 'approverenderer'},
  ];

  public components = {
    sheetnamerenderer: this.sheetnamerenderer.bind(this),
    actionrenderer: this.actionrenderer.bind(this),
    chkrenderer: this.chkrenderer.bind(this),
    feedrenderer: this.feedrenderer.bind(this)
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

  public rowData: GoogleSheet[] = [];
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
  public Gsheets: GoogleSheet[] = [];

  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, public dialog: MatDialog) {

  }

  ngOnInit() {
    this.commonService.setTitle('Google Sheet Integration');

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

  handleFeedChange(companyid: number, sheetid: number, status: number, gsheet_record:GoogleSheet): any {
    var self = this;
    // alert(`${company_name} - ${currentCompanyName} - Feed Value: ${allowFeed}`);
    this.openDialog((status === 1 ? 'disable feed' : ' enable feed' ), (result) => {
      if (result === true) {
        const feedChangedValue = (status === 1 ? 0 : 1);
        this.adminService.changeStatusOfGsheet(sheetid, companyid, gsheet_record).subscribe((res: any) => {
          console.log(res);
          //self.loadGSheets(companyid, -1, null);
          self.RefreshData(companyid);
        });
      }
    });
    // tslint:disable-next-line: deprecation
    event.stopPropagation();
  }  

  openDialog(action, callback): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '450px',
      data: `Are you sure to ${action} for this google sheet ?`,
      autoFocus: true,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Yes clicked');
        // Since this is yes, then lets save the changes
        if (callback) {
          callback(result);
        }
      } else {
        console.log(`No clicked ${result}`);
      }
    });
  }  

  feedrenderer(params): any {
    const element = document.createElement('i');
    const data = params.data;
    const onFeedChange = params.onFeedChange;
    const currentCompanyid = this.currentUser.companyid;
    const currentCompanyName = this.currentUser.cname;

    if (parseInt(params.value, 10) === 1) {
      element.className = 'fa fa-link';
      element.setAttribute('style', 'font-size: 22px; color: #00ff00; cursor: pointer; cursor: hand;');
      element.title = `${data.name} gsheet data feed is linked and active`;
    } else {
      element.className = 'fa fa-chain-broken';
      element.setAttribute('style', 'font-size: 22px; color: #ff0000; cursor: pointer; cursor: hand;');
      element.title = `${data.name} gsheet data feed is not linked and not active`;
    }

    if (onFeedChange !== null) {
      // this.handleFeedChange
      // handleFeedChange(companyid: number, sheetid: number, status: number, gsheet_record:GoogleSheet)
      element.addEventListener('click', (ev) => {
        var gsheet = new GoogleSheet();
        gsheet.id = parseInt(data.id, 10);
        gsheet.name = data.name;
        gsheet.sheet_url = data.sheet_url;
        gsheet.sheetid = data.sheetid;
        gsheet.sourcecode = data.sourcecode;
        gsheet.status = parseInt(data.status, 10)>0 ? 0 : 1;
        gsheet.target_companyid = parseInt(data.target_companyid, 10);

        onFeedChange(currentCompanyid, parseInt(data.id, 10), parseInt(params.value, 10), gsheet);
      });
    }

    // element.appendChild(document.createTextNode(params.value));
    return element;
  }

  loadGSheets(companyid = -1, status = -1, filter:any) {

    var self = this;
    return new Promise((resolve, reject) => {
      try
      {
        self.adminService.getGSheetQueries(companyid, status, filter).subscribe((result:any) => {
          self.Gsheets = [];
          if(result && isArray(result)) {
            result.forEach((val:any, idx) => {
              var gs = new GoogleSheet();
              gs.id = val.id;
              gs.name = val.name;
              gs.sheetid = val.sheetid;
              gs.status = val.status;
              gs.sourcecode = val.sourcecode;
              gs.target_companyid = val.target_companyid;
              gs.sheet_url = val.sheet_url;
    
              self.Gsheets.push(gs);
            });
          }

          resolve(self.Gsheets);
        });
      }
      catch(ex) {
        console.log(ex);
        reject(ex);
      }
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

  async RefreshData(companyid) {
    const self = this;

    // self.rowData = [];
    if (this.gridApi !== null && this.gridApi !== undefined) {
      this.gridApi.showLoadingOverlay();
    }

    var sheets = await self.loadGSheets(companyid, -1, null).catch(reason => console.log(reason)) as GoogleSheet[];

    if(sheets && isArray(sheets)) {
      self.rowData = sheets;
    }

    // this.adminService.getTicketsByCompany(companyid).subscribe((res: Ticket[]) => {
    //   if (res !== null && res !== undefined && res.length > 0) {
    //     this.gridApi.hideOverlay();
    //     const ownTickets = [];
    //     const othersTickets = [];

    //     res.forEach(ticket => {
    //       if (ticket.companyid === companyid) {
    //         ownTickets.push(ticket);
    //       } else {
    //         othersTickets.push(ticket);
    //       }
    //     });

    //     self.rowData = othersTickets;
    //     self.ownTickets = ownTickets;
    //   } else {
    //     this.gridApi.showNoRowsOverlay();
    //   }
    // });
  }

  onBack(ev) {
    this.mode = 'noshow';
    setTimeout( () => {
      this.RefreshData(parseInt('0'+this.currentUser.companyid));
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

  sheetnamerenderer(params):any {
    const element = document.createElement('a');
    element.href = params.data.sheet_url;
    element.target = "blank";
    element.appendChild(document.createTextNode(params.value));
    return element;
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
    const ticket_companyid = parseInt(params.data.target_companyid, 10);
    // const onrejectclick = params.onRejectInvitation;
    const data = params.data;
    const currentCompanyid = parseInt(this.currentUser.companyid.toString(), 10);
    const currentCompanyName = this.currentUser.cname;

    // Add action element for inviting to suppliers / wholesalers
    const edit_element = this.getInvitationLink(params, 'edit', (ev) => {
      // rateplanid:"1"
      // relationid:"1"
      const gsheet = params.data;
      alert('Feature coming soon ...');
      //oneditclick('edit', params.rowIndex, parseInt(ticket.id, 10), ticket, currentCompanyid, currentCompanyName);
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
    if (false && row.node.selected) {
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
