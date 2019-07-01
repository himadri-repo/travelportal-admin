import { RateplanDetail } from './rateplandetail';
import * as moment from 'moment';
import * as uuid from 'uuid';

export class Rateplan {
    id: number;
    planname: string;
    assigned_to: number;
    companyid: number;
    display_name: string;
    active: number;
    default: number;
    created_on: string;
    created_by: number;
    created_by_name: string;
    updated_on: string;
    updated_by: number;

    details: RateplanDetail[];

    constructor(companyid, createdby, createdByName) {
        this.id = -1;
        this.planname = '';
        this.assigned_to = 0;
        this.companyid = companyid;
        this.active = 1;
        this.default = 0;
        this.created_by = createdby;
        this.created_on = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        this.created_by_name = createdByName;

        this.details = [];
    }
}
