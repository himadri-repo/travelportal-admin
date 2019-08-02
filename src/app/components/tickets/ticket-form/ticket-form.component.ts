import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Ticket } from 'src/app/models/ticket';
import { User } from 'src/app/models/user';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
// import { OWL_MOMENT_DATE_TIME_FORMATS } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time-format.class';

// export const CUSTOM_FORMAT = {
//   parseInput: 'lll',
//   fullPickerInput: 'lll',
//   datePickerInput: 'LL',
//   timePickerInput: 'LT',
//   monthYearLabel: 'MMM YYYY',
//   dateA11yLabel: 'LL',
//   monthYearA11yLabel: 'MMMM YYYY',
// };

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss'],
  // providers: [
  //   {provide: OWL_MOMENT_DATE_TIME_FORMATS, useValue: CUSTOM_FORMAT},
  // ],
})
export class TicketFormComponent implements OnInit {
  public currentUser: User;
  public cities: any;
  public airlines: any;
  public handleticketform: FormGroup;

  public selectedMoment = new Date();
  public selectedMoment2 = new FormControl(new Date());
  public selectedMoments = [new Date(2018, 1, 12, 10, 30), new Date(2018, 3, 21, 20, 30)];

  @Input() public ticket: Ticket;

  @Output() public close = new EventEmitter();
  @Output() public save = new EventEmitter();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, private formBuilder: FormBuilder) {
    this.ticket = new Ticket();
  }

  ngOnInit() {
    this.currentUser = this.authenticationService.currentLoggedInUser;

    this.loadCities();
    this.loadAirlines();
    this.init();
  }

  init() {
    this.handleticketform = this.formBuilder.group({
      ticket_no: new FormControl(''),
      trip_type: new FormControl('ONE'),
      approve: new FormControl(1),
      refundable: new FormControl(1),
      sale_type: new FormControl('request'),

      source:  new FormControl(-1),
      destination: new FormControl(-1),
      departure_date_time: new FormControl(new Date()),
      arrival_date_time: new FormControl(new Date()),
      airline: new FormControl(-1),
      class: new FormControl('ECONOMY'),
      flight_no: new FormControl(''),
      terminal: new FormControl(''),

      source1:  new FormControl(-1),
      destination1: new FormControl(-1),
      departure_date_time1: new FormControl(new Date()),
      arrival_date_time1: new FormControl(new Date()),
      airline1: new FormControl(-1),
      class1: new FormControl('ECONOMY'),
      flight_no1: new FormControl(''),
      terminal1: new FormControl(''),

      no_of_stop: new FormControl(0),
      no_of_person: new FormControl(0),
      price: new FormControl(0.0),
      price_child: new FormControl(0.0),
      price_infant: new FormControl(0.0),
      baggage: new FormControl(0.0),
      meal: new FormControl(0.0),

      pnr: new FormControl(''),
      cancel_rate: new FormControl(0.00),
      booking_freeze_by: new FormControl(new Date()),
    }, {});
  }

  get tkt() { return this.handleticketform.controls; }

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

  closeview(ev) {
    this.close.emit({command: 'close', data: ev});
  }

  onHandleChangeTicket() {
    if (this.handleticketform.valid) {
      console.log('saving ticket');
    } else {
      console.log('Ticket form is invalid');
    }
  }
}
