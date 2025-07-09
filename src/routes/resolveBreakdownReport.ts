import type express from 'express';
import logger from '../utils/logger';
import * as DataModel from '../datamodel';
import { database } from '../utils/database';

interface ResolveBreakdownReportRequest {
  status: string;
  resolution_notes: string;
}

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

const putBreakdownReport = (): express.RequestHandler => {
  const handler: express.RequestHandler = async (req, res, next) => {
    try {
      const userId = req.headers['x-storm-userid'] as string;
      const breakdownReportId = req.params.breakdown_report_id;
      const { status, resolution_notes } = req.body as ResolveBreakdownReportRequest;

      // Validate user ID
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // Validate breakdown report ID
      if (!breakdownReportId) {
        res.status(400).json({ error: 'Breakdown report ID is required' });
        return;
      }

      // Get user and verify role
      const user = await DataModel.User.findById(userId);
      if (!user) {
        res.status(400).json({ error: 'User not found' });
        return;
      }

      if (user.role !== 'manager') {
        res.status(403).json({ error: 'Only managers can resolve breakdown reports' });
        return;
      }

      // Validate status
      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      const validStatuses = ['pending', 'resolved', 'in_progress'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be one of: pending, resolved, in_progress' });
        return;
      }

      // Validate resolution notes
      if (!resolution_notes) {
        res.status(400).json({ error: 'Resolution notes are required' });
        return;
      }

      // Get database connection
      const db = await database.getDb();
      
      // Find the breakdown report
      const existingReport = await db.collection('breakdown_reports').findOne({ report_details: breakdownReportId });
      
      if (!existingReport) {
        res.status(404).json({ error: 'Breakdown report not found' });
        return;
      }

      // Update the breakdown report
      const updateResult = await db.collection('breakdown_reports').updateOne(
        { report_details: breakdownReportId },
        { 
          $set: { 
            status: status,
            resolution_notes: resolution_notes
          }
        }
      );

      if (updateResult.matchedCount === 0) {
        res.status(404).json({ error: 'Breakdown report not found' });
        return;
      }

      // Fetch the updated breakdown report
      const updatedReport = await db.collection('breakdown_reports').findOne({ report_details: breakdownReportId });
      
      if (!updatedReport) {
        res.status(500).json({ error: 'Failed to retrieve updated breakdown report' });
        return;
      }

      // Prepare response
      const response: BreakdownReportResponse = {
        id: updatedReport.report_details,
        user_id: updatedReport.user_id,
        truck_registration_number: updatedReport.truck_registration_number,
        fleet_number: updatedReport.fleet_number,
        driver_full_names: updatedReport.driver_full_names,
        cellphone_number: updatedReport.cellphone_number,
        supervisor_name: updatedReport.supervisor_name,
        supervisor_cellphone_number: updatedReport.supervisor_cellphone_number,
        company_name: updatedReport.company_name,
        breakdown_location: updatedReport.breakdown_location,
        issue_description: updatedReport.issue_description,
        submission_date: updatedReport.submission_date,
        status: updatedReport.status,
        notes: updatedReport.notes,
        resolution_notes: updatedReport.resolution_notes,
        slip_picture: updatedReport.slip_picture,
        seal_1_picture: updatedReport.seal_1_picture,
        seal_2_picture: updatedReport.seal_2_picture
      };

      logger.info(`Breakdown report ${breakdownReportId} resolved by manager ${userId}`);
      res.status(200).json(response);
      return;

    } catch (e) {
      logger.error('Error resolving breakdown report:', e);
      next(e);
    }
  };
  return handler;
};

export default putBreakdownReport;
