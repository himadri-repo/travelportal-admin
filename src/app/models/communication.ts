import { CommunicationDetail } from './communication_details';

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
    details: Array<CommunicationDetail>;

    constructor() {
        this.details = new Array<CommunicationDetail>();
    }
}
