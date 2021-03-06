import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';
import { AdminService } from 'src/app/services/admin.service';
import { Supplier } from 'src/app/models/supplier';
import { Ticket } from 'src/app/models/ticket';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {MatRipple} from '@angular/material/core';
import {MatSort} from '@angular/material/sort';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {MatRadioChange} from '@angular/material/radio';

// MatRipple, MatSort, MatTabChangeEvent, MatRadioChange
import { FormBuilder } from '@angular/forms';

import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

import * as moment from 'moment';
import { City } from 'src/app/models/city';
import { Airline } from 'src/app/models/airline';

import * as $ from 'jquery';
import { FormGroup, FormControl } from '@angular/forms';
import { Company } from 'src/app/models/company';
import { PNR } from 'src/app/models/pnr_details';

@Component({
  selector: 'app-pnrsearch',
  templateUrl: './pnrsearch.component.html',
  styleUrls: ['./pnrsearch.component.scss']
})
export class PnrsearchComponent implements OnInit {
  public title = 'app';
  menuTitle = 'inventory';
  public message = '';
  public gridApi: any;
  public current_url: string;
  public gridColumnApi: any;

  public activities: PNR[] = [];

  public rowSelection = 'single';
  public currentUser: User;
  public company: Company;
  public mode = 'noshow';

  public searchKey = '';

  // @Output() navigationChangeEvent = new EventEmitter<string>();
  PNRSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['source', 'destination', 'name', 'age', 'airline_ticket_no', 'pnr', 'booking_id', 'actions'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sorter: MatSort;

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.commonService.setTitle('PNR Search');

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.activities = [];
    this.current_url = this.router.url;

    this.refreshPNRdata();
  }

  refreshPNRdata() {
    this.PNRSource = null;
    this.adminService.doPNRSearch({filter: {pnr: this.searchKey, companyid: this.currentUser.companyid}}).subscribe(resp => {
      let travellersByPNR = [];
      if (resp) {
        travellersByPNR = resp.map(item => {
          return {
            'action': 0,
            ...item
          };
        });
      }

      this.PNRSource = new MatTableDataSource(travellersByPNR);
      this.PNRSource.paginator = this.paginator;
      this.PNRSource.sort = this.sorter;
      // this.PNRSource.filterPredicate = ((data, filter) => {
      //   return this.displayedColumns.some(col => {
      //     // console.log(col);
      //     return (col !== 'actions' && data[col].toString().toLowerCase().indexOf(filter) !== -1);
      //   });
      // });
    });
  }

  edit(row, $event) {
    if (parseInt(row.id, 10) > 0 && row.action === 0) {
      const record = row;
      row.action = 1; // 1 = edit
    }
  }

  searchClear($event) {
    this.searchKey = '';
    this.refreshPNRdata();
  }

  applyFilter() {
    this.refreshPNRdata();
  }

  cancel(row, $event) {
    if (parseInt(row.id, 10) > 0 && row.action === 1) {
      const record = row;
      row.action = 0; // 1 = edit
    }
  }

  save(row, $event) {
    if (parseInt(row.id, 10) > 0 && row.action === 1) {
      const record = row;
      row.action = 0; // 1 = edit
      console.log(`Saving data - ${JSON.stringify(row)}`);
      this.adminService.savePNRDetails(row).subscribe(res => {
        if (res) {
          console.log(res);
          this.applyFilter();
        }
      });

      console.log('Saving data');
    }
  }
}
