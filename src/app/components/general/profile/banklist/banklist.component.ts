import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { Supplier } from 'src/app/models/supplier';
import { Ticket } from 'src/app/models/ticket';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {MatRipple} from '@angular/material/core';
import {MatSort} from '@angular/material/sort';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {MatRadioChange} from '@angular/material/radio';
// MatTabChangeEvent, MatRadioChange
import { FormBuilder } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import * as moment from 'moment';
import { City } from 'src/app/models/city';
import { Airline } from 'src/app/models/airline';

import * as $ from 'jquery';
import { FormGroup, FormControl } from '@angular/forms';
import { Company } from 'src/app/models/company';
import { Metadata } from 'src/app/models/metadata';
import { OperationAccount } from 'src/app/models/operation_account';

@Component({
  selector: 'app-banklist',
  templateUrl: './banklist.component.html',
  styleUrls: ['./banklist.component.scss']
})
export class BanklistComponent implements OnInit {
  @Input() currentUser: User;
  @Input() company: Company;

  @Output() afterSave = new EventEmitter<string>();
  // Class properties
  public handlecompanyinfoform: FormGroup;
  public states: Metadata[];
  public countries: Metadata[];
  public employees: User[];
  public submitted = false;
  public customerInfoData: Company;
  public bankdetails: any;
  public accounts: OperationAccount[];
  public mode = 0;

  BankDetailsSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['bank_name', 'bank_branch', 'acc_no', 'ifsc', 'acc_name', 'acc_type', 'account', 'actions'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sorter: MatSort;

  constructor(private _formBuilder: FormBuilder, private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService) { }

  ngOnInit() {
    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.company = this.authenticationService.currentCompany;
    this.mode = 0;

    // this.bankdetails = this.company.settings.bank_accounts;
    this.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
      this.refreshBankDetails();
    });

    // this.getStates();
    // this.getCountries();
  }

  getAccounts() {
    return this.adminService.getAccounts().pipe(map((accounts: OperationAccount[]) => {
      this.accounts = accounts;

      return accounts;
    }, (error: any) => {
      console.log(`Error => ${error}`);
    }));
  }

  getStates() {
    this.adminService.getMetadata('state', this.currentUser.companyid).subscribe((states: Metadata[]) => {
      this.states = states;
    }, (error: any) => {
      console.log(`Error => ${error}`);
    });
  }

  getCountries() {
    this.adminService.getMetadata('country', this.currentUser.companyid).subscribe((countries: Metadata[]) => {
      this.countries = countries;
    }, (error: any) => {
      console.log(`Error => ${error}`);
    });
  }

  edit(row, $event) {
    if (parseInt(row.id, 10) > 0 && row.action === 0) {
      const record = row;
      row.action = 1; // 1 = edit
    }
  }

  addnew() {
    this.mode = 1;
  }

  cancel(row, $event) {
    if (parseInt(row.id, 10) > 0 && row.action === 1) {
      const record = row;
      row.action = 0; // 1 = edit
    }
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

  save(row, $event) {
    if (parseInt(row.id, 10) > 0 && row.action === 1) {
      const record = row;
      const self = this;
      row.action = 0; // 1 = edit
      console.log(`Saving data - ${JSON.stringify(row)}`);

      if (!this.isFormValid(row)) {
        alert('All fields are mandatory. Please check your input');
        return;
      }

      for (let index = 0; index < this.bankdetails.length; index++) {
        const bank = this.bankdetails[index];
        if (parseInt(bank.id, 10) === parseInt(row.id, 10)) {
          console.log(JSON.stringify(bank));
          break;
        }
      }

      console.log('Final json data');
      console.log(JSON.stringify(this.bankdetails));

      this.adminService.save_bankdetails(this.company.id, this.bankdetails).subscribe(res => {
        if (res) {
          console.log(res);
          self.refreshBankDetails();
        }
      });

      console.log('Saving data');
    }
  }

  delete(row, $event) {
    if (parseInt(row.id, 10) > 0) {
      const record = row;
      const self = this;
      row.action = 0; // 1 = edit
      const rowid = parseInt(row.id, 10);
      console.log(`Deleting data - ${JSON.stringify(row)}`);
      const bankdetails = new Array();

      for (let index = 0; index < this.bankdetails.length; index++) {
        const bank = this.bankdetails[index];
        if (parseInt(bank.id, 10) === parseInt(row.id, 10)) {
          // ignore this bank
          console.log(JSON.stringify(bank));
        } else {
          bankdetails.push(bank);
        }
      }

      console.log('Final json data');
      console.log(JSON.stringify(bankdetails));

      this.adminService.save_bankdetails(this.company.id, bankdetails).subscribe(res => {
        if (res) {
          console.log(res);
          self.refreshBankDetails();
        }
      });

      console.log('Saving data');
    }
  }

  refreshBankDetails() {
    this.BankDetailsSource = null;
    const companyid = this.company.id;
    const self = this;
    this.mode = 0;
    this.authenticationService.getCompany(companyid).subscribe((cmpny) => {
      self.company = cmpny;

      self.bankdetails = self.company.settings.bank_accounts;

      for (let index = 0; index < self.bankdetails.length; index++) {
        const bank = self.bankdetails[index];
        if (bank) {
          bank.action = 0;
          for (let j = 0; j < self.accounts.length; j++) {
            const account = self.accounts[j];
            if (account && parseInt(account.id.toString(), 10) === bank.accountid) {
              bank.account = account;
            }
          }
        }
      }

      self.BankDetailsSource = new MatTableDataSource(self.bankdetails);
      self.BankDetailsSource.paginator = self.paginator;
      self.BankDetailsSource.sort = self.sorter;
    });
  }

  bankInfoSaved($event) {
    console.log('New Bank Info Saved');
    if ($event === 'BANKINFO_FORM_CLOSE') {
      this.mode = 0;
      this.refreshBankDetails();
    }
  }
}
