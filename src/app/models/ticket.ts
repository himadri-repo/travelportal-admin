export class Ticket {
    [x: string]: any;
    id: number;
    source: string;
    destination: string;
    trip_type: string;
    departure_date_time: string;
    arrival_date_time: string;
    flight_no: string;
    terminal: string;
    no_of_person: number;
    class: string;
    airline: string;
    image: string;
    aircode: string;
    ticket_no: string;
    price: number;
    admin_markup: number;
    user_id: number;
    data_collected_from: string;
    last_sync_key: string;
    supplier: string;
    markup_rate: number;
    markup_type: number;
    allowfeed: number;
    service: string;
    owner_companyid: number;
    no_of_stops: number;
    availibility: number;
    price_child: number;
    price_infant: number;
    total: number;
    baggage: number;
    meal: number;
    pnr: string;
    cancel_rate: number;
    approved: number;
    trans_type: string;

    constructor() {
        this.id = -1;
        this.source = '';
        this.destination = '';
        this.trip_type = 'ONE';
        this.no_of_stops = 0;
        this.no_of_person = 0;
        this.availibility = 0;
        this.price = 0.0;
        this.price_child = 0.0;
        this.price_infant = 0.0;
        this.total = 0.0;
        this.baggage = 0.0;
        this.meal = 0.0;
        this.pnr = '';
        this.cancel_rate = 0.0;
        this.approved = 0;
        this.trans_type = 'ON REQUEST';
    }
}
