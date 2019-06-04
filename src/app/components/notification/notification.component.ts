import { Component, OnInit, Inject } from '@angular/core';
import { MAT_CHECKBOX_CLICK_ACTION } from '@angular/material';
import * as moment from 'moment';
import * as uuid from 'uuid';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MustMatch } from 'src/app/common/must-match-validator';
import { AdminService } from 'src/app/services/admin.service';
import { Communication } from 'src/app/models/communication';
import { User } from 'src/app/models/user';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommunicationDetail } from 'src/app/models/communication_details';
import { NgxEditorModule } from 'ngx-editor';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Company } from 'src/app/models/company';
import { Supplier } from 'src/app/models/supplier';
import { Wholesaler } from 'src/app/models/wholesaler';
import { Rateplan } from 'src/app/models/rateplan';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  providers: [{provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'check'}]
})
export class NotificationComponent implements OnInit {
  public communication: Communication;
  public communicationform: FormGroup;
  public handleinvitationform: FormGroup;
  public submitted = false;
  public invitationhandled = false;
  public handleRowInvitation = false;
  public title = '';
  public message = '';
  public invitorid = 0;
  public inviteeid = 0;
  public invitorname = '';
  public inviteename = '';
  public tabindex = 1;
  public currentUser: User;
  public currentCompany: Company;
  public suppliers: Supplier[];
  public wholesalers: Wholesaler[];
  public rateplans: Rateplan[];
  public connections: any[];

  private inboxGridApi;
  private inboxGridColumnApi;

  private outboxGridApi;
  private outboxGridColumnApi;

  public communicationDetails: CommunicationDetail[];

  public inboxRowData: Message[] = [];
  public outboxRowData: Message[] = [];

  public inboxRowSelected = false;
  public inboxMessage: any = {};
  public options: any = {};
  public invitation_for = '';
  public invitation_by = '';

  public invitationHandle: any = {};

  public inboxColumnDefs = [
    {headerName: 'Date', field: 'created_on', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'Title', field: 'title', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'From', field: 'from_company_name', sortable: true, filter: true, resizable: true, width: 250, cellRenderer: 'invitorrenderer'},
    // {headerName: 'To', field: 'to_company_name', sortable: true, filter: true, resizable: true, width: 150},
    // {headerName: 'Ref.No', field: 'ref_no', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Message', field: 'message', sortable: true, filter: true, resizable: true, width: 200},
    {headerName: 'Req.Status', field: 'type', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'typerenderer'},
    {headerName: 'Current.Status', field: 'finaltype', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'typerenderer'},
    {headerName: 'Send.By', field: 'name', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Actions', field: 'id', sortable: true, filter: true, resizable: true, width: 100, cellRenderer: 'actionsrenderer', cellRendererParams: {onAcceptInvitation: this.handleInvitation.bind(this), onRejectInvitation: this.handleInvitation.bind(this)}},
  ];

  public outboxColumnDefs = [
    {headerName: 'Date', field: 'created_on', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'Title', field: 'title', sortable: true, filter: true, resizable: true, width: 150},
    // {headerName: 'From', field: 'from_company_name', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'To', field: 'to_company_name', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Ref.No', field: 'ref_no', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Message', field: 'message', sortable: true, filter: true, resizable: true, width: 200},
    {headerName: 'Req.Status', field: 'type', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'typerenderer'},
    {headerName: 'Current.Status', field: 'finaltype', sortable: true, filter: true, resizable: true, width: 70, cellRenderer: 'typerenderer'},
    {headerName: 'Send.By', field: 'name', sortable: true, filter: true, resizable: true, width: 150},
    // {headerName: 'Actions', field: 'id', sortable: true, filter: true, resizable: true, width: 200, cellRenderer: 'actionsrenderer', cellRendererParams: {onInviteClick: this.sendMessage.bind(this), onCommunicationClick: this.readMessage.bind(this)}},
  ];

  public components = {
    typerenderer: this.typerenderer.bind(this),
    actionsrenderer: this.actionsrenderer.bind(this),
    invitorrenderer: this.invitorrenderer.bind(this),
  };

  public ibrowClassRules = {
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

  public obrowClassRules = {
    'row-bold'(params) {
      const read = parseInt(params.data.read, 10);
      return read === 0;
    }
    // 'sick-days-breach': 'data.sickDays > 8'
  };

  public rowSelection = 'single';

  constructor(private authenticationService: AuthenticationService,
              private formBuilder: FormBuilder, private adminService: AdminService)
  {
    const self = this;

    this.tabindex = 1;
    this.init();
    this.resetCommunication();
    // self.f.title.setValue(self.communication.title);
    // self.f.type.setValue(1);
    // self.f.invitee.setValue(self.communication.invitee);
    // self.f.invitor.setValue(self.communication.invitor);
  }

  init() {
    let self = this;
    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.authenticationService.getCompany(this.currentUser.companyid).subscribe(obsrv => {
      self.currentCompany = obsrv;
      // tslint:disable-next-line: no-bitwise
      if ((self.currentCompany.type & 2) === 2) {
        self.adminService.getSuppliersByCompany(self.currentCompany.id).subscribe((res: Supplier[]) => {
          self.suppliers = res;

          self.refreshConnectionList();
        });
      }
      // tslint:disable-next-line: no-bitwise
      if ((self.currentCompany.type & 4) === 4) {
        self.adminService.getWholesalersByCompany(self.currentCompany.id).subscribe((res: Wholesaler[]) => {
          self.wholesalers = res;
          self.refreshConnectionList();
        });
      }

      if (self.currentCompany.id > 0) {
        self.adminService.getRatePlans(self.currentCompany.id).subscribe((res: Rateplan[]) => {
          self.rateplans = res;
        });
      }
    });
  }

  ngOnInit() {
    this.communicationform = this.formBuilder.group({
      title: new FormControl(this.communication.title, Validators.required),
      type: new FormControl('2'),
      invitee: new FormControl(this.communication.invitee),
      invitor: new FormControl(this.communication.invitor),
      message: new FormControl(''),
    }, {});

    this.handleinvitationform = this.formBuilder.group({
      status: new FormControl('0'),
      message: new FormControl(''),
      rateplan: new FormControl(0, Validators.required),
      msgid: new FormControl(0)
    }, {});

    if (this.tabindex === 1) {
      // inbox
      this.loadMessages('inbox');
    } else if (this.tabindex === 2) {
      // outbox
      this.loadMessages('outbox');
    }
  }

  refreshConnectionList() {
    this.connections = [];
    if (this.suppliers !== null && this.suppliers !== undefined && this.suppliers.length > 0) {
      for (let index = 0; index < this.suppliers.length; index++) {
        const supplier = this.suppliers[index];

        if (this.currentUser.companyid !== supplier.id) {
          this.connections.push({id: supplier.id, name: supplier.display_name, email: supplier.primary_user_email,
            mobile: supplier.primary_user_mobie, contactuser: supplier.primary_user_name, contactuserid: supplier.primary_user_id,
            type: supplier.type, tenent_code: supplier.tenent_code, services: supplier.services});
        }
      }
    }

    if (this.wholesalers !== null && this.wholesalers !== undefined && this.wholesalers.length > 0) {
      for (let index = 0; index < this.wholesalers.length; index++) {
        const wholesaler = this.wholesalers[index];

        if (this.currentUser.companyid !== wholesaler.id) {
          this.connections.push({id: wholesaler.id, name: wholesaler.display_name, email: wholesaler.primary_user_email,
            mobile: wholesaler.primary_user_mobie, contactuser: wholesaler.primary_user_name, contactuserid: wholesaler.primary_user_id,
            type: wholesaler.type, tenent_code: wholesaler.tenent_code, services: wholesaler.services});
        }
      }
    }
  }

  resetCommunication() {
    this.communication = new Communication();
    this.communication.id = -1;
    this.communication.active = 1;
    this.communication.companyid = -1;
    this.communication.title = '';
    this.communication.created_by = this.currentUser.id;
    this.communication.invitee = '';
    this.communication.invitor = this.currentUser.cname;
  }

  actionsrenderer(params): any {
    const action_container = document.createElement('span');
    action_container.setAttribute('style', 'text-align: cneter');
    const id = parseInt(params.value, 10);
    const onacceptclick = params.onAcceptInvitation;
    const onrejectclick = params.onRejectInvitation;
    const data = params.data;
    const currentCompanyid = this.currentUser.companyid;
    const currentCompanyName = this.currentUser.cname;

    // Add action element for inviting to suppliers / wholesalers
    let edit_element = this.getInvitationLink(params, 'accept', (ev) => {
      onacceptclick('accept', parseInt(data.id, 10), data.display_name, currentCompanyid, currentCompanyName);
    });

    if (currentCompanyid !== id && parseInt(data.finaltype, 10) !== 2 && parseInt(data.finaltype, 10) !== 3) {
      action_container.appendChild(edit_element);
    }

    // Add action element for message reading
    edit_element = this.getInvitationLink(params, 'reject', (ev) => {
      onrejectclick('reject', parseInt(data.id, 10), data.display_name, currentCompanyid, currentCompanyName);
    });

    if (parseInt(data.finaltype, 10) !== 2 && parseInt(data.finaltype, 10) !== 3) {
      action_container.appendChild(edit_element);
    }

    return action_container;
  }

  public getInvitationLink(params, actionName, callback) {
    const edit_element = document.createElement('i');

    if (actionName.toLowerCase() === 'accept') {
      edit_element.title = `Accept the invitation`;
      edit_element.className = 'fa fa-thumbs-up actionicon actionicon-bl';
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

  typerenderer(params): any {
    let type_value = '';

    if (parseInt(params.value, 10) === 0) {
      type_value = 'Message';
    } else if (parseInt(params.value, 10) === 1) {
      type_value = 'Invite';
    } else if (parseInt(params.value, 10) === 2) {
      type_value = 'Approve';
    } else if (parseInt(params.value, 10) === 3) {
      type_value = 'Reject';
    }

    const element = document.createElement('span');
    element.appendChild(document.createTextNode(type_value));
    return element;
  }

  invitorrenderer(params): any {
    const data = params.data;
    let invitedBy = '';
    let invitedFor = '';

    if (parseInt(data.invitation_type, 10) === 1) {
      invitedBy = 'Supplier'; invitedFor = 'Wholesaler';
    } else if (parseInt(data.invitation_type, 10) === 2) {
      invitedBy = 'Wholesaler'; invitedFor = 'Supplier';
    }

    // const container_element = document.createElement('span');
    const element = document.createElement('span');
    // element.setAttribute('style', 'display: block');
    element.appendChild(document.createTextNode(params.value + ' (' + invitedBy + ')'));
    // container_element.appendChild(element);
    // container_element.appendChild(document.createTextNode(invitedBy));
    return element;
  }

  // 'accept', parseInt(data.id, 10), data.display_name, currentCompanyid, currentCompanyName
  handleInvitation(mode, msgid, invitorname, inviteeid, inviteename) {
    // alert(`${mode} - ${msgid}`);
    let data: any = {};
    const length = this.inboxGridApi.getDisplayedRowCount();
    for (let index = 0; index < length; index++) {
      const nodeData = this.inboxGridApi.getDisplayedRowAtIndex(index).data;
      if (nodeData !== null && parseInt(nodeData.id, 10) === msgid) {
        data = nodeData;
        break;
      }
    }

    this.invitorname = data.from_company_name;
    this.invitation_for = (parseInt(data.invitation_type, 10) === 1 ? 'wholesaler' : 'supplier');
    this.invitation_by = (parseInt(data.invitation_type, 10) === 1 ? 'supplier' : 'wholesaler');
    this.g.status.setValue((mode === 'accept') ? '1' : '2');
    this.g.message.setValue('');
    this.g.msgid.setValue(msgid);

    this.inboxRowSelected = false;
    this.handleRowInvitation = true;
    // tslint:disable-next-line: deprecation
    event.stopPropagation();
  }

  get f() { return this.communicationform.controls; }
  get g() { return this.handleinvitationform.controls; }

  async onSubmit() {
    this.submitted = true;
    if (!this.communicationform.invalid) {
      console.log(this.communicationform.value);
      const postedForm = this.communicationform.value;
      this.communication = new Communication();
      this.communication.id = -1;
      this.communication.companyid = this.currentUser.companyid;
      this.communication.created_by = this.currentUser.id;
      this.communication.active = 1;
      this.communication.title = postedForm.title;

      try {
        this.communication.details = new Array<CommunicationDetail>();
        const communicationDetail = new CommunicationDetail();
        communicationDetail.active = 1;
        communicationDetail.created_by = this.currentUser.id;
        communicationDetail.from_companyid = this.currentUser.companyid;
        communicationDetail.message = postedForm.message;
        communicationDetail.to_companyid = this.inviteeid;
        communicationDetail.type = postedForm.type;
        communicationDetail.ref_no = '';
        this.communication.details.push(communicationDetail);
      } catch (e) {
        console.log(e);
      }

      await this.adminService.saveMessage(this.communication, (msg) => {
          // this.dialogRef.close('Close');
          this.tabindex = 2; // Lets move to outbox to see just sent invitation or message
          this.communicationform.reset();
          return;
      });

    } else {
      return;
    }
  }

  loadMessages(boxtype) {
    // this.currentUser = this.authenticationService.currentLoggedInUser;
    // this.message = 'Please wait, loading customer data';
    this.inboxRowData = this.outboxRowData = [];
    this.inboxRowSelected = false;
    this.handleRowInvitation = false;
    this.adminService.getMessages(boxtype, this.currentUser.companyid).subscribe((res: Message[]) => {
      if (boxtype === 'inbox') {
        this.inboxRowData = res;
      } else if (boxtype === 'outbox') {
        this.outboxRowData = res;
      }
    });
  }

  onSelectedTabChanged(tabindex) {
    if (tabindex === 1) {
      // inbox
      this.loadMessages('inbox');
    } else if (tabindex === 2) {
      // outbox
      this.loadMessages('outbox');
    }
  }

  onRowSelected(messageType, row) {
    if (row.node.selected) {
      const inbxMessage = row.data;
      if (parseInt(inbxMessage.type, 10) === 0) {
        this.inboxMessage.type = 'Message';
      } else if (parseInt(inbxMessage.type, 10) === 1) {
        this.inboxMessage.type = 'Invite';
      } else if (parseInt(inbxMessage.type, 10) === 2) {
        this.inboxMessage.type = 'Approve';
      } else if (parseInt(inbxMessage.type, 10) === 3) {
        this.inboxMessage.type = 'Reject';
      }

      this.inboxMessage.invitee = inbxMessage.to_company_name;
      this.inboxMessage.invitor = inbxMessage.from_company_name;
      this.inboxMessage.title = inbxMessage.title;
      this.inboxMessage.message = inbxMessage.message;

      if (inbxMessage.to_companyid === this.currentUser.companyid) {
        this.adminService.readMessage(row.data.id, this.currentUser.id);
      }

      this.handleRowInvitation = false;
      this.inboxRowSelected = true;
      // alert(inboxMessage.message);
    }
  }

  async onHandleInvitation() {
    this.invitationhandled = true;
    this.submitted = true;
    if (this.g.rateplan.value <= 0) {
      this.g.rateplan.setErrors({ required: true });
    }
    console.log(this.handleinvitationform.value);
    if (!this.handleinvitationform.invalid) {
      if (this.handleinvitationform.value.status === '1') {
        const postedForm = this.handleinvitationform.value;
        this.adminService.acceptInvitation({msgid: postedForm.msgid, message: postedForm.message,
          rateplan: parseInt(postedForm.rateplan, 10), userid: this.currentUser.id});
      } else {
        const postedForm = this.handleinvitationform.value;
        this.adminService.rejectInvitation({msgid: postedForm.msgid, message: postedForm.message,
          rateplan: parseInt(postedForm.rateplan, 10), userid: this.currentUser.id});
      }

      this.handleRowInvitation = false;
      this.inboxRowSelected = false;
      this.loadMessages('outbox');
      this.tabindex = 2;
    }
  }

  onInboxGridReady(params) {
    this.inboxGridApi = params.api;
    this.inboxGridColumnApi = params.columnApi;
  }

  onOutboxGridReady(params) {
    this.outboxGridApi = params.api;
    this.outboxGridColumnApi = params.columnApi;
  }
}
