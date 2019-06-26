import { RateplanDetail } from './rateplandetail';

export class Rateplan {
    id: number;
    planname: string;
    assigned_to: number;
    companyid: number;
    display_name: string;
    active: number;
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
        this.created_by = createdby;
        this.created_on = new Date().toString();
        this.created_by_name = createdByName;

        this.details = [];
    }
}
