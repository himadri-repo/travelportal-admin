import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { MatDialog } from '@angular/material';
import { ConfirmationComponent } from '../../shared/confirmation/confirmation.component';
import { Rateplan } from 'src/app/models/rateplan';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { RateplanDetail } from 'src/app/models/rateplandetail';

@Component({
  selector: 'app-rateplan',
  templateUrl: './rateplan.component.html',
  styleUrls: ['./rateplan.component.scss']
})
export class RateplanComponent implements OnInit {
  public title = 'app';
  menuTitle = 'suppliers';
  isediting = false;
  public tabindex = 0;
  rateplans: Rateplan[] = [];
  rateplanDetails: RateplanDetail[] = [];
  currentRateplan: Rateplan;
  currentRateplanDetail: RateplanDetail;

  private rpGridApi;
  private rpGridColumnApi;

  private rpdGridApi;
  private rpdGridColumnApi;

  public rpcolumnDefs = [
    // {headerName: 'Action', field: 'id', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this)}},
    {headerName: 'Action', field: 'id', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this)}},
    {headerName: 'Plan.Name', field: 'planname', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Applicable.To', field: 'assigned_to', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'Active', field: 'active', sortable: true, filter: true, resizable: true, width: 175},
  ];

  public rpdcolumnDefs = [
    // {headerName: 'Action', field: 'id', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this)}},
    {headerName: 'Action', field: 'id', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this)}},
    {headerName: 'Sl.#', field: 'serialno', sortable: true, filter: true, resizable: true, width: 70},
    {headerName: 'Head.Name', field: 'head_name', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'A/C.Code', field: 'head_code', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'Type', field: 'amount_type', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'Amount', field: 'amount', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Operation', field: 'operation', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Calculation', field: 'calculation', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Active', field: 'active', sortable: true, filter: true, resizable: true, width: 70},
  ];

  public components = {
    chkrenderer: this.chkrenderer.bind(this),
    emailrenderer: this.emailrenderer.bind(this),
    actionrenderer: this.actionrenderer.bind(this),
    feedrenderer: this.feedrenderer.bind(this),
    transrenderer: this.transrenderer.bind(this)
  };

  public rprowClassRules = {
    'row-bold'(params) {
      const toberead = parseInt(params.data.read, 10);
      return toberead === 0;
    },
    'row-invite'(params) {
      const type = parseInt(params.data.type, 10);
      return type === 1;
    }
    // 'sick-days-breach': 'data.sickDays > 8'
  };

  public rpdrowClassRules = {
    'row-bold'(params) {
      const read = parseInt(params.data.read, 10);
      return read === 0;
    }
    // 'sick-days-breach': 'data.sickDays > 8'
  };


  public rowData: Rateplan[] = [];
  public message = '';
  public rowSelection = 'single';
  private currentUser: User;
  public rateplanform: FormGroup;
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

    this.loadRateplans();

    this.init();
  }

  init() {
    this.currentRateplan = new Rateplan(this.currentUser.companyid, this.currentUser.id, this.currentUser.name);

    this.rateplanform = this.formBuilder.group({
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

  get g() { return this.rateplanform.controls; }

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

    event.stopPropagation();
  }

  handleFeedChange(allowFeed, companyid, company_name, currentCompanyid, currentCompanyName): any {
    // alert(`${company_name} - ${currentCompanyName} - Feed Value: ${allowFeed}`);
    this.openDialog((allowFeed === 1 ? 'disable feed' : ' enable feed' ), (result) => {
      if (result === true) {
        const feedChangedValue = (allowFeed === 1 ? 0 : 1);
        this.adminService.changeFeed('supplier', feedChangedValue, companyid, currentCompanyid).subscribe((res: any) => {
          console.log(res);
          this.loadRateplans();
        });
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

  closeDialog() {
    this.isediting = false;
    this.targetCompanyName = '';
  }

  loadMessages(boxtype) {
    // this.currentUser = this.authenticationService.currentLoggedInUser;
    // this.message = 'Please wait, loading customer data';
    // this.inboxRowData = this.outboxRowData = [];
    // this.inboxRowSelected = false;
    // this.adminService.getMessages(boxtype, this.currentUser.companyid).subscribe((res: Message[]) => {
    //   if (boxtype === 'inbox') {
    //     this.inboxRowData = res;
    //   } else if (boxtype === 'outbox') {
    //     this.outboxRowData = res;
    //   }
    // });
  }

  onSaveRatePlan() {
    this.isediting = false;

    if (!this.rateplanform.invalid) {
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
        this.loadRateplans();
      });
    }
  }

  onRPGridReady(params) {
    this.rpGridApi = params.api;
    this.rpGridColumnApi = params.columnApi;
  }

  onRPDGridReady(params) {
    this.rpdGridApi = params.api;
    this.rpdGridColumnApi = params.columnApi;
  }

  onRowSelected(gridtype, row) {
    if (row.node.selected) {
      let gridrow = null;

      if (gridtype === 'rp') {
        gridrow = row.data;
      } else if (gridtype === 'rp') {
        gridrow = row.data;
      }

      alert(JSON.stringify(gridrow));
    }
  }

  onSelectedTabChanged(tabindex) {
    if (tabindex === 1) {
      // rateplans
      this.loadRateplans();
    }
  }
}
