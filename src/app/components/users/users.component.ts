import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public title = 'app';

  public columnDefs = [
      {headerName: 'Make', field: 'make', sortable: true, filter: true, resizable: true },
      {headerName: 'Model', field: 'model', sortable: true, filter: true, resizable: true },
      {headerName: 'Price', field: 'price', sortable: true, filter: true, resizable: true },
  ];

  public rowData = [
      { make: 'Toyota', model: 'Celica', price: 35000 },
      { make: 'Ford', model: 'Mondeo', price: 32000 },
      { make: 'Porsche', model: 'Boxter', price: 72000 }
  ];

  public rowSelection = 'single';

  constructor() { }

  ngOnInit() {
  }

}
