import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'My Travel App';
  companyname: string = 'OxyTra';
  constructor(headTitle: Title) {
    headTitle.setTitle(this.title);
  }
}
