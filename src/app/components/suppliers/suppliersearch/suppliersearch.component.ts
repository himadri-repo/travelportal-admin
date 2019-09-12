import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { Company } from 'src/app/models/company';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AdminService } from 'src/app/services/admin.service';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material';
import { InviteComponent } from '../../communication/invite/invite.component';
import { Supplier } from 'src/app/models/supplier';

@Component({
  selector: 'app-suppliersearch',
  templateUrl: './suppliersearch.component.html',
  styleUrls: ['./suppliersearch.component.scss']
})
export class SuppliersearchComponent implements OnInit {
  public title = 'app';
  menuTitle = 'suppliers';
  message = '';
  matDialogRef: MatDialogRef<InviteComponent>;

  public columnDefs = [
      {headerName: 'Code', field: 'tenent_code', sortable: true, filter: true, resizable: true, width: 70},
      {headerName: 'Name', field: 'display_name', sortable: true, filter: true, resizable: true, width: 200, cellRenderer: 'companynamerenderer'},
      {headerName: 'Address', field: 'address', sortable: true, filter: true, resizable: true, width: 120},
      {headerName: 'Email', field: 'email', sortable: true, filter: true, resizable: true, width: 200, cellRenderer: 'emailrenderer'},
      {headerName: 'Services', field: 'services', sortable: true, filter: true, resizable: true, width: 350},
      {headerName: 'Actions', field: 'id', sortable: true, filter: true, resizable: true, width: 200, cellRenderer: 'actionsrenderer', cellRendererParams: {onInviteClick: this.sendMessage.bind(this), onCommunicationClick: this.readMessage.bind(this)}},
  ];

  public components = {
    actionsrenderer: this.actionsrenderer.bind(this),
    emailrenderer: this.emailrenderer.bind(this),
    companynamerenderer: this.companynamerenderer.bind(this)
  };

  public rowData: Company[] = [];
  public mySuppliers: Supplier[] = [];

  public rowSelection = 'single';
  private currentUser: User;
  private currentCompany: Company;
  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, private dialog: MatDialog) {

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
    const id = parseInt(params.value, 10);
    const oninviteclick = params.onInviteClick;
    const onmessageclick = params.onCommunicationClick;
    const data = params.data;
    const currentCompanyid = parseInt(this.currentUser.companyid.toString(), 10);
    const currentCompanyName = this.currentUser.cname;

    // Add action element for inviting to suppliers / wholesalers
    let edit_element = this.getInvitationLink(params, 'invite', (ev) => {
      oninviteclick(parseInt(data.id, 10), data.display_name, currentCompanyid, currentCompanyName);
    });

    const supplier = this.mySuppliers.find((supl, idx) => {
      return parseInt(supl.id.toString(), 10) === id;
    });

    if (currentCompanyid !== id && (supplier === null || supplier === undefined)) {
      action_container.appendChild(edit_element);
    }

    // Add action element for message reading
    edit_element = this.getInvitationLink(params, 'communication', (ev) => {
      onmessageclick(parseInt(data.id, 10), currentCompanyid);
    });

    action_container.appendChild(edit_element);

    return action_container;
  }

  public getInvitationLink(params, actionName, callback) {
    const edit_element = document.createElement('i');

    if (actionName.toLowerCase() === 'invite') {
      edit_element.title = `Invite ${params.data.display_name} to join your network.`;
      edit_element.className = 'fa fa-envelope-o actionicon actionicon-bl';
    } else if (actionName.toLowerCase() === 'communication') {
      edit_element.title = `Check message received.`;
      edit_element.className = 'fa fa-comments-o actionicon actionicon-gr';
    }
    edit_element.setAttribute('style', 'font-size: 18px; color: #000000; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');

    if (callback !== null) {
      edit_element.addEventListener('click', callback);
    }
    return edit_element;
  }

  ngOnInit() {
    this.commonService.setTitle('Supplier Management - Search');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.currentCompany = this.authenticationService.currentCompany;

    this.loadSuppliers();
    // this.loadMySuppliers(msg => {
    //   this.loadSuppliers();
    // });
  }

  loadMySuppliers(callback) {
    this.adminService.getSuppliersByCompany(this.currentUser.companyid).subscribe((res: any) => {
      // Supplier[]
      this.mySuppliers = res;
      if (res === null || res === undefined || res === false) {
        this.mySuppliers = [];
      }
      if (callback !== null) {
        callback(res);
      }
    });
  }


  loadSuppliers() {
    this.rowData = [];
    // 1 means Visible as Wholesaler
    if ((this.currentCompany.settings.configuration.search_visibility & 1) === 1) {
      this.adminService.searchSuppliers().subscribe((res: Company[]) => {
        this.rowData = this.sanitizeData(res);
      }, err => {
        console.log(err);
      });
    } else {
      this.message = 'Please enable Visible as Wholesaler option to search any suppliers, as you will be wholesaler to them';
    }
  }

  private sanitizeData(companylist: Company[]): Company[] {
    const companies: Company[] = [];
    if (companylist != null && companylist.length > 0) {
      companylist.forEach(company => {
        if (company.configuration != null && company.configuration !== '') {
          const configType = company.configtype;
          if (configType === 'object') {
            const config = JSON.parse(company.configuration);
            // 1 means visible as wholesaler | 2 means visible as supplier
            if ((parseInt(config.search_visibility, 10) & 2) === 2) {
              companies.push(company);
            }
          }
        }
      });
    }

    return companies;
  }

  sendMessage(inviteeid, inviteeCompanyName, invitorid, invitorCompanyName) {
    // alert(companyid);
    if ((this.currentCompany.type & 4) === 4) {
      // logged-in company is a wholesaler type. So can request for supplier
      this.openDialog(inviteeid, inviteeCompanyName, invitorid, invitorCompanyName, {showInvite: true, defaultTabIndex: 0});
    } else {
      alert('You are not a wholesaler. So can`t invite any supplier.If you want more inventory accrosse globe, please enhance your account as wholesaler.\nYou can have both wholesaler and supplier feature.');
    }
  }

  readMessage(inviteeid, inviteeCompanyName, invitorid, invitorCompanyName) {
    this.openDialog(inviteeid, inviteeCompanyName, invitorid, invitorCompanyName, {showInvite: false, defaultTabIndex: 1});
  }

  openDialog(supplierid, suppliername, companyid, companyname, option) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    dialogConfig.width = '70%';
    dialogConfig.height = '700px';
    dialogConfig.data = {type: 'Invite Supplier', inviteeid: supplierid, inviteename: suppliername, invitorid: companyid, invitorname: companyname, option};

    this.matDialogRef = this.dialog.open(InviteComponent, dialogConfig);
    this.matDialogRef.afterClosed().subscribe(obsrv => {
      this.loadSuppliers();
    });
  }
}
