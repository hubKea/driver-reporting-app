import type express from 'express';
import logger from '../utils/logger';
import * as DataModel from '../datamodel';
import { database } from '../utils/database';
import { stringify } from 'csv-stringify/sync';

const downloadReports = (): express.RequestHandler => {
  const handler: express.RequestHandler = async (req, res, next) => {
    try {
      const { start_date, end_date, report_type } = req.query;

      // Validate report_type
      if (!report_type) {
        res.status(400).json({ error: 'report_type is required' });
        return;
      }

      if (typeof report_type !== 'string') {
        res.status(400).json({ error: 'report_type must be a string' });
        return;
      }

      if (report_type !== 'breakdown' && report_type !== 'break_request') {
        res.status(400).json({ error: 'report_type must be either "breakdown" or "break_request"' });
        return;
      }

      // Validate date parameters if provided
      let startDateNum: number | undefined;
      let endDateNum: number | undefined;

      if (start_date !== undefined) {
        if (typeof start_date !== 'string' || isNaN(Number(start_date))) {
          res.status(400).json({ error: 'start_date must be a valid integer' });
          return;
        }
        startDateNum = parseInt(start_date as string, 10);
      }

      if (end_date !== undefined) {
        if (typeof end_date !== 'string' || isNaN(Number(end_date))) {
          res.status(400).json({ error: 'end_date must be a valid integer' });
          return;
        }
        endDateNum = parseInt(end_date as string, 10);
      }

      let data: any[] = [];
      let csvData: string;

      if (report_type === 'breakdown') {
        // Get all breakdown reports
        const reports = await DataModel.BreakdownReport.findAll();
        
        // Filter by date range if provided
        let filteredReports = reports;
        if (startDateNum !== undefined || endDateNum !== undefined) {
          filteredReports = reports.filter(report => {
            if (startDateNum !== undefined && report.submission_date < startDateNum) {
              return false;
            }
            if (endDateNum !== undefined && report.submission_date > endDateNum) {
              return false;
            }
            return true;
          });
        }

        // Convert to CSV format
        data = filteredReports.map(report => ({
          report_details: report.report_details,
          user_id: report.user_id,
          truck_number: report.truck_registration_number,
          breakdown_location: report.breakdown_location,
          issue_description: report.issue_description,
          submission_date: report.submission_date,
          status: report.status,
          notes: report.notes,
          resolution_notes: report.resolution_notes
        }));

        csvData = stringify(data, {
          header: true,
          columns: [
            'report_details',
            'user_id',
            'truck_registration_number',
            'breakdown_location',
            'issue_description',
            'submission_date',
            'status',
            'notes',
            'resolution_notes'
          ]
        });
      } else if (report_type === 'break_request') {
        // Get all break requests
        const requests = await DataModel.BreakRequest.findAll();
        
        // Filter by date range if provided
        let filteredRequests = requests;
        if (startDateNum !== undefined || endDateNum !== undefined) {
          filteredRequests = requests.filter((request: DataModel.BreakRequest) => {
            if (startDateNum !== undefined && request.submission_date < startDateNum) {
              return false;
            }
            if (endDateNum !== undefined && request.submission_date > endDateNum) {
              return false;
            }
            return true;
          });
        }

        // Convert to CSV format
        data = filteredRequests.map((request: DataModel.BreakRequest) => ({
          request_details: request.request_details,
          user_id: request.user_id,
          break_type: request.break_type,
          break_duration: request.break_duration,
          submission_date: request.submission_date,
          notes: request.notes
        }));

        csvData = stringify(data, {
          header: true,
          columns: [
            'request_details',
            'user_id',
            'break_type',
            'break_duration',
            'submission_date',
            'notes'
          ]
        });
      } else {
        res.status(400).json({ error: 'Invalid report_type' });
        return;
      }

      // Encode CSV as base64
      const base64Csv = Buffer.from(csvData, 'utf8').toString('base64');

      logger.info(`Downloaded ${report_type} reports with ${data.length} records`);

      res.status(200).json(base64Csv);
      return;

    } catch (e) {
      logger.error('Error downloading reports:', e);
      next(e);
    }
  };
  return handler;
};

export default downloadReports;
