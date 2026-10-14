import { authedFactory } from "@/factory";

import { emptyInput, updateProfileInput } from "./profile.input";
import { profileOutput } from "./profile.output";
import { profileService } from "./profile.service";

export const getProfile = authedFactory.build({
  description:
    "Retrieve complete user profile including stats, achievements, practice history, and accessibility settings.",
  handler: async ({ ctx }) => profileService.getProfile(ctx.user.id),
  input: emptyInput,
  method: "get",
  operationId: "getUserProfile",
  output: profileOutput,
  summary: "Get user profile",
  tag: "User",
});

export const updateProfile = authedFactory.build({
  description:
    "Update user profile information, bio, city, or accessibility settings.",
  handler: async ({ ctx, input }) =>
    profileService.updateProfile(ctx.user.id, input),
  input: updateProfileInput,
  method: "patch",
  operationId: "updateUserProfile",
  output: profileOutput,
  summary: "Update user profile",
  tag: "User",
});
