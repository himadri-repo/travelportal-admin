import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'My Travel App';
  companyname = 'OxyTra';
  constructor(headTitle: Title) {
    headTitle.setTitle(this.title);
  }

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
    // this.title = this.route.snapshot.params.id
    this.companyname = 'OxyTra or Something';
  }
}
