import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { Company } from 'src/app/models/company';
declare const $: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public modules = [];
  public activeClass = '';
  private currentUser: User;
  public company: Company = new Company();
  private uuid: any;
  constructor(private commonService: CommonService, private route: ActivatedRoute, private authenticationService: AuthenticationService) { }

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.has('uuid')); // true
    console.log(urlParams.get('uuid')); // uuid
    if (urlParams.has('uuid')) {
      this.uuid = urlParams.get('uuid');
    }

    this.init();
  }

  private init() {
    const parentObj = this;
    this.commonService.getAuthenticated().subscribe((obsrv: Company) => {
      parentObj.commonService.setTitle('Dashboard');
      parentObj.currentUser = this.authenticationService.currentLoggedInUser;
      parentObj.company = this.authenticationService.currentCompany;
    });

    this.authenticationService.getCurrentUser(this.uuid).subscribe(obsrv => {
      if (obsrv != null) {
        this.currentUser = obsrv;
        this.populateMenus(this.currentUser.id);
      }
    });
  }

  private populateMenus(userid) {
    this.commonService.get_menus(userid).subscribe((res: any[]) => {
      this.modules = res;
      // alert(JSON.stringify(this.route.snapshot.params.id));
      // this.modules.forEach(module => {
      //   console.log(module.display_name);
      // });
    });
  }

  public get_activeClass(category: string): any {
    if (category === null) {
      return {activeClass: '', show: '', expand: 'false'};
    }

    if (category.toLowerCase() === 'dashboard') {
      return {activeClass: 'active', show: 'show', expand: 'true'};
    } else {
      return {activeClass: '', show: '', expand: 'false'};
    }
  }

  isMobileMenu() {
    if ($(window).width() > 991) {
        return false;
    }
    return true;
  }

  getabbreviation(name: string): any {
    let abreviation = '';
    if (name !== undefined && name !== null && name !== '') {
      name.split(' ').forEach((val, idx) => {
        abreviation += val.trim()[0].toUpperCase();
      });
    }

    return abreviation;
  }
}
