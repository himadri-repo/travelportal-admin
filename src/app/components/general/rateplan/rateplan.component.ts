import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from '../../shared/confirmation/confirmation.component';
import { Rateplan } from 'src/app/models/rateplan';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { RateplanDetail } from 'src/app/models/rateplandetail';
import { ValidateAssignedTo, ValidateAccountHead } from 'src/app/common/must-match-validator';

import * as moment from 'moment';
import * as uuid from 'uuid';

@Component({
  selector: 'app-rateplan',
  templateUrl: './rateplan.component.html',
  styleUrls: ['./rateplan.component.scss']
})
export class RateplanComponent implements OnInit {
  public title = 'app';
  public flag = false;
  public errorMessage = '';
  menuTitle = 'suppliers';
  isediting = false;
  public tabindex = 0;
  public selectedRateplan: Rateplan;
  public selectedRateplanDetail: RateplanDetail;
  public submiting = false;
  rateplans: Rateplan[] = [];
  filtered_rateplans: Rateplan[] = [];
  rateplanDetails: RateplanDetail[] = [];
  currentRateplan: Rateplan;
  currentRateplanDetail: RateplanDetail;
  public rateplan_message = 'New Rate plan';
  public showRateplanDetails = false;
  public submitted = false;

  private rpGridApi;
  private rpGridColumnApi;

  private rpdGridApi;
  private rpdGridColumnApi;

  public rpcolumnDefs = [
    // {headerName: 'Action', field: 'id', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this)}},
    {headerName: 'Action', field: 'id', sortable: true, filter: true, resizable: true, width: 50, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this), type: 'rp'}},
    {headerName: 'Plan.Name', field: 'planname', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Applicable.To', field: 'assigned_to', sortable: true, filter: true, resizable: true, width: 100, cellRenderer: 'applicabletorenderer'},
    {headerName: 'Active', field: 'active', sortable: true, filter: true, resizable: true, width: 90, cellRenderer: 'activerenderer'},
    {headerName: 'Default', field: 'default', sortable: true, filter: true, resizable: true, width: 90, cellRenderer: 'defaultrenderer'},
  ];

  public rpdcolumnDefs = [
    // {headerName: 'Action', field: 'id', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this)}},
    {headerName: 'Action', field: 'id', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'actionrenderer', cellRendererParams: {onEdit: this.handleEdit.bind(this), type: 'rpd'}},
    {headerName: 'Sl.#', field: 'serialno', sortable: true, filter: true, resizable: true, width: 70},
    {headerName: 'Head.Name', field: 'head_name', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'A/C.Code', field: 'head_code', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'Type', field: 'amount_type', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'typerenderer'},
    {headerName: 'Amount', field: 'amount', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Operation', field: 'operation', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'operationrenderer'},
    {headerName: 'Calculation', field: 'calculation', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'Active', field: 'active', sortable: true, filter: true, resizable: true, width: 90, cellRenderer: 'activerenderer'},
  ];

  public components = {
    chkrenderer: this.chkrenderer.bind(this),
    // emailrenderer: this.emailrenderer.bind(this),
    actionrenderer: this.actionrenderer.bind(this),
    activerenderer: this.activerenderer.bind(this),
    transrenderer: this.transrenderer.bind(this),
    applicabletorenderer: this.applicabletorenderer.bind(this),
    defaultrenderer: this.defaultrenderer.bind(this),
    operationrenderer: this.operationrenderer.bind(this),
    typerenderer: this.typerenderer.bind(this)
  };

  public rprowClassRules = {
    'row-bold'(params) {
      const active = parseInt(params.data.active, 10);
      return active === 1;
    }
    // 'row-invite'(params) {
    //   const active = parseInt(params.data.active, 10);
    //   return type === 1;
    // }
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
    this.commonService.setTitle('Settings :: Rateplan');

    this.currentUser = this.authenticationService.currentLoggedInUser;

    this.loadRateplans();

    this.init();
  }

  init() {
    this.currentRateplan = new Rateplan(this.currentUser.companyid, this.currentUser.id, this.currentUser.name);
    this.currentRateplanDetail = new RateplanDetail(this.currentUser.companyid, this.currentUser.id, this.currentUser.name);
    this.currentRateplanDetail.head_code = '-1';

    this.initRateplanForm();
  }

  initRateplanForm() {
    this.rateplanform = this.formBuilder.group({
      name: new FormControl(this.currentRateplan.planname, Validators.required),
      assignedto_whl: new FormControl((this.currentRateplan.assigned_to & 2) === 2),
      assignedto_ta: new FormControl((this.currentRateplan.assigned_to & 4) === 4),
      assignedto_rc: new FormControl((this.currentRateplan.assigned_to & 8) === 8),
      // tslint:disable-next-line: triple-equals
      active: new FormControl(this.currentRateplan.active == 1),
      // tslint:disable-next-line: triple-equals
      default: new FormControl(this.currentRateplan.default == 1),
      headname: new FormControl(this.currentRateplanDetail.head_name, Validators.required),
      accounthead: new FormControl(this.currentRateplanDetail.head_code, [Validators.required, ValidateAccountHead]),
      amount: new FormControl(this.currentRateplanDetail.amount, Validators.required),
      amounttype: new FormControl(this.currentRateplanDetail.amount_type, Validators.required),
      operation: new FormControl(this.currentRateplanDetail.operation, Validators.required),
      calculation: new FormControl(this.currentRateplanDetail.calculation),
    }, {
      validators: ValidateAssignedTo()
    });
  }

  loadRateplans() {
    const self = this;
    this.showRateplanDetails = false;
    this.rateplanDetails = [];
    if (this.currentUser.companyid > 0) {
      this.adminService.getRatePlans(this.currentUser.companyid).subscribe((res: Rateplan[]) => {
        self.rateplans = res;
        self.filtered_rateplans = res;
      });
    }
  }

  loadDetailRateplans(rpid: number) {
    const self = this;
    this.showRateplanDetails = false;
    if (rpid !== null && rpid !== undefined && this.currentUser.companyid > 0) {
      this.adminService.getRatePlansDetails(rpid).subscribe((res: RateplanDetail[]) => {
        self.rateplanDetails = res;
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

  applicabletorenderer(params): any {
    const container = document.createElement('span');
    let element = document.createElement('i');
    const data = params.data;

    if (parseInt(params.value, 10) & 2) {
      // wholesaler
      element = document.createElement('i');
      element.className = 'fa fa-truck';
      element.setAttribute('style', 'font-size: 22px; color: #0d31ef; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');
      element.title = `Applicable to Wholesaler`;
      container.appendChild(element);
    }

    if (parseInt(params.value, 10) & 4) {
      // travel agent
      element = document.createElement('i');
      element.className = 'fa fa-user-o';
      element.setAttribute('style', 'font-size: 22px; color: #ff0000; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');
      element.title = `Applicable to Travel Agent`;
      container.appendChild(element);
    }

    if (parseInt(params.value, 10) & 8) {
      // Retail Customer
      element = document.createElement('i');
      element.className = 'fa fa-users';
      element.setAttribute('style', 'font-size: 22px; color: #faa61a; cursor: pointer; cursor: hand; margin: 0px 3px 0px 3px;');
      element.title = `Applicable to Retail Customers`;
      container.appendChild(element);
    }

    return container;
  }

  activerenderer(params): any {
    const element = document.createElement('i');
    const data = params.data;

    if (parseInt(params.value, 10) === 1) {
      element.className = 'fa fa-check';
      element.setAttribute('style', 'font-size: 22px; color: #28a745; cursor: pointer; cursor: hand;');
      element.title = `Active`;
    } else {
      element.className = 'fa fa-times';
      element.setAttribute('style', 'font-size: 22px; color: #ff0000; cursor: pointer; cursor: hand;');
      element.title = `Inactive`;
    }

    return element;
  }

  operationrenderer(params): any {
    const element = document.createElement('i');
    const data = params.data;

    if (parseInt(params.value, 10) === 1) {
      element.className = 'fa fa-plus';
      element.setAttribute('style', 'font-size: 22px; color: #28a745; cursor: pointer; cursor: hand;');
      element.title = `Add`;
    } else {
      element.className = 'fa fa-minus';
      element.setAttribute('style', 'font-size: 22px; color: #ff0000; cursor: pointer; cursor: hand;');
      element.title = `Subtract`;
    }

    return element;
  }

  typerenderer(params): any {
    const element = document.createElement('i');
    const data = params.data;

    if (parseInt(params.value, 10) === 1) {
      element.className = 'fa fa-inr';
      element.setAttribute('style', 'font-size: 20px; color: #0000ff; cursor: pointer; cursor: hand;');
      element.title = `Value type (i.e. 250 rupees)`;
    } else {
      element.className = 'fa fa-percent';
      element.setAttribute('style', 'font-size: 20px; color: #0000ff; cursor: pointer; cursor: hand;');
      element.title = `Percentage type (i.e. 10%)`;
    }

    return element;
  }

  defaultrenderer(params): any {
    const element = document.createElement('i');
    const data = params.data;

    if (parseInt(params.value, 10) === 1) {
      element.className = 'fa fa-circle';
      element.setAttribute('style', 'font-size: 22px; color: #218809; cursor: pointer; cursor: hand;');
      element.title = `Default rate plan`;
    }

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
      oneditclick('edit', params.type, parseInt(data.rateplanid, 10), parseInt(data.id, 10));
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

  handleEdit(action, type, rateplanid, rateplanDetailId): any {
    // alert(`${company_name} - ${currentCompanyName}`);

    if (action === 'edit' && type === 'rpd') {
      this.isediting = true;

      this.reset();

      this.selectedRateplanDetail = this.rateplanDetails.find((val, idx) => {
        return (parseInt(val.id.toString(), 10) === parseInt(rateplanDetailId, 10));
      });

      this.currentRateplan = this.selectedRateplan;
      this.currentRateplanDetail = this.selectedRateplanDetail;
      this.rateplan_message = 'Rate plan : ' + this.selectedRateplan.planname;
      this.initRateplanForm();
      this.flag = false;
      this.tabindex = 2;
    }
    console.log(JSON.stringify(this.currentRateplan));
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
          this.loadRateplans();
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
    this.submiting = false;
    this.submitted = false;
    this.reset();
    this.tabindex = 1;
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
    this.submitted = true;
    if (!this.rateplanform.invalid && !this.submiting) {
      this.submiting = true;
      if (this.currentRateplan.id > 0) {
        // Rate plan already present now just add line item in detail table.
        this.adminService.getRatePlansDetails(this.currentRateplan.id).subscribe((res: RateplanDetail[]) => {
          this.rateplanDetails = res;
          const ratePlan: Rateplan = this.prepareRatePlan({'detailsCount': res.length + 1});

          this.saveRateplan(ratePlan, (rtn) => {
            this.submiting = false;
            this.submitted = false;
            if (rtn.status) {
              this.reset();
              this.tabindex = 1;
              this.loadRateplans();
            } else {
              this.errorMessage = rtn.message;
            }
          });
        });
      } else {
        const ratePlan: Rateplan = this.prepareRatePlan({'detailsCount': 1});

        this.saveRateplan(ratePlan, (rtn) => {
          this.submiting = false;
          this.submitted = false;
          if (rtn.status) {
            this.reset();
            this.tabindex = 1;
            this.loadRateplans();
          } else {
            this.errorMessage = rtn.message;
          }
        });
      }
    } else {
      if (this.submiting) {
        this.errorMessage = 'Please wait form already submitted. Let that request persisted.';
      } else {
        this.errorMessage = 'Invalid form data. Unable to submit the form. Please check your input. All mandatory fields must be filled before submitting the form.';
      }
    }
  }

  private reset() {
    this.rateplanform.reset();
    this.errorMessage = '';
    this.currentRateplan = new Rateplan(this.currentUser.companyid, this.currentUser.id, this.currentUser.name);
  }

  private saveRateplan(ratePlan: Rateplan, callback) {
    this.adminService.saveRateplan(ratePlan).subscribe((retrn: any) => {
      console.log('Rateplan saved', retrn);
      if (callback) {
        callback({status: true, message: 'Rateplan saved', data: retrn});
      }
    }, (error: any) => {
      console.log('Error', error);
      if (callback) {
        callback({status: false, message: `Error : ${error}`, data: error});
      }
    });
  }

  private prepareRatePlan(option) {
    option = option || {'detailsCount': 1};
    const rpid = parseInt(this.currentRateplan.id.toString(), 10);
    let rpdid = 0;

    if (this.currentRateplanDetail !== null && this.currentRateplanDetail !== undefined
      && this.currentRateplanDetail.id !== null && this.currentRateplanDetail.id !== undefined) {
      rpdid = parseInt(this.currentRateplanDetail.id.toString(), 10);
    }

    const detailRatePlan = new RateplanDetail(this.currentRateplan.companyid, this.currentRateplan.created_by, this.currentRateplan.created_by_name);
    if (rpid > 0) {
      detailRatePlan.rateplanid = rpid;
    } else {
      delete detailRatePlan.rateplanid;
    }

    if (rpdid > 0) {
      detailRatePlan.id = rpdid;
    }

    detailRatePlan.active = 1;
    const assigned_to = (this.g.assignedto_whl.value ? 2 : 0) + (this.g.assignedto_ta.value ? 4 : 0) + (this.g.assignedto_rc.value ? 8 : 0);

    detailRatePlan.head_code = this.g.accounthead.value;
    detailRatePlan.head_name = this.g.headname.value;
    detailRatePlan.operation = this.g.operation.value;
    detailRatePlan.amount = parseFloat(this.g.amount.value);
    detailRatePlan.amount_type = parseInt(this.g.amounttype.value, 10);
    detailRatePlan.calculation = this.g.calculation.value;
    detailRatePlan.serialno = option.detailsCount;
    delete detailRatePlan.created_by_name;
    delete detailRatePlan.planname;
    delete detailRatePlan.assigned_to;

    const ratePlan = new Rateplan(this.currentRateplan.companyid, this.currentRateplan.created_by, this.currentRateplan.created_by_name);
    if (rpid > 0) {
      ratePlan.id = rpid;
    } else {
      delete ratePlan.id;
    }

    delete ratePlan.planname;
    if (rpid <= 0) {
      // tslint:disable-next-line: no-string-literal
      ratePlan['name'] = this.g.name.value;
      ratePlan.display_name = this.g.name.value;
    } else {
      ratePlan.display_name = this.currentRateplan.planname;
    }
    ratePlan.assigned_to = assigned_to;
    ratePlan.active = this.g.active.value ? 1 : 0;
    ratePlan.default = this.g.default.value ? 1 : 0;
    ratePlan.updated_by = this.currentUser.id;
    ratePlan.updated_on = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    delete ratePlan.created_by_name;
    ratePlan.details = [detailRatePlan];

    return ratePlan;
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
        this.selectedRateplan = gridrow;
        this.loadDetailRateplans(gridrow.id);
        this.showRateplanDetails = false;
      } else if (gridtype === 'rpd') {
        gridrow = row.data;
        this.selectedRateplanDetail = gridrow;
        this.rateplan_message = `Rateplan : ${this.selectedRateplan.planname}`;
        this.showRateplanDetails = true;
      }
    }
  }

  newDocument(type) {
    this.reset();
    if (type === 'rp') {
      this.currentRateplan = new Rateplan(this.currentUser.companyid, this.currentUser.id, this.currentUser.name); // this.selectedRateplan;
      this.currentRateplanDetail = new RateplanDetail(this.currentUser.companyid, this.currentUser.id, this.currentUser.name); // this.selectedRateplanDetail;
    } else if (type === 'rpd') {
      this.currentRateplan = new Rateplan(this.currentUser.companyid, this.currentUser.id, this.currentUser.name); // this.selectedRateplan;
      this.currentRateplanDetail = new RateplanDetail(this.currentUser.companyid, this.currentUser.id, this.currentUser.name); // this.selectedRateplanDetail;
    }
    this.initRateplanForm();
    this.tabindex = 2;
    // event.stopPropagation();
  }

  onSelectedTabChanged(tabindex) {
    if (tabindex === 1) {
      // rateplans
      this.loadRateplans();
    }
    // else {
    //   this.reset();
    //   this.initRateplanForm();
    // }
  }

  onRateplanDetailClose(closeEvent) {
    if (closeEvent.command === 'close') {
      this.showRateplanDetails = false;
    }
  }

  onrpchange(event) {
    // rateplan_message = 'Rate plan : ' + $event.target.value
    const rpname = event.target.value;

    this.rateplan_message = 'Rate plan : ' + rpname;
    this.filtered_rateplans = this.rateplans.filter((rp, idx) => {
      return rp.planname.toLowerCase().indexOf(rpname.toLowerCase()) > -1;
    });

    if (this.filtered_rateplans.length === 0) {
      this.currentRateplan.id = -1;
      this.g.assignedto_whl.setValue(false);
      this.g.assignedto_ta.setValue(false);
      this.g.assignedto_rc.setValue(false);
    }

    this.flag = (rpname.length > 2 && this.filtered_rateplans.length > 0 && this.filtered_rateplans[0].planname.toLowerCase() !== rpname.toLowerCase()) ? true : false;
    // this.flag = (rpname.length > 2 && this.filtered_rateplans.length > 0) ? true : false;
  }

  onSelectClick(rateplan) {
    this.currentRateplan = rateplan;
    this.rateplan_message = 'Rate plan : ' + rateplan.planname;
    this.initRateplanForm();
    this.flag = false;
    console.log(JSON.stringify(rateplan));
    // event.stopPropagation();
  }

  onrpnameblur(event) {
    setTimeout(() => {
      this.flag = false;
    }, 300);
  }
}
