import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthenticationService } from './services/authentication.service';
import { User } from './models/user';
import { Subscription } from 'rxjs';
import { Company } from './models/company';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute, Params, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser: User;
  currentCompany: Company;
  currentUserSubscription: Subscription;
  title = 'My Travel App';
  companyname = 'OxyTra';
  currentUUID = '';

  constructor(private headTitle: Title, private authenticationService: AuthenticationService,
              private route: ActivatedRoute, private router: Router)
  // tslint:disable-next-line:one-line
  {
    console.log(window.location.href);
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.has('uuid')); // true
    console.log(urlParams.get('uuid')); // uuid
    if (urlParams.has('uuid')) {
      this.currentUUID = urlParams.get('uuid');
    }

    this.currentCompany = new Company();
    this.currentUser = new User();
    // this.route.queryParams.subscribe(params => {
    //   // tslint:disable-next-line:no-string-literal
    //   const uuid = params['uuid'];
    //   console.log(`UUID: ${uuid}`);
    // });

    headTitle.setTitle(this.title);
  }

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
    // this.title = this.route.snapshot.params.id
    this.initInitialValues();
    this.companyname = 'OxyTra or Something';
  }

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }

  private initInitialValues(): void {
    if (this.currentUUID !== null && this.currentUUID !== undefined) {
      // this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      //   if (user !== null && user !== undefined) {
      //     this.currentUser = user;
      //     this.getCompany(this.currentUser.companyid);
      //   }
      //   if (user === null) {
          this.authenticationService.getCurrentUser(this.currentUUID).subscribe((obsr) => {
            this.currentUser = obsr;
            this.getCompany(this.currentUser.companyid);
            // this.authenticationService.getCompany(this.currentUser.companyid).subscribe((cmpny) => {
            //   this.currentCompany = cmpny;
            // });
          });
      //   }
      // });
    }
  }

  private getCompany(companyid): void {
    this.authenticationService.getCompany(this.currentUser.companyid).subscribe((cmpny) => {
      this.currentCompany = cmpny;
    });
  }
}
