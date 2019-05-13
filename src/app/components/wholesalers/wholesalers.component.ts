import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { Wholesaler } from 'src/app/models/wholesaler';

@Component({
  selector: 'app-wholesalers',
  templateUrl: './wholesalers.component.html',
  styleUrls: ['./wholesalers.component.scss']
})
export class WholesalersComponent implements OnInit {
  public title = 'app';
  menuTitle = 'wholesalers';

  public columnDefs = [
      {headerName: 'Code', field: 'tenent_code', sortable: true, filter: true, resizable: true, width: 70},
      {headerName: 'Name', field: 'display_name', sortable: true, filter: true, resizable: true, width: 120},
      {headerName: 'Contact', field: 'primary_user_name', sortable: true, filter: true, resizable: true, width: 120},
      {headerName: 'Email', field: 'primary_user_email', sortable: true, filter: true, resizable: true, width: 175, cellRenderer: 'emailrenderer'},
      {headerName: 'Mobile', field: 'primary_user_mobile', sortable: true, filter: true, resizable: true, width: 100},
      {headerName: 'Website', field: 'baseurl', sortable: true, filter: true, resizable: true, width: 150},
      {headerName: 'Services', field: 'services', sortable: true, filter: true, resizable: true, width: 350},
  ];

  public components = {
    chkrenderer: this.chkrenderer,
    emailrenderer: this.emailrenderer
  };

  public rowData: Wholesaler[] = [];

  public rowSelection = 'single';
  private currentUser: User;
  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService) {

  }

  ngOnInit() {
    this.commonService.setTitle('Wholesaler Management');

    this.currentUser = this.authenticationService.currentLoggedInUser;

    this.adminService.getWholesalersByCompany(this.currentUser.companyid).subscribe((res: Wholesaler[]) => {
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
