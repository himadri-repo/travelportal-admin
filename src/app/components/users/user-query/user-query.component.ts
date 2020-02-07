import { Component, OnInit, ViewChild } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { MatRipple } from '@angular/material';
import { MatTableDataSource} from '@angular/material/table';
import { MatPaginator} from '@angular/material/paginator';
import { MatSort} from '@angular/material/sort';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormBuilder } from '@angular/forms';
import { User } from 'src/app/models/user';
import { Company } from 'src/app/models/company';
import * as moment from 'moment';
import * as $ from 'jquery';
import { City } from 'src/app/models/city';

export interface UserQuery {
  source: string;
  destination: string;
  id: number;
  reqid: string;
  source_city: number;
  destination_city: number;
  departure_date: string;
  no_of_person: number;
  start_price: number;
  end_price: number;
  time_range: number;
  mobile: string;
  email: string;
  remarks: string;
  userid: number;
  companyid: number;
  created_by: number;
  is_flexible: boolean;
  status: number;
}

@Component({
  selector: 'app-user-query',
  templateUrl: './user-query.component.html',
  styleUrls: ['./user-query.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UserQueryComponent implements OnInit {
  public rowSelection = 'single';
  public currentUser: User;
  public company: Company;
  public mode = 'noshow';
  public queries: UserQuery[] = [];
  public current_url: string;

  public searchKey = '';

  public fromdate = new Date();
  public todate = new Date();

  dataSource: MatTableDataSource<UserQuery>;
  columnsToDisplay = [
    {'id': 'name', 'name': 'Name'},
    {'id': 'email', 'name': 'Email'},
    {'id': 'mobile', 'name': 'Mobile'},
    {'id': 'source', 'name': 'Source'},
    {'id': 'destination', 'name': 'Destination'},
    {'id': 'departure_date', 'name': 'Dept.Date'},
    {'id': 'no_of_person', 'name': 'PAX'},
    {'id': 'price_range', 'name': 'Price Range'},
    {'id': 'time_slot', 'name': 'Time Slot'},
    {'id': 'is_flexible', 'name': 'Date Flexible ?'}
  ];
  expandedElement: UserQuery | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, private formBuilder: FormBuilder) {
    this.dataSource = new MatTableDataSource([]);
    // this.dataSource.filterPredicate = ((data: UserQuery, filter: string) => {
    //   const formatted_data = `${data.source.toLowerCase()} ${data.destination.toString().toLowerCase()} ${data.mobile.toString().toLowerCase()} ${data.email.toString().toLowerCase()}`;
    //   return formatted_data.indexOf(filter) > -1;
    // });
  }

  ngOnInit() {
    this.commonService.setTitle('User Activity');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.company = this.authenticationService.currentCompany;
    this.queries = [];
    this.current_url = this.router.url;

    this.fromdate = new Date();
    this.todate = new Date();

    this.loadUnapprovedWalletTransactions();

    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.toLowerCase();
  }

  loadUnapprovedWalletTransactions() {
    this.dataSource = null;
    this.adminService.getUserQueries(this.company.id, 1, {}).subscribe(resp => {
      let queries = [];
      if (resp) {
        queries = resp.map(item => {
          return {'price_range': item.start_price + ' - ' + item.end_price, 'time_slot': this.getTimeSlot(item.time_range),
            ...item
          };
        });
      }

      this.dataSource = new MatTableDataSource(queries);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = ((data: UserQuery, filter: string) => {
        return this.columnsToDisplay.some(col => {
          // console.log(col);
          console.log(`${col} - ${data[col.id].toString().toLowerCase().indexOf(filter)}`);
          console.log(`${(col.id !== 'actions' && data[col.id].toString().toLowerCase().indexOf(filter) !== -1)}`);
          return (col.id !== 'actions' && data[col.id].toString().toLowerCase().indexOf(filter) !== -1);
        });
      });
    });
  }

  getTimeSlot(time_range): string {
    let time_slot = '';
    switch (parseInt(time_range, 10)) {
      case 1:
        time_slot = 'Morning   (04 hrs to 11 hrs)';
        break;
      case 2:
        time_slot = 'Afternoon (11 hrs to 16 hrs)';
        break;
      case 3:
        time_slot = 'Evening   (16 hrs to 21 hrs)';
        break;
      case 4:
        time_slot = 'Night     (21 hrs to 04 hrs)';
        break;
    }
    return time_slot;
  }
}

