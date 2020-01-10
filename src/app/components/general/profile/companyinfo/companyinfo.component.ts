import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { User } from 'src/app/models/user';
import { Company } from 'src/app/models/company';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Metadata } from 'src/app/models/metadata';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-companyinfo',
  templateUrl: './companyinfo.component.html',
  styleUrls: ['./companyinfo.component.scss']
})
export class CompanyinfoComponent implements OnInit {
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

  constructor(private _formBuilder: FormBuilder, private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService) { }

  ngOnInit() {
    // this.currentUser = this.authenticationService.currentLoggedInUser;
    // this.company = this.authenticationService.currentCompany;
    this.init(this.company);
    this.getStates();
    this.getCountries();
    this.getEmployeesByCompany(this.company.id);
  }

  getEmployeesByCompany(companyid: number) {
    this.usersService.getUsersByCompany(this.currentUser.companyid).subscribe((users: User[]) => {
      if (users && users.length > 0) {
        this.employees = [];
        users.forEach(user => {
          if (user.type === 'EMP' || (user.type === 'B2B' && parseInt(user.is_admin.toString(), 10) === 1)) {
            this.employees.push(user);
          }
        });
      }
    }, (error: any) => {
      console.log(`Error => ${error}`);
    });
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

  init(company: Company) {
    let type = '';
    if ((this.company.type & 2) === 2) {
      type = 'Supplier';
    }
    if ((this.company.type & 4) === 4) {
      if (type !== '') {
        type += ' & Wholesaler';
      } else {
        type = 'Wholesaler';
      }
    }

    this.company.type_name = type;

    this.handlecompanyinfoform = this._formBuilder.group({
      display_name: new FormControl(company.display_name),
      address: new FormControl(company.address),
      email: new FormControl(company.settings.email),
      // refundable: new FormControl(company.refundable === 'Y' ? 1 : 0),
      phone: new FormControl(company.settings.phone_no),
      fax: new FormControl(company.settings.fax),
      gst: new FormControl(company.gst_no),
      pan: new FormControl(company.pan),
      pin: new FormControl(company.pin),

      state:  new FormControl(company.state),
      country: new FormControl(company.country),
      primary_user_id: new FormControl(company.primary_user_id),
      active: new FormControl(company.active),
      services: new FormControl(company.services),

      facebook_link: new FormControl(company.settings.facebook_link),
      twitter_link: new FormControl(company.settings.twitter_link),
      youtube_link: new FormControl(company.settings.youtube_link),
      pinterest_link: new FormControl(company.settings.pinterest_link),
      instagram_link: new FormControl(company.settings.instagram_link),
      map: new FormControl(company.settings.map)
    }, {});
  }

  get companyinfo() { return this.handlecompanyinfoform.controls; }

  is_valid(companyinfo: Company) {
    let flag = true;

    if (companyinfo) {
      flag = flag && (companyinfo.display_name !== undefined && companyinfo.display_name !== '');
    }

    return flag;
  }

  async onHandleCompanyInfoSave() {
    this.submitted = true;
    if (!this.handlecompanyinfoform.invalid) {
      console.log(this.handlecompanyinfoform.value);
      const companyinfoForm = this.handlecompanyinfoform.value;

      const companyinfo = new Company();
      companyinfo.display_name = companyinfoForm.display_name;
      companyinfo.address = companyinfoForm.address;
      companyinfo.email = companyinfoForm.email;
      companyinfo.phone = companyinfoForm.phone;
      companyinfo.fax = companyinfoForm.fax;
      companyinfo.gst = companyinfoForm.gst;
      companyinfo.pan = companyinfoForm.pan;
      companyinfo.pin = companyinfoForm.pin;

      companyinfo.state = companyinfoForm.state;
      companyinfo.country = companyinfoForm.country;
      companyinfo.type = companyinfoForm.type;
      companyinfo.primary_user_id = companyinfoForm.primary_user_id;
      companyinfo.active = companyinfoForm.active;
      companyinfo.id = this.company.id;

      companyinfo.facebook_link = companyinfoForm.facebook_link;
      companyinfo.twitter_link = companyinfoForm.twitter_link;
      companyinfo.youtube_link = companyinfoForm.youtube_link;
      companyinfo.pinterest_link = companyinfoForm.pinterest_link;
      companyinfo.instagram_link = companyinfoForm.instagram_link;
      companyinfo.map = companyinfoForm.map;

      const isValid = this.is_valid(companyinfo);
      if (isValid) {
        this.adminService.saveCompanyInfo(companyinfo).subscribe(res => {
          if (res) {
            console.log(res);
            this.afterSave.emit('COMPANY_SAVE');
          }
        });
      } else {
        // tslint:disable-next-line: no-string-literal
        // tslint:disable-next-line: no-string-literal
        return;
      }
    } else {
      alert('Please provide mandatory data.');
      console.log('Please provide mandatory data.');
    }
  }
}
