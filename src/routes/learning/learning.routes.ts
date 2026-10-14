import { authedFactory } from "@/factory";

import {
  attemptInput,
  emptyInput,
  exerciseInput,
  leaderboardInput,
  lessonInput,
  streakActivityInput,
} from "./learning.input";
import {
  attemptOutput,
  catalogOutput,
  dashboardOutput,
  exerciseOutput,
  leaderboardOutput,
  lessonOutput,
  streakOutput,
} from "./learning.output";
import { learningService } from "./learning.service";

export const catalog = authedFactory.build({
  description: "List of published BISINDO categories, levels, and lessons.",
  handler: async ({ ctx }) => learningService.getCatalog(ctx.user.id),
  input: emptyInput,
  method: "get",
  operationId: "getLearningCatalog",
  output: catalogOutput,
  summary: "Get learning catalog",
  tag: "Learning",
});

export const lesson = authedFactory.build({
  description: "Retrieve the materials and exercises for a single lesson.",
  handler: async ({ input }) => learningService.getLesson(input.slug),
  input: lessonInput,
  method: "get",
  operationId: "getLesson",
  output: lessonOutput,
  summary: "Get lesson detail",
  tag: "Learning",
});

export const exercise = authedFactory.build({
  description:
    "Retrieve detailed exercise questions for an authenticated user.",
  handler: async ({ input }) => learningService.getExercise(input.id),
  input: exerciseInput,
  method: "get",
  operationId: "getExercise",
  output: exerciseOutput,
  summary: "Get exercise detail",
  tag: "Practice",
});

export const submitAttempt = authedFactory.build({
  description:
    "Save the exercise result and update the user's score and learning progress.",
  handler: async ({ ctx, input }) =>
    learningService.completeAttempt(ctx.user.id, input),
  input: attemptInput,
  method: "post",
  operationId: "submitExerciseAttempt",
  output: attemptOutput,
  summary: "Submit exercise attempt",
  tag: "Practice",
});

export const dashboard = authedFactory.build({
  description:
    "Retrieve a summary of the user's profile, score, streak, and learning progress.",
  handler: async ({ ctx }) => learningService.getDashboard(ctx.user.id),
  input: emptyInput,
  method: "get",
  operationId: "getDashboard",
  output: dashboardOutput,
  summary: "Get user dashboard",
  tag: "User",
});

export const leaderboard = authedFactory.build({
  description: "Retrieve user rankings based on the selected score period.",
  handler: async ({ input }) =>
    learningService.getLeaderboard(input.period, input.limit),
  input: leaderboardInput,
  method: "get",
  operationId: "getLeaderboard",
  output: leaderboardOutput,
  summary: "Get leaderboard",
  tag: "Gamification",
});

export const streak = authedFactory.build({
  description: "Retrieve the user's current learning streak.",
  handler: async ({ ctx }) => learningService.getStreak(ctx.user.id),
  input: emptyInput,
  method: "get",
  operationId: "getLearningStreak",
  output: streakOutput,
  summary: "Get learning streak",
  tag: "Gamification",
});

export const recordStreakActivity = authedFactory.build({
  description:
    "Record the user's daily learning activity and update their streak.",
  handler: async ({ ctx, input }) =>
    learningService.recordActivity(ctx.user.id, input.minutes),
  input: streakActivityInput,
  method: "post",
  operationId: "recordStreakActivity",
  output: streakOutput,
  summary: "Record learning activity",
  tag: "Gamification",
});
