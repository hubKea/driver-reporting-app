import type express from 'express';
import logger from '../utils/logger';
import * as DataModel from '../datamodel';
import { database } from '../utils/database';

interface BreakdownReportResponse {
  id: string;
  user_id: string;
  truck_registration_number: string;
  fleet_number: string;
  driver_full_names: string;
  cellphone_number: string;
  supervisor_name: string;
  supervisor_cellphone_number: string;
  company_name: string;
  breakdown_location: string;
  issue_description: string;
  submission_date: number;
  status: string;
  notes: string;
  resolution_notes: string;
  slip_picture: string;
  seal_1_picture: string;
  seal_2_picture: string;
}

interface BreakdownReportsResponse {
  breakdown_reports: BreakdownReportResponse[];
}

const getBreakdownReports = (): express.RequestHandler => {
  const handler: express.RequestHandler = async (req, res, next) => {
    try {
      const { start_date, end_date } = req.query;

      // Validate date parameters if provided
      let startDateTimestamp: number | undefined;
      let endDateTimestamp: number | undefined;

      if (start_date !== undefined) {
        const parsedStartDate = parseInt(start_date as string, 10);
        if (isNaN(parsedStartDate)) {
          res.status(400).json({ error: 'Invalid start_date parameter. Must be a valid Unix timestamp.' });
          return;
        }
        startDateTimestamp = parsedStartDate;
      }

      if (end_date !== undefined) {
        const parsedEndDate = parseInt(end_date as string, 10);
        if (isNaN(parsedEndDate)) {
          res.status(400).json({ error: 'Invalid end_date parameter. Must be a valid Unix timestamp.' });
          return;
        }
        endDateTimestamp = parsedEndDate;
      }

      // Validate date range if both are provided
      if (startDateTimestamp !== undefined && endDateTimestamp !== undefined && startDateTimestamp > endDateTimestamp) {
        res.status(400).json({ error: 'start_date cannot be greater than end_date.' });
        return;
      }

      const db = await database.getDb();
      const collection = db.collection('breakdown_reports');

      // Build query filter
      const filter: any = {};
      if (startDateTimestamp !== undefined || endDateTimestamp !== undefined) {
        filter.submission_date = {};
        if (startDateTimestamp !== undefined) {
          filter.submission_date.$gte = startDateTimestamp;
        }
        if (endDateTimestamp !== undefined) {
          filter.submission_date.$lte = endDateTimestamp;
        }
      }

      // Retrieve breakdown reports with optional date filtering and sort by submission_date descending
      const breakdownReports = await collection
        .find(filter)
        .sort({ submission_date: -1 })
        .toArray();

      // Transform the data to match the response format
      const breakdownReportResponses: BreakdownReportResponse[] = breakdownReports.map(report => ({
        id: report._id?.toString() || report.id,
        user_id: report.user_id,
        truck_registration_number: report.truck_registration_number,
        fleet_number: report.fleet_number,
        driver_full_names: report.driver_full_names,
        cellphone_number: report.cellphone_number,
        supervisor_name: report.supervisor_name,
        supervisor_cellphone_number: report.supervisor_cellphone_number,
        company_name: report.company_name,
        breakdown_location: report.breakdown_location,
        issue_description: report.issue_description,
        submission_date: report.submission_date,
        status: report.status,
        notes: report.notes,
        resolution_notes: report.resolution_notes,
        slip_picture: report.slip_picture,
        seal_1_picture: report.seal_1_picture,
        seal_2_picture: report.seal_2_picture
      }));

      const response: BreakdownReportsResponse = {
        breakdown_reports: breakdownReportResponses
      };

      logger.info(`Retrieved ${breakdownReportResponses.length} breakdown reports`);
      res.status(200).json(response);
      return;

    } catch (e) {
      logger.error('Error retrieving breakdown reports:', e);
      next(e);
    }
  };
  return handler;
};

export default getBreakdownReports;
