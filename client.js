const API_BASE_URL = 'https://driver-reporting-app.onrender.com';

export default class ClientAPI {
// Helper method for common fetch operations
async fetchJSON(endpoint, options = {}) {
    const url = `${endpoint.startsWith('http') ? endpoint : API_BASE_URL + endpoint}`;
    
    // Only include Content-Type for requests with body
    const headers = {
        ...(options.body && { 'Content-Type': 'application/json' })
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
}

/**
 * Get Break Requests
 * 
 * Request:
 * - Method: GET
 * - Path: /api/break_requests
 * - Query Parameters:
 *   - start_date (optional, integer, Unix timestamp in seconds)
 *   - end_date (optional, integer, Unix timestamp in seconds)
 * 
 * Response:
 * - 200: { break_requests: BreakRequestResponse[] }
 * - BreakRequestResponse: { id: string, user_id: string, break_type: string, break_duration: number, submission_date: number, notes: string }
 * - 500: Internal Server Error
 */
async getBreakRequests(startDate = null, endDate = null) {
    const queryParams = new URLSearchParams();
    
    if (startDate !== null) {
        queryParams.append('start_date', startDate.toString());
    }
    
    if (endDate !== null) {
        queryParams.append('end_date', endDate.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE_URL}/api/break_requests?${queryString}` : `${API_BASE_URL}/api/break_requests`;
    
    return await this.fetchJSON(endpoint, {
        method: 'GET'
    });
}

/**
 * Creates a new break request for truck drivers to request fatigue or lunch breaks
 * 
 * Request: POST /api/break_requests
 * Body: { truck_registration_number: string, break_type: string, break_duration: number, driver_name: string, company_name: string, location: string }
 * 
 * Response: 201 Created
 * Body: { id: string, user_id: string, break_type: string, break_duration: number, submission_date: number, notes: string }
 */
async createBreakRequest(breakRequestData) {
    return await this.fetchJSON(`${API_BASE_URL}/api/break_requests`, {
        method: 'POST',
        body: JSON.stringify({
            truck_registration_number: breakRequestData.truck_registration_number,
            break_type: breakRequestData.break_type,
            break_duration: breakRequestData.break_duration,
            driver_name: breakRequestData.driver_name,
            company_name: breakRequestData.company_name,
            location: breakRequestData.location
        })
    });
}

/**
 * Request: GET /api/breakdown_reports?start_date={start_date}&end_date={end_date}
 * Query Parameters:
 * - start_date (optional, integer): Unix timestamp in seconds
 * - end_date (optional, integer): Unix timestamp in seconds
 * 
 * Response: {
 *   breakdown_reports: [{
 *     id: string,
 *     user_id: string,
 *     truck_registration_number: string,
 *     fleet_number: string,
 *     driver_full_names: string,
 *     cellphone_number: string,
 *     supervisor_name: string,
 *     supervisor_cellphone_number: string,
 *     company_name: string,
 *     breakdown_location: string,
 *     issue_description: string,
 *     submission_date: number,
 *     status: string,
 *     notes: string,
 *     resolution_notes: string,
 *     slip_picture: string,
 *     seal_1_picture: string,
 *     seal_2_picture: string
 *   }]
 * }
 */
async getBreakdownReports(startDate = null, endDate = null) {
    const queryParams = new URLSearchParams();
    
    if (startDate !== null) {
        queryParams.append('start_date', startDate.toString());
    }
    
    if (endDate !== null) {
        queryParams.append('end_date', endDate.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE_URL}/api/breakdown_reports?${queryString}` : `${API_BASE_URL}/api/breakdown_reports`;
    
    return await this.fetchJSON(endpoint);
}

/**
 * Creates a new breakdown report for truck drivers to report truck breakdowns.
 * 
 * Request: POST /api/breakdown_reports
 * Body: {
 *   truck_registration_number: string,
 *   fleet_number: string,
 *   driver_full_names: string,
 *   cellphone_number: string,
 *   supervisor_name: string,
 *   supervisor_cellphone_number: string,
 *   company_name: string,
 *   slip_picture: string,
 *   seal_1_picture: string,
 *   seal_2_picture: string,
 *   breakdown_location: string,
 *   issue_description: string
 * }
 * 
 * Response: {
 *   id: string,
 *   user_id: string,
 *   truck_number: string,
 *   breakdown_location: string,
 *   issue_description: string,
 *   submission_date: number,
 *   status: string,
 *   notes: string,
 *   resolution_notes: string
 * }
 */
async createBreakdownReport(breakdownReportRequest) {
    return await this.fetchJSON(`${API_BASE_URL}/api/breakdown_reports`, {
        method: 'POST',
        body: JSON.stringify(breakdownReportRequest)
    });
}

/**
 * Request: { status: string; resolution_notes: string; }
 * Response: { id: string; user_id: string; truck_number: string; breakdown_location: string; issue_description: string; submission_date: number; status: string; notes: string; resolution_notes: string; }
 */
async resolveBreakdownReport(breakdownReportId, resolveBreakdownReportRequest) {
    const endpoint = `${API_BASE_URL}/api/breakdown_reports/${encodeURIComponent(breakdownReportId)}`;
    
    return await this.fetchJSON(endpoint, {
        method: 'PUT',
        body: JSON.stringify(resolveBreakdownReportRequest)
    });
}

/**
 * Download Reports
 * 
 * Request:
 * - Query Parameters:
 *   - start_date (optional, integer, Unix timestamp in seconds)
 *   - end_date (optional, integer, Unix timestamp in seconds)
 *   - report_type (required, string, either 'breakdown' or 'break_request')
 * 
 * Response:
 * - 200: Returns the CSV file as a base64 encoded string
 * - 400: Bad Request - Invalid input data or report type
 * - 500: Internal Server Error - Something went wrong on the server
 */
async downloadReports(reportType, startDate = null, endDate = null) {
    const queryParams = new URLSearchParams();
    queryParams.append('report_type', reportType);
    
    if (startDate !== null) {
        queryParams.append('start_date', startDate.toString());
    }
    
    if (endDate !== null) {
        queryParams.append('end_date', endDate.toString());
    }
    
    const endpoint = `${API_BASE_URL}/api/download_reports?${queryParams.toString()}`;
    
    const response = await fetch(endpoint, {
        method: 'GET'
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    return await response.text();
}

/**
 * Request: GET /api/storm/auth_user
 * Response: { name: string, id: string, handle: string, email: string }
 */
async getStormAuthUserById() {
    return await this.fetchJSON(`${API_BASE_URL}/api/storm/auth_user`);
}

/**
 * Request: GET /api/storm/me
 * Response: { name: string, id: string, handle: string, email: string }
 */
async getCurrentStormAuthUser() {
    return await this.fetchJSON(`${API_BASE_URL}/api/storm/me`);
}

/**
 * Logs in a user and returns a session token.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{token: string}>}
 */
async login(username, password) {
    // The fix is to explicitly add the Content-Type header
    return await this.fetchJSON(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
}
}