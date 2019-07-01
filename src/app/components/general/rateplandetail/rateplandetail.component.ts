import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Rateplan } from 'src/app/models/rateplan';
import { RateplanDetail } from 'src/app/models/rateplandetail';

@Component({
  selector: 'app-rateplandetail',
  templateUrl: './rateplandetail.component.html',
  styleUrls: ['./rateplandetail.component.scss']
})
export class RateplandetailComponent implements OnInit {

  @Input() public rateplan: Rateplan;
  @Input() public rateplandetail: RateplanDetail;

  @Output() public close = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  public getAssignedTo(assignedTo: number) {
    let assignedToString = '';
    assignedToString += (assignedTo & 2) === 2 ? 'Wholesaler,' : '';
    assignedToString += (assignedTo & 4) === 4 ? 'Travel Agent,' : '';
    assignedToString += (assignedTo & 8) === 8 ? 'Retail Customer,' : '';

    return assignedToString;
  }

  public closeview() {
    this.close.emit({'command': 'close', 'message': 'Close rateplan details form'});
  }
}
