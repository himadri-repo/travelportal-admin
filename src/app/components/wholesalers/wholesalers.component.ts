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
      {headerName: 'Action', field: 'id', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this)}},
      {headerName: 'Name', field: 'display_name', sortable: true, filter: true, resizable: true, width: 120},
      {headerName: 'Contact', field: 'primary_user_name', sortable: true, filter: true, resizable: true, width: 120},
      {headerName: 'Email', field: 'primary_user_email', sortable: true, filter: true, resizable: true, width: 175, cellRenderer: 'emailrenderer'},
      {headerName: 'Mobile', field: 'primary_user_mobile', sortable: true, filter: true, resizable: true, width: 100},
      {headerName: 'Website', field: 'baseurl', sortable: true, filter: true, resizable: true, width: 120},
      {headerName: 'Services', field: 'services', sortable: true, filter: true, resizable: true, width: 180},
      {headerName: 'Allow.Feed', field: 'allowfeed', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'feedrenderer'},
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
              private usersService: UsersService, private adminService: AdminService) {

  }

  ngOnInit() {
    this.commonService.setTitle('Wholesaler Management');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.loadWholesalers();
  }

  loadWholesalers() {
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

    if (parseInt(params.value, 10) === 1) {
      element.className = 'fa fa-link';
      element.title = 'Feed allowed';
      element.setAttribute('style', 'font-size: 22px; color: #28a745');
    } else {
      element.className = 'fa fa-chain-broken';
      element.title = 'Feed not allowed';
      element.setAttribute('style', 'font-size: 22px; color: #ff0000');
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
  }
}
