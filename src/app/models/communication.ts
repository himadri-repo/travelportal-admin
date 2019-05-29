import { CommnucationDetail } from './communication_details';

export class Communication {
    id: number;
    title: string;
    active: number;
    companyid: number;
    created_by: number;
    created_on: string;
    updated_by: number;
    updated_on: string;
    invitee: string;
    invitor: string;
    msgcount: number;
    toberead: number;
    details: Array<CommnucationDetail>;

    constructor() {
        this.details = new Array<CommnucationDetail>();
    }
}
