import * as moment from 'moment';
import * as uuid from 'uuid';

export class RateplanDetail {
    id: number;
    planname: string;
    assigned_to: number;
    companyid: number;
    rateplanid: number;
    serialno: number;
    head_name: string;
    head_code: string;
    amount: number;
    amount_type: number;
    operation: number;
    calculation: string;
    active: number;
    created_on: string;
    created_by: number;
    created_by_name: string;
    updated_on: string;
    updated_by: number;

    public constructor(companyid, createdBy, createdByName) {
        // this.id = ;
        this.planname = '';
        this.assigned_to = -1;
        this.companyid = companyid;
        this.rateplanid = -1;
        this.serialno = 0;
        this.head_name = '';
        this.head_code = '';
        this.amount = 0;
        this.amount_type = -1;
        this.operation = -1;
        this.calculation = '';
        this.active = 1;
        this.created_on = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        this.created_by = createdBy;
        this.created_by_name = createdByName;
        this.updated_by = -1;
    }
}
