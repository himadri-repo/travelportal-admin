import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { Supplier } from 'src/app/models/supplier';
import { Ticket } from 'src/app/models/ticket';
import {MatDialog, MatDialogConfig, MatDialogRef, MatPaginator, MatTableDataSource, MatRipple, MatSort, MatTabChangeEvent, MatRadioChange} from '@angular/material';
import { UserActivity } from 'src/app/models/useractivity';
import { FormBuilder } from '@angular/forms';

// import {MatPaginator} from '@angular/material/paginator';
// import {MatTableDataSource} from '@angular/material/table';
import * as moment from 'moment';
import { City } from 'src/app/models/city';
import { Airline } from 'src/app/models/airline';

import * as $ from 'jquery';
import { FormGroup, FormControl } from '@angular/forms';
import { Company } from 'src/app/models/company';

@Component({
  selector: 'app-useractivity',
  templateUrl: './useractivity.component.html',
  styleUrls: ['./useractivity.component.scss']
})
export class UseractivityComponent implements OnInit {
  public title = 'app';
  menuTitle = 'inventory';
  public message = '';
  public gridApi: any;
  public current_url: string;
  public gridColumnApi: any;

  public activities: UserActivity[] = [];

  public rowSelection = 'single';
  public currentUser: User;
  public company: Company;
  public mode = 'noshow';

  public searchKey = '';

  public fromdate = new Date();
  public todate = new Date();

  // @Output() navigationChangeEvent = new EventEmitter<string>();
  userActivitySource: MatTableDataSource<any>;
  displayedColumns: string[] = ['requested_on', 'membername', 'remote', 'device', 'controller', 'source_city_name', 'destination_city_name', 'no_of_person', 'travel_date'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sorter: MatSort;

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.commonService.setTitle('User Activity');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.company = this.authenticationService.currentCompany;
    this.activities = [];
    this.current_url = this.router.url;

    this.fromdate = new Date();
    this.todate = new Date();

    this.loadUnapprovedWalletTransactions();
  }

  loadUnapprovedWalletTransactions() {
    this.userActivitySource = null;
    this.usersService.getUserActivities({filter: {flow: 'search', companyid: this.currentUser.companyid, admin_userid: this.company.primary_user_id, fromdate: moment(this.fromdate).format('YYYY-MM-DD 00:00:00'), todate: moment(this.todate).format('YYYY-MM-DD 23:59:59')}}).subscribe(resp => {
      let walletTrans = [];
      if (resp) {
        walletTrans = resp.map(item => {
          return {
            'remote': item.remote_ip + ':' + item.remote_port,
            ...item
          };
        });
      }

      this.userActivitySource = new MatTableDataSource(walletTrans);
      this.userActivitySource.paginator = this.paginator;
      this.userActivitySource.sort = this.sorter;
      this.userActivitySource.filterPredicate = ((data, filter) => {
        return this.displayedColumns.some(col => {
          // console.log(col);
          return (col !== 'actions' && data[col].toString().toLowerCase().indexOf(filter) !== -1);
        });
      });
    });
  }

  edit(row, $event) {
    if (row._id > -1) {
      const record = row;
    }
  }

  searchClear($event) {
    this.searchKey = '';
    this.applyFilter();
  }

  applyFilter() {
    if (this.userActivitySource) {
      this.userActivitySource.filter = this.searchKey.toLowerCase();
    }
  }

  dateFilterChanged(ctrl) {
    console.log(`From Date : ${moment(this.fromdate).format('YYYY-MM-DD')} | To Date : ${moment(this.todate).format('YYYY-MM-DD')}`);
    this.loadUnapprovedWalletTransactions();
  }
}
