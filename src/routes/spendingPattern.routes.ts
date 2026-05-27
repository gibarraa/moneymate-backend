import { Router } from "express";
import {
  generateSpendingPatterns,
  getSpendingPatterns,
} from "../controllers/spendingPattern.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const spendingPatternRouter = Router();

spendingPatternRouter.get("/", asyncHandler(getSpendingPatterns));
spendingPatternRouter.post("/generate", asyncHandler(generateSpendingPatterns));
