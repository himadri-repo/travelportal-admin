import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'datediff'
})
export class DatediffPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let diff = null;
    if (args) {
      diff = moment(args).diff(value, 'hours', true);

      const hour = Math.floor(diff);
      const minutes = (diff - hour) * 60;

      if (hour > 0) {
        diff = `${hour} Hour(s) `;
      }
      if (minutes > 0) {
        diff += `${minutes} Minutes(s)`;
      }
    }

    return diff;
  }

}
