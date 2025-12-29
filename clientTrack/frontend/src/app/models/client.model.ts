export interface Client {
  id: number;
  full_name: string;
  job: string;
  status: string;
  phone_number: string;
  address: string;
  hourly_rate: string;
  amount_to_pay: number;
  systems: System[];
  total_hours_unpaid: number;
  breakdown: { system: string; hours: number }[];
}

export interface System {
  id: number;
  name: string;
}
