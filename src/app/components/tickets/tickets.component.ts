import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { Supplier } from 'src/app/models/supplier';
import { Ticket } from 'src/app/models/ticket';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {
  public title = 'app';
  menuTitle = 'inventory';

  public columnDefs = [
    {headerName: 'Ticket#', field: 'ticket_no', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Dept.City', field: 'source', sortable: true, filter: true, resizable: true, width: 140},
    {headerName: 'Arrv.City', field: 'destination', sortable: true, filter: true, resizable: true, width: 140},
    {headerName: 'Trip.Type', field: 'trip_type', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Dept.Time', field: 'departure_date_time', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Arrv.Time', field: 'arrival_date_time', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Flight#', field: 'flight_no', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Seats', field: 'no_of_person', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Class', field: 'class', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'Airline', field: 'airline', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'Aircode', field: 'aircode', sortable: true, filter: true, resizable: true, width: 80},
    {headerName: 'Price', field: 'price', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Admin.Markup', field: 'admin_markup', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Supplier', field: 'supplier', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Markup', field: 'markup_rate', sortable: true, filter: true, resizable: true, width: 75},
    {headerName: 'Tag', field: 'data_collected_from', sortable: true, filter: true, resizable: true, width: 75}
];

  public components = {
    actionrenderer: this.actionrenderer,
    chkrenderer: this.chkrenderer,
    typerenderer: this.typerenderer,
    emailrenderer: this.emailrenderer
  };

  // [loadingOverlayComponent]="customLoadingOverlay"
  // [noRowsOverlayComponent]="customNoRowsOverlay"

  public rowData: Ticket[] = [];

  public rowSelection = 'single';
  private currentUser: User;
  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService) {

  }

  ngOnInit() {
    this.commonService.setTitle('Inventory Management');

    this.currentUser = this.authenticationService.currentLoggedInUser;

    this.adminService.getTicketsByCompany(this.currentUser.companyid).subscribe((res: Ticket[]) => {
      this.rowData = res;
    });
  }

  emailrenderer(params): any {
    const element = document.createElement('a');
    element.href = 'mailto: ' + params.value;
    element.appendChild(document.createTextNode(params.value));
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
    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: cneter');
    const edit_element = document.createElement('i');
    let id = parseInt(params.value, 10);

    edit_element.className = 'fa fa-pencil-square-o';
    edit_element.setAttribute('style', 'font-size: 18px; color: #000000; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');
    edit_element.addEventListener('click', (ev) => {
      alert(`Id : ${id}`);
    });

    action_container.appendChild(edit_element);

    return action_container;
  }
}
