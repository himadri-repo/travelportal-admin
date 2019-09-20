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
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { CustomerInfo } from 'src/app/models/customerInfo';
import { DatediffPipe } from 'src/app/common/datediff.pipe';
import { BookingActivity } from 'src/app/models/booking_activity';

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
  public current_url: string;
  public gridColumnApi: any;
  public overlayLoadingTemplate = '<span class="ag-overlay-loading-center" style="font-weight: 600; color: #0000ff">Please wait while your bookings are getting loaded ...</span>';
  public overlayNoRowsTemplate = '<span style=\"padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;\">No records found</span>';

  public columnDefs = [
    {headerName: 'Booking.ID#', field: 'id', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Booking.Date', field: 'date', sortable: true, filter: true, resizable: true, width: 140, cellRenderer: 'journeyrenderer'},
    {headerName: 'Ticket#', field: 'ticket_no', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Travel.Date', field: 'departure_date_time', sortable: true, filter: true, resizable: true, width: 140, cellRenderer: 'journeyrenderer'},
    {headerName: 'Trip.Type', field: 'trip_type', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Customer', field: 'name', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'Departing.City', field: 'source_city', sortable: true, filter: true, resizable: true, width: 150},
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
    linkedbookingrenderer: this.linkedbookingrenderer.bind(this),
    journeyrenderer: this.journeyrenderer.bind(this)
  };

  public bookings: Booking[] = [];

  public rowSelection = 'single';
  public currentUser: User;
  public booking: Booking;
  public bookingPmtDetails: Booking;
  public tickets: Ticket[];
  public assignedSuppliers: Booking[];
  public mode = 'noshow';
  public fullyProcessed = false;
  public allApproved = false;
  public handlebookingform: FormGroup;
  public processed_qty = 0;
  public approved_qty = 0;
  public booking_req_qty = 0;
  public selectedTicket: Ticket;
  public action = 'pass';
  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.commonService.setTitle('My Bookings');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.tickets = [];
    this.current_url = this.router.url;

    this.init(new Booking(), this.tickets);

    setTimeout( () => {
      this.RefreshData(this.currentUser.companyid);
    }, 300);
  }

  init(booking, tickets) {
    this.handlebookingform = this.formBuilder.group({
      id: new FormControl(booking.id),
      pnr: new FormControl(booking.pnr),
      customers: this.formBuilder.array(this.createCustomerControls(booking.customers)),
      tickets: this.formBuilder.array(this.createTicketControls(tickets)),
      notes: new FormControl(booking.notes),
    }, {});
  }

  createCustomerControls(customers: CustomerInfo[]): FormGroup[] {
    const formGroups = [];

    customers.forEach((customer, idx) => {
      formGroups.push(this.formBuilder.group({
        id: new FormControl(customer.id),
        sl: new FormControl(idx),
        name: new FormControl(`${customer.prefix} ${customer.first_name} ${customer.last_name}`),
        age: new FormControl(customer.age),
        mobile: new FormControl(`${customer.mobile_no}`),
        email: new FormControl(customer.email),
        pnr: new FormControl(customer.pnr),
        airline_ticket_no: new FormControl(customer.airline_ticket_no),
        refrence_id: new FormControl(customer.refrence_id),
        booking_id: new FormControl(customer.booking_id),
        status: new FormControl(customer.status),
        action: new FormControl(customer.status),
        cus_booking_id: new FormControl(customer.cus_booking_id)
      }));
    });
    return formGroups;
  }

  createTicketControls(tickets: Ticket[]): FormGroup[] {
    const formGroups = [];
    // const ticketControls = this.handlebookingform.get('tickets') as FormArray;
    // ticket.controls.tktid.value === booking.ticket.id

    tickets.forEach((ticket, idx) => {
      // const select = (parseInt(ticket.id.toString(), 10) === parseInt(this.booking.ticket.id.toString(), 10)) ? 1 : 0;
      const select = (ticket.id === this.booking.ticket.id) ? 1 : 0;
      formGroups.push(this.formBuilder.group({
        select: new FormControl(select),
        tktid: new FormControl(ticket.id),
        source: new FormControl(ticket.source_city),
        destination: new FormControl(ticket.destination_city),
        type: new FormControl(`${ticket.trip_type} WAY`),
        departure_date_time: new FormControl(ticket.departure_date_time),
        arrival_date_time: new FormControl(ticket.arrival_date_time),
        flight_no: new FormControl(ticket.flight_no),
        class: new FormControl(ticket.class),
        supplier: new FormControl(ticket.companyname),
        price: new FormControl(ticket.price),
        costprice: new FormControl(ticket.cost_price),
        no_of_person: new FormControl(ticket.no_of_person),
        order_qty: new FormControl(this.booking.qty),
        status:  new FormControl((select === 1) ? 2 : 0)
      }));
    });

    // ticketControls.push(ticketControls);

    return formGroups;
  }

  get f() { return this.handlebookingform.controls; }

  RefreshData(companyid = 0, userid = 0) {
    const self = this;

    // parentObj.rowData = [];
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

    // tslint:disable-next-line: deprecation
    event.stopPropagation();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
  }

  onRowSelected(mode, row) {
    if (row.node.selected) {
      const parentObj = this;
      parentObj.booking = row.data;
      parentObj.init(row.data, parentObj.tickets);

      const query = {
        'companyid': this.currentUser.companyid,
        'source': parseInt(this.booking.ticket.source, 10),
        'destination': parseInt(this.booking.ticket.destination, 10),
        'from_date': moment(this.booking.departure_date_time).format('YYYY-MM-DD'),
        'to_date': moment(this.booking.arrival_date_time).format('YYYY-MM-DD'),
        'trip_type': 'ONE',
        'approved': 1,
        'available': 'YES',
        'no_of_person': 1,
      };

      this.getBookingPaymentDetails({'bk.id': this.booking.id}).subscribe((res: any) => {
        if (res !== null && res !== undefined && res.length > 0) {
          parentObj.bookingPmtDetails = res[0];
        } else {
          parentObj.bookingPmtDetails = null;
        }
      });

      this.getAssignedSuppliers({'pbooking_id': this.booking.id}).subscribe((res: any[]) => {
        if (res !== null && res !== undefined && res.length > 0) {
          parentObj.assignedSuppliers = res;
        } else {
          parentObj.assignedSuppliers = [];
        }
        // let processedQty = 0;
        // let approvedQty = 0;
        const bookingQty = parseInt(parentObj.booking.qty.toString(), 10);

        const processed_data = this._evaluate_booked_passengers(row.data.customers);

        // row.data.customers.forEach((customer, idx) => {
        //   const customerStatus = parseInt(customer.status, 10);
        //   const refid = parseInt(customer.refrence_id, 10);
        //   if (customerStatus !== 3 && customerStatus !== 4) {
        //     // 1 = Pending | 3 = Rejected | 4 = Cancelled
        //     // processedQty += parseInt(supplier.qty.toString(), 10);
        //     if (customerStatus === 1) {
        //       // This flow failing when orders are splitted into two parts and send into two booking id.
        //       // if (row.data.status === 'PROCESSING') {
        //       if (refid !== 0) {
        //         processedQty++;
        //       }
        //     } else {
        //       processedQty++;
        //     }

        //     if (customerStatus === 2 || customerStatus === 3 || customerStatus === 4 || customerStatus === 127) {
        //       // Mainly settled one.
        //       // Settlement can be done either by Approve, Reject or Cancel the booking.
        //       // Approved one
        //       approvedQty++;
        //     }
        //   } else if ((customerStatus === 3 || customerStatus === 4) && refid === 0) {
        //     processedQty++; // count rejected and cancelled one also.
        //   }
        // });

        // parentObj.assignedSuppliers.forEach(supplier => {
        //   if (supplier.status !== 'REJECTED' && supplier.status !== 'CANCELLED') {
        //     processedQty += parseInt(supplier.qty.toString(), 10);
        //   }
        // });

        this.processed_qty = processed_data.processedQty;
        this.approved_qty = processed_data.approvedQty;
        this.booking_req_qty = bookingQty;

        if (this.processed_qty < bookingQty && parseInt(parentObj.booking.parent_booking_id.toString(), 10) === 0) {
          parentObj.booking.qty = (bookingQty - this.processed_qty);
          (row.data as Booking).qty = (bookingQty - this.approved_qty);
          parentObj.fullyProcessed = false;
          this.getTickets(query).subscribe((res1: any[]) => {
            if (res1 !== null && res1 !== undefined && res1.length > 0) {
              parentObj.tickets = res1;
            } else {
              parentObj.tickets = [];
            }

            parentObj.init(row.data, parentObj.tickets);
          });
        } else {
          parentObj.fullyProcessed = true;
          if (this.approved_qty === bookingQty) {
            parentObj.allApproved = true;
          } else {
            parentObj.allApproved = false;
          }
          parentObj.tickets = [];
          parentObj.init(row.data, parentObj.tickets);
        }
      });

      this.mode = 'edit';
      // alert(inboxMessage.message);
    }
  }

  _evaluate_booked_passengers(customers: any[]) {
    let processedQty = 0;
    let approvedQty = 0;

    customers.forEach((customer, idx) => {
      const customerStatus = parseInt(customer.status, 10);
      const refid = parseInt(customer.refrence_id, 10);
      if (customerStatus !== 3 && customerStatus !== 4) {
        // 1 = Pending | 3 = Rejected | 4 = Cancelled
        // processedQty += parseInt(supplier.qty.toString(), 10);
        if (customerStatus === 1) {
          // This flow failing when orders are splitted into two parts and send into two booking id.
          // if (row.data.status === 'PROCESSING') {
          if (refid !== 0) {
            processedQty++;
          }
        } else {
          processedQty++;
        }

        if (customerStatus === 2 || customerStatus === 3 || customerStatus === 4 || customerStatus === 127) {
          // Mainly settled one.
          // Settlement can be done either by Approve, Reject or Cancel the booking.
          // Approved one
          approvedQty++;
        }
      } else if ((customerStatus === 3 || customerStatus === 4) && refid === 0) {
        processedQty++; // count rejected and cancelled one also.
      }
    });

    this.processed_qty = processedQty;
    this.approved_qty = approvedQty;

    return {processedQty, approvedQty};
  }

  getTickets(query) {
    return this.adminService.getTickets(query);
  }

  getAssignedSuppliers(arg) {
    return this.adminService.getAssignedSuppliers(arg);
  }

  getBookingPaymentDetails(arg) {
    return this.adminService.getBookingPaymentDetails(arg);
  }

  onHandleChangeBooking() {

  }

  deleteCustomer(bookingid, customerid) {
    const parentObj = this;
    const customers = this.f.customers.value;

    if (confirm('Are you sure want to delete this customer?')) {
      this.adminService.deleteBookingCustomer(bookingid, customerid).subscribe((res: any) => {
        if (res) {
          parentObj.booking.customers.forEach((customer, idx) => {
            if (parseInt(customer.id.toString(), 10) === parseInt(customerid, 10)) {
              customer.status = 127;
              customers[idx].status = 127;
              customers[idx].action = 127; // deleted customer

            }
          });
          parentObj.init(parentObj.booking, parentObj.tickets);

          const processed_data = parentObj._evaluate_booked_passengers(parentObj.booking.customers);
        }
      });
    } else {
      // tslint:disable-next-line: deprecation
      event.preventDefault();
    }

  }

  onBack(ev) {
    this.mode = 'noshow';
    setTimeout( () => {
      this.RefreshData(this.currentUser.companyid);
    }, 300);
  }

  onSendToSeller(ev) {
    const companyid = this.currentUser.companyid;
    const customers = this.f.customers.value;
    const tickets = this.f.tickets.value;
    const booking = this.booking;

    const orderedOwnTickets = [];
    const orderedOthersTickets = [];
    let orderedQty = 0;
    let pendingQty = this.booking.qty;


    if (customers !== null && customers.length > 0) {
      pendingQty = 0;
      customers.forEach((customer, idx) => {
        this.booking.customers[idx].status = customer.action;
        const status = parseInt(this.booking.customers[idx].status.toString(), 10);

        if (status === 1 || status === 3 || status === 8) {
          pendingQty++;
        }
      });
    }

    // seperated out own orders and other supplier's orders
    tickets.forEach(ticket => {
      const tktid = parseInt(ticket.tktid, 10);
      const ticket_status = parseInt(ticket.status, 10);
      this.tickets.forEach(tkt => {
        if (tktid === parseInt(tkt.id.toString(), 10) && (ticket_status === 2 || ticket_status === 1) && parseInt(ticket.order_qty, 10) > 0) {
          // only approved with qty assigned ticket should be considered for processing.
          tkt.ordered_qty = ticket.order_qty;
          tkt.ordered_status = parseInt(ticket.status, 10);

          orderedQty += parseInt(ticket.order_qty, 10);
          // if (tkt.companyid === companyid) {
          //   // own ticket
          //   orderedOwnTickets.push(tkt);
          // } else {
            // other's ticket
          orderedOthersTickets.push(tkt);
          // }
        }
      });
    });

    // if (orderedOthersTickets.length === 0 ||  (orderedQty > this.booking.qty)) {
    if (orderedOthersTickets.length === 0 ||  (orderedQty !== pendingQty)) {
      alert('Before placing order selective seller(s) should be [APPROVED] | [HOLD] and you need to settle full quantity of the order. Please note that sum of ordered quantity should be same with total ordered quantity.');
      return;
    }

    if (orderedOwnTickets.length > 0) {
      // Hey we have some qty assigned to himself.
      // So if the status is "Approved" then it will be auto approved and send to customer. No parallel booking will be created.
      // But in this case we need to check PNR is set for those qty or not. If not then raise alarts and send back.
    }

    if (orderedOthersTickets.length > 0) {
      // Ok so this is other supplier. In that case another booking to be raised and change the current booking status as [Processing]
      // and the new booking will be ticket wise and supplier wise.

      const bookings = [];
      let selectedticket = null;
      orderedOthersTickets.forEach(ticket => {
        selectedticket = ticket;
        const refBooking = this.getBookingFromSelectedTicket(ticket, this.booking.customers);
        if (refBooking.customers && refBooking.customers.length > 0) {
          bookings.push(refBooking);
        }
      });

      if (bookings.length > 0 && this.booking.qty === pendingQty) {
        this.adminService.saveBooking({bookings, selectedticket, originalbooking: this.booking, 'price_diff_action': this.action}).subscribe((res: any) => {
          // I think response has come. Now we should change the status of originiting booking
          const mainBooking: any = {};
          mainBooking.id = this.booking.id;
          mainBooking.status = 4; // Processing
          mainBooking.parent_booking_id = this.booking.parent_booking_id;
          mainBooking.pnr = this.booking.pnr;
          mainBooking.notes = this.f.notes.value;
          this.adminService.saveBooking([mainBooking]).subscribe((res1: any) => {
            this.onBack(ev);
          });
        });
      } else {
        alert('Please check at least one customer is approved/rejected. Total order quality must be settled in one go.');
      }
    }
  }

  onSellerAction(mode = '', ev) {
    const customers = this.f.customers.value;
    const processedCustomers = [];
    const mainbooking: any = Object.assign({}, this.booking);
    let proceedFlag = true;
    let errorMsg = 'Please provide PNR details for at least one customer to process.';

    if (mode === '') {
      alert('System error. Please contact with system administrator');
      return;
    }

    customers.forEach((customer, idx) => {
      let action = parseInt(customer.action, 10);
      if (action !== 1) {
        processedCustomers.push(customer);
      }
      if (mainbooking.customers.length > idx) {
        action = parseInt(customer.action, 10);
        if (mode !== 'hold') {
          if (action < 2) {
            if (customer.pnr !== null && customer.pnr !== '') {
              action = 2;
            } else {
              action = 3;
            }
          } else if (action === 2 && (customer.pnr === null || customer.pnr === '')) {
            errorMsg = 'If approving booking against a customer, then please provide PNR value. Approval with empty PNR doesn\'t allow';
            proceedFlag = false;
            return;
          }
        } else {
          action = 8;
        }

        if (mode !== 'hold') {
          if (action !== 127) {
            mainbooking.customers[idx].status = (customer.pnr !== null && customer.pnr !== '') ? action : 3;
            mainbooking.customers[idx].pnr = customer.pnr;
            mainbooking.customers[idx].airline_ticket_no = customer.airline_ticket_no;
          } else {
            mainbooking.customers[idx].status = 127;
            mainbooking.customers[idx].pnr = '';
            mainbooking.customers[idx].airline_ticket_no = '';
          }
        } else {
          mainbooking.customers[idx].status = action;
        }
      }
    });

    if (processedCustomers.length > 0 && proceedFlag) {
      // if (processedCustomers.length !== customers.length) {
        if (processedCustomers.length === customers.length) {
          // alert('Going to approve for those PNR provided. Rest will be rejected.');
          this.booking.notes = this.f.notes.value;
          mainbooking.notes = this.f.notes.value;
          mainbooking.status = (mode === 'approve') ? '2' : (mode === 'hold' ? '1' : '8'); // 2
          delete mainbooking.booking_activities;
          mainbooking.activity = Object.assign([], this.booking.booking_activities);
          if (mainbooking.activity.length > 0) {
            // mainbooking.activity[0].status = (mode === 'approve') ? '32' : '2'; // 32 = Processed | 2 = rejected;
            mainbooking.activity[0].status = (mode === 'approve') ? '32' : (mode === 'hold' ? '1' : '2'); // 32 = Processed | 2 = rejected;
            if (mainbooking.activity[0].notes === null || mainbooking.activity[0].notes === undefined) {
              mainbooking.activity[0].notes = `\n${mainbooking.notes}`;
            } else {
              mainbooking.activity[0].notes += `\n${mainbooking.notes}`;
            }
          }

          if (true) {
            this.adminService.saveBooking([mainbooking]).subscribe((res1: any) => {
              this.onBack(ev);
            });
          }
        }
      // } else {
      //  alert('Going to approve the booking from seller\'s end');
      // }
    } else {
      alert(errorMsg);
      // alert('Please provide PNR details for at least one customer to process.');
    }
  }

  onSellerReject(ev) {
    const customers = this.f.customers.value;
    alert('Going to reject the booking from seller\'s end');
  }

  getBookingFromSelectedTicket(ticket, customers) {
    const refBooking: any = {}; // new Booking();
    refBooking.activity = [{}]; // [new BookingActivity()];

    refBooking.id = -1;
    refBooking.qty = parseInt(ticket.ordered_qty, 10);

    if (parseInt(ticket.ordered_status, 10) === 1) {
      refBooking.status = '64'; // This will be request for hold
    } else {
      refBooking.status = '0'; // This will be pending for the supplier
    }

    refBooking.booking_date = moment().format('YYYY-MM-DD HH:mm:ss');
    refBooking.pbooking_id = this.booking.id;
    refBooking.ticket_id = ticket.id;
    refBooking.customer_userid = this.currentUser.id;
    refBooking.customer_companyid = this.currentUser.companyid;
    refBooking.seller_userid = ticket.user_id;
    refBooking.seller_companyid = ticket.companyid;
    refBooking.message = '';
    refBooking.price = parseFloat(ticket.total);
    refBooking.markup = parseFloat(ticket.spl_markup);
    refBooking.srvchg = parseFloat(ticket.spl_srvchg);
    refBooking.cgst = parseFloat(ticket.spl_cgst);
    refBooking.sgst = parseFloat(ticket.spl_sgst);
    refBooking.igst = parseFloat(ticket.spl_igst);
    refBooking.total = ((refBooking.price + refBooking.markup + refBooking.srvchg + refBooking.cgst + refBooking.sgst) - parseFloat(ticket.spl_disc))  * parseFloat(refBooking.qty);
    refBooking.costprice = parseFloat(ticket.total);
    refBooking.rateplanid = ticket.rate_plan_id;
    refBooking.adult = refBooking.qty;
    refBooking.created_by = this.currentUser.id;
    refBooking.created_on = moment().format('YYYY-MM-DD HH:mm:ss');

    // Booking Activity
    refBooking.activity[0].activity_id = -1;
    refBooking.activity[0].booking_id = -1;
    refBooking.activity[0].activity_date = moment().format('YYYY-MM-DD HH:mm:ss');
    refBooking.activity[0].source_userid = this.currentUser.id;
    refBooking.activity[0].source_companyid = this.currentUser.companyid;
    refBooking.activity[0].requesting_by = 4;
    refBooking.activity[0].target_userid = ticket.user_id;
    refBooking.activity[0].target_companyid = ticket.companyid;
    refBooking.activity[0].requesting_to = 8;

    if (refBooking.status === '64') {
      refBooking.activity[0].status = 128;
    } else {
      refBooking.activity[0].status = 0;
    }
    refBooking.activity[0].created_by = ticket.user_id;
    refBooking.activity[0].created_on = moment().format('YYYY-MM-DD HH:mm:ss');
    refBooking.activity[0].charge_amount = 0;

    let indx = 0;
    let processedIndx = 0;
    const selectedCustomers: any = [];
    while (customers && customers.length > 0 && indx < customers.length && processedIndx < refBooking.qty) {
      // Ignore removed customers
      if ((parseInt(customers[indx].refrence_id, 10) === 0 || parseInt(customers[indx].status, 10) === 3) && parseInt(customers[indx].status, 10) !== 127) {
        const selectedCustomer: any = {};
        customers[indx].refrence_id = -1;
        selectedCustomer.id = customers[indx].id;
        selectedCustomer.refrence_id = -1;

        if (refBooking.status === '64') {
          selectedCustomer.status = 16;
          customers[indx].status = 16;
        } else {
          selectedCustomer.status = 1;
          customers[indx].status = 1;
        }

        selectedCustomers.push(selectedCustomer);

        processedIndx++;
      }
      indx++;
    }

    refBooking.customers = selectedCustomers;

    // delete refBooking.customers;
    // delete refBooking.booking_activities;

    return refBooking;
  }

  getStatus(status) {
    status = parseInt(status, 10);
    let statusCode = ''; // (status === 2 ? 'Approved' : (status === 8 ? 'Hold' : (status === 3 ? 'Reject' : (status === 16 ? 'Request For Hold' : ''))));

    switch (status) {
      case 2:
        statusCode = 'Approved';
        break;
      case 3:
        statusCode = 'Rejected';
        break;
      case 4:
        statusCode = 'Cancelled';
        break;
      case 8:
        statusCode = 'Hold';
        break;
      case 16:
        statusCode = 'Request For Hold';
        break;
      case 32:
        statusCode = 'Request For Cancel';
        break;
      case 127:
        statusCode = 'DELETED';
        break;
      default:
        break;
    }

    return statusCode;
  }

  handleChange(tkt, control, $event) {
    const selection = $event.target.checked;

    const ticketsFormArray = this.handlebookingform.get('tickets') as FormArray;

    ticketsFormArray.controls.forEach(ticketForm => {
      if (ticketForm.value.tktid === tkt) {
        this.selectedTicket = ticketForm.value;
        // (ticketForm.get('select') as FormControl).value = $event.target.checked ? 1 : 0;
        (ticketForm.get('select') as FormControl).setValue($event.target.checked ? 1 : 0);
        (ticketForm.get('order_qty') as FormControl).setValue(this.booking.qty);
        (ticketForm.get('status') as FormControl).setValue(2);
      } else {
        (ticketForm.get('select') as FormControl).setValue(0);
        (ticketForm.get('order_qty') as FormControl).setValue(0);
        (ticketForm.get('status') as FormControl).setValue(0);
      }
    });
  }

  handlePriceDiffChange(tktid, action, $event) {
    const selection = $event.target.checked;
    this.action = action;
    const ticketsFormArray = this.handlebookingform.get('tickets') as FormArray;

    // ticketsFormArray.controls.forEach(ticketForm => {
    //   if (ticketForm.value.tktid === tktid) {

    //   }
    // });
  }
}
