import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
import { Service } from 'src/app/models/service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {
  public communication: Communication;
  public communicationform: FormGroup;
  public submitted = false;
  public title = '';
  public message = '';
  public invitorid = 0;
  public inviteeid = 0;
  public invitorname = '';
  public inviteename = '';
  public invitation_type = 0; /* 1 = Wholesaler | 2 = Supplier */
  public tabindex = 0;
  public currentUser: User;
  public communicationDetails: CommunicationDetail[];
  public allowInvitation = true;


  public inboxRowData: Message[] = [];
  public outboxRowData: Message[] = [];
  public services: Service[] = [];

  public inboxRowSelected = false;
  public inboxMessage: any = {};
  public options: any = {};

  public inboxColumnDefs = [
    {headerName: 'Date', field: 'created_on', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'Title', field: 'title', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'From', field: 'from_company_name', sortable: true, filter: true, resizable: true, width: 150},
    // {headerName: 'To', field: 'to_company_name', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Ref.No', field: 'ref_no', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Message', field: 'message', sortable: true, filter: true, resizable: true, width: 200},
    {headerName: 'Type', field: 'type', sortable: true, filter: true, resizable: true, width: 100, cellRenderer: 'typerenderer'},
    {headerName: 'Send.By', field: 'name', sortable: true, filter: true, resizable: true, width: 150},
    // {headerName: 'Actions', field: 'id', sortable: true, filter: true, resizable: true, width: 200, cellRenderer: 'actionsrenderer', cellRendererParams: {onInviteClick: this.sendMessage.bind(this), onCommunicationClick: this.readMessage.bind(this)}},
  ];

  public outboxColumnDefs = [
    {headerName: 'Date', field: 'created_on', sortable: true, filter: true, resizable: true, width: 120},
    {headerName: 'Title', field: 'title', sortable: true, filter: true, resizable: true, width: 150},
    // {headerName: 'From', field: 'from_company_name', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'To', field: 'to_company_name', sortable: true, filter: true, resizable: true, width: 150},
    {headerName: 'Ref.No', field: 'ref_no', sortable: true, filter: true, resizable: true, width: 100},
    {headerName: 'Message', field: 'message', sortable: true, filter: true, resizable: true, width: 200},
    {headerName: 'Type', field: 'type', sortable: true, filter: true, resizable: true, width: 100, cellRenderer: 'typerenderer'},
    {headerName: 'Send.By', field: 'name', sortable: true, filter: true, resizable: true, width: 150},
    // {headerName: 'Actions', field: 'id', sortable: true, filter: true, resizable: true, width: 200, cellRenderer: 'actionsrenderer', cellRendererParams: {onInviteClick: this.sendMessage.bind(this), onCommunicationClick: this.readMessage.bind(this)}},
  ];

  public components = {
    typerenderer: this.typerenderer.bind(this)
  };

  public ibrowClassRules = {
    'row-bold'(params) {
      const toberead = parseInt(params.data.read, 10);
      return toberead === 0;
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

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialogRef: MatDialogRef<InviteComponent>, private authenticationService: AuthenticationService,
              private formBuilder: FormBuilder, private adminService: AdminService) {
    const self = this;
    this.title = data.type;
    this.invitorid = data.invitorid;
    this.inviteeid = data.inviteeid;
    this.invitorname = data.invitorname;
    this.inviteename = data.inviteename;
    this.invitation_type = (data.type === 'INVITE_WHOLESALER') ? 1 : ((data.type === 'INVITE_SUPPLIER') ? 2 : -1); /* Invitation Type : 1 = Wholesaler | 2 = Supplier */
    this.options = data.option || {showInvite: true, defaultTabIndex: 0};

    this.tabindex = this.options.defaultTabIndex;

    this.communication = new Communication();
    this.communication.id = -1;
    this.communication.active = 1;
    this.communication.companyid = 1;
    this.communication.title = '';
    this.communication.created_by = -1;

    if (data.invitorid >= -1) {
      this.adminService.getCommunications(this.inviteeid, this.invitorid, this.invitation_type).subscribe(obsrv => {
        if (obsrv !== null && obsrv !== undefined && obsrv.length > 0) {
          self.communication = new Communication();

          for (let index = 0; index < obsrv.length; index++) {
            const comm = obsrv[index];
            if (parseInt(comm.type, 10) === 1) {
              this.allowInvitation = false;
              break;
            }
          }
          //#region commented code
          // const communicationInfo = obsrv[0];
          // self.communication.id = communicationInfo.id;
          // self.communication.companyid = communicationInfo.companyid;
          // self.communication.active = communicationInfo.active;
          // self.communication.title = communicationInfo.title;
          // self.communication.created_by = communicationInfo.created_by;
          // self.communication.created_on = communicationInfo.created_on;
          // self.communication.invitee = communicationInfo.invitee;
          // self.communication.invitor = communicationInfo.invitor;
          // self.communication.msgcount = communicationInfo.msgcount;

          // self.f.title.setValue(communicationInfo.title);
          // self.f.type.setValue(1);
          // self.f.invitee.setValue(communicationInfo.invitee);
          // self.f.invitor.setValue(communicationInfo.invitor);

          // self.adminService.getCommunicationDetails(communicationInfo.id).subscribe(obsrv1 => {
          //   if (obsrv1 !== null && obsrv1 !== undefined && obsrv1.length > 0) {
          //     for (let index = 0; index < obsrv1.length; index++) {
          //       const communicationDetail = new CommunicationDetail();
          //     }
          //   }
          // });
          //#endregion
        }

        self.communication.active = 1;
        self.communication.title = '';
        self.communication.created_by = this.currentUser.id;
        self.communication.invitee = this.inviteename;
        self.communication.invitor = this.invitorname;

        self.f.title.setValue(self.communication.title);
        self.f.type.setValue(1);
        self.f.invitee.setValue(self.communication.invitee);
        self.f.invitor.setValue(self.communication.invitor);
      });
    }
  }

  ngOnInit() {
    this.currentUser = this.authenticationService.currentLoggedInUser;

    this.communicationform = this.formBuilder.group({
      title: new FormControl(this.communication.title, Validators.required),
      type: new FormControl('2'),
      invitee: new FormControl(this.communication.invitee),
      invitor: new FormControl(this.communication.invitor),
      message: new FormControl(''),
      service: new FormControl('')
    }, {});

    this.adminService.getServicesByCompany(this.inviteeid).subscribe((res: Service[]) => {
      this.services = res;
    });

    if (this.tabindex === 1) {
      // inbox
      this.loadMessages('inbox');
    } else if (this.tabindex === 2) {
      // outbox
      this.loadMessages('outbox');
    }
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

  get f() { return this.communicationform.controls; }

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
      this.communication.status = (this.invitation_type === 1 || this.invitation_type === 2) ? 1 : 0;

      try {
        this.communication.details = new Array<CommunicationDetail>();
        const communicationDetail = new CommunicationDetail();

        if (postedForm.service === null || postedForm.service === '' || postedForm.service === undefined) {
          communicationDetail.serviceid = this.services[0].serviceid;
        } else {
          communicationDetail.serviceid = parseInt(postedForm.service, 10);
        }

        communicationDetail.active = 1;
        communicationDetail.created_by = this.currentUser.id;
        communicationDetail.from_companyid = this.currentUser.companyid;
        communicationDetail.message = postedForm.message;
        communicationDetail.to_companyid = this.inviteeid;
        communicationDetail.type = postedForm.type;
        if (postedForm.type === 1) {
          // communicationDetail.invitation_type = (this.title.toLocaleLowerCase() === 'INVITE_WHOLESALER') ? 1 : 2;
          communicationDetail.invitation_type = this.invitation_type;
        }
        communicationDetail.ref_no = '';
        this.communication.details.push(communicationDetail);
      } catch (e) {
        console.log(e);
      }

      await this.adminService.saveMessage(this.communication, (msg) => {
        // this.dialogRef.close('Close');
        this.tabindex = 2; // Lets move to outbox to see just sent invitation or message
        this.communicationform.reset();
        // After reset we need to allow user to send another message to the same user.
        return;
      });

      // const isValid = await this.adminService.is_valid(this.customerInfoData);
      // if (isValid) {
      //   this.adminService.saveCustomer(this.customerInfoData, (msg) => {
      //     this.dialogRef.close('Close');
      //     this.custinfoform.reset();
      //     return;
      //   });
      // } else {
      //   // tslint:disable-next-line: no-string-literal
      //   this.custinfoform.controls['mobile'].setErrors({ uniqueMatch: true });
      //   // tslint:disable-next-line: no-string-literal
      //   this.custinfoform.controls['email'].setErrors({ uniqueMatch: true });
      //   return;
      // }
    } else {
      return;
    }
  }

  closeDialog() {
    this.dialogRef.close('Close');
  }

  loadMessages(boxtype) {
    // this.currentUser = this.authenticationService.currentLoggedInUser;
    // this.message = 'Please wait, loading customer data';
    this.inboxRowData = this.outboxRowData = [];
    this.inboxRowSelected = false;
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
      if (inbxMessage.type === 0) {
        this.inboxMessage.type = 'Message';
      } else if (inbxMessage.type === 1) {
        this.inboxMessage.type = 'Invite';
      } else if (inbxMessage.type === 2) {
        this.inboxMessage.type = 'Approve';
      } else if (inbxMessage.type === 3) {
        this.inboxMessage.type = 'Reject';
      }

      this.inboxMessage.invitee = inbxMessage.to_company_name;
      this.inboxMessage.invitor = inbxMessage.from_company_name;
      this.inboxMessage.title = inbxMessage.title;
      this.inboxMessage.message = inbxMessage.message;

      if (inbxMessage.to_companyid === this.currentUser.companyid) {
        this.adminService.readMessage(row.data.id, this.currentUser.id);
      }

      this.inboxRowSelected = true;
      // alert(inboxMessage.message);
    }
  }
}
