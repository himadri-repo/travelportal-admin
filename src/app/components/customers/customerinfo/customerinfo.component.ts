import { Component, OnInit, ViewChild, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Customer, Transaction } from 'src/app/models/customer';
import * as moment from 'moment';
import * as uuid from 'uuid';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MustMatch } from 'src/app/common/must-match-validator';
import { AdminService } from 'src/app/services/admin.service';
import { User } from 'src/app/models/user';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Rateplan } from 'src/app/models/rateplan';
import { Metadata } from 'src/app/models/metadata';
import { MatTableDataSource } from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-customerinfo',
  templateUrl: './customerinfo.component.html',
  styleUrls: ['./customerinfo.component.scss']
})
export class CustomerinfoComponent implements OnInit {
  public customerInfoData: Customer;
  public custinfoform: FormGroup;
  public submitted = false;
  public currentUser: User;
  public rateplans: Rateplan[];
  public states: Metadata[];
  public countries: Metadata[];
  public CustomerTransactionsSource: MatTableDataSource<Transaction>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sorter: MatSort;

  public tabindex = 0;

  displayedColumns: string[] = ['rowIndex', 'trans_date', 'narration', 'debit', 'credit', 'balance'];  

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialogRef: MatDialogRef<CustomerinfoComponent>,
              private formBuilder: FormBuilder, private adminService: AdminService, private authenticationService: AuthenticationService) {
    if (data.customerid === -1) {
      this.customerInfoData = new Customer();
      this.customerInfoData.user_id = 'USR' + Math.floor(10000 + (Math.random() * 100000));
      this.customerInfoData.id = data.customerid;
      this.customerInfoData.companyid = parseInt(data.companyid, 10);
      this.customerInfoData.type = '-1';
      this.customerInfoData.is_supplier = 0;
      this.customerInfoData.is_customer = 1;
      this.customerInfoData.active = 1;
      this.customerInfoData.credit_ac = 0;
      this.customerInfoData.doj = moment().format('YYYY-MM-DD HH:mm:ss');
      this.customerInfoData.permission = 255;
      this.customerInfoData.is_admin = 0;
      this.customerInfoData.state = -1;
      this.customerInfoData.country = -1;
      this.customerInfoData.address = '';
      this.customerInfoData.uid = uuid.v4();
    } else {
      this.customerInfoData = new Customer();
      this.adminService.getCustomerById(parseInt(data.companyid, 10), data.customerid).subscribe(obsrv => {
        if (obsrv !== null && obsrv !== undefined && obsrv.length > 0) {
          const customer = obsrv[0];

          this.customerInfoData.user_id = customer.user_id;
          this.customerInfoData.id = parseInt(customer.id, 10);
          this.customerInfoData.companyid = parseInt(customer.companyid, 10);
          this.customerInfoData.type = customer.type;
          this.customerInfoData.is_supplier = 0;
          this.customerInfoData.is_customer = 1;
          this.customerInfoData.active = customer.active;
          this.customerInfoData.credit_ac = customer.credit_ac;
          this.customerInfoData.doj = customer.doj;
          this.customerInfoData.permission = parseInt(customer.permission, 10);
          this.customerInfoData.is_admin = 0;
          this.customerInfoData.uid = customer.uid;
          this.customerInfoData.rateplanid = customer.rateplanid;
          this.customerInfoData.address = customer.address;
          this.customerInfoData.state = customer.state;
          this.customerInfoData.country = customer.country;
          this.customerInfoData.transactions = this.get_customer_transactions(customer.transactions);

          this.CustomerTransactionsSource = new MatTableDataSource(this.customerInfoData.transactions);
          this.CustomerTransactionsSource.paginator = this.paginator;
          this.CustomerTransactionsSource.sort = this.sorter;    

          this.f.name.setValue(customer.name);
          this.f.mobile.setValue(customer.mobile);
          this.f.email.setValue(customer.email);
          this.f.type.setValue(customer.type);
          this.f.active.setValue(parseInt(customer.active, 10));
          this.f.credit_ac.setValue(parseInt(customer.credit_ac, 10));
          this.f.password.setValue(customer.password);
          this.f.password1.setValue(customer.password);
          this.f.rateplanid.setValue(customer.rateplanid);
          this.f.address.setValue(customer.address);
          this.f.state.setValue(customer.state);
          this.f.country.setValue(customer.country);
        }
      });
    }
  }

  ngOnInit() {
    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.adminService.getRatePlans(this.currentUser.companyid).subscribe((rps: Rateplan[]) => {
      this.rateplans = rps;
    });

    this.adminService.getMetadata('state', this.currentUser.companyid).subscribe((states: Metadata[]) => {
      this.states = states;
    }, (error: any) => {
      console.log(`Error => ${error}`);
    });

    this.adminService.getMetadata('country', this.currentUser.companyid).subscribe((countries: Metadata[]) => {
      this.countries = countries;
    }, (error: any) => {
      console.log(`Error => ${error}`);
    });

    this.custinfoform = this.formBuilder.group({
      name: new FormControl(this.customerInfoData.name, Validators.required),
      email: new FormControl(this.customerInfoData.email, Validators.required),
      mobile: new FormControl(this.customerInfoData.mobile, Validators.required),
      credit_ac: new FormControl(this.customerInfoData.credit_ac),
      password: new FormControl(this.customerInfoData.password, Validators.required),
      password1: new FormControl('', Validators.required),
      type: new FormControl(this.customerInfoData.type, Validators.required),
      active: new FormControl(this.customerInfoData.active),
      rateplanid: new FormControl(this.customerInfoData.rateplanid),
      address: new FormControl(this.customerInfoData.address),
      state: new FormControl(this.customerInfoData.state),
      country: new FormControl(this.customerInfoData.country),
    }, {
      validators: MustMatch('password', 'password1')
    });
  }

  closeDialog() {
    this.dialogRef.close('Close');
  }

  get f() { return this.custinfoform.controls; }

  async onSubmit() {
    this.submitted = true;
    if (!this.custinfoform.invalid) {
      console.log(this.custinfoform.value);
      const postedForm = this.custinfoform.value;
      this.customerInfoData.name = postedForm.name;
      this.customerInfoData.email = postedForm.email;
      this.customerInfoData.mobile = postedForm.mobile;
      this.customerInfoData.active = postedForm.active;
      this.customerInfoData.type = postedForm.type;
      this.customerInfoData.credit_ac = postedForm.credit_ac;
      this.customerInfoData.password = postedForm.password;
      this.customerInfoData.rateplanid = postedForm.rateplanid;
      this.customerInfoData.address = postedForm.address;
      this.customerInfoData.state = postedForm.state;
      this.customerInfoData.country = postedForm.country;
      const isValid = await this.adminService.is_valid(this.customerInfoData);
      if (isValid) {
        this.adminService.saveCustomer(this.customerInfoData, (msg) => {
          this.dialogRef.close('Close');
          this.custinfoform.reset();
          return;
        });
      } else {
        // tslint:disable-next-line: no-string-literal
        this.custinfoform.controls['mobile'].setErrors({ uniqueMatch: true });
        // tslint:disable-next-line: no-string-literal
        this.custinfoform.controls['email'].setErrors({ uniqueMatch: true });
        return;
      }
    } else {
      return;
    }
  }

  get_customer_transactions(transactions) {
    if(!transactions) return [];

    let customer_transactions:Transaction[] = [];
    let balance: number = 0;

    for (let index = 0; index < transactions.length; index++) {
      const transaction = transactions[index];
      
      const cust_trans = new Transaction();
      if(parseInt(transaction.id, 10) > 0) {
        if(transaction.dr_cr_type === 'DR') {
          balance = balance - parseFloat(transaction.amount);
        }
        else if(transaction.dr_cr_type === 'CR') {
          balance = balance + parseFloat(transaction.amount);
        }
        
        cust_trans.wallet_id = transaction.wallet_id;
        cust_trans.allowed_transactions = transaction.allowed_transactions;
        cust_trans.amount = transaction.amount;
        cust_trans.balance = balance;
        cust_trans.bank = transaction.bank;
        cust_trans.branch = transaction.branch;
        cust_trans.date = transaction.date;
        cust_trans.dr_cr_type = transaction.dr_cr_type;
        cust_trans.narration = transaction.narration;
        cust_trans.sponsoring_companyid = transaction.sponsoring_companyid;
        cust_trans.status = transaction.status;
        cust_trans.target_accountid = transaction.target_accountid;
        cust_trans.target_bank_transid = transaction.target_bank_transid;
        cust_trans.target_companyid = transaction.target_companyid;
        cust_trans.trans_document_id = transaction.trans_document_id;
        cust_trans.trans_id = transaction.trans_id;
        cust_trans.trans_ref_id = transaction.trans_ref_id;
        cust_trans.trans_ref_type = transaction.trans_ref_type;
        cust_trans.trans_tracking_id = transaction.trans_tracking_id;
        cust_trans.trans_type = transaction.trans_type;
        cust_trans.wallet_status = transaction.wallet_status;
        cust_trans.wallet_type = transaction.wallet_type;

        customer_transactions.push(cust_trans);
      }
    }

    return customer_transactions;
  }

  onSelectedTabChanged(tabindex) {
    console.log(tabindex);
  }
}
