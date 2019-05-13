import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-headerbar',
  templateUrl: './headerbar.component.html',
  styleUrls: ['./headerbar.component.scss']
})
export class HeaderbarComponent implements OnInit {
  public navigationMessage: string;

  constructor(private router: Router, private commonService: CommonService) {
    this.navigationMessage = '';
  }

  ngOnInit() {
    // this.router.events.subscribe((val) => {
    //   console.log(val instanceof NavigationEnd);
    //   if (val.snapshot !== null && val.snapshot !== undefined && val instanceof NavigationEnd) {
    //     if (val.snapshot.url.join('-').toLowerCase() === 'admin-users') {
    //       this.navigationMessage = 'User Management';
    //     }
    //   }
    // });

    this.commonService.getTitle().subscribe(obsrv => {
      this.navigationMessage = obsrv.toString();
    });
  }

}
