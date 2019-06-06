import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { Wholesaler } from 'src/app/models/wholesaler';
import { MatDialog } from '@angular/material';
import { ConfirmationComponent } from '../shared/confirmation/confirmation.component';

@Component({
  selector: 'app-wholesalers',
  templateUrl: './wholesalers.component.html',
  styleUrls: ['./wholesalers.component.scss']
})
export class WholesalersComponent implements OnInit {
  public title = 'app';
  menuTitle = 'wholesalers';

  public columnDefs = [
      {headerName: 'Action', field: 'id', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this)}},
      {headerName: 'Name', field: 'display_name', sortable: true, filter: true, resizable: true, width: 120},
      {headerName: 'Contact', field: 'primary_user_name', sortable: true, filter: true, resizable: true, width: 120},
      {headerName: 'Email', field: 'primary_user_email', sortable: true, filter: true, resizable: true, width: 175, cellRenderer: 'emailrenderer'},
      {headerName: 'Mobile', field: 'primary_user_mobile', sortable: true, filter: true, resizable: true, width: 100},
      {headerName: 'Website', field: 'baseurl', sortable: true, filter: true, resizable: true, width: 120},
      {headerName: 'Services', field: 'services', sortable: true, filter: true, resizable: true, width: 180},
      {headerName: 'Allow.Feed', field: 'allowfeed', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'feedrenderer', cellRendererParams: {onFeedChange: this.handleFeedChange.bind(this)}},
      {headerName: 'Rateplan', field: 'rateplan_name', sortable: true, filter: true, resizable: true, width: 100},
      {headerName: 'Rateplan.Details', field: 'rateplandetails', sortable: true, filter: true, resizable: true, width: 250},
  ];

  public components = {
    chkrenderer: this.chkrenderer.bind(this),
    emailrenderer: this.emailrenderer.bind(this),
    actionrenderer: this.actionrenderer.bind(this),
    feedrenderer: this.feedrenderer.bind(this),
  };

  public rowData: Wholesaler[] = [];
  public message = '';
  public rowSelection = 'single';
  private currentUser: User;
  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, public dialog: MatDialog) {

  }

  ngOnInit() {
    this.commonService.setTitle('Wholesaler Management');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.loadWholesalers();
  }

  loadWholesalers() {
    this.rowData = [];
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

  feedrenderer(params): any {
    const element = document.createElement('i');
    const data = params.data;
    const onFeedChange = params.onFeedChange;
    const currentCompanyid = this.currentUser.companyid;
    const currentCompanyName = this.currentUser.cname;

    if (parseInt(params.value, 10) === 1) {
      element.className = 'fa fa-link';
      element.title = `${data.display_name} is connected with you. Feeds are active`;
      element.setAttribute('style', 'font-size: 22px; color: #28a745; cursor: pointer; cursor: hand;');
    } else {
      element.className = 'fa fa-chain-broken';
      element.title = `${data.display_name} is connected with you but due to some reason feeds are not enabled yet.\nEither you suspended it or valid rate plan is not assigned yet.`;
      element.setAttribute('style', 'font-size: 22px; color: #ff0000; cursor: pointer; cursor: hand;');
    }

    if (onFeedChange !== null) {
      // this.handleFeedChange
      element.addEventListener('click', (ev) => {
        onFeedChange(parseInt(params.value, 10), parseInt(data.id, 10), data.display_name, currentCompanyid, currentCompanyName);
      });
    }

    // element.appendChild(document.createTextNode(params.value));
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

  actionrenderer(params): any {
    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: cneter');
    const id = parseInt(params.value, 10);
    const oneditclick = params.onEdit;
    // const onrejectclick = params.onRejectInvitation;
    const data = params.data;
    const currentCompanyid = this.currentUser.companyid;
    const currentCompanyName = this.currentUser.cname;

    // Add action element for inviting to suppliers / wholesalers
    const edit_element = this.getInvitationLink(params, 'edit', (ev) => {
       oneditclick('edit', parseInt(data.id, 10), data.display_name, currentCompanyid, currentCompanyName);
    });

    // if (currentCompanyid !== id) {
    //   action_container.appendChild(edit_element);
    // }

    // // Add action element for message reading
    // edit_element = this.getInvitationLink(params, 'reject', (ev) => {
    //   onrejectclick('reject', parseInt(data.id, 10), data.display_name, currentCompanyid, currentCompanyName);
    // });

    action_container.appendChild(edit_element);

    return action_container;
  }

  public getInvitationLink(params, actionName, callback) {
    const edit_element = document.createElement('i');

    if (actionName.toLowerCase() === 'edit') {
      edit_element.title = `Edit the record`;
      edit_element.className = 'fa fa-pencil-square-o actionicon actionicon-bl';
    } else if (actionName.toLowerCase() === 'reject') {
      edit_element.title = `Reject the invitation.`;
      edit_element.className = 'fa fa-thumbs-down actionicon actionicon-rd';
    }
    edit_element.setAttribute('style', 'font-size: 18px; color: #000000; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');

    if (callback !== null) {
      edit_element.addEventListener('click', callback);
    }
    return edit_element;
  }

  handleEdit(action, companyid, company_name, currentCompanyid, currentCompanyName): any {
    alert(`${company_name} - ${currentCompanyName}`);
    event.stopPropagation();
  }

  handleFeedChange(allowFeed, companyid, company_name, currentCompanyid, currentCompanyName): any {
    // alert(`${company_name} - ${currentCompanyName} - Feed Value: ${allowFeed}`);
    this.openDialog((allowFeed === 1 ? 'disable feed' : ' enable feed' ), (result) => {
      if (result === true) {
        const feedChangedValue = (allowFeed === 1 ? 0 : 1);
        this.adminService.changeFeed('wholesaler', feedChangedValue, companyid, currentCompanyid).subscribe((res: any) => {
          console.log(res);
          this.loadWholesalers();
        });

        // this.loadWholesalers();
      }
    });
    event.stopPropagation();
  }

  openDialog(action, callback): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '450px',
      data: `Are you sure to ${action} between selected supplier/wholesaler ?`,
      autoFocus: true,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Yes clicked');
        // Since this is yes, then lets save the changes
        if (callback) {
          callback(result);
        }
      } else {
        console.log(`No clicked ${result}`);
      }
    });
  }
}
