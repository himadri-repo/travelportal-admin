import { User } from './user';
import { Company } from './company';

export class BookingActivity {
    activity_id: number;
    pactivity_id: number;
    booking_id: number;
    activity_date: string;
    source_userid: number;
    source_user: User;
    source_companyid: number;
    source_company: Company;
    target_userid: number;
    target_user: User;
    target_companyid: number;
    target_company: Company;
    requesting_by: number;
    requesting_to: number;
    status: number;
    status_name: string;
    notes: string;
    charge_amount: number;
    charge_name: string;
    created_by: number;
    created_on: string;
    updated_by: number;
    updated_on: string;
}
