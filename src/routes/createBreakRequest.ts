import type express from 'express';
import logger from '../utils/logger';
import * as DataModel from '../datamodel';
import { database } from '../utils/database';
import { tryDecodeBase64 } from '../utils/utils';
import nodemailer from 'nodemailer';

interface BreakRequestRequest {
  break_type: string;
  break_duration: number;
  driver_name: string;
  company_name: string;
  location: string;
}

interface BreakRequestResponse {
  id: string;
  user_id: string;
  break_type: string;
  break_duration: number;
  submission_date: number;
  notes: string;
}

const createBreakRequest = (): express.RequestHandler => {
  const handler: express.RequestHandler = async (req, res, next) => {
    try {
      // Get user ID from headers
      const userId = req.headers['x-storm-userid'] as string;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // Validate request body exists
      if (!req.body) {
        res.status(400).json({ error: 'Request body is required' });
        return;
      }

      const { break_type, break_duration, driver_name, company_name, location }: BreakRequestRequest = req.body;

      // Validate break_type
      if (!break_type) {
        res.status(400).json({ error: 'break_type is required' });
        return;
      }

      if (typeof break_type !== 'string') {
        res.status(400).json({ error: 'break_type must be a string' });
        return;
      }

      if (break_type !== 'fatigue' && break_type !== 'lunch') {
        res.status(400).json({ error: 'break_type must be either "fatigue" or "lunch"' });
        return;
      }

      // Validate break_duration
      if (break_duration === undefined || break_duration === null) {
        res.status(400).json({ error: 'break_duration is required' });
        return;
      }

      if (typeof break_duration !== 'number') {
        res.status(400).json({ error: 'break_duration must be a number' });
        return;
      }

      // Validate driver_name
      if (!driver_name) {
        res.status(400).json({ error: 'driver_name is required' });
        return;
      }

      if (typeof driver_name !== 'string') {
        res.status(400).json({ error: 'driver_name must be a string' });
        return;
      }

      // Validate company_name
      if (!company_name) {
        res.status(400).json({ error: 'company_name is required' });
        return;
      }

      if (typeof company_name !== 'string') {
        res.status(400).json({ error: 'company_name must be a string' });
        return;
      }

      // Validate location
      if (!location) {
        res.status(400).json({ error: 'location is required' });
        return;
      }

      if (typeof location !== 'string') {
        res.status(400).json({ error: 'location must be a string' });
        return;
      }

      // Get current timestamp
      const submissionDate = Math.floor(Date.now() / 1000);

      // Generate unique ID for the break request
      const breakRequestId = new Date().getTime().toString();

      // Create new break request
      const breakRequest = new DataModel.BreakRequest(
  breakRequestId,
  userId,
  break_type,
  break_duration,
  submissionDate,
  '', // notes initialized as empty string
  driver_name,
  company_name,
  location,
  new Date() // This is the missing argument
);

      // Save to database
      const saved = await breakRequest.save();
      if (!saved) {
        res.status(500).json({ error: 'Failed to save break request' });
        return;
      }

      // Send email alert to management team
      try {
        const emailConfig = {
          host: tryDecodeBase64(process.env.EMAIL_HOST || ''),
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: tryDecodeBase64(process.env.EMAIL_USER || ''),
            pass: tryDecodeBase64(process.env.EMAIL_PASS || '')
          }
        };

        const transporter = nodemailer.createTransport(emailConfig);

        const managementEmails = (tryDecodeBase64(process.env.MANAGEMENT_EMAILS || '')).split(',');
        const emailSubject = tryDecodeBase64(process.env.BREAK_REQUEST_EMAIL_SUBJECT || 'New Break Request Submitted');
        const emailBody = tryDecodeBase64(process.env.BREAK_REQUEST_EMAIL_BODY || `A new break request has been submitted.\n\nType: ${break_type}\nDuration: ${break_duration} minutes\nDriver: ${driver_name}\nCompany: ${company_name}\nLocation: ${location}\nUser ID: ${userId}\nSubmission Date: ${new Date(submissionDate * 1000).toISOString()}`);

        await transporter.sendMail({
          from: tryDecodeBase64(process.env.EMAIL_FROM || ''),
          to: managementEmails.join(','),
          subject: emailSubject,
          text: emailBody
        });

        logger.info(`Email alert sent to management for break request ${breakRequestId}`);
      } catch (emailError) {
        logger.error('Failed to send email alert:', emailError);
        // Continue execution - don't fail the request if email fails
      }

      // Fetch the saved break request from database to return
      const savedBreakRequests = await DataModel.BreakRequest.findByUserId(userId);
      const savedBreakRequest = savedBreakRequests.find(br => br.request_details === breakRequestId);

      if (!savedBreakRequest) {
        res.status(500).json({ error: 'Failed to retrieve saved break request' });
        return;
      }

      const response: BreakRequestResponse = {
        id: savedBreakRequest.request_details,
        user_id: savedBreakRequest.user_id,
        break_type: savedBreakRequest.break_type,
        break_duration: savedBreakRequest.break_duration,
        submission_date: savedBreakRequest.submission_date,
        notes: savedBreakRequest.notes
      };

      res.status(201).json(response);
      return;

    } catch (e) {
      next(e);
    }
  };
  return handler;
};

export default createBreakRequest;
