import { Router } from "express";
import {
  createRecommendations,
  getRecommendations,
  markRecommendationRead,
} from "../controllers/recommendation.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const recommendationRouter = Router();

recommendationRouter.get("/", asyncHandler(getRecommendations));
recommendationRouter.post("/", asyncHandler(createRecommendations));
recommendationRouter.patch("/:id/read", asyncHandler(markRecommendationRead));
