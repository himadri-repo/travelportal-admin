import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { UsersService } from 'src/app/services/users.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from 'src/app/services/common.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { Company } from 'src/app/models/company';
import { AdminService } from 'src/app/services/admin.service';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  isOptional = false;
  public rowSelection = 'single';
  public currentUser: User;
  public company: Company;

  form: FormGroup;
  error: string;
  uploadResponse = { status: '', message: '', filePath: '' , data: {name: ''}};
  public logo_path = '';
  public uploaded_file = '';
  public enable_upload = false;
  public stepper: MatStepper;

  constructor(private _formBuilder: FormBuilder, private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService) {}

  ngOnInit() {
    this.commonService.setTitle('Manage Profile');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.company = this.authenticationService.currentCompany;

    this.logo_path = `${this.company.baseurl}/upload/${this.company.settings.logo}`;

    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ''
    });

    this.form = this._formBuilder.group({
      logo: ['']
    });
  }

  onSubmit() {
    const formData = new FormData();

    formData.append('logo', this.form.get('logo').value);
    const self = this;

    this.adminService.upload(formData, parseInt(this.company.id.toString(), 10)).subscribe(
      (res) => {
        self.uploadResponse = res;
        console.log(JSON.stringify(self.company));
        if (self.uploadResponse && self.uploadResponse.data) {
          self.logo_path = `${self.company.baseurl}/upload/${self.uploadResponse.data.name}?t=${(new Date()).getTime()}`;
          console.log(`Logo path refreshed : ${self.logo_path}`);
          this.enable_upload = false;
        }
      },
      (err) => this.error = err
    );
  }

  onFileChange($event) {
    console.log($event.target.files);

    if ($event.target.files.length > 0) {
      if (parseFloat($event.target.files[0].size) > 4194304) {
        console.log('Attached file can`t be more than 4MB size');
        this.uploaded_file = 'File size has to be less than 4MB in size.';
        this.enable_upload = false;
      } else {
        this.form.get('logo').setValue($event.target.files[0]);
        this.uploaded_file = $event.target.files[0].name;
        this.enable_upload = true;
      }
    }
  }

  companyProfileSaved($event, stepper) {
    console.log($event);
    if ($event === 'COMPANY_SAVE') {
      alert('Company information saved successfully');
      stepper.next();
    }
  }

}
