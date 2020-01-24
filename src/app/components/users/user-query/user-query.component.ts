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

// const ELEMENT_DATA: UserQuery[] = [
//   {
//     position: 1,
//     name: 'Hydrogen',
//     weight: 1.0079,
//     symbol: 'H',
//     description: `Hydrogen is a chemical element with symbol H and atomic number 1. With a standard
//         atomic weight of 1.008, hydrogen is the lightest element on the periodic table.`
//   }, {
//     position: 2,
//     name: 'Helium',
//     weight: 4.0026,
//     symbol: 'He',
//     description: `Helium is a chemical element with symbol He and atomic number 2. It is a
//         colorless, odorless, tasteless, non-toxic, inert, monatomic gas, the first in the noble gas
//         group in the periodic table. Its boiling point is the lowest among all the elements.`
//   }, {
//     position: 3,
//     name: 'Lithium',
//     weight: 6.941,
//     symbol: 'Li',
//     description: `Lithium is a chemical element with symbol Li and atomic number 3. It is a soft,
//         silvery-white alkali metal. Under standard conditions, it is the lightest metal and the
//         lightest solid element.`
//   }, {
//     position: 4,
//     name: 'Beryllium',
//     weight: 9.0122,
//     symbol: 'Be',
//     description: `Beryllium is a chemical element with symbol Be and atomic number 4. It is a
//         relatively rare element in the universe, usually occurring as a product of the spallation of
//         larger atomic nuclei that have collided with cosmic rays.`
//   }, {
//     position: 5,
//     name: 'Boron',
//     weight: 10.811,
//     symbol: 'B',
//     description: `Boron is a chemical element with symbol B and atomic number 5. Produced entirely
//         by cosmic ray spallation and supernovae and not by stellar nucleosynthesis, it is a
//         low-abundance element in the Solar system and in the Earth's crust.`
//   }, {
//     position: 6,
//     name: 'Carbon',
//     weight: 12.0107,
//     symbol: 'C',
//     description: `Carbon is a chemical element with symbol C and atomic number 6. It is nonmetallic
//         and tetravalent—making four electrons available to form covalent chemical bonds. It belongs
//         to group 14 of the periodic table.`
//   }, {
//     position: 7,
//     name: 'Nitrogen',
//     weight: 14.0067,
//     symbol: 'N',
//     description: `Nitrogen is a chemical element with symbol N and atomic number 7. It was first
//         discovered and isolated by Scottish physician Daniel Rutherford in 1772.`
//   }, {
//     position: 8,
//     name: 'Oxygen',
//     weight: 15.9994,
//     symbol: 'O',
//     description: `Oxygen is a chemical element with symbol O and atomic number 8. It is a member of
//          the chalcogen group on the periodic table, a highly reactive nonmetal, and an oxidizing
//          agent that readily forms oxides with most elements as well as with other compounds.`
//   }, {
//     position: 9,
//     name: 'Fluorine',
//     weight: 18.9984,
//     symbol: 'F',
//     description: `Fluorine is a chemical element with symbol F and atomic number 9. It is the
//         lightest halogen and exists as a highly toxic pale yellow diatomic gas at standard
//         conditions.`
//   }, {
//     position: 10,
//     name: 'Neon',
//     weight: 20.1797,
//     symbol: 'Ne',
//     description: `Neon is a chemical element with symbol Ne and atomic number 10. It is a noble gas.
//         Neon is a colorless, odorless, inert monatomic gas under standard conditions, with about
//         two-thirds the density of air.`
//   },
// ];

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
  columnsToDisplay = ['name', 'email', 'mobile', 'source', 'destination', 'departure_date', 'no_of_person', 'price_range', 'time_slot', 'is_flexible'];
  expandedElement: UserQuery | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService, private formBuilder: FormBuilder) {
    this.dataSource = new MatTableDataSource([]);
    this.dataSource.filterPredicate = ((data: UserQuery, filter: string) => {
      const formatted_data = `${data.source.toLowerCase()} ${data.destination.toString().toLowerCase()} ${data.mobile.toString().toLowerCase()} ${data.email.toString().toLowerCase()}`;
      return formatted_data.indexOf(filter) > -1;
    });
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
      this.dataSource.filterPredicate = ((data, filter) => {
        return this.columnsToDisplay.some(col => {
          // console.log(col);
          return (col !== 'actions' && data[col].toString().toLowerCase().indexOf(filter) !== -1);
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
