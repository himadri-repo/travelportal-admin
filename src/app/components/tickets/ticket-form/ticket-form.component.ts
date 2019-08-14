import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Ticket } from 'src/app/models/ticket';
import { User } from 'src/app/models/user';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';

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
export class TicketFormComponent implements OnInit, OnChanges {
  public currentUser: User;
  public cities: any;
  public airlines: any;
  public handleticketform: FormGroup;

  public selectedMoment = new Date();
  public selectedMoment2 = new FormControl(new Date());
  public selectedMoments = [new Date(2018, 1, 12, 10, 30), new Date(2018, 3, 21, 20, 30)];

  public submitted = false;

  @Input() public ticket: Ticket;

  @Output() public close = new EventEmitter();
  @Output() public save = new EventEmitter();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, private formBuilder: FormBuilder) {
    // this.ticket = new Ticket();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.init(this.ticket);
  }

  ngOnInit() {
    this.currentUser = this.authenticationService.currentLoggedInUser;

    this.loadCities();
    this.loadAirlines();

    this.init(new Ticket());

    // this.ticket.subscribe(ticket => {
    //   this.init(ticket);
    // });
    // setTimeout( () => {
    //   this.init(this.ticket);
    // }, 300);
  }

  init(ticket: Ticket) {
    this.handleticketform = this.formBuilder.group({
      ticket_no: new FormControl(ticket.ticket_no),
      trip_type: new FormControl(ticket.trip_type),
      approve: new FormControl(ticket.approved),
      refundable: new FormControl(ticket.refundable === 'Y' ? 1 : 0),
      sale_type: new FormControl(ticket.sale_type),

      source:  new FormControl(ticket.source),
      destination: new FormControl(ticket.destination),
      departure_date_time: new FormControl(new Date(ticket.departure_date_time)),
      arrival_date_time: new FormControl(new Date(ticket.arrival_date_time)),
      airline: new FormControl(ticket.airline),
      class: new FormControl(ticket.class),
      flight_no: new FormControl(ticket.flight_no),
      terminal: new FormControl(ticket.terminal),

      source1:  new FormControl(ticket.source1),
      destination1: new FormControl(ticket.destination1),
      departure_date_time1: new FormControl(new Date(ticket.departure_date_time1)),
      arrival_date_time1: new FormControl(new Date(ticket.arrival_date_time1)),
      airline1: new FormControl(ticket.airline1),
      class1: new FormControl(ticket.class1),
      flight_no1: new FormControl(ticket.flight_no1),
      terminal1: new FormControl(ticket.terminal1),

      no_of_stop: new FormControl(ticket.no_of_stops),
      no_of_person: new FormControl(ticket.no_of_person),
      price: new FormControl(ticket.price),
      price_child: new FormControl(ticket.price_child),
      price_infant: new FormControl(ticket.price_infant),
      baggage: new FormControl(ticket.baggage),
      meal: new FormControl(ticket.meal),

      pnr: new FormControl(ticket.pnr),
      cancel_rate: new FormControl(ticket.cancel_rate),
      booking_freeze_by: new FormControl(new Date(ticket.booking_freeze_by)),
    }, {});
  }

  get tkt() { return this.handleticketform.controls; }

  public cityname(city_code: any = -1): any {
    if (city_code === null || city_code === '') {
      return '';
    }
    city_code = parseInt(city_code.toString(), 10);
    let sourceName = '';

    if (this.cities && this.cities.length > 0) {
      this.cities.forEach((city, idx) => {
        if (parseInt(city.id, 10) === city_code) {
          sourceName = city.city;
        }
      });
    }

    return sourceName;
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

  closeview(ev) {
    this.close.emit({command: 'close', data: ev});
    this.submitted = false;
  }

  onHandleChangeTicket() {
    this.submitted = true;

    if (this.handleticketform.valid) {
      const ticket = this.getPostedTicket();
      console.log('saving ticket');

      this.adminService.saveTicket([ticket]).subscribe((res: any) => {
        if (res) {
          alert('Ticket saved.');
          this.closeview(null);
        }
      });
    } else {
      console.log('Ticket form is invalid');
    }
  }

  private getPostedTicket(): any {
    const ticket = new Ticket();

    delete ticket.trans_type;
    ticket.ticket_no = this.tkt.ticket_no.value;
    ticket.trip_type = this.tkt.trip_type.value;
    ticket.approved = this.tkt.approve.value;

    ticket.refundable = this.tkt.refundable.value === '1' ? 'Y' : 'N';

    ticket.sale_type = this.tkt.sale_type.value.toString().toLowerCase();
    ticket.source = this.tkt.source.value;
    ticket.destination = this.tkt.destination.value;
    ticket.departure_date_time = moment(this.tkt.departure_date_time.value).format('YYYY-MM-DD HH:mm');
    ticket.arrival_date_time = moment(this.tkt.arrival_date_time.value).format('YYYY-MM-DD HH:mm');
    ticket.airline = this.tkt.airline.value;
    ticket.class = this.tkt.class.value;
    ticket.flight_no = this.tkt.flight_no.value;
    ticket.terminal = this.tkt.terminal.value;

    ticket.source1 = this.tkt.source1.value ? this.tkt.source1.value : 0;
    ticket.destination1 = this.tkt.destination1.value ? this.tkt.destination1.value : 0;

    if (ticket.source1 === 0) {
      ticket.departure_date_time1 = new Date(1899, 11, 31);
      ticket.arrival_date_time1 = new Date(1899, 11, 31);
      ticket.airline1 = this.tkt.airline1.value ? this.tkt.airline1.value : 0;
      ticket.class1 = this.tkt.class1.value ? this.tkt.class1.value : '';
      ticket.aircode1 = '';
      ticket.flight_no1 = '';
      ticket.terminal1 = '';
    } else {
      ticket.departure_date_time1 = moment(this.tkt.departure_date_time1.value).format('YYYY-MM-DD HH:mm');
      ticket.arrival_date_time1 = moment(this.tkt.arrival_date_time1.value).format('YYYY-MM-DD HH:mm');
      ticket.airline1 = this.tkt.airline1.value ? this.tkt.airline1.value : 0;
      ticket.class1 = this.tkt.class1.value ? this.tkt.class1.value : '';
      ticket.aircode1 = '';
      ticket.flight_no1 = this.tkt.flight_no1.value;
      ticket.terminal1 = this.tkt.terminal1.value;
    }


    ticket.no_of_stops = this.tkt.no_of_stop.value;
    ticket.no_of_person = this.tkt.no_of_person.value;
    ticket.max_no_of_person = this.tkt.no_of_person.value;
    ticket.availibility = this.tkt.no_of_person.value;
    ticket.price = this.tkt.price.value;
    ticket.price_child = this.tkt.price_child.value;
    ticket.price_infant = this.tkt.price_infant.value;
    ticket.total = this.tkt.price.value;
    ticket.baggage = this.tkt.baggage.value;
    ticket.meal = this.tkt.meal.value;
    ticket.pnr = this.tkt.pnr.value;
    ticket.cancel_rate = this.tkt.cancel_rate.value;
    ticket.booking_freeze_by = moment(this.tkt.booking_freeze_by.value).format('YYYY-MM-DD HH:mm');
    ticket.available = parseInt(this.tkt.no_of_person.value, 10) > 0 ? 'YES' : 'NO';

    if (this.ticket.id <= 0) {
      delete ticket.id;
      ticket.created_by = this.currentUser.id;
      ticket.created_date = new Date();
      ticket.created_on = new Date();
      ticket.companyid = this.currentUser.companyid;
      ticket.max_no_of_person = this.tkt.no_of_person.value;
      ticket.user_id = this.currentUser.id;
      ticket.approved = 1;
    } else {
      // ticket.created_date = this.ticket.created_date;
      ticket.id = this.ticket.id;
      ticket.updated_by = this.currentUser.id;
      ticket.updated_on = new Date();
      ticket.companyid = this.ticket.companyid;
    }

    return ticket;
  }
}
