import { Wallet } from './wallet';

export class WalletTransaction {
    [x: string]: any;
    id: number;
    wallet_id: number;
    wallet: Wallet;
    date: number;
    trans_id: string;
    companyid: number;
    userid: number;
    amount: number;
    bank: string;
    dr_cr_type: string;
    trans_type: number;
    trans_ref_id: string;
    trans_ref_date: string;
    trans_ref_type: string;
    trans_tracking_id: string;
    trans_documentid: number;
    narration: string;
    sponsoring_companyid: number;
    created_by: number;
    created_on: string;
    updated_by: number;
    updated_on: string;
    status: number;
    approved_by: number;
    approved_on: string;
    target_accountid: number;
    target_companyid: number;
    target_bank_transid: string;
}
