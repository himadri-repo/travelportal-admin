export class Statistics {
    [x: string]: any;
    total_booking: number;
    pending_booking: number;
    total_revenue: number;
    total_suppliers: number;
    total_wholesaler: number;
    total_retailers: number;
    total_agents: number;
    total_ticket_enq: number;
    pending_wallet_trans: number;
    user_pending_req: number;
    new_message: number;
    staff: number;
    own_ticket: number;
    sourced_ticket: number;

    constructor() {
        this.total_booking = 0;
        this.pending_booking = 0;
        this.total_revenue = 0;
        this.total_suppliers = 0;
        this.total_wholesaler = 0;
        this.total_retailers = 0;
        this.total_agents = 0;
        this.total_ticket_enq = 0;
        this.pending_wallet_trans = 0;
        this.user_pending_req = 0;
        this.new_message = 0;
        this.staff = 0;
        this.own_ticket = 0;
        this.sourced_ticket = 0;
    }
}
