import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/models/user';
import { Ticket } from 'src/app/models/ticket';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AdminService } from 'src/app/services/admin.service';
import { UsersService } from 'src/app/services/users.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-ticketview',
  templateUrl: './ticketview.component.html',
  styleUrls: ['./ticketview.component.scss']
})
export class TicketviewComponent implements OnInit {
  public currentUser: User;
  @Input() public selectedTicket: Ticket;
  @Input() public ticket: Ticket;

  @Output() public close = new EventEmitter();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService, private usersService: UsersService, private adminService: AdminService) { }

  ngOnInit() {
    this.currentUser = this.authenticationService.currentLoggedInUser;
  }

  public closeview(ev) {
    this.close.emit({'command': 'closeview', 'event': ev});
  }
}
