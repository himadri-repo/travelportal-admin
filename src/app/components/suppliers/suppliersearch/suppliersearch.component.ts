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

  public rowSelection = 'single';
  private currentUser: User;
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
    const currentCompanyid = this.currentUser.companyid;
    const currentCompanyName = this.currentUser.cname;

    // Add action element for inviting to suppliers / wholesalers
    let edit_element = this.getInvitationLink(params, 'invite', (ev) => {
      oninviteclick(parseInt(data.id, 10), data.display_name, currentCompanyid, currentCompanyName);
    });

    if (currentCompanyid !== id) {
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
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.rowData = [];
    this.adminService.searchSuppliers().subscribe((res: Company[]) => {
      this.rowData = res;
    });
  }

  sendMessage(inviteeid, inviteeCompanyName, invitorid, invitorCompanyName) {
    // alert(companyid);
    this.openDialog(inviteeid, inviteeCompanyName, invitorid, invitorCompanyName);
  }

  readMessage(companyid) {
    alert(companyid);
  }

  openDialog(supplierid, suppliername, companyid, companyname) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    dialogConfig.width = '70%';
    dialogConfig.height = '700px';
    dialogConfig.data = {type: 'Invite Supplier', inviteeid: supplierid, inviteename: suppliername, invitorid: companyid, invitorname: companyname};

    this.matDialogRef = this.dialog.open(InviteComponent, dialogConfig);
    this.matDialogRef.afterClosed().subscribe(obsrv => {
      this.loadSuppliers();
    });
  }
}
