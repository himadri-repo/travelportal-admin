import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { Supplier } from 'src/app/models/supplier';
import { Ticket } from 'src/app/models/ticket';
import {MatDialog, MatDialogConfig, MatDialogRef, MatPaginator, MatTableDataSource, MatRipple, MatSort, MatTabChangeEvent, MatRadioChange} from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// import {MatPaginator} from '@angular/material/paginator';
// import {MatTableDataSource} from '@angular/material/table';
import * as moment from 'moment';
import { City } from 'src/app/models/city';
import { Airline } from 'src/app/models/airline';

import * as $ from 'jquery';
import { FormGroup, FormControl } from '@angular/forms';
import { Company } from 'src/app/models/company';
import { Metadata } from 'src/app/models/metadata';
import { OperationAccount } from 'src/app/models/operation_account';



@Component({
  selector: 'app-bankinfo',
  templateUrl: './bankinfo.component.html',
  styleUrls: ['./bankinfo.component.scss']
})
export class BankinfoComponent implements OnInit {
  @Input() currentUser: User;
  @Input() company: Company;

  @Output() afterSave = new EventEmitter<string>();

  public bankdetails: any;
  public accounts: OperationAccount[];
  public bankinfoform: FormGroup;
  public submitted = false;

  constructor(private _formBuilder: FormBuilder, private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService) { }

  ngOnInit() {
    this.init();
  }

  init() {
    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.company = this.authenticationService.currentCompany;
    this.submitted = false;

    // this.bankdetails = this.company.settings.bank_accounts;
    this.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
    });

    this.resetBankInfo();

    this.initForm();
  }

  resetBankInfo() {
    this.bankdetails = {
      'bank_name': '',
      'bank_branch': '',
      'acc_no': '',
      'ifsc': '',
      'acc_name': '',
      'acc_type': '',
      'accountid': 0,
      'account': OperationAccount
    };
  }

  initForm() {
    this.bankinfoform = this._formBuilder.group({
      bank_name: new FormControl(this.bankdetails.bank_name),
      bank_branch: new FormControl(this.bankdetails.bank_branch),
      acc_no: new FormControl(this.bankdetails.acc_no),
      ifsc: new FormControl(this.bankdetails.ifsc),

      acc_name: new FormControl(this.bankdetails.acc_name),
      acc_type: new FormControl(this.bankdetails.acc_type),
      accountid: new FormControl(this.bankdetails.accountid),
    }, {});
  }

  getAccounts() {
    return this.adminService.getAccounts().pipe(map((accounts: OperationAccount[]) => {
      this.accounts = accounts;

      return accounts;
    }, (error: any) => {
      console.log(`Error => ${error}`);
    }));
  }

  private isFormValid(bankinfo) {
    let flag = false;
    if (bankinfo) {
      if (bankinfo.bank_name !== '' && bankinfo.bank_branch !== '' && bankinfo.acc_no !== '' && bankinfo.ifsc !== '' && bankinfo.acc_name !== '' && bankinfo.acc_type !== '' && parseInt(bankinfo.accountid, 10) > 0) {
        flag = true;
      }
    }

    return flag;
  }

  save($event) {
    const bank_info = this.bankinfoform.value;
    const bank_accounts = new Array();
    let nextid = 0;

    if (!this.isFormValid(bank_info)) {
      alert('All fields are mandatory. Please check your input');
      return;
    }

    if (this.company.settings.bank_accounts && Array.isArray(this.company.settings.bank_accounts) && this.company.settings.bank_accounts.length > 0) {
      console.log('Company already having bank accounts');
      const savedbanks = this.company.settings.bank_accounts;
      for (let index = 0; index < savedbanks.length; index++) {
        const bank = savedbanks[index];
        bank_accounts.push({id: parseInt(bank.id, 10), 'bank_name': bank.bank_name, 'bank_branch': bank.bank_branch, 'acc_no': bank.acc_no, 'ifsc': bank.ifsc, 'acc_name': bank.acc_name, 'acc_type': bank.acc_type, 'accountid': parseInt(bank.accountid, 10)});
      }
    }

    nextid = bank_accounts.length + 1;
    bank_accounts.push({id: nextid, 'bank_name': bank_info.bank_name, 'bank_branch': bank_info.bank_branch, 'acc_no': bank_info.acc_no, 'ifsc': bank_info.ifsc, 'acc_name': bank_info.acc_name, 'acc_type': bank_info.acc_type, 'accountid': parseInt(bank_info.accountid, 10)});

    this.adminService.save_bankdetails(this.company.id, bank_accounts).subscribe(res => {
      if (res) {
        console.log(res);
        alert('New bank info added');
        this.cancel(null);
      }
    });

    console.log('Saving data');

    console.log(`Bank Name : ${bank_info.bank_name}`);
  }

  cancel($event) {
    this.resetBankInfo();

    this.afterSave.emit('BANKINFO_FORM_CLOSE');
  }
}
