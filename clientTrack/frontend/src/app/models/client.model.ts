export interface Client {
    id: number;
    first_name: string;
    last_name: string;
    job: string;
    status: string;
    phone_number: string;
    address: string;
    hourly_rate: string;
    amount_to_pay: number;
    systems: System[];
}

export interface System {
    id: number;
    name: string;
}