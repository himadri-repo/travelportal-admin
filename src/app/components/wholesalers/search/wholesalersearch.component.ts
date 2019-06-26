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
import { Wholesaler } from 'src/app/models/wholesaler';

@Component({
  selector: 'app-search',
  templateUrl: './wholesalersearch.component.html',
  styleUrls: ['./wholesalersearch.component.scss']
})
export class WholesalerSearchComponent implements OnInit {
  public title = 'app';
  menuTitle = 'wholesalers';
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
  public myWholesalers: Wholesaler[] = [];

  public rowSelection = 'single';
  public currentUser: User;
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

    // if (parseInt(currentCompanyid.toString(), 10) !== id) {
    //   action_container.appendChild(edit_element);
    // }

    const wholesaler = this.myWholesalers.find((whls, idx) => {
      return parseInt(whls.id.toString(), 10) === id;
    });

    if (currentCompanyid !== id && (wholesaler === null || wholesaler === undefined)) {
      action_container.appendChild(edit_element);
    }

    // Add action element for message reading
    edit_element = this.getInvitationLink(params, 'communication', (ev) => {
      onmessageclick(parseInt(data.id, 10), data.display_name, currentCompanyid, currentCompanyName);
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
    this.commonService.setTitle('Wholesaler Management - Search');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.loadMyWholesalers(msg => {
      this.loadWholesalers();
    });
  }

  loadWholesalers() {
    this.rowData = [];
    this.adminService.searchWholesalers().subscribe((res: Company[]) => {
      this.rowData = res;
    }, err => {
      console.log(err);
    });
  }

  loadMyWholesalers(callback) {
    this.adminService.getWholesalersByCompany(this.currentUser.companyid).subscribe((res: any) => {
      // Wholesaler[]
      this.myWholesalers = res;
      if (res === null || res === undefined || res === false) {
        this.myWholesalers = [];
      }
      if (callback !== null) {
        callback(res);
      }
    });
  }

  sendMessage(inviteeid, inviteeCompanyName, invitorid, invitorCompanyName) {
    // alert(companyid);
    this.openDialog(inviteeid, inviteeCompanyName, invitorid, invitorCompanyName, {showInvite: true, defaultTabIndex: 0});
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
    dialogConfig.data = {type: 'Invite Wholesaler', inviteeid: supplierid, inviteename: suppliername, invitorid: companyid, invitorname: companyname, option};

    this.matDialogRef = this.dialog.open(InviteComponent, dialogConfig);
    this.matDialogRef.afterClosed().subscribe(obsrv => {
      this.loadWholesalers();
    });
  }
}
