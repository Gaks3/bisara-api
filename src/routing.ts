import { Routing } from "express-zod-api";

import { getSignDetail, listSigns } from "@/routes/dictionary/dictionary.routes";
import {
  catalog,
  dashboard,
  exercise,
  leaderboard,
  lesson,
  recordStreakActivity,
  streak,
  submitAttempt,
} from "@/routes/learning/learning.routes";
import { getProfile, updateProfile } from "@/routes/profile/profile.routes";

const routing: Routing = {
  api: {
    dashboard,
    dictionary: {
      "": listSigns,
      ":code": getSignDetail,
    },
    leaderboard,
    learning: {
      attempts: submitAttempt,
      catalog,
      exercises: { ":id": exercise },
      lessons: { ":slug": lesson },
    },
    profile: {
      "": getProfile,
      update: updateProfile,
    },
    streak: { activity: recordStreakActivity, current: streak },
  },
};

export default routing;
