import { Booking } from './booking';
import { Company } from './company';

export class CustomerInfo {
    [x: string]: any;
    id: number;
    prefix: string;
    first_name: string;
    last_name: string;
    mobile: string;
    age: number;
    email: number;
    pnr: string;
    ticket_fare: number;
    costprice: number;
    booking_id: number;
    booking: Booking;
    refrence_id: number;
    companyid: number;
    company: Company;
    status: number;
    created_by: number;
    created_on: string;
    updated_by: number;
    updated_on: string;
}
