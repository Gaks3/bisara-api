import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding Bisara database...");

  // 1. Create Achievements
  const achievementsData = [
    {
      code: "MASTER_ABJAD",
      description: "Selesaikan semua huruf isyarat dasar BISINDO A-Z",
      icon: "check",
      name: "Master Abjad",
    },
    {
      code: "API_KONSISTEN",
      description: "Belajar konsisten setiap hari selama 7 hari berturut-turut",
      icon: "flame",
      name: "Api Konsisten",
    },
    {
      code: "TEMAN_INKLUSIF",
      description: "Aktif belajar dan berinteraksi dalam ruang inklusif",
      icon: "people",
      name: "Teman Inklusif",
    },
    {
      code: "AI_DETEKSI",
      description: "Raih akurasi di atas 85% pada latihan kamera AI",
      icon: "camera",
      name: "AI Deteksi",
    },
  ];

  for (const ach of achievementsData) {
    await db.achievement.upsert({
      create: ach,
      update: ach,
      where: { code: ach.code },
    });
  }

  // 2. Create Categories
  const categoriesData = [
    {
      description: "Huruf Alfabet Bahasa Isyarat Indonesia (A-Z)",
      icon: "A",
      name: "Abjad A-Z",
      order: 1,
      slug: "abjad",
      type: "ALPHABET" as const,
    },
    {
      description: "Kosakata percakapan dan sapaan sehari-hari",
      icon: "chat",
      name: "Kata Hari",
      order: 2,
      slug: "kata-hari",
      type: "VOCABULARY" as const,
    },
    {
      description: "Simbol angka dan perhitungan dasar BISINDO",
      icon: "0",
      name: "Angka",
      order: 3,
      slug: "angka",
      type: "NUMBER" as const,
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await db.learningCategory.upsert({
      create: cat,
      update: cat,
      where: { slug: cat.slug },
    });
    categoryMap.set(cat.slug, record.id);
  }

  const getCategory = (slug: string) => {
    const val = categoryMap.get(slug);
    if (!val) throw new Error(`Missing category ${slug}`);
    return val;
  };

  // 3. Create Levels
  const levelsData = [
    {
      code: 1,
      description: "Pengenalan abjad ejaan jari dan dasar gerakan",
      isPublished: true,
      order: 1,
      title: "Level 1: Abjad Ejaan Jari",
    },
    {
      code: 2,
      description: "Bilangan angka dan hitungan tangan BISINDO",
      isPublished: true,
      order: 2,
      title: "Level 2: Angka & Hitungan",
    },
    {
      code: 3,
      description: "Frasa percakapan dan salam ramah sehari-hari",
      isPublished: true,
      order: 3,
      title: "Level 3: Percakapan Sehari-hari",
    },
  ];

  const levelMap = new Map<number, string>();
  for (const lvl of levelsData) {
    const record = await db.learningLevel.upsert({
      create: lvl,
      update: lvl,
      where: { code: lvl.code },
    });
    levelMap.set(lvl.code, record.id);
  }

  const getLevel = (code: number) => {
    const val = levelMap.get(code);
    if (!val) throw new Error(`Missing level ${String(code)}`);
    return val;
  };

  // 4. Create Signs
  const signsData = [
    {
      code: "A",
      description:
        "Kepalkan tangan dengan ibu jari berada tegak di samping jari telunjuk.",
      difficulty: 1,
      meaning: "Huruf A",
      mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      word: "Huruf 'A'",
    },
    {
      code: "HALO",
      description:
        "Buka telapak tangan Anda setinggi dada lalu lambaikan perlahan ke samping.",
      difficulty: 1,
      meaning: "Salam sapaan ramah",
      mediaUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500",
      word: "HALO",
    },
    {
      code: "TERIMA_KASIH",
      description:
        "Sentuhkan ujung jari tangan kanan ke bibir/dagu, lalu gerakkan tangan ke depan secara terbuka.",
      difficulty: 1,
      meaning: "Ungkapan terima kasih",
      mediaUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=500",
      word: "TERIMA KASIH",
    },
    {
      code: "SAPAAN",
      description: "Gerakan salam hangat dua tangan di dada.",
      difficulty: 1,
      meaning: "Sapaan pembuka",
      mediaUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500",
      word: "SAPAAN",
    },
    {
      code: "CINTA",
      description: "I Love You hand sign (ibu jari, telunjuk, kelingking terbuka).",
      difficulty: 1,
      meaning: "Saya Cinta Kamu",
      mediaUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500",
      word: "SAYA CINTA KAMU",
    },
    {
      code: "MAAF",
      description: "Kepalan tangan memutar melingkar searah jarum jam di depan dada.",
      difficulty: 1,
      meaning: "Permohonan maaf",
      mediaUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
      word: "MAAF",
    },
  ];

  const signMap = new Map<string, string>();
  for (const signItem of signsData) {
    const sign = await db.sign.upsert({
      create: {
        code: signItem.code,
        description: signItem.description,
        difficulty: signItem.difficulty,
        meaning: signItem.meaning,
        media: {
          create: [
            {
              duration: 3,
              thumbnail: signItem.mediaUrl,
              type: "IMAGE",
              url: signItem.mediaUrl,
            },
          ],
        },
        word: signItem.word,
      },
      update: {
        description: signItem.description,
        meaning: signItem.meaning,
        word: signItem.word,
      },
      where: { code: signItem.code },
    });
    signMap.set(signItem.code, sign.id);
  }

  const getSign = (code: string) => {
    const val = signMap.get(code);
    if (!val) throw new Error(`Missing sign ${code}`);
    return val;
  };

  // 5. Create Lessons
  const lesson1 = await db.lesson.upsert({
    create: {
      categoryId: getCategory("abjad"),
      description: "Materi belajar huruf isyarat dasar BISINDO A-Z secara visual dan interaktif.",
      isPublished: true,
      levelId: getLevel(1),
      order: 1,
      slug: "modul-abjad-a-z",
      title: "Modul Abjad BISINDO A-Z",
    },
    update: {
      description: "Materi belajar huruf isyarat dasar BISINDO A-Z secara visual dan interaktif.",
      title: "Modul Abjad BISINDO A-Z",
    },
    where: { slug: "modul-abjad-a-z" },
  });

  await db.lesson.upsert({
    create: {
      categoryId: getCategory("kata-hari"),
      description: "Belajar salam, ungkapan terima kasih, dan sapaan sehari-hari.",
      isPublished: true,
      levelId: getLevel(3),
      order: 1,
      slug: "sapaan-salam",
      title: "Sapaan & Salam Sehari-hari",
    },
    update: {
      levelId: getLevel(3),
      title: "Sapaan & Salam Sehari-hari",
    },
    where: { slug: "sapaan-salam" },
  });

  const lessonAngka = await db.lesson.upsert({
    create: {
      categoryId: getCategory("angka"),
      description: "Mengenal angka dan simbol hitungan BISINDO.",
      isPublished: true,
      levelId: getLevel(2),
      order: 1,
      slug: "angka-dan-hitungan",
      title: "Angka & Hitungan",
    },
    update: {
      levelId: getLevel(2),
      title: "Angka & Hitungan",
    },
    where: { slug: "angka-dan-hitungan" },
  });

  // 6. Materials for Lesson 1 (Matches Image 2)
  await db.learningMaterial.deleteMany({ where: { lessonId: lesson1.id } });

  await db.learningMaterial.create({
    data: {
      content: "Flashcard interaktif huruf 'A' sesuai standar BISINDO.",
      lessonId: lesson1.id,
      mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      order: 1,
      score: 10,
      signId: getSign("A"),
      title: "Flashcard & Player Isyarat (BISINDO Standar)",
      type: "SIGN",
    },
  });

  await db.learningMaterial.create({
    data: {
      content: "Video peraga isyarat gerak tangan TERIMA KASIH dengan opsi perlambat 0.5x.",
      lessonId: lesson1.id,
      mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      order: 2,
      score: 10,
      signId: getSign("TERIMA_KASIH"),
      title: "Video Peraga",
      type: "VIDEO",
    },
  });

  // 7. Exercises for Lesson 1 (Matches Image 2 & 3)
  await db.exercise.deleteMany({ where: { lessonId: lesson1.id } });

  // Exercise A: Quiz (Tebak Arti)
  const quizExercise = await db.exercise.create({
    data: {
      instruction: "Pilih salah satu arti isyarat yang paling tepat sesuai demonstrasi gestur.",
      isPublished: true,
      lessonId: lesson1.id,
      levelId: getLevel(1),
      maxScore: 50,
      mediaUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500",
      order: 1,
      passingScore: 70,
      prompt: "Apakah arti gestur isyarat berikut ini?",
      signId: getSign("HALO"),
      type: "GUESS_MEANING",
    },
  });

  await db.exerciseOption.createMany({
    data: [
      {
        exerciseId: quizExercise.id,
        isCorrect: true,
        label: "A. Halo / Salam",
        order: 1,
        signId: getSign("HALO"),
      },
      {
        exerciseId: quizExercise.id,
        isCorrect: false,
        label: "B. Saya Cinta Kamu",
        order: 2,
        signId: getSign("CINTA"),
      },
      {
        exerciseId: quizExercise.id,
        isCorrect: false,
        label: "C. Terima Kasih",
        order: 3,
        signId: getSign("TERIMA_KASIH"),
      },
      {
        exerciseId: quizExercise.id,
        isCorrect: false,
        label: "D. Maaf",
        order: 4,
        signId: getSign("MAAF"),
      },
    ],
  });

  // Exercise B: AI Practice (Latihan Kamera AI - Matches Image 3 & Flowchart)
  const aiExercise = await db.exercise.create({
    data: {
      cvConfig: {
        create: {
          confidenceThreshold: 0.85,
          detectionMode: "HAND_POSITION",
          holdTimeMs: 1500,
          targetSignId: getSign("HALO"),
        },
      },
      instruction: "Buka telapak tangan Anda setinggi dada lalu lambaikan perlahan ke samping.",
      isPublished: true,
      lessonId: lesson1.id,
      levelId: getLevel(1),
      maxScore: 50,
      order: 2,
      passingScore: 85,
      prompt: "Coba peragakan kata \"HALO\" di depan kamera!",
      signId: getSign("HALO"),
      type: "AI_PRACTICE",
    },
  });

  // 8. Create Demo User matching Image 4
  const demoUserId = "user_demo_bisara";
  const demoUser = await db.user.upsert({
    create: {
      bio: "Belajar BISINDO untuk komunikasi tanpa batas.",
      city: "Yogyakarta",
      email: "you@bisara.app",
      emailVerified: true,
      id: demoUserId,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      name: "You",
      preferences: {
        dailyReminder: true,
        dyslexiaFont: false,
        highContrast: false,
        reminderTime: "19:00 WIB",
      },
      roleTitle: "Pembelajar Inklusif",
      username: "you",
    },
    update: {
      bio: "Belajar BISINDO untuk komunikasi tanpa batas.",
      city: "Yogyakarta",
      name: "You",
      roleTitle: "Pembelajar Inklusif",
    },
    where: { email: "you@bisara.app" },
  });

  // User Score (1,250 XP total)
  await db.userScore.upsert({
    create: { totalScore: 1250, userId: demoUser.id },
    update: { totalScore: 1250 },
    where: { userId: demoUser.id },
  });

  // Learning Streak (7 Days)
  const streak = await db.learningStreak.upsert({
    create: {
      currentDays: 7,
      lastActivityDate: new Date(),
      longestDays: 12,
      userId: demoUser.id,
    },
    update: {
      currentDays: 7,
      lastActivityDate: new Date(),
      longestDays: 12,
    },
    where: { userId: demoUser.id },
  });

  // 7 Days of activities
  for (let i = 0; i < 7; i++) {
    const activityDate = new Date();
    activityDate.setUTCDate(activityDate.getUTCDate() - (6 - i));
    const normalizedDate = new Date(
      Date.UTC(
        activityDate.getUTCFullYear(),
        activityDate.getUTCMonth(),
        activityDate.getUTCDate(),
      ),
    );

    await db.streakActivity.upsert({
      create: {
        activityDate: normalizedDate,
        minutes: 15 + i * 2,
        streakId: streak.id,
        userId: demoUser.id,
      },
      update: {
        minutes: 15 + i * 2,
      },
      where: {
        userId_activityDate: {
          activityDate: normalizedDate,
          userId: demoUser.id,
        },
      },
    });
  }

  // 3 / 4 Unlocked Achievements (Master Abjad, Api Konsisten, Teman Inklusif)
  const masterAbjad = await db.achievement.findUnique({
    where: { code: "MASTER_ABJAD" },
  });
  const apiKonsisten = await db.achievement.findUnique({
    where: { code: "API_KONSISTEN" },
  });
  const temanInklusif = await db.achievement.findUnique({
    where: { code: "TEMAN_INKLUSIF" },
  });

  for (const ach of [masterAbjad, apiKonsisten, temanInklusif]) {
    if (ach) {
      await db.userAchievement.upsert({
        create: {
          achievementId: ach.id,
          awardedAt: new Date(Date.now() - 2 * 86400000),
          userId: demoUser.id,
        },
        update: {},
        where: {
          userId_achievementId: {
            achievementId: ach.id,
            userId: demoUser.id,
          },
        },
      });
    }
  }

  // User Progress for Lessons (50% Selesai)
  await db.userProgress.upsert({
    create: {
      completedExercises: 1,
      completedMaterials: 2,
      lastActivityAt: new Date(Date.now() - 86400000),
      lessonId: lesson1.id,
      levelId: getLevel(1),
      progressPercent: 50,
      score: 50,
      totalExercises: 2,
      userId: demoUser.id,
    },
    update: {
      completedExercises: 1,
      progressPercent: 50,
      score: 50,
      totalExercises: 2,
    },
    where: {
      userId_levelId_lessonId: {
        lessonId: lesson1.id,
        levelId: getLevel(1),
        userId: demoUser.id,
      },
    },
  });

  // User Progress for Level 2 (20% Selesai - Matches Image 2)
  await db.userProgress.upsert({
    create: {
      completedExercises: 1,
      completedMaterials: 1,
      lastActivityAt: new Date(Date.now() - 2 * 86400000),
      lessonId: lessonAngka.id,
      levelId: getLevel(2),
      progressPercent: 20,
      score: 20,
      totalExercises: 5,
      userId: demoUser.id,
    },
    update: {
      completedExercises: 1,
      progressPercent: 20,
      score: 20,
      totalExercises: 5,
    },
    where: {
      userId_levelId_lessonId: {
        lessonId: lessonAngka.id,
        levelId: getLevel(2),
        userId: demoUser.id,
      },
    },
  });

  // Recent Exercise Attempt (Matches Image 3)
  await db.exerciseAttempt.create({
    data: {
      accuracy: 0.98,
      completedAt: new Date(),
      detectedSignId: getSign("HALO"),
      durationMs: 4200,
      exerciseId: aiExercise.id,
      feedback: "Posisi telapak tangan tepat & irama lambaian stabil.",
      score: 50,
      status: "COMPLETED",
      userId: demoUser.id,
    },
  });

  console.log("✅ Bisara database successfully seeded with UI-matching data!");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
