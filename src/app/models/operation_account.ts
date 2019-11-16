export enum ACCOUNT_TYPE {ASSET = 1, LIABILITY = 2, INCOME = 3, EXPENSE = 4}

export class OperationAccount {
    [x: string]: any;
    id: number;
    group_code: string;
    type: ACCOUNT_TYPE; /* 1 = ASSET | 2 = LIABILITY | 3 = INCOME | 4 = EXPENSE */
    parent_group_id: number;
    status: number;
    configuration: any;
    created_by: number;
    created_on: string;
    updated_by: number;
    updated_on: string;

    constructor() {
        this.id = -1;
        this.group_code = '';
        this.destination = '';
        this.type = ACCOUNT_TYPE.ASSET;
        this.parent_group_id = 0;
        this.status = 0;
        this.configuration = {};
        this.created_by = 0;
        this.created_on = '';
        this.updated_by = 0;
        this.updated_on = '';
    }
}
