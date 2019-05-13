import { Component, OnInit, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public title = 'app';
  menuTitle = 'user';

  public columnDefs = [
      {headerName: 'User.ID', field: 'user_id', sortable: true, filter: true, resizable: true, width: 70},
      {headerName: 'Name', field: 'name', sortable: true, filter: true, resizable: true, width: 120},
      {headerName: 'Email', field: 'email', sortable: true, filter: true, resizable: true, width: 175, cellRenderer: 'emailrenderer'},
      {headerName: 'Mobile', field: 'mobile', sortable: true, filter: true, resizable: true, width: 100},
      {headerName: 'Supplier', field: 'is_supplier', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'chkrenderer'},
      {headerName: 'Customer', field: 'is_customer', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'chkrenderer'},
      {headerName: 'Active', field: 'active', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'chkrenderer'},
      {headerName: 'Type', field: 'type', sortable: true, filter: true, resizable: true, width: 50},
      {headerName: 'Allow.Credit', field: 'credit_ac', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'chkrenderer'},
      {headerName: 'Permissions', field: 'permission', sortable: true, filter: true, resizable: true, width: 100},
      {headerName: 'Admin', field: 'is_admin', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'chkrenderer'},
      {headerName: 'UUID', field: 'uid', sortable: true, filter: true, resizable: true, width: 75},
  ];

  public components = {
    chkrenderer: this.chkrenderer,
    emailrenderer: this.emailrenderer
  };

  public rowData: User[] = [];

  public rowSelection = 'single';
  private currentUser: User;
  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService) {

  }

  ngOnInit() {
    this.commonService.setTitle('User Management');

    this.currentUser = this.authenticationService.currentLoggedInUser;

    this.usersService.getUsersByCompany(this.currentUser.companyid).subscribe((res: User[]) => {
      this.rowData = res;
    });
  }

  emailrenderer(params): any {
    const element = document.createElement('a');
    element.href = 'mailto: ' + params.value;
    element.appendChild(document.createTextNode(params.value));
    return element;
  }

  chkrenderer(params): any {
    // const element = document.createElement('span');
    // const imageElement = document.createElement('img');
    // imageElement.width = 32;
    // imageElement.height = 32;
    // // visually indicate if this months value is higher or lower than last months value
    const element = document.createElement('i');

    if (parseInt(params.value, 10) === 1) {
      element.className = 'fa fa-check';
      element.setAttribute('style', 'font-size: 22px; color: #00ff00');
    } else {
      element.className = 'fa fa-close';
      element.setAttribute('style', 'font-size: 22px; color: #ff0000');
    }
    // element.appendChild(imageElement);
    // // element.appendChild(document.createTextNode(params.value));
    // element.appendChild(document.createTextNode(params.value));
    return element;
  }
}
