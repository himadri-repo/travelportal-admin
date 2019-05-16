import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Customer } from 'src/app/models/customer';
import * as moment from 'moment';
import * as uuid from 'uuid';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MustMatch } from 'src/app/common/must-match-validator';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-customerinfo',
  templateUrl: './customerinfo.component.html',
  styleUrls: ['./customerinfo.component.scss']
})
export class CustomerinfoComponent implements OnInit {
  public customerInfoData: Customer;
  public custinfoform: FormGroup;
  public submitted = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialogRef: MatDialogRef<CustomerinfoComponent>,
              private formBuilder: FormBuilder, private adminService: AdminService) {
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

          this.f.name.setValue(customer.name);
          this.f.mobile.setValue(customer.mobile);
          this.f.email.setValue(customer.email);
          this.f.type.setValue(customer.type);
          this.f.active.setValue(parseInt(customer.active, 10));
          this.f.credit_ac.setValue(parseInt(customer.credit_ac, 10));
          this.f.password.setValue(customer.password);
        }
      });
    }
  }

  ngOnInit() {
    this.custinfoform = this.formBuilder.group({
      name: new FormControl(this.customerInfoData.name, Validators.required),
      email: new FormControl(this.customerInfoData.email, Validators.required),
      mobile: new FormControl(this.customerInfoData.mobile, Validators.required),
      credit_ac: new FormControl(this.customerInfoData.credit_ac),
      password: new FormControl(this.customerInfoData.password, Validators.required),
      password1: new FormControl('', Validators.required),
      type: new FormControl(this.customerInfoData.type, Validators.required),
      active: new FormControl(this.customerInfoData.active),
    }, {
      validators: MustMatch('password', 'password1')
    });
  }

  // checkPassword(): ValidatorFn {
  //   return true;
  // }

  closeDialog() {
    this.dialogRef.close('Close');
  }

  get f() { return this.custinfoform.controls; }

  onSubmit() {
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
      this.adminService.saveCustomer(this.customerInfoData, () => {
        this.dialogRef.close('Close');
        this.custinfoform.reset();
        return;
      });
    } else {
      return;
    }
  }
}
