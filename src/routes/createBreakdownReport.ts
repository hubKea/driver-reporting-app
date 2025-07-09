import type express from 'express';
import logger from '../utils/logger';
import * as DataModel from '../datamodel';
import { database } from '../utils/database';
import { tryDecodeBase64 } from '../utils/utils';

interface BreakdownReportRequest {
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
  issue_description: string;
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

interface StormMeResponse {
  id: string;
  name: string;
  handle: string;
  email: string;
}

const getCurrentUser = async (userId: string): Promise<StormMeResponse | null> => {
  try {
    const response = await fetch('/api/storm/me', {
      method: 'GET',
      headers: {
        'x-storm-userid': userId,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      logger.error(`Failed to get current user: ${response.status} ${response.statusText}`);
      return null;
    }

    const userData = await response.json() as StormMeResponse;
    return userData;
  } catch (error) {
    logger.error('Error fetching current user:', error);
    return null;
  }
};

const sendEmailAlert = async (breakdownReport: DataModel.BreakdownReport): Promise<void> => {
  try {
    const emailApiKey = tryDecodeBase64(process.env.EMAIL_API_KEY || '');
    const emailApiUrl = process.env.EMAIL_API_URL || 'https://api.sendgrid.com/v3/mail/send';
    const managementEmails = (process.env.MANAGEMENT_EMAILS || '').split(',').map(email => email.trim());
    const fromEmail = process.env.FROM_EMAIL || 'noreply@company.com';
    
    if (!emailApiKey || managementEmails.length === 0) {
      logger.warn('Email configuration missing, skipping email alert');
      return;
    }

    const emailPayload = {
      personalizations: [{
        to: managementEmails.map(email => ({ email })),
        subject: `URGENT: Truck Breakdown Report - ${breakdownReport.truck_registration_number}`
      }],
      from: { email: fromEmail },
      content: [{
        type: 'text/html',
        value: `
          <h2>Truck Breakdown Alert</h2>
          <p><strong>Truck Registration Number:</strong> ${breakdownReport.truck_registration_number}</p>
          <p><strong>Fleet Number:</strong> ${breakdownReport.fleet_number}</p>
          <p><strong>Driver:</strong> ${breakdownReport.driver_full_names}</p>
          <p><strong>Driver Phone:</strong> ${breakdownReport.cellphone_number}</p>
          <p><strong>Supervisor:</strong> ${breakdownReport.supervisor_name}</p>
          <p><strong>Supervisor Phone:</strong> ${breakdownReport.supervisor_cellphone_number}</p>
          <p><strong>Company:</strong> ${breakdownReport.company_name}</p>
          <p><strong>Location:</strong> ${breakdownReport.breakdown_location}</p>
          <p><strong>Issue Description:</strong> ${breakdownReport.issue_description}</p>
          <p><strong>Reported By:</strong> User ID ${breakdownReport.user_id}</p>
          <p><strong>Report Time:</strong> ${new Date(breakdownReport.submission_date * 1000).toISOString()}</p>
          <p><strong>Status:</strong> ${breakdownReport.status}</p>
          <p><strong>Slip Picture:</strong> ${breakdownReport.slip_picture}</p>
          <p><strong>Seal 1 Picture:</strong> ${breakdownReport.seal_1_picture}</p>
          <p><strong>Seal 2 Picture:</strong> ${breakdownReport.seal_2_picture}</p>
        `
      }]
    };

    const response = await fetch(emailApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      logger.error(`Failed to send email alert: ${response.status} ${response.statusText}`);
    } else {
      logger.info(`Email alert sent successfully for breakdown report ${breakdownReport.report_details}`);
    }
  } catch (error) {
    logger.error('Error sending email alert:', error);
  }
};

const createBreakdownReport = (): express.RequestHandler => {
  const handler: express.RequestHandler = async (req, res, next) => {
    try {
      const userId = req.headers['x-storm-userid'] as string;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // Get current user details
      const currentUser = await getCurrentUser(userId);
      if (!currentUser) {
        res.status(400).json({ error: 'Unable to retrieve user details' });
        return;
      }

      const requestBody = req.body as BreakdownReportRequest;

      // Validate truck_registration_number
      if (!requestBody.truck_registration_number) {
        res.status(400).json({ error: 'truck_registration_number is required' });
        return;
      }
      if (typeof requestBody.truck_registration_number !== 'string') {
        res.status(400).json({ error: 'truck_registration_number must be a string' });
        return;
      }

      // Validate fleet_number
      if (!requestBody.fleet_number) {
        res.status(400).json({ error: 'fleet_number is required' });
        return;
      }
      if (typeof requestBody.fleet_number !== 'string') {
        res.status(400).json({ error: 'fleet_number must be a string' });
        return;
      }

      // Validate driver_full_names
      if (!requestBody.driver_full_names) {
        res.status(400).json({ error: 'driver_full_names is required' });
        return;
      }
      if (typeof requestBody.driver_full_names !== 'string') {
        res.status(400).json({ error: 'driver_full_names must be a string' });
        return;
      }

      // Validate cellphone_number
      if (!requestBody.cellphone_number) {
        res.status(400).json({ error: 'cellphone_number is required' });
        return;
      }
      if (typeof requestBody.cellphone_number !== 'string') {
        res.status(400).json({ error: 'cellphone_number must be a string' });
        return;
      }

      // Validate supervisor_name
      if (!requestBody.supervisor_name) {
        res.status(400).json({ error: 'supervisor_name is required' });
        return;
      }
      if (typeof requestBody.supervisor_name !== 'string') {
        res.status(400).json({ error: 'supervisor_name must be a string' });
        return;
      }

      // Validate supervisor_cellphone_number
      if (!requestBody.supervisor_cellphone_number) {
        res.status(400).json({ error: 'supervisor_cellphone_number is required' });
        return;
      }
      if (typeof requestBody.supervisor_cellphone_number !== 'string') {
        res.status(400).json({ error: 'supervisor_cellphone_number must be a string' });
        return;
      }

      // Validate company_name
      if (!requestBody.company_name) {
        res.status(400).json({ error: 'company_name is required' });
        return;
      }
      if (typeof requestBody.company_name !== 'string') {
        res.status(400).json({ error: 'company_name must be a string' });
        return;
      }

      // Validate slip_picture
      if (!requestBody.slip_picture) {
        res.status(400).json({ error: 'slip_picture is required' });
        return;
      }
      if (typeof requestBody.slip_picture !== 'string') {
        res.status(400).json({ error: 'slip_picture must be a string' });
        return;
      }

      // Validate seal_1_picture
      if (!requestBody.seal_1_picture) {
        res.status(400).json({ error: 'seal_1_picture is required' });
        return;
      }
      if (typeof requestBody.seal_1_picture !== 'string') {
        res.status(400).json({ error: 'seal_1_picture must be a string' });
        return;
      }

      // Validate seal_2_picture
      if (!requestBody.seal_2_picture) {
        res.status(400).json({ error: 'seal_2_picture is required' });
        return;
      }
      if (typeof requestBody.seal_2_picture !== 'string') {
        res.status(400).json({ error: 'seal_2_picture must be a string' });
        return;
      }

      // Validate breakdown_location
      if (!requestBody.breakdown_location) {
        res.status(400).json({ error: 'breakdown_location is required' });
        return;
      }
      if (typeof requestBody.breakdown_location !== 'string') {
        res.status(400).json({ error: 'breakdown_location must be a string' });
        return;
      }

      // Validate issue_description
      if (!requestBody.issue_description) {
        res.status(400).json({ error: 'issue_description is required' });
        return;
      }
      if (typeof requestBody.issue_description !== 'string') {
        res.status(400).json({ error: 'issue_description must be a string' });
        return;
      }

      const db = await database.getDb();
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      // Generate a unique report_details ID
      const reportId = `breakdown_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create the breakdown report
      const breakdownReport = new DataModel.BreakdownReport(
        reportId,
        currentUser.id,
        requestBody.truck_registration_number,
        requestBody.breakdown_location,
        requestBody.issue_description,
        currentTimestamp,
        'pending',
        '',
        '',
        requestBody.fleet_number,
        requestBody.driver_full_names,
        requestBody.cellphone_number,
        requestBody.supervisor_name,
        requestBody.supervisor_cellphone_number,
        requestBody.company_name,
        requestBody.slip_picture,
        requestBody.seal_1_picture,
        requestBody.seal_2_picture,
        new Date()
      );

      // Save to database
      const saveResult = await breakdownReport.save();
      
      if (!saveResult) {
        res.status(500).json({ error: 'Failed to save breakdown report' });
        return;
      }

      // Send email alert (don't wait for it to complete)
      sendEmailAlert(breakdownReport).catch(error => {
        logger.error('Failed to send email alert:', error);
      });

      // Return the created report directly instead of fetching from database
      const response: BreakdownReportResponse = {
        id: breakdownReport.report_details,
        user_id: breakdownReport.user_id,
        truck_registration_number: breakdownReport.truck_registration_number,
        fleet_number: breakdownReport.fleet_number,
        driver_full_names: breakdownReport.driver_full_names,
        cellphone_number: breakdownReport.cellphone_number,
        supervisor_name: breakdownReport.supervisor_name,
        supervisor_cellphone_number: breakdownReport.supervisor_cellphone_number,
        company_name: breakdownReport.company_name,
        breakdown_location: breakdownReport.breakdown_location,
        issue_description: breakdownReport.issue_description,
        submission_date: breakdownReport.submission_date,
        status: breakdownReport.status,
        notes: breakdownReport.notes,
        resolution_notes: breakdownReport.resolution_notes,
        slip_picture: breakdownReport.slip_picture,
        seal_1_picture: breakdownReport.seal_1_picture,
        seal_2_picture: breakdownReport.seal_2_picture
      };

      res.status(201).json(response);
      return;

    } catch (e) {
      next(e);
    }
  };
  return handler;
};

export default createBreakdownReport;