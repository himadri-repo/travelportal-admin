import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public modules = [];
  public activeClass = '';
  private currentUser: User;
  constructor(private commonService: CommonService, private route: ActivatedRoute, private authenticationService: AuthenticationService) { }

  ngOnInit() {
    let uuid = '';
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.has('uuid')); // true
    console.log(urlParams.get('uuid')); // uuid
    if (urlParams.has('uuid')) {
      uuid = urlParams.get('uuid');
    }
    this.authenticationService.getCurrentUser(uuid).subscribe(obsrv => {
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
    if (category.toLowerCase() === 'communication') {
      return {activeClass: 'active', show: 'show', expand: 'true'};
    } else {
      return {activeClass: '', show: '', expand: 'false'};
    }
  }
}
