export interface Gym {
    id: string;
    owner_id?: string;
    name: string;
    contact_phone?: string;
    subscription_tier?: string;
    status: string;
    trial_ends_at?: string;
    next_billing_date?: string;
    created_at: string;
}

export interface Member {
    id: string;
    gym_id: string;
    full_name: string;
    phone?: string;
    email?: string;
    date_of_birth?: string;
    gender?: string;
    status: string;
    notes?: string;
    member_number?: string;
    plan_id?: string;
    plan_name?: string;
    join_date?: string;
    expiry_date?: string;
    qr_code_value?: string;
    qr_generated_at?: string;
    created_at: string;
    plans?: Pick<Plan, 'name' | 'price' | 'duration_days'>;
    last_payment?: number;
}

export interface Plan {
    id: string;
    gym_id: string;
    name: string;
    price: number;
    duration_days: number;
    duration_type: string;
    description?: string;
    is_popular?: boolean;
    created_at: string;
}

export interface Payment {
    id: string;
    gym_id: string;
    member_id: string;
    plan_id: string;
    price_paid: number;
    payment_method: string;
    start_date: string;
    end_date: string;
    created_at: string;
    members?: Pick<Member, 'full_name'>;
    plans?: Pick<Plan, 'name'>;
}

export interface Attendance {
    id: string;
    gym_id: string;
    member_id: string;
    check_in_time: string;
    method?: string;
    members?: Pick<Member, 'full_name' | 'plan_id' | 'status'> & { plans?: Pick<Plan, 'name'> };
}

export interface SupportTicket {
    id: string;
    gym_id: string;
    subject: string;
    description?: string;
    priority: string;
    status: string;
    category: string;
    created_at: string;
    updated_at: string;
    gyms?: Pick<Gym, 'name'>;
    gym_name?: string; // Appended by frontend
}
