import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { Supplier } from 'src/app/models/supplier';
import { MatDialog } from '@angular/material';
import { ConfirmationComponent } from '../shared/confirmation/confirmation.component';
import { Rateplan } from 'src/app/models/rateplan';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {
  public title = 'app';
  menuTitle = 'suppliers';
  isediting = false;
  rateplans: Rateplan[] = [];

  public columnDefs = [
    {headerName: 'Action', field: 'id', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this)}},
    {headerName: 'Name', field: 'display_name', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'Contact', field: 'primary_user_name', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'Email', field: 'primary_user_email', sortable: true, filter: true, resizable: true, width: 175, cellRenderer: 'emailrenderer'},
    {headerName: 'Mobile', field: 'primary_user_mobile', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Website', field: 'baseurl', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Services', field: 'services', sortable: true, filter: true, resizable: true, width: 180},
    {headerName: 'Inventory', field: 'transaction_type', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'transrenderer'},
    {headerName: 'Allow.Feed', field: 'allowfeed', sortable: true, filter: true, resizable: true, width: 75, cellRenderer: 'feedrenderer', cellRendererParams: {onFeedChange: this.handleFeedChange.bind(this)}},
    {headerName: 'Rateplan', field: 'rateplan_name', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Rateplan.Details', field: 'rateplandetails', sortable: true, filter: true, resizable: true, width: 250},
];

  public components = {
    chkrenderer: this.chkrenderer.bind(this),
    emailrenderer: this.emailrenderer.bind(this),
    actionrenderer: this.actionrenderer.bind(this),
    feedrenderer: this.feedrenderer.bind(this),
    transrenderer: this.transrenderer.bind(this)
  };

  public rowData: Supplier[] = [];
  public message = '';
  public rowSelection = 'single';
  private currentUser: User;
  public handlelinkform: FormGroup;
  public targetCompanyName = '';
  public rateplanid = -1;
  public relationid = -1;
  public supplierid = -1;
  public wholesalerid = -1;

  // @Output() navigationChangeEvent = new EventEmitter<string>();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, public dialog: MatDialog, private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.commonService.setTitle('Suppliers Management');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.loadSuppliers();

    this.loadRateplans();

    this.init();
  }

  init() {
    this.handlelinkform = this.formBuilder.group({
      supplierid: new FormControl(-1),
      wholesalerid: new FormControl(this.currentUser.companyid),
      allowFeed: new FormControl(0),
      rateplan:  new FormControl(0),
      transactiontype:  new FormControl(''),
      walletid: new FormControl(-1),
      relationid: new FormControl(-1)
    }, {});
  }

  loadRateplans() {
    const self = this;
    if (this.currentUser.companyid > 0) {
      this.adminService.getRatePlans(this.currentUser.companyid).subscribe((res: Rateplan[]) => {
        self.rateplans = res;
      });
    }
  }

  loadSuppliers() {
    this.rowData = [];
    this.adminService.getSuppliersByCompany(this.currentUser.companyid).subscribe((res: Supplier[]) => {
      this.rowData = res;
    });
  }

  get g() { return this.handlelinkform.controls; }

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
      element.setAttribute('style', 'font-size: 22px; color: #00ff00; cursor: pointer; cursor: hand;');
      element.title = `${data.display_name} is connected with you. Feeds are active`;
    } else {
      element.className = 'fa fa-chain-broken';
      element.setAttribute('style', 'font-size: 22px; color: #ff0000; cursor: pointer; cursor: hand;');
      element.title = `${data.display_name} is connected with you but due to some reason feeds are not enabled yet.\nEither you suspended it or valid rate plan is not assigned yet.`;
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

  transrenderer(params): any {
    const element = document.createElement('i');
    const data = params.data;
    // const onFeedChange = params.onFeedChange;
    const currentCompanyid = this.currentUser.companyid;
    const currentCompanyName = this.currentUser.cname;

    if (parseInt(params.value, 10) === 1) {
      element.className = 'fa fa-gavel';
      element.setAttribute('style', 'font-size: 22px; color: #00ff00;');
      element.title = 'Inventory can be sold on Request basis';
    } else {
      element.className = 'fa fa-exchange';
      element.setAttribute('style', 'font-size: 22px; color: #ff0000;');
      element.title = 'Inventory can be sold on Live basis';
    }

    // if (onFeedChange !== null) {
    //   // this.handleFeedChange
    //   element.addEventListener('click', (ev) => {
    //     onFeedChange(parseInt(params.value, 10), parseInt(data.id, 10), data.display_name, currentCompanyid, currentCompanyName);
    //   });
    // }
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
      // rateplanid:"1"
      // relationid:"1"
      oneditclick('edit', parseInt(data.rateplanid, 10), parseInt(data.relationid, 10), parseInt(data.allowfeed, 10),
        parseInt(data.transaction_type, 10), 1, parseInt(data.id, 10), data.display_name, currentCompanyid, currentCompanyName);
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

  handleEdit(action, rateplanid, relationid, allowfeed, transactiontype, walletid, companyid, company_name, currentCompanyid, currentCompanyName): any {
    // alert(`${company_name} - ${currentCompanyName}`);
    this.isediting = true;
    this.targetCompanyName = company_name;
    this.rateplanid = rateplanid;
    this.relationid = relationid;

    this.supplierid = companyid;
    this.wholesalerid = currentCompanyid;

    this.g.allowFeed.setValue(allowfeed);
    this.g.rateplan.setValue(rateplanid);
    this.g.transactiontype.setValue(`${transactiontype}`);
    this.g.walletid.setValue(walletid);

    // tslint:disable-next-line: deprecation
    event.stopPropagation();
  }

  handleFeedChange(allowFeed, companyid, company_name, currentCompanyid, currentCompanyName): any {
    // alert(`${company_name} - ${currentCompanyName} - Feed Value: ${allowFeed}`);
    this.openDialog((allowFeed === 1 ? 'disable feed' : ' enable feed' ), (result) => {
      if (result === true) {
        const feedChangedValue = (allowFeed === 1 ? 0 : 1);
        this.adminService.changeFeed('supplier', feedChangedValue, companyid, currentCompanyid).subscribe((res: any) => {
          console.log(res);
          this.loadSuppliers();
        });
      }
    });
    // tslint:disable-next-line: deprecation
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

  closeDialog() {
    this.isediting = false;
    this.targetCompanyName = '';
  }

  onHandleLink() {
    this.isediting = false;

    if (!this.handlelinkform.invalid) {
      this.adminService.saveLinkDetail({
        'vendorType': 'supplier',
        'relationid': this.relationid,
        'allowFeed': this.g.allowFeed.value,
        'rateplanid': this.g.rateplan.value,
        'transactiontype': this.g.transactiontype.value,
        'walletid': this.g.walletid.value,
        'supplierid': this.supplierid,
        'wholesalerid': this.wholesalerid
      }).subscribe(data => {
        console.log(`Result : ${data}`);
        this.loadSuppliers();
        this.loadRateplans();
      });
    }
  }
}
