import { PaymentMode } from './payment_mode';
import { WalletTransaction } from './wallet_transaction';
import { Company } from './company';
import { User } from './user';

export class Wallet {
    [x: string]: any;
    id: number;
    name: string;
    display_name: string;
    companyid: number;
    company: Company;
    userid: number;
    user: User;
    sponsoring_companyid: number;
    sponsoring_company: Company;
    allowed_transactions: PaymentMode[];
    wallet_account_code: string;
    balance: number;
    type: number;
    status: number;
    created_by: number;
    created_on: string;
    updated_by: number;
    updated_on: string;
    transactions: WalletTransaction[];
}
