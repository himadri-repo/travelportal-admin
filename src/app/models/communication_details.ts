export class CommunicationDetail {
    id: number;
    pid: number;
    message: string;
    from_companyid: number;
    to_companyid: number;
    ref_no: string;
    type: number;
    active: number;
    created_by: number;
    created_on: string;
    updated_by: number;
    updated_on: string;
    read: number;
    last_read_on: string;
    invitation_type: number; /* 1 = Wholesaler | 2 = Supplier */
    serviceid: number;
}
