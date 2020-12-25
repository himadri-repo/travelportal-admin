export class Customer {
    id: number;
    user_id: string;
    name: string;
    profile_image: string;
    email: string;
    mobile: string;
    password: string;
    is_supplier: number;
    is_customer: number;
    active: number;
    type: string;
    credit_ac: number;
    doj: string;
    companyid: number;
    created_by: number;
    created_on: string;
    updated_by: number;
    updated_on: string;
    permission: number;
    is_admin: number;
    uid: string;
    primary_user: number;
    company_type: number;
    rateplanid: number;
    address: string;
    state: number;
    country: number;
    transactions: Transaction[]
}

export class Transaction {
    wallet_id: number;
    date: string;
    trans_id: string;
    amount: number;
    bank: string;
    branch: string;
    dr_cr_type: string;
    trans_type: number;
    trans_ref_id: string;
    trans_ref_type: string;
    trans_tracking_id: string;
    trans_document_id: number;
    narration: string;
    sponsoring_companyid: number;
    status: number;
    target_accountid: number;
    target_companyid: number;
    target_bank_transid: string;
    allowed_transactions: string;
    balance: number;
    wallet_type: number
    wallet_status: number;

    constructor() {
        this.wallet_id = -1;
        this.balance = 0.00;
    }
}