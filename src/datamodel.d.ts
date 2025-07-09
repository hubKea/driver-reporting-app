export declare class User {
    role: string;
    id: string;
    name: string;
    handle: string;
    email: string;
    username: string;
    password: string;
    constructor(role: string, id: string, name: string, handle: string, email: string, username: string, password: string);
    static findById(id: string): Promise<User | null>;
    static findAll(): Promise<User[]>;
    save(): Promise<boolean>;
    delete(): Promise<boolean>;
}
export declare class BreakdownReport {
    report_details: string;
    user_id: string;
    truck_registration_number: string;
    breakdown_location: string;
    issue_description: string;
    submission_date: number;
    status: string;
    notes: string;
    resolution_notes: string;
    fleet_number: string;
    driver_full_names: string;
    cellphone_number: string;
    supervisor_name: string;
    supervisor_cellphone_number: string;
    company_name: string;
    slip_picture: string;
    seal_1_picture: string;
    seal_2_picture: string;
    date_range: Date;
    constructor(report_details: string, user_id: string, truck_registration_number: string, breakdown_location: string, issue_description: string, submission_date: number, status: string, notes: string, resolution_notes: string, fleet_number: string, driver_full_names: string, cellphone_number: string, supervisor_name: string, supervisor_cellphone_number: string, company_name: string, slip_picture: string, seal_1_picture: string, seal_2_picture: string, date_range: Date);
    static findByUserId(user_id: string): Promise<BreakdownReport[]>;
    static findAll(): Promise<BreakdownReport[]>;
    save(): Promise<boolean>;
}
export declare class BreakRequest {
    request_details: string;
    user_id: string;
    break_type: string;
    break_duration: number;
    submission_date: number;
    notes: string;
    driver_full_names: string;
    company_name: string;
    location: string;
    date_range: Date;
    constructor(request_details: string, user_id: string, break_type: string, break_duration: number, submission_date: number, notes: string, driver_full_names: string, company_name: string, location: string, date_range: Date);
    static findByUserId(user_id: string): Promise<BreakRequest[]>;
    static findAll(): Promise<BreakRequest[]>;
    save(): Promise<boolean>;
}
export declare class StormAuthUser {
    id: string;
    name: string;
    handle: string;
    email: string;
    constructor(id: string, name: string, handle?: string, email?: string);
    /**
     * For internal use only. Prefer getOrCreate function instead.
     */
    private static findById;
    static getOrCreate(user_id: string, user_name: string): Promise<StormAuthUser>;
    save(): Promise<boolean>;
}
export declare class BreakdownReportRequest {
    truck_registration_number: string;
    fleet_number: string;
    driver_full_names: string;
    cellphone_number: string;
    supervisor_name: string;
    supervisor_cellphone_number: string;
    company_name: string;
    slip_picture: string;
    seal_1_picture: string;
    seal_2_picture: string;
    breakdown_location: string;
    constructor(truck_registration_number: string, fleet_number: string, driver_full_names: string, cellphone_number: string, supervisor_name: string, supervisor_cellphone_number: string, company_name: string, slip_picture: string, seal_1_picture: string, seal_2_picture: string, breakdown_location: string);
    static findAll(): Promise<BreakdownReportRequest[]>;
    save(): Promise<boolean>;
}
export declare class BreakdownReportResponse {
    truck_registration_number: string;
    fleet_number: string;
    driver_full_names: string;
    cellphone_number: string;
    supervisor_name: string;
    supervisor_cellphone_number: string;
    company_name: string;
    slip_picture: string;
    seal_1_picture: string;
    seal_2_picture: string;
    breakdown_location: string;
    constructor(truck_registration_number: string, fleet_number: string, driver_full_names: string, cellphone_number: string, supervisor_name: string, supervisor_cellphone_number: string, company_name: string, slip_picture: string, seal_1_picture: string, seal_2_picture: string, breakdown_location: string);
    static findAll(): Promise<BreakdownReportResponse[]>;
    save(): Promise<boolean>;
}
export declare class BreakRequestResponse {
    request_details: string;
    string: string;
    driver_full_names: string;
    company_name: string;
    location: string;
    constructor(request_details: string, string: string, driver_full_names: string, company_name: string, location: string);
    static findAll(): Promise<BreakRequestResponse[]>;
    save(): Promise<boolean>;
}
