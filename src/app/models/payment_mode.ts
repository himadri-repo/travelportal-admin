export class PaymentMode {
    [x: string]: any;
    recid: number;
    payment_mode: number;
    minimum: number;
    maximum: number;
    providers: string[]; /*This is only valid for online payment modes. This will be the list of payment gateways allowed by the sponsoring company */
}
