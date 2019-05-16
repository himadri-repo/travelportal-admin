import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/customer';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { User } from 'src/app/models/user';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material';
import { CustomerinfoComponent } from './customerinfo/customerinfo.component';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  public title = 'app';
  menuTitle = 'customers';
  message = '';
  matDialogRef: MatDialogRef<CustomerinfoComponent>;

  public columnDefs = [
    {headerName: 'Actions', field: 'id', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'actionrenderer', cellRendererParams: {onClick: this.AddOrEditCustomer.bind(this)}},
    {headerName: 'Code', field: 'user_id', sortable: true, filter: true, resizable: true, width: 70},
    {headerName: 'Name', field: 'name', sortable: true, filter: true, resizable: true, width: 175},
    {headerName: 'Email', field: 'email', sortable: true, filter: true, resizable: true, width: 225, cellRenderer: 'emailrenderer'},
    {headerName: 'Mobile', field: 'mobile', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Type', field: 'type', sortable: true, filter: true, resizable: true, width: 150, cellRenderer: 'typerenderer'},
    {headerName: 'Allow.Credit', field: 'credit_ac', sortable: true, filter: true, resizable: true, width: 350, cellRenderer: 'chkrenderer'}
];

  public components = {
    actionrenderer: this.actionrenderer,
    chkrenderer: this.chkrenderer,
    typerenderer: this.typerenderer,
    emailrenderer: this.emailrenderer
  };

  // [loadingOverlayComponent]="customLoadingOverlay"
  // [noRowsOverlayComponent]="customNoRowsOverlay"

  public rowData: Customer[] = [];

  public rowSelection = 'single';
  public currentUser: User;
  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, private dialog: MatDialog) {

  }

  ngOnInit() {
    this.commonService.setTitle('Customers Management');
    this.loadGrid();
  }

  loadGrid() {
    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.message = 'Please wait, loading customer data';
    this.adminService.getCustomersByCompany(this.currentUser.companyid).subscribe((res: Customer[]) => {
      this.rowData = res;
      this.message = '';
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
    const id = parseInt(params.value, 10);
    const onclick = params.onClick;
    const data = params.data;

    edit_element.className = 'fa fa-pencil-square-o';
    edit_element.setAttribute('style', 'font-size: 18px; color: #000000; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');
    edit_element.addEventListener('click', (ev) => {
      // alert(`Id : ${id}`);
      // this.AddOrEditCustomer(this.currentUser.companyid, id);
      onclick(parseInt(data.companyid, 10), parseInt(data.id, 10));
    });

    action_container.appendChild(edit_element);

    return action_container;
  }

  AddOrEditCustomer(companyid, customerid) {
    // alert(`Company Id => ${companyid} | Customer Id => ${customerid}`);
    this.openDialog(companyid, customerid);
  }

  openDialog(companyid, customerid) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    dialogConfig.width = '50%';
    dialogConfig.data = {companyid, customerid};

    this.matDialogRef = this.dialog.open(CustomerinfoComponent, dialogConfig);
    this.matDialogRef.afterClosed().subscribe(obsrv => {
      this.loadGrid();
    });
  }
}
