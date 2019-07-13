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
import { Booking } from 'src/app/models/booking';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { CustomerInfo } from 'src/app/models/customerInfo';
import { DatediffPipe } from 'src/app/common/datediff.pipe';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  public title = 'app';
  menuTitle = 'inventory';
  public message = '';
  public gridApi: any;
  public gridColumnApi: any;
  public overlayLoadingTemplate = '<span class="ag-overlay-loading-center" style="font-weight: 600; color: #0000ff">Please wait while your bookings are getting loaded ...</span>';
  public overlayNoRowsTemplate = '<span style=\"padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;\">No records found</span>';

  public columnDefs = [
    {headerName: 'Booking.ID#', field: 'id', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Booking.Date', field: 'date', sortable: true, filter: true, resizable: true, width: 140},
    {headerName: 'Ticket#', field: 'ticket_no', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Travel.Date', field: 'departure_date_time', sortable: true, filter: true, resizable: true, width: 140},
    {headerName: 'Trip.Type', field: 'trip_type', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Customer', field: 'name', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'Departing.City', field: 'source_city', sortable: true, filter: true, resizable: true, width: 150, cellRenderer: 'journeyrenderer'},
    {headerName: 'Arriving.City', field: 'destination_city', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Flight#', field: 'flight_no', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Aircode', field: 'flight_no', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Seats', field: 'qty', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Class', field: 'class', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'Total.Fare', field: 'total', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'Status', field: 'status', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Processed.Date', field: 'process_date', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Linked.Booking', field: 'parent_booking_id', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'linkedbookingrenderer', cellRendererParams: {onClick: this.showBookingDetails.bind(this)}},
];

  public components = {
    linkedbookingrenderer: this.linkedbookingrenderer,
    journeyrenderer: this.journeyrenderer
  };

  public bookings: Booking[] = [];

  public rowSelection = 'single';
  currentUser: User;
  public booking: Booking;
  public mode = 'noshow';
  public handlebookingform: FormGroup;
  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.commonService.setTitle('My Bookings');

    this.currentUser = this.authenticationService.currentLoggedInUser;

    this.init(new Booking());

    setTimeout( () => {
      this.RefreshData(this.currentUser.companyid);
    }, 300);
  }

  init(booking) {
    this.handlebookingform = this.formBuilder.group({
      id: new FormControl(booking.id),
      pnr: new FormControl(booking.pnr),
      customers: this.formBuilder.array(this.createCustomerControls(booking.customers))
    }, {});
  }

  createCustomerControls(customers: CustomerInfo[]): FormGroup[] {
    const formGroups = [];

    customers.forEach((customer, idx) => {
      formGroups.push(this.formBuilder.group({
        id: new FormControl(customer.id),
        sl: new FormControl(idx),
        name: new FormControl(`${customer.first_name} ${customer.last_name}`),
        age: new FormControl(customer.age),
        mobile: new FormControl(`${customer.mobile_no}`),
        email: new FormControl(customer.email),
        pnr: new FormControl(customer.pnr),
      }));
    });
    return formGroups;
  }

  RefreshData(companyid = 0, userid = 0) {
    const self = this;

    // self.rowData = [];
    if (this.gridApi !== null && this.gridApi !== undefined) {
      this.gridApi.showLoadingOverlay();
    }

    this.adminService.getBookings(companyid).subscribe((res: any[]) => {
      if (res !== null && res !== undefined && res.length > 0) {
        this.gridApi.hideOverlay();
        self.bookings = res;
      } else {
        this.gridApi.showNoRowsOverlay();
      }
    });
  }

  linkedbookingrenderer(params): any {
    const element = document.createElement('a');
    element.href = 'mailto: ' + params.value;
    element.appendChild(document.createTextNode(params.value));
    return element;
  }

  journeyrenderer(params): any {
    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: cneter');
    const updated_on = moment(new Date(params.value + ' UTC')).format('DD-MM-YYYY HH:mm:ss');

    action_container.appendChild(document.createTextNode(updated_on));

    return action_container;
  }

  actionsrenderer(params): any {
    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: cneter');
    const id = parseInt(params.value, 10); // ref.booking id
    const onclick = params.onClick;
    const data = params.data;
    const currentCompanyid = parseInt(this.currentUser.companyid.toString(), 10);
    const currentCompanyName = this.currentUser.cname;

    // Add action element for inviting to suppliers / wholesalers
    const edit_element = this.getInvitationLink(params, 'edit_parent', (ev) => {
      onclick(parseInt(data.id, 10), currentCompanyid, currentCompanyName);
    });

    const booking = this.bookings.find((whls, idx) => {
      return parseInt(whls.id.toString(), 10) === id;
    });

    if (currentCompanyid !== id && (booking === null || booking === undefined)) {
      action_container.appendChild(edit_element);
    }

    return action_container;
  }

  public getInvitationLink(params, actionName, callback) {
    const edit_element = document.createElement('i');

    if (actionName.toLowerCase() === 'edit_parent') {
      edit_element.title = `Show booking - ${params.data.id}.`;
      edit_element.className = 'fa fa-envelope-o actionicon actionicon-bl';
    } else if (actionName.toLowerCase() === 'edit') {
      edit_element.title = `Check message received.`;
      edit_element.className = 'fa fa-comments-o actionicon actionicon-gr';
    }
    edit_element.setAttribute('style', 'font-size: 18px; color: #000000; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');

    if (callback !== null) {
      edit_element.addEventListener('click', callback);
    }
    return edit_element;
  }

  showBookingDetails(bookingid, companyid, companyname) {
    const booking = this.bookings.find((bookingItem, idx) => {
      return parseInt(bookingItem.id.toString(), 10) === bookingid;
    });

    if (booking !== null && booking !== undefined) {
      this.booking = booking;
      this.mode = 'edit';
      this.message = `Editing booking - ${booking.id}.`;
    } else {
      this.message = 'Invalid booking id.';
    }

    event.stopPropagation();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
  }

  onRowSelected(mode, row) {
    if (row.node.selected) {
      this.init(row.data);
      this.booking = row.data;
      this.mode = 'edit';
      // alert(inboxMessage.message);
    }
  }

  onHandleChangeBooking() {

  }

  onBack(ev) {
    this.mode = 'noshow';
    setTimeout( () => {
      this.RefreshData(this.currentUser.companyid);
    }, 300);
  }
}
