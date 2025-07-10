import { ObjectId } from 'mongodb';
import { database } from './utils/database';
import logger from './utils/logger';

// --- FULLY CORRECTED USER CLASS ---
export class User {
    constructor(
        public role: string,
        public id: string,
        public name: string,
        public handle: string,
        public email: string,
        public username: string,
        public password: string
    ) {}

    private static fromData(data: any): User | null {
        if (!data) return null;
        return new User(data.role, data.id, data.name, data.handle, data.email, data.username, data.password);
    }

    static async findById(id: string): Promise<User | null> {
        const db = await database.getDb();
        const userData = await db.collection('users').findOne({ id: id });
        return this.fromData(userData);
    }

    static async findByUsername(username: string): Promise<User | null> {
        const db = await database.getDb();
        const userData = await db.collection('users').findOne({ username: username });
        return this.fromData(userData);
    }
}

// --- FULLY CORRECTED BREAKDOWN REPORT CLASS ---
export class BreakdownReport {
    constructor(
        public report_details: string,
        public user_id: string,
        public truck_registration_number: string,
        public breakdown_location: string,
        public issue_description: string,
        public submission_date: number,
        public status: string,
        public notes: string,
        public resolution_notes: string,
        public fleet_number: string,
        public driver_full_names: string,
        public cellphone_number: string,
        public supervisor_name: string,
        public supervisor_cellphone_number: string,
        public company_name: string,
        public slip_picture: string,
        public seal_1_picture: string,
        public seal_2_picture: string,
        public date_range: Date
    ) {}

    async save(): Promise<boolean> {
        try {
            const db = await database.getDb();
            await db.collection('breakdown_reports').insertOne({ ...this });
            return true;
        } catch (error) {
            logger.error('Error saving breakdown report:', error);
            return false;
        }
    }

    static async findAll(): Promise<BreakdownReport[]> {
        const db = await database.getDb();
        const reportsData = await db.collection('breakdown_reports').find({}).toArray();
        return reportsData.map(data => new BreakdownReport(data.report_details, data.user_id, data.truck_registration_number, data.breakdown_location, data.issue_description, data.submission_date, data.status, data.notes, data.resolution_notes, data.fleet_number, data.driver_full_names, data.cellphone_number, data.supervisor_name, data.supervisor_cellphone_number, data.company_name, data.slip_picture, data.seal_1_picture, data.seal_2_picture, data.date_range));
    }
}

// --- FULLY CORRECTED BREAK REQUEST CLASS ---
export class BreakRequest {
    constructor(
        public request_details: string,
        public user_id: string,
        public break_type: string,
        public break_duration: number,
        public submission_date: number,
        public notes: string,
        public driver_name: string,
        public cellphone_number: string,
        public company_name: string,
        public location: string,
        public date_range: Date
    ) {}

    static fromData(data: any): BreakRequest | null {
        if (!data) return null;
        return new BreakRequest(
            data.request_details || data.id || '',
            data.user_id || '',
            data.break_type || '',
            data.break_duration || 0,
            data.submission_date || 0,
            data.notes || '',
            data.driver_name || '',
            data.cellphone_number || '',
            data.company_name || '',
            data.location || '',
            data.date_range ? new Date(data.date_range) : new Date()
        );
    }

    async save(): Promise<boolean> {
        try {
            const db = await database.getDb();
            await db.collection('break_requests').insertOne({ ...this });
            return true;
        } catch (error) {
            logger.error('Error saving break request:', error);
            return false;
        }
    }

    static async findByUserId(user_id: string): Promise<BreakRequest[]> {
        try {
            const db = await database.getDb();
            const breakRequests = await db.collection('break_requests').find({ user_id }).toArray();
            return breakRequests.map(data => BreakRequest.fromData(data)).filter(Boolean) as BreakRequest[];
        } catch (error) {
            logger.error('Error finding break requests by user_id:', error);
            return [];
        }
    }

    static async findAll(): Promise<BreakRequest[]> {
        try {
            const db = await database.getDb();
            const breakRequests = await db.collection('break_requests').find({}).toArray();
            return breakRequests.map((data: any) => BreakRequest.fromData(data)).filter(Boolean) as BreakRequest[];
        } catch (error) {
            logger.error('Error finding all break requests:', error);
            return [];
        }
    }
}

// ... other classes can remain as they are

export class StormAuthUser {
    id: string;
    name: string;
    handle: string;
    email: string;

    constructor(id: string, name: string, handle: string = '', email: string = '') {
        this.id = id;
        this.name = name;
        this.handle = handle;
        this.email = email;
    }

    /**
     * For internal use only. Prefer getOrCreate function instead.
     */
    private static async findById(user_id: string): Promise<StormAuthUser | null> {
      const db = await database.getDb();
      const stormAuthUserData = await db.collection('storm_auth_user').findOne({ id: user_id });
      return stormAuthUserData ? Object.assign(new StormAuthUser('', '', '', ''), stormAuthUserData) : null;
    }

    static async getOrCreate(user_id: string, user_name: string): Promise<StormAuthUser> {  
      let user = await StormAuthUser.findById(user_id)
      if (!user) {
          user = new StormAuthUser(user_id, user_name)
          await user.save()
      }
      return user
    }

    async save(): Promise<boolean> {
        const db = await database.getDb();

        // Check if user exists
        const exists = await StormAuthUser.findById(this.id);
        if (!exists) {
            await db.collection('storm_auth_user').insertOne(this);
            return true;
        }
        return false;
    }
}

export class BreakdownReportRequest {
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

    constructor(
        truck_registration_number: string,
        fleet_number: string,
        driver_full_names: string,
        cellphone_number: string,
        supervisor_name: string,
        supervisor_cellphone_number: string,
        company_name: string,
        slip_picture: string,
        seal_1_picture: string,
        seal_2_picture: string,
        breakdown_location: string
    ) {
        this.truck_registration_number = truck_registration_number;
        this.fleet_number = fleet_number;
        this.driver_full_names = driver_full_names;
        this.cellphone_number = cellphone_number;
        this.supervisor_name = supervisor_name;
        this.supervisor_cellphone_number = supervisor_cellphone_number;
        this.company_name = company_name;
        this.slip_picture = slip_picture;
        this.seal_1_picture = seal_1_picture;
        this.seal_2_picture = seal_2_picture;
        this.breakdown_location = breakdown_location;
    }

    static async findAll(): Promise<BreakdownReportRequest[]> {
        try {
            const db = await database.getDb();
            const requestsData = await db.collection('breakdown_report_requests').find({}).toArray();
            return requestsData.map(requestData => new BreakdownReportRequest(
                requestData.truck_registration_number,
                requestData.fleet_number,
                requestData.driver_full_names,
                requestData.cellphone_number,
                requestData.supervisor_name,
                requestData.supervisor_cellphone_number,
                requestData.company_name,
                requestData.slip_picture,
                requestData.seal_1_picture,
                requestData.seal_2_picture,
                requestData.breakdown_location
            ));
        } catch (error) {
            logger.error('Error finding all breakdown report requests:', error);
            return [];
        }
    }

    async save(): Promise<boolean> {
        try {
            const db = await database.getDb();
            await db.collection('breakdown_report_requests').insertOne({
                truck_registration_number: this.truck_registration_number,
                fleet_number: this.fleet_number,
                driver_full_names: this.driver_full_names,
                cellphone_number: this.cellphone_number,
                supervisor_name: this.supervisor_name,
                supervisor_cellphone_number: this.supervisor_cellphone_number,
                company_name: this.company_name,
                slip_picture: this.slip_picture,
                seal_1_picture: this.seal_1_picture,
                seal_2_picture: this.seal_2_picture,
                breakdown_location: this.breakdown_location
            });
            return true;
        } catch (error) {
            logger.error('Error saving breakdown report request:', error);
            return false;
        }
    }
}

export class BreakdownReportResponse {
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

    constructor(
        truck_registration_number: string,
        fleet_number: string,
        driver_full_names: string,
        cellphone_number: string,
        supervisor_name: string,
        supervisor_cellphone_number: string,
        company_name: string,
        slip_picture: string,
        seal_1_picture: string,
        seal_2_picture: string,
        breakdown_location: string
    ) {
        this.truck_registration_number = truck_registration_number;
        this.fleet_number = fleet_number;
        this.driver_full_names = driver_full_names;
        this.cellphone_number = cellphone_number;
        this.supervisor_name = supervisor_name;
        this.supervisor_cellphone_number = supervisor_cellphone_number;
        this.company_name = company_name;
        this.slip_picture = slip_picture;
        this.seal_1_picture = seal_1_picture;
        this.seal_2_picture = seal_2_picture;
        this.breakdown_location = breakdown_location;
    }

    static async findAll(): Promise<BreakdownReportResponse[]> {
        try {
            const db = await database.getDb();
            const responsesData = await db.collection('breakdown_report_responses').find({}).toArray();
            return responsesData.map(responseData => new BreakdownReportResponse(
                responseData.truck_registration_number,
                responseData.fleet_number,
                responseData.driver_full_names,
                responseData.cellphone_number,
                responseData.supervisor_name,
                responseData.supervisor_cellphone_number,
                responseData.company_name,
                responseData.slip_picture,
                responseData.seal_1_picture,
                responseData.seal_2_picture,
                responseData.breakdown_location
            ));
        } catch (error) {
            logger.error('Error finding all breakdown report responses:', error);
            return [];
        }
    }

    async save(): Promise<boolean> {
        try {
            const db = await database.getDb();
            await db.collection('breakdown_report_responses').insertOne({
                truck_registration_number: this.truck_registration_number,
                fleet_number: this.fleet_number,
                driver_full_names: this.driver_full_names,
                cellphone_number: this.cellphone_number,
                supervisor_name: this.supervisor_name,
                supervisor_cellphone_number: this.supervisor_cellphone_number,
                company_name: this.company_name,
                slip_picture: this.slip_picture,
                seal_1_picture: this.seal_1_picture,
                seal_2_picture: this.seal_2_picture,
                breakdown_location: this.breakdown_location
            });
            return true;
        } catch (error) {
            logger.error('Error saving breakdown report response:', error);
            return false;
        }
    }
}

export class BreakRequestResponse {
    request_details: string;
    string: string;
    driver_full_names: string;
    company_name: string;
    location: string;

    constructor(
        request_details: string,
        string: string,
        driver_full_names: string,
        company_name: string,
        location: string
    ) {
        this.request_details = request_details;
        this.string = string;
        this.driver_full_names = driver_full_names;
        this.company_name = company_name;
        this.location = location;
    }

    static async findAll(): Promise<BreakRequestResponse[]> {
        try {
            const db = await database.getDb();
            const responsesData = await db.collection('break_request_responses').find({}).toArray();
            return responsesData.map(responseData => new BreakRequestResponse(
                responseData.request_details,
                responseData.string,
                responseData.driver_full_names,
                responseData.company_name,
                responseData.location
            ));
        } catch (error) {
            logger.error('Error finding all break request responses:', error);
            return [];
        }
    }

    async save(): Promise<boolean> {
        try {
            const db = await database.getDb();
            await db.collection('break_request_responses').insertOne({
                request_details: this.request_details,
                string: this.string,
                driver_full_names: this.driver_full_names,
                company_name: this.company_name,
                location: this.location
            });
            return true;
        } catch (error) {
            logger.error('Error saving break request response:', error);
            return false;
        }
    }
}
