import { db } from "../src/lib/db";

// ============================================================
// ASET DARI FOLDER PUBLIC (diserve via route /assets/*)
// ============================================================
const ASSETS = {
  images: {
    angka1: "/assets/tangan-angka-1.png",
    angka2: "/assets/tangan-angka-2.png",
    hari: "/assets/hari.jpeg",
    hurufA: "/assets/tangan-huruf-a.png",
    hurufB: "/assets/tangan-huruf-b.png",
  },
  videos: {
    angka1: "/assets/vidio-angka-1.mp4",
    angka2: "/assets/vidio-angka-2.mp4",
    hari: "/assets/hari.mp4",
    hurufA: "/assets/vidio-huruf-a.mp4",
    hurufB: "/assets/vidio-huruf-b.mp4",
  },
};

const IMAGES = [
  ASSETS.images.hurufA,
  ASSETS.images.hurufB,
  ASSETS.images.angka1,
  ASSETS.images.angka2,
];

const VIDEOS = {
  angka: ASSETS.videos.angka1,
  angka1: ASSETS.videos.angka1,
  angka2: ASSETS.videos.angka2,
  hari: ASSETS.videos.hurufB,
  huruf: ASSETS.videos.hurufA,
  hurufA: ASSETS.videos.hurufA,
  hurufB: ASSETS.videos.hurufB,
};

const img = (i: number) => IMAGES[i % IMAGES.length] as string;

// ============================================================
// TIPE & HELPER
// ============================================================
type MaterialSeed = {
  content: string;
  mediaUrl: string;
  signCode: string;
  title: string;
  type: "SIGN" | "VIDEO";
};

type QuizSeed = {
  correctIndex: number;
  instruction: string;
  mediaUrl: string;
  options: { label: string; signCode: string }[];
  prompt: string;
  signCode: string;
};

type AiSeed = {
  confidenceThreshold: number;
  instruction: string;
  passingScore: number;
  prompt: string;
  signCode: string;
};

/**
 * Hapus lalu buat ulang materi + soal untuk 1 lesson.
 * Urutan soal: semua kuis dulu (order 1..n), lalu latihan kamera AI (order n+1).
 * Mengembalikan exercise AI (dipakai untuk demo attempt).
 */
async function seedLessonContent(params: {
  ai: AiSeed;
  getSign: (code: string) => string;
  lessonId: string;
  levelId: string;
  materials: MaterialSeed[];
  quizzes: QuizSeed[];
}) {
  const { ai, getSign, lessonId, levelId, materials, quizzes } = params;

  // --- Materi ---
  await db.learningMaterial.deleteMany({ where: { lessonId } });

  for (const [i, m] of materials.entries()) {
    await db.learningMaterial.create({
      data: {
        content: m.content,
        lessonId,
        mediaUrl: m.mediaUrl,
        order: i + 1,
        score: 10,
        signId: getSign(m.signCode),
        title: m.title,
        type: m.type,
      },
    });
  }

  // --- Soal ---
  await db.exercise.deleteMany({ where: { lessonId } });

  for (const [i, q] of quizzes.entries()) {
    const exercise = await db.exercise.create({
      data: {
        instruction: q.instruction,
        isPublished: true,
        lessonId,
        levelId,
        maxScore: 50,
        mediaUrl: q.mediaUrl,
        order: i + 1,
        passingScore: 70,
        prompt: q.prompt,
        signId: getSign(q.signCode),
        type: "GUESS_MEANING",
      },
    });

    await db.exerciseOption.createMany({
      data: q.options.map((opt, idx) => ({
        exerciseId: exercise.id,
        isCorrect: idx === q.correctIndex,
        label: opt.label,
        order: idx + 1,
        signId: getSign(opt.signCode),
      })),
    });
  }

  const aiExercise = await db.exercise.create({
    data: {
      cvConfig: {
        create: {
          confidenceThreshold: ai.confidenceThreshold,
          detectionMode: "HAND_POSITION",
          holdTimeMs: 1500,
          targetSignId: getSign(ai.signCode),
        },
      },
      instruction: ai.instruction,
      isPublished: true,
      lessonId,
      levelId,
      maxScore: 50,
      order: quizzes.length + 1,
      passingScore: ai.passingScore,
      prompt: ai.prompt,
      signId: getSign(ai.signCode),
      type: "AI_PRACTICE",
    },
  });

  return aiExercise;
}

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
    // --- Level 1: Huruf ---
    {
      code: "A",
      description:
        "Kepalkan tangan dengan ibu jari berada tegak di samping jari telunjuk.",
      difficulty: 1,
      imageUrl: ASSETS.images.hurufA,
      meaning: "Huruf A",
      videoUrl: ASSETS.videos.hurufA,
      word: "Huruf 'A'",
    },
    {
      code: "B",
      description:
        "Rapatkan keempat jari tegak ke atas, ibu jari dilipat di depan telapak.",
      difficulty: 1,
      imageUrl: ASSETS.images.hurufB,
      meaning: "Huruf B",
      videoUrl: ASSETS.videos.hurufB,
      word: "Huruf 'B'",
    },
    {
      code: "C",
      description: "Lengkungkan jari dan ibu jari membentuk huruf C.",
      difficulty: 1,
      imageUrl: ASSETS.images.hurufA,
      meaning: "Huruf C",
      videoUrl: ASSETS.videos.hurufA,
      word: "Huruf 'C'",
    },
    {
      code: "D",
      description: "Telunjuk tegak, jari lain melengkung menyentuh ibu jari.",
      difficulty: 1,
      imageUrl: ASSETS.images.hurufB,
      meaning: "Huruf D",
      videoUrl: ASSETS.videos.hurufB,
      word: "Huruf 'D'",
    },

    // --- Level 2: Angka ---
    {
      code: "1",
      description: "Acungkan jari telunjuk ke atas.",
      difficulty: 1,
      imageUrl: ASSETS.images.angka1,
      meaning: "Angka 1",
      videoUrl: ASSETS.videos.angka1,
      word: "SATU",
    },
    {
      code: "2",
      description: "Acungkan jari telunjuk dan jari tengah.",
      difficulty: 1,
      imageUrl: ASSETS.images.angka2,
      meaning: "Angka 2",
      videoUrl: ASSETS.videos.angka2,
      word: "DUA",
    },
    {
      code: "3",
      description: "Acungkan telunjuk, jari tengah, dan jari manis.",
      difficulty: 1,
      imageUrl: ASSETS.images.angka1,
      meaning: "Angka 3",
      videoUrl: ASSETS.videos.angka1,
      word: "TIGA",
    },
    {
      code: "4",
      description: "Acungkan empat jari, ibu jari dilipat.",
      difficulty: 2,
      imageUrl: ASSETS.images.angka2,
      meaning: "Angka 4",
      videoUrl: ASSETS.videos.angka2,
      word: "EMPAT",
    },

    // --- Level 3: Percakapan ---
    {
      code: "HARI",
      description:
        "Gerakan tangan membentuk lengkungan dari kiri ke kanan seperti lintasan matahari.",
      difficulty: 2,
      imageUrl: ASSETS.images.hari,
      meaning: "Hari",
      videoUrl: ASSETS.videos.hari,
      word: "HARI",
    },
    {
      code: "HALO",
      description:
        "Buka telapak tangan Anda setinggi dada lalu lambaikan perlahan ke samping.",
      difficulty: 1,
      imageUrl: ASSETS.images.hurufA,
      meaning: "Salam sapaan ramah",
      videoUrl: ASSETS.videos.hurufA,
      word: "HALO",
    },
    {
      code: "TERIMA_KASIH",
      description:
        "Sentuhkan ujung jari tangan kanan ke bibir/dagu, lalu gerakkan tangan ke depan secara terbuka.",
      difficulty: 1,
      imageUrl: ASSETS.images.hurufB,
      meaning: "Ungkapan terima kasih",
      videoUrl: ASSETS.videos.hurufB,
      word: "TERIMA KASIH",
    },
    {
      code: "MAAF",
      description:
        "Kepalan tangan memutar melingkar searah jarum jam di depan dada.",
      difficulty: 1,
      imageUrl: ASSETS.images.angka1,
      meaning: "Permohonan maaf",
      videoUrl: ASSETS.videos.angka1,
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
        word: signItem.word,
      },
      update: {
        description: signItem.description,
        difficulty: signItem.difficulty,
        meaning: signItem.meaning,
        word: signItem.word,
      },
      where: { code: signItem.code },
    });

    // Hapus dan perbarui SignMedia agar selalu sinkron dengan URL lokal /assets/*
    await db.signMedia.deleteMany({ where: { signId: sign.id } });

    await db.signMedia.create({
      data: {
        duration: 3,
        signId: sign.id,
        thumbnail: signItem.imageUrl,
        type: "IMAGE",
        url: signItem.imageUrl,
      },
    });

    if (signItem.videoUrl) {
      await db.signMedia.create({
        data: {
          duration: 5,
          signId: sign.id,
          thumbnail: signItem.imageUrl,
          type: "VIDEO",
          url: signItem.videoUrl,
        },
      });
    }

    signMap.set(signItem.code, sign.id);
    signMap.set(signItem.code.toUpperCase(), sign.id);
    signMap.set(signItem.code.toLowerCase(), sign.id);
    if (signItem.code === "1") signMap.set("ANGKA_1", sign.id);
    if (signItem.code === "2") signMap.set("ANGKA_2", sign.id);
    if (signItem.code === "3") signMap.set("ANGKA_3", sign.id);
    if (signItem.code === "4") signMap.set("ANGKA_4", sign.id);
    if (signItem.code === "TERIMA_KASIH") {
      signMap.set("terima kasih", sign.id);
      signMap.set("terima_kasih", sign.id);
    }
  }

  const getSign = (code: string) => {
    const val =
      signMap.get(code) ??
      signMap.get(code.toUpperCase()) ??
      signMap.get(code.toLowerCase()) ??
      signMap.get(code.replace("ANGKA_", "")) ??
      signMap.get(code.replace(/_/g, " ").toLowerCase());
    if (!val) throw new Error(`Missing sign ${code}`);
    return val;
  };

  // 5. Create Lessons
  const lesson1 = await db.lesson.upsert({
    create: {
      categoryId: getCategory("abjad"),
      description:
        "Materi belajar huruf isyarat dasar BISINDO A-Z secara visual dan interaktif.",
      isPublished: true,
      levelId: getLevel(1),
      order: 1,
      slug: "modul-abjad-a-z",
      title: "Modul Abjad BISINDO A-Z",
    },
    update: {
      description:
        "Materi belajar huruf isyarat dasar BISINDO A-Z secara visual dan interaktif.",
      title: "Modul Abjad BISINDO A-Z",
    },
    where: { slug: "modul-abjad-a-z" },
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

  const lessonSapaan = await db.lesson.upsert({
    create: {
      categoryId: getCategory("kata-hari"),
      description: "Belajar kosakata hari dan percakapan sehari-hari.",
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

  // ============================================================
  // 6. LEVEL 1: Materi (huruf A, huruf B, video huruf A) + Soal
  //    Soal: kuis huruf A, kuis huruf B, kuis video huruf A, computer vision A
  // ============================================================
  const aiExerciseLevel1 = await seedLessonContent({
    ai: {
      confidenceThreshold: 0.85,
      instruction:
        "Kepalkan tangan dengan ibu jari tegak di samping telunjuk, lalu tahan di depan kamera.",
      passingScore: 85,
      prompt: 'Coba peragakan huruf "A" di depan kamera!',
      signCode: "A",
    },
    getSign,
    lessonId: lesson1.id,
    levelId: getLevel(1),
    materials: [
      {
        content: "Flashcard interaktif huruf 'A' sesuai standar BISINDO.",
        mediaUrl: ASSETS.images.hurufA,
        signCode: "A",
        title: "Huruf A",
        type: "SIGN",
      },
      {
        content: "Flashcard interaktif huruf 'B' sesuai standar BISINDO.",
        mediaUrl: ASSETS.images.hurufB,
        signCode: "B",
        title: "Huruf B",
        type: "SIGN",
      },
      {
        content: "Video peraga isyarat huruf 'A' dengan opsi perlambat 0.5x.",
        mediaUrl: ASSETS.videos.hurufA,
        signCode: "A",
        title: "Video Huruf A",
        type: "VIDEO",
      },
    ],
    quizzes: [
      {
        correctIndex: 0,
        instruction: "Pilih huruf yang sesuai dengan isyarat pada gambar.",
        mediaUrl: ASSETS.images.hurufA,
        options: [
          { label: "A. Huruf A", signCode: "A" },
          { label: "B. Huruf B", signCode: "B" },
          { label: "C. Huruf C", signCode: "C" },
          { label: "D. Huruf D", signCode: "D" },
        ],
        prompt: "Huruf apakah isyarat berikut ini?",
        signCode: "A",
      },
      {
        correctIndex: 1,
        instruction: "Pilih huruf yang sesuai dengan isyarat pada gambar.",
        mediaUrl: ASSETS.images.hurufB,
        options: [
          { label: "A. Huruf A", signCode: "A" },
          { label: "B. Huruf B", signCode: "B" },
          { label: "C. Huruf C", signCode: "C" },
          { label: "D. Huruf D", signCode: "D" },
        ],
        prompt: "Huruf apakah isyarat berikut ini?",
        signCode: "B",
      },
      {
        correctIndex: 2,
        instruction: "Tonton video peraga lalu pilih huruf yang diperagakan.",
        mediaUrl: ASSETS.videos.hurufA,
        options: [
          { label: "A. Huruf B", signCode: "B" },
          { label: "B. Huruf C", signCode: "C" },
          { label: "C. Huruf A", signCode: "A" },
          { label: "D. Huruf D", signCode: "D" },
        ],
        prompt: "Huruf apakah yang diperagakan dalam video?",
        signCode: "A",
      },
    ],
  });

  // ============================================================
  // 7. LEVEL 2: Materi (angka 1, angka 2, video angka 1) + Soal
  //    Soal: kuis angka 1, kuis angka 2, kuis video angka 1, computer vision 1
  // ============================================================
  await seedLessonContent({
    ai: {
      confidenceThreshold: 0.8,
      instruction: "Acungkan jari telunjuk ke atas dan tahan di depan kamera.",
      passingScore: 80,
      prompt: 'Peragakan angka "1" (SATU) di depan kamera!',
      signCode: "ANGKA_1",
    },
    getSign,
    lessonId: lessonAngka.id,
    levelId: getLevel(2),
    materials: [
      {
        content: "Flashcard interaktif angka 1 sesuai standar BISINDO.",
        mediaUrl: ASSETS.images.angka1,
        signCode: "ANGKA_1",
        title: "Angka 1",
        type: "SIGN",
      },
      {
        content: "Flashcard interaktif angka 2 sesuai standar BISINDO.",
        mediaUrl: ASSETS.images.angka2,
        signCode: "ANGKA_2",
        title: "Angka 2",
        type: "SIGN",
      },
      {
        content: "Video peraga isyarat angka 1 dengan opsi perlambat 0.5x.",
        mediaUrl: ASSETS.videos.angka1,
        signCode: "ANGKA_1",
        title: "Video Angka 1",
        type: "VIDEO",
      },
    ],
    quizzes: [
      {
        correctIndex: 0,
        instruction: "Lihat gestur jari lalu pilih angka yang sesuai.",
        mediaUrl: ASSETS.images.angka1,
        options: [
          { label: "A. Satu (1)", signCode: "ANGKA_1" },
          { label: "B. Dua (2)", signCode: "ANGKA_2" },
          { label: "C. Tiga (3)", signCode: "ANGKA_3" },
          { label: "D. Empat (4)", signCode: "ANGKA_4" },
        ],
        prompt: "Angka berapakah isyarat berikut ini?",
        signCode: "ANGKA_1",
      },
      {
        correctIndex: 1,
        instruction: "Lihat gestur jari lalu pilih angka yang sesuai.",
        mediaUrl: ASSETS.images.angka2,
        options: [
          { label: "A. Satu (1)", signCode: "ANGKA_1" },
          { label: "B. Dua (2)", signCode: "ANGKA_2" },
          { label: "C. Tiga (3)", signCode: "ANGKA_3" },
          { label: "D. Empat (4)", signCode: "ANGKA_4" },
        ],
        prompt: "Angka berapakah isyarat berikut ini?",
        signCode: "ANGKA_2",
      },
      {
        correctIndex: 3,
        instruction: "Tonton video peraga lalu pilih angka yang diperagakan.",
        mediaUrl: ASSETS.videos.angka1,
        options: [
          { label: "A. Dua (2)", signCode: "ANGKA_2" },
          { label: "B. Tiga (3)", signCode: "ANGKA_3" },
          { label: "C. Empat (4)", signCode: "ANGKA_4" },
          { label: "D. Satu (1)", signCode: "ANGKA_1" },
        ],
        prompt: "Angka berapakah yang diperagakan dalam video?",
        signCode: "ANGKA_1",
      },
    ],
  });

  // ============================================================
  // 8. LEVEL 3: Materi (video hari) + Soal
  //    Soal: kuis video hari, computer vision hari
  // ============================================================
  await seedLessonContent({
    ai: {
      confidenceThreshold: 0.85,
      instruction:
        "Gerakkan tangan membentuk lengkungan dari kiri ke kanan, lalu tahan di depan kamera.",
      passingScore: 85,
      prompt: 'Peragakan kata "HARI" di depan kamera!',
      signCode: "HARI",
    },
    getSign,
    lessonId: lessonSapaan.id,
    levelId: getLevel(3),
    materials: [
      {
        content: "Video peraga isyarat kata HARI dengan opsi perlambat 0.5x.",
        mediaUrl: ASSETS.videos.hari,
        signCode: "HARI",
        title: "Video Hari",
        type: "VIDEO",
      },
    ],
    quizzes: [
      {
        correctIndex: 2,
        instruction:
          "Tonton video peraga lalu pilih arti isyarat yang paling tepat.",
        mediaUrl: ASSETS.videos.hari,
        options: [
          { label: "A. Halo", signCode: "HALO" },
          { label: "B. Terima Kasih", signCode: "TERIMA_KASIH" },
          { label: "C. Hari", signCode: "HARI" },
          { label: "D. Maaf", signCode: "MAAF" },
        ],
        prompt: "Apa arti isyarat yang diperagakan dalam video?",
        signCode: "HARI",
      },
    ],
  });

  // ============================================================
  // 9. Create Demo User
  // ============================================================
  const demoUserId = "user_demo_bisara";
  const demoUser = await db.user.upsert({
    create: {
      bio: "Belajar BISINDO untuk komunikasi tanpa batas.",
      city: "Yogyakarta",
      email: "you@bisara.app",
      emailVerified: true,
      id: demoUserId,
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
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

  // Unlocked Achievements (Master Abjad, Api Konsisten, Teman Inklusif)
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

  // User Progress Level 1 (2 dari 4 soal = 50%)
  await db.userProgress.upsert({
    create: {
      completedExercises: 2,
      completedMaterials: 3,
      lastActivityAt: new Date(Date.now() - 86400000),
      lessonId: lesson1.id,
      levelId: getLevel(1),
      progressPercent: 50,
      score: 100,
      totalExercises: 4,
      userId: demoUser.id,
    },
    update: {
      completedExercises: 2,
      completedMaterials: 3,
      progressPercent: 50,
      score: 100,
      totalExercises: 4,
    },
    where: {
      userId_levelId_lessonId: {
        lessonId: lesson1.id,
        levelId: getLevel(1),
        userId: demoUser.id,
      },
    },
  });

  // User Progress Level 2 (1 dari 4 soal = 25%)
  await db.userProgress.upsert({
    create: {
      completedExercises: 1,
      completedMaterials: 1,
      lastActivityAt: new Date(Date.now() - 2 * 86400000),
      lessonId: lessonAngka.id,
      levelId: getLevel(2),
      progressPercent: 25,
      score: 50,
      totalExercises: 4,
      userId: demoUser.id,
    },
    update: {
      completedExercises: 1,
      completedMaterials: 1,
      progressPercent: 25,
      score: 50,
      totalExercises: 4,
    },
    where: {
      userId_levelId_lessonId: {
        lessonId: lessonAngka.id,
        levelId: getLevel(2),
        userId: demoUser.id,
      },
    },
  });

  // Recent Exercise Attempt (latihan kamera AI Level 1 - huruf A)
  await db.exerciseAttempt.create({
    data: {
      accuracy: 0.98,
      completedAt: new Date(),
      detectedSignId: getSign("A"),
      durationMs: 4200,
      exerciseId: aiExerciseLevel1.id,
      feedback: "Posisi tangan tepat & bentuk huruf A stabil.",
      score: 50,
      status: "COMPLETED",
      userId: demoUser.id,
    },
  });

  console.log(
    "✅ Bisara database successfully seeded with materials & exercises!",
  );
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
