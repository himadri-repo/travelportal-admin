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
// import {MatPaginator} from '@angular/material/paginator';
// import {MatTableDataSource} from '@angular/material/table';
import * as moment from 'moment';
import { City } from 'src/app/models/city';
import { Airline } from 'src/app/models/airline';

import * as $ from 'jquery';
import { FormGroup, FormControl } from '@angular/forms';
import { Company } from 'src/app/models/company';

@Component({
  selector: 'app-wallets',
  templateUrl: './wallets.component.html',
  styleUrls: ['./wallets.component.scss']
})
export class WalletsComponent implements OnInit {
  public title = 'app';
  menuTitle = 'wallet';
  message = '';
  public recordStatus = 0;
  public handlewalletform: FormGroup;
  public gridApi: any;
  public gridColumnApi: any;
  public overlayLoadingTemplate = '<span class="ag-overlay-loading-center" style="font-weight: 600; color: #0000ff">Please wait while your tickets are getting loaded ...</span>';
  public overlayNoRowsTemplate = '<span style=\"padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;\">No records found</span>';

  public tabindex = 0;

  public rowSelection = 'single';
  public currentUser: User;
  public company: Company;
  public selectedWallet: Ticket;
  public wallet: Ticket;
  public mode = 'noshow';
  public cities: City[] = [];
  public airlines: Airline[] = [];
  public is_supplier = false;
  public is_wholesaler = false;

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService) {

  }

  walletTransactions: MatTableDataSource<any>;
  displayedColumns: string[] = ['username', 'type', 'trans_type_name', 'trans_ref_id', 'date', 'amount', 'narration', 'actions'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sorter: MatSort;

  ngOnInit() {
    this.commonService.setTitle('Wallet Management');
    this.message = 'Unapproved wallet transactions | Please approve or reject below transactions';

    this.currentUser = this.authenticationService.currentLoggedInUser;
    this.company = this.authenticationService.currentCompany;
    this.is_supplier = (parseInt(this.authenticationService.currentCompany.type, 10) & 2) === 2; /* 2 means supplier */
    this.is_wholesaler = (parseInt(this.authenticationService.currentCompany.type, 10) & 4) === 4; /* 4 means wholesaler */

    this.loadUnapprovedWalletTransactions();
  }

  loadUnapprovedWalletTransactions() {
    this.walletTransactions = null;
    this.adminService.getWalletTransactions({filter: {status: this.recordStatus, target_companyid: this.company.id}}).subscribe(resp => {
      let walletTrans = [];
      if (resp) {
        walletTrans = resp.map(item => {
          return {
            'trans_type_name': this.getTransTypeName(item.trans_type, item),
            ...item
          };
        });
      }

      this.walletTransactions = new MatTableDataSource(walletTrans);
      this.walletTransactions.paginator = this.paginator;
      this.walletTransactions.sort = this.sorter;
    });
  }

  recordQueryChanged($event: MatRadioChange) {
    const source = $event.source;
    const value = parseInt($event.value, 10);

    switch (value) {
      case 0:
        this.message = 'Unapproved wallet transactions | Please approve or reject below transactions';
        break;
      case 1:
        this.message = 'Approved wallet transactions';
        break;
      case 2:
        this.message = 'Rejected wallet transactions';
        break;
      default:
        break;
    }
    this.recordStatus = $event.value;
    this.loadUnapprovedWalletTransactions();
  }

  edit(row, $event) {
    if (row._id > -1) {
      const record = row;
    }
  }

  private getTransTypeName(type_code, transaction) {
    let typeName = '';

    switch (parseInt(type_code, 10)) {
      case 1:
        typeName = 'Cheque';
        break;
      case 2:
        typeName = 'Draft';
        break;
      case 3:
        typeName = 'Cash';
        break;
      case 4:
        typeName = 'RTGS';
        break;
      case 5:
        typeName = 'Credit Card';
        break;
      case 6:
        typeName = 'Debit Card';
        break;
      case 7:
        typeName = 'Net Banking';
        break;
      case 8:
        typeName = 'NEFT';
        break;
      case 9:
        typeName = 'Transfer';
        break;
      case 10:
        typeName = 'EDC Machine';
        break;
      default:
        break;
    }
    return typeName;
  }

  takeAction(mode, element) {
    let status = 0;
    if (mode === 'approve') {
      status = 1;
    } else if (mode === 'reject') {
      status = 2;
    }

    this.adminService.settleWalletTransaction({status, id: element.id}).subscribe(resp => {
      // if (resp) {
        this.loadUnapprovedWalletTransactions();
      // }
    });
  }
}
