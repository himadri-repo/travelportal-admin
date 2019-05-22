import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { Company } from 'src/app/models/company';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-search',
  templateUrl: './wholesalersearch.component.html',
  styleUrls: ['./wholesalersearch.component.scss']
})
export class WholesalerSearchComponent implements OnInit {
  public title = 'app';
  menuTitle = 'wholesalers';
  message = '';

  public columnDefs = [
      {headerName: 'Code', field: 'tenent_code', sortable: true, filter: true, resizable: true, width: 70},
      {headerName: 'Name', field: 'display_name', sortable: true, filter: true, resizable: true, width: 200, cellRenderer: 'companynamerenderer'},
      {headerName: 'Address', field: 'address', sortable: true, filter: true, resizable: true, width: 120},
      {headerName: 'Email', field: 'email', sortable: true, filter: true, resizable: true, width: 200, cellRenderer: 'emailrenderer'},
      {headerName: 'Services', field: 'services', sortable: true, filter: true, resizable: true, width: 350},
      {headerName: 'Actions', field: 'id', sortable: true, filter: true, resizable: true, width: 200, cellRenderer: 'actionsrenderer', cellRendererParams: {onClick: this.sendMessage.bind(this)}},
  ];

  public components = {
    actionsrenderer: this.actionsrenderer,
    emailrenderer: this.emailrenderer,
    companynamerenderer: this.companynamerenderer
  };

  public rowData: Company[] = [];

  public rowSelection = 'single';
  private currentUser: User;
  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService) {

  }

  emailrenderer(params): any {
    const element = document.createElement('a');
    element.href = 'mailto: ' + params.value;
    element.appendChild(document.createTextNode(params.value));
    return element;
  }

  companynamerenderer(params): any {
    const element = document.createElement('a');
    element.href = params.data.baseurl;
    element.target = '_blank';
    element.appendChild(document.createTextNode(params.value));
    return element;
  }

  actionsrenderer(params): any {
    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: cneter');
    const edit_element = document.createElement('i');
    const id = parseInt(params.value, 10);
    const onclick = params.onClick;
    const data = params.data;

    edit_element.className = 'fa fa-envelope-o';
    edit_element.setAttribute('style', 'font-size: 18px; color: #000000; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');
    edit_element.title = `Invite ${params.data.display_name} to join your network`;
    edit_element.addEventListener('click', (ev) => {
      // alert(`Id : ${id}`);
      // this.AddOrEditCustomer(this.currentUser.companyid, id);
      onclick(parseInt(data.id, 10));
    });

    action_container.appendChild(edit_element);

    return action_container;
  }

  ngOnInit() {
    this.commonService.setTitle('Wholesaler Management - Search');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.loadWholesalers();
  }

  loadWholesalers() {
    this.rowData = [];
    this.adminService.searchWholesalers().subscribe((res: Company[]) => {
      this.rowData = res;
    }, err => {
      console.log(err);
    });
  }

  sendMessage(companyid) {
    alert(companyid);
  }
}
