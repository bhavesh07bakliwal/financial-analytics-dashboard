import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as dashboardService from '../services/dashboardService';

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await dashboardService.getSummary(req.query);
  res.status(200).json({ success: true, data: summary });
});

export const getTrends = asyncHandler(async (req: Request, res: Response) => {
  const trends = await dashboardService.getTrends(req.query);
  res.status(200).json({ success: true, data: trends });
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await dashboardService.getCategoryBreakdown(req.query);
  res.status(200).json({ success: true, data: categories });
});

export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = await dashboardService.getStatusBreakdown(req.query);
  res.status(200).json({ success: true, data: status });
});
