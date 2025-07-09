export default class ClientAPI {
    fetchJSON(endpoint: any, options?: {}): Promise<any>;
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
    getBreakRequests(startDate?: any, endDate?: any): Promise<any>;
    /**
     * Creates a new break request for truck drivers to request fatigue or lunch breaks
     *
     * Request: POST /api/break_requests
     * Body: { truck_registration_number: string, break_type: string, break_duration: number, driver_name: string, company_name: string, location: string }
     *
     * Response: 201 Created
     * Body: { id: string, user_id: string, break_type: string, break_duration: number, submission_date: number, notes: string }
     */
    createBreakRequest(breakRequestData: any): Promise<any>;
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
    getBreakdownReports(startDate?: any, endDate?: any): Promise<any>;
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
    createBreakdownReport(breakdownReportRequest: any): Promise<any>;
    /**
     * Request: { status: string; resolution_notes: string; }
     * Response: { id: string; user_id: string; truck_number: string; breakdown_location: string; issue_description: string; submission_date: number; status: string; notes: string; resolution_notes: string; }
     */
    resolveBreakdownReport(breakdownReportId: any, resolveBreakdownReportRequest: any): Promise<any>;
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
    downloadReports(reportType: any, startDate?: any, endDate?: any): Promise<string>;
    /**
     * Request: GET /api/storm/auth_user
     * Response: { name: string, id: string, handle: string, email: string }
     */
    getStormAuthUserById(): Promise<any>;
    /**
     * Request: GET /api/storm/me
     * Response: { name: string, id: string, handle: string, email: string }
     */
    getCurrentStormAuthUser(): Promise<any>;
}
