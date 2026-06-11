"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const G = "#39613B";
const GOLD = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK = "#1B201A";
const MID = "#4E504F";

const PHASE_COLORS = {
  1: { bg: "#E8F5E0", color: "#39613B", border: "#39613B", label: "🌱 PHASE 1", sub: "FOUNDATION", days: "Day 1–30" },
  2: { bg: "#E6F1FB", color: "#185FA5", border: "#185FA5", label: "💪 PHASE 2", sub: "PROGRESSION", days: "Day 31–60" },
  3: { bg: "#FEF0E0", color: "#C0863B", border: "#C0863B", label: "🏆 PHASE 3", sub: "TRANSFORMATION", days: "Day 61–90" },
};

type DayEntry = {
  easebrew: boolean; avocado: boolean; exercise: boolean;
  tubig: number; painScore: number; energyScore: number; notes: string;
};
const emptyDay = (): DayEntry => ({ easebrew: false, avocado: false, exercise: false, tubig: 0, painScore: 0, energyScore: 0, notes: "" });

const PLAN = [
  { day: 1, phase: 1, week: "Wk1", agahan: "Easebrew ☕ + Oatmeal + Saging", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Brisk Walk 15 min + Stretching 10 min", focus: "Consistency — Gawi pa lang ito" },
  { day: 2, phase: 1, week: "Wk1", agahan: "Easebrew ☕ + Itlog + Kamatis", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Seated Leg Raises 3x10 + Wall Sit 30s", focus: "Hydration — 8 glasses goal" },
  { day: 3, phase: 1, week: "Wk1", agahan: "Easebrew ☕ + Pandesal + PB", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Light Stretching 10 min", focus: "Pain Awareness — Observe mo" },
  { day: 4, phase: 1, week: "Wk1", agahan: "Easebrew ☕ + Lugaw + Boiled Egg", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Chair Squats 3x10 + Arm Circles 2x20", focus: "Sleep Quality — Tulog ng 7-8 hrs" },
  { day: 5, phase: 1, week: "Wk1", agahan: "Easebrew ☕ + Champorado", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Brisk Walk 20 min", focus: "Nutrition Focus — Anti-inflammation" },
  { day: 6, phase: 1, week: "Wk1", agahan: "Easebrew ☕ + Scrambled Egg + Kangkong", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Heel Raises 3x15 + Shoulder Rolls", focus: "Mindset — Positive lang" },
  { day: 7, phase: 1, week: "Wk1", agahan: "Easebrew ☕ + Arroz Caldo", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga Breathing 15 min", focus: "Rest & Recovery — Mahalaga ito" },
  { day: 8, phase: 1, week: "Wk2", agahan: "Easebrew ☕ + Oatmeal + Saging", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Brisk Walk 15 min + Stretching 10 min", focus: "Building Momentum" },
  { day: 9, phase: 1, week: "Wk2", agahan: "Easebrew ☕ + Itlog + Kamatis", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Seated Leg Raises 3x10 + Wall Sit 30s", focus: "Noticing Progress" },
  { day: 10, phase: 1, week: "Wk2", agahan: "Easebrew ☕ + Pandesal + PB", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Light Stretching 10 min", focus: "Habit Stacking — Layer ang habits" },
  { day: 11, phase: 1, week: "Wk2", agahan: "Easebrew ☕ + Lugaw + Boiled Egg", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Chair Squats 3x10 + Arm Circles 2x20", focus: "Energy Management" },
  { day: 12, phase: 1, week: "Wk2", agahan: "Easebrew ☕ + Champorado", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Brisk Walk 20 min", focus: "Joint Protection" },
  { day: 13, phase: 1, week: "Wk2", agahan: "Easebrew ☕ + Scrambled Egg + Kangkong", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Heel Raises 3x15 + Shoulder Rolls", focus: "Breathing & Relaxation" },
  { day: 14, phase: 1, week: "Wk2", agahan: "Easebrew ☕ + Arroz Caldo", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga Breathing 15 min", focus: "Gut Health — Sapat na gulay" },
  { day: 15, phase: 1, week: "Wk3", agahan: "Easebrew ☕ + Oatmeal + Saging", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Brisk Walk 15 min + Stretching 10 min", focus: "Stress Reduction" },
  { day: 16, phase: 1, week: "Wk3", agahan: "Easebrew ☕ + Itlog + Kamatis", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Seated Leg Raises 3x10 + Wall Sit 30s", focus: "Strength Building" },
  { day: 17, phase: 1, week: "Wk3", agahan: "Easebrew ☕ + Pandesal + PB", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Light Stretching 10 min", focus: "Endurance Improvement" },
  { day: 18, phase: 1, week: "Wk3", agahan: "Easebrew ☕ + Lugaw + Boiled Egg", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Chair Squats 3x10 + Arm Circles 2x20", focus: "Balance & Coordination" },
  { day: 19, phase: 1, week: "Wk3", agahan: "Easebrew ☕ + Champorado", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Brisk Walk 20 min", focus: "Pain Management Mastery" },
  { day: 20, phase: 1, week: "Wk3", agahan: "Easebrew ☕ + Scrambled Egg + Kangkong", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Heel Raises 3x15 + Shoulder Rolls", focus: "Full Lifestyle Integration" },
  { day: 21, phase: 1, week: "Wk3", agahan: "Easebrew ☕ + Arroz Caldo", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga Breathing 15 min", focus: "Consistency — Gawi pa lang ito" },
  { day: 22, phase: 1, week: "Wk4", agahan: "Easebrew ☕ + Oatmeal + Saging", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Brisk Walk 15 min + Stretching 10 min", focus: "Hydration — 8 glasses goal" },
  { day: 23, phase: 1, week: "Wk4", agahan: "Easebrew ☕ + Itlog + Kamatis", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Seated Leg Raises 3x10 + Wall Sit 30s", focus: "Pain Awareness — Observe mo" },
  { day: 24, phase: 1, week: "Wk4", agahan: "Easebrew ☕ + Pandesal + PB", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Light Stretching 10 min", focus: "Sleep Quality — Tulog ng 7-8 hrs" },
  { day: 25, phase: 1, week: "Wk4", agahan: "Easebrew ☕ + Lugaw + Boiled Egg", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Chair Squats 3x10 + Arm Circles 2x20", focus: "Nutrition Focus — Anti-inflammation" },
  { day: 26, phase: 1, week: "Wk4", agahan: "Easebrew ☕ + Champorado", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Brisk Walk 20 min", focus: "Mindset — Positive lang" },
  { day: 27, phase: 1, week: "Wk4", agahan: "Easebrew ☕ + Scrambled Egg + Kangkong", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Heel Raises 3x15 + Shoulder Rolls", focus: "Rest & Recovery — Mahalaga ito" },
  { day: 28, phase: 1, week: "Wk4", agahan: "Easebrew ☕ + Arroz Caldo", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga Breathing 15 min", focus: "Building Momentum" },
  { day: 29, phase: 1, week: "Wk5", agahan: "Easebrew ☕ + Oatmeal + Saging", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Brisk Walk 15 min + Stretching 10 min", focus: "Noticing Progress" },
  { day: 30, phase: 1, week: "Wk5", agahan: "Easebrew ☕ + Itlog + Kamatis", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Seated Leg Raises 3x10 + Wall Sit 30s", focus: "Habit Stacking — Layer ang habits" },
  { day: 31, phase: 2, week: "Wk1", agahan: "Easebrew ☕ + Quinoa Bowl + Egg", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Brisk Walk 30 min + Core Exercises 15 min", focus: "Energy Management" },
  { day: 32, phase: 2, week: "Wk1", agahan: "Easebrew ☕ + Oatmeal + Mixed Fruits", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Bodyweight Squats 3x15 + Push-up Wall 3x10", focus: "Joint Protection" },
  { day: 33, phase: 2, week: "Wk1", agahan: "Easebrew ☕ + Pandesal + Kesong Puti", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Stretching 15 min", focus: "Breathing & Relaxation" },
  { day: 34, phase: 2, week: "Wk1", agahan: "Easebrew ☕ + Brown Rice + Itlog", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Lunges 3x10 + Plank 30s + Walk 20 min", focus: "Gut Health — Sapat na gulay" },
  { day: 35, phase: 2, week: "Wk1", agahan: "Easebrew ☕ + Avocado Toast", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Brisk Walk 40 min + Arm Exercises", focus: "Stress Reduction" },
  { day: 36, phase: 2, week: "Wk1", agahan: "Easebrew ☕ + Lugaw + Chicken", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Step-ups (Chair) 3x12 + Calf Raises 3x20", focus: "Strength Building" },
  { day: 37, phase: 2, week: "Wk1", agahan: "Easebrew ☕ + Champorado Dark Choco", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga 20 min", focus: "Endurance Improvement" },
  { day: 38, phase: 2, week: "Wk2", agahan: "Easebrew ☕ + Quinoa Bowl + Egg", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Brisk Walk 30 min + Core Exercises 15 min", focus: "Balance & Coordination" },
  { day: 39, phase: 2, week: "Wk2", agahan: "Easebrew ☕ + Oatmeal + Mixed Fruits", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Bodyweight Squats 3x15 + Push-up Wall 3x10", focus: "Pain Management Mastery" },
  { day: 40, phase: 2, week: "Wk2", agahan: "Easebrew ☕ + Pandesal + Kesong Puti", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Stretching 15 min", focus: "Full Lifestyle Integration" },
  { day: 41, phase: 2, week: "Wk2", agahan: "Easebrew ☕ + Brown Rice + Itlog", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Lunges 3x10 + Plank 30s + Walk 20 min", focus: "Consistency" },
  { day: 42, phase: 2, week: "Wk2", agahan: "Easebrew ☕ + Avocado Toast", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Brisk Walk 40 min + Arm Exercises", focus: "Hydration — 8 glasses goal" },
  { day: 43, phase: 2, week: "Wk2", agahan: "Easebrew ☕ + Lugaw + Chicken", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Step-ups (Chair) 3x12 + Calf Raises 3x20", focus: "Pain Awareness" },
  { day: 44, phase: 2, week: "Wk2", agahan: "Easebrew ☕ + Champorado Dark Choco", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga 20 min", focus: "Sleep Quality — Tulog ng 7-8 hrs" },
  { day: 45, phase: 2, week: "Wk3", agahan: "Easebrew ☕ + Quinoa Bowl + Egg", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Brisk Walk 30 min + Core Exercises 15 min", focus: "Nutrition Focus — Anti-inflammation" },
  { day: 46, phase: 2, week: "Wk3", agahan: "Easebrew ☕ + Oatmeal + Mixed Fruits", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Bodyweight Squats 3x15 + Push-up Wall 3x10", focus: "Mindset — Positive lang" },
  { day: 47, phase: 2, week: "Wk3", agahan: "Easebrew ☕ + Pandesal + Kesong Puti", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Stretching 15 min", focus: "Rest & Recovery" },
  { day: 48, phase: 2, week: "Wk3", agahan: "Easebrew ☕ + Brown Rice + Itlog", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Lunges 3x10 + Plank 30s + Walk 20 min", focus: "Building Momentum" },
  { day: 49, phase: 2, week: "Wk3", agahan: "Easebrew ☕ + Avocado Toast", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Brisk Walk 40 min + Arm Exercises", focus: "Noticing Progress" },
  { day: 50, phase: 2, week: "Wk3", agahan: "Easebrew ☕ + Lugaw + Chicken", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Step-ups (Chair) 3x12 + Calf Raises 3x20", focus: "Habit Stacking" },
  { day: 51, phase: 2, week: "Wk3", agahan: "Easebrew ☕ + Champorado Dark Choco", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga 20 min", focus: "Energy Management" },
  { day: 52, phase: 2, week: "Wk4", agahan: "Easebrew ☕ + Quinoa Bowl + Egg", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Brisk Walk 30 min + Core Exercises 15 min", focus: "Joint Protection" },
  { day: 53, phase: 2, week: "Wk4", agahan: "Easebrew ☕ + Oatmeal + Mixed Fruits", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Bodyweight Squats 3x15 + Push-up Wall 3x10", focus: "Breathing & Relaxation" },
  { day: 54, phase: 2, week: "Wk4", agahan: "Easebrew ☕ + Pandesal + Kesong Puti", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Stretching 15 min", focus: "Gut Health" },
  { day: 55, phase: 2, week: "Wk4", agahan: "Easebrew ☕ + Brown Rice + Itlog", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Lunges 3x10 + Plank 30s + Walk 20 min", focus: "Stress Reduction" },
  { day: 56, phase: 2, week: "Wk4", agahan: "Easebrew ☕ + Avocado Toast", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Brisk Walk 40 min + Arm Exercises", focus: "Strength Building" },
  { day: 57, phase: 2, week: "Wk4", agahan: "Easebrew ☕ + Lugaw + Chicken", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Step-ups (Chair) 3x12 + Calf Raises 3x20", focus: "Endurance Improvement" },
  { day: 58, phase: 2, week: "Wk4", agahan: "Easebrew ☕ + Champorado Dark Choco", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga 20 min", focus: "Balance & Coordination" },
  { day: 59, phase: 2, week: "Wk5", agahan: "Easebrew ☕ + Quinoa Bowl + Egg", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Brisk Walk 30 min + Core Exercises 15 min", focus: "Pain Management Mastery" },
  { day: 60, phase: 2, week: "Wk5", agahan: "Easebrew ☕ + Oatmeal + Mixed Fruits", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Bodyweight Squats 3x15 + Push-up Wall 3x10", focus: "Full Lifestyle Integration" },
  { day: 61, phase: 3, week: "Wk1", agahan: "Easebrew ☕ + Quinoa Bowl + Egg", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Walk/Jog Interval 30 min + Core 20 min", focus: "Consistency" },
  { day: 62, phase: 3, week: "Wk1", agahan: "Easebrew ☕ + Oatmeal + Mixed Fruits", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Compound Exercises 40 min (Squat+Lunge+Press)", focus: "Hydration" },
  { day: 63, phase: 3, week: "Wk1", agahan: "Easebrew ☕ + Pandesal + Kesong Puti", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Active Recovery Walk 20 min", focus: "Pain Awareness" },
  { day: 64, phase: 3, week: "Wk1", agahan: "Easebrew ☕ + Brown Rice + Itlog", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Full Body Circuit 45 min", focus: "Sleep Quality" },
  { day: 65, phase: 3, week: "Wk1", agahan: "Easebrew ☕ + Avocado Toast", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Walk/Jog 45 min + Balance Exercises", focus: "Nutrition Focus" },
  { day: 66, phase: 3, week: "Wk1", agahan: "Easebrew ☕ + Lugaw + Chicken", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Strength + Flexibility 40 min", focus: "Mindset — Positive lang" },
  { day: 67, phase: 3, week: "Wk1", agahan: "Easebrew ☕ + Champorado Dark Choco", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga + Meditation 25 min", focus: "Rest & Recovery" },
  { day: 68, phase: 3, week: "Wk2", agahan: "Easebrew ☕ + Quinoa Bowl + Egg", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Walk/Jog Interval 30 min + Core 20 min", focus: "Building Momentum" },
  { day: 69, phase: 3, week: "Wk2", agahan: "Easebrew ☕ + Oatmeal + Mixed Fruits", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Compound Exercises 40 min", focus: "Noticing Progress" },
  { day: 70, phase: 3, week: "Wk2", agahan: "Easebrew ☕ + Pandesal + Kesong Puti", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Active Recovery Walk 20 min", focus: "Habit Stacking" },
  { day: 71, phase: 3, week: "Wk2", agahan: "Easebrew ☕ + Brown Rice + Itlog", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Full Body Circuit 45 min", focus: "Energy Management" },
  { day: 72, phase: 3, week: "Wk2", agahan: "Easebrew ☕ + Avocado Toast", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Walk/Jog 45 min + Balance Exercises", focus: "Joint Protection" },
  { day: 73, phase: 3, week: "Wk2", agahan: "Easebrew ☕ + Lugaw + Chicken", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Strength + Flexibility 40 min", focus: "Breathing & Relaxation" },
  { day: 74, phase: 3, week: "Wk2", agahan: "Easebrew ☕ + Champorado Dark Choco", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga + Meditation 25 min", focus: "Gut Health" },
  { day: 75, phase: 3, week: "Wk3", agahan: "Easebrew ☕ + Quinoa Bowl + Egg", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Walk/Jog Interval 30 min + Core 20 min", focus: "Stress Reduction" },
  { day: 76, phase: 3, week: "Wk3", agahan: "Easebrew ☕ + Oatmeal + Mixed Fruits", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Compound Exercises 40 min", focus: "Strength Building" },
  { day: 77, phase: 3, week: "Wk3", agahan: "Easebrew ☕ + Pandesal + Kesong Puti", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Active Recovery Walk 20 min", focus: "Endurance Improvement" },
  { day: 78, phase: 3, week: "Wk3", agahan: "Easebrew ☕ + Brown Rice + Itlog", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Full Body Circuit 45 min", focus: "Balance & Coordination" },
  { day: 79, phase: 3, week: "Wk3", agahan: "Easebrew ☕ + Avocado Toast", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Walk/Jog 45 min + Balance Exercises", focus: "Pain Management Mastery" },
  { day: 80, phase: 3, week: "Wk3", agahan: "Easebrew ☕ + Lugaw + Chicken", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Strength + Flexibility 40 min", focus: "Full Lifestyle Integration" },
  { day: 81, phase: 3, week: "Wk3", agahan: "Easebrew ☕ + Champorado Dark Choco", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga + Meditation 25 min", focus: "Consistency" },
  { day: 82, phase: 3, week: "Wk4", agahan: "Easebrew ☕ + Quinoa Bowl + Egg", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Walk/Jog Interval 30 min + Core 20 min", focus: "Hydration" },
  { day: 83, phase: 3, week: "Wk4", agahan: "Easebrew ☕ + Oatmeal + Mixed Fruits", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Compound Exercises 40 min", focus: "Pain Awareness" },
  { day: 84, phase: 3, week: "Wk4", agahan: "Easebrew ☕ + Pandesal + Kesong Puti", tanghalian: "Tinolang Manok + B.Rice", merienda: "Peanuts + Mansanas", hapunan: "Chicken Soup + B.Rice", exercise: "REST DAY — Active Recovery Walk 20 min", focus: "Sleep Quality" },
  { day: 85, phase: 3, week: "Wk4", agahan: "Easebrew ☕ + Brown Rice + Itlog", tanghalian: "Nilagang Baka (lean) + B.Rice", merienda: "Papaya Slices", hapunan: "Ginataang Gulay + B.Rice", exercise: "Full Body Circuit 45 min", focus: "Nutrition Focus" },
  { day: 86, phase: 3, week: "Wk4", agahan: "Easebrew ☕ + Avocado Toast", tanghalian: "Paksiw na Bangus + B.Rice", merienda: "Mais + Tsaa", hapunan: "Nilaga + Labanos", exercise: "Walk/Jog 45 min + Balance Exercises", focus: "Mindset — Positive lang" },
  { day: 87, phase: 3, week: "Wk4", agahan: "Easebrew ☕ + Lugaw + Chicken", tanghalian: "Ginisang Ampalaya + Egg + B.Rice", merienda: "Boiled Saging na Saba", hapunan: "Steamed Fish + Ampalaya", exercise: "Strength + Flexibility 40 min", focus: "Rest & Recovery" },
  { day: 88, phase: 3, week: "Wk4", agahan: "Easebrew ☕ + Champorado Dark Choco", tanghalian: "Pinakbet + Grilled Isda", merienda: "Cucumber + Kalamansi Water", hapunan: "Monggo + B.Rice", exercise: "REST DAY — Yoga + Meditation 25 min", focus: "Building Momentum" },
  { day: 89, phase: 3, week: "Wk5", agahan: "Easebrew ☕ + Quinoa Bowl + Egg", tanghalian: "Sinigang Salmon + Brown Rice", merienda: "Buko Juice + Banana", hapunan: "Tinola + Sayote + B.Rice", exercise: "Walk/Jog Interval 30 min + Core 20 min", focus: "Noticing Progress" },
  { day: 90, phase: 3, week: "Wk5", agahan: "Easebrew ☕ + Oatmeal + Mixed Fruits", tanghalian: "Monggo + Malunggay + B.Rice", merienda: "Kamote + Ginger Tea", hapunan: "Pesang Isda + B.Rice", exercise: "Compound Exercises 40 min — FINAL DAY! 🏆", focus: "🎉 90 DAYS COMPLETE — BAGONG KATAWAN NA!" },
];

const TABS = ["📅 90-Day Plan", "📊 Progress", "🌿 Gabay"];

export default function BagongKatawanPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verified = sessionStorage.getItem("easebrew-verified");
    if (!verified) { router.replace("/verify"); } else { setChecking(false); }
  }, [router]);

  const [activeTab, setActiveTab] = useState(0);
  const [activePhase, setActivePhase] = useState(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [trackData, setTrackData] = useState<Record<number, DayEntry>>({});
  const [measurements, setMeasurements] = useState({
    timbang1: "", timbang30: "", timbang60: "", timbang90: "",
    waist1: "", waist30: "", waist60: "", waist90: "",
    pain1: "", pain30: "", pain60: "", pain90: "",
  });

  useEffect(() => {
    if (checking) return;
    try {
      const saved = localStorage.getItem("easebrew-90days");
      const savedTrack = localStorage.getItem("easebrew-90days-track");
      const savedMeas = localStorage.getItem("easebrew-90days-meas");
      if (saved) setCompletedDays(JSON.parse(saved));
      if (savedTrack) setTrackData(JSON.parse(savedTrack));
      if (savedMeas) setMeasurements(JSON.parse(savedMeas));
    } catch {}
  }, [checking]);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, margin: "0 0 12px 0" }}>🏆</p>
        <p style={{ fontSize: 20, color: G, fontWeight: 700 }}>Loading Bagong Katawan...</p>
      </div>
    </div>
  );

  const toggleComplete = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = completedDays.includes(day) ? completedDays.filter(d => d !== day) : [...completedDays, day];
    setCompletedDays(updated);
    localStorage.setItem("easebrew-90days", JSON.stringify(updated));
  };

  const saveTrack = (day: number, data: DayEntry) => {
    const updated = { ...trackData, [day]: data };
    setTrackData(updated);
    localStorage.setItem("easebrew-90days-track", JSON.stringify(updated));
  };

  const saveMeasurements = (updated: typeof measurements) => {
    setMeasurements(updated);
    localStorage.setItem("easebrew-90days-meas", JSON.stringify(updated));
  };

  const filteredDays = PLAN.filter(d => d.phase === activePhase);
  const progress = Math.round((completedDays.length / 90) * 100);
  const phase1Done = PLAN.filter(d => d.phase === 1 && completedDays.includes(d.day)).length;
  const phase2Done = PLAN.filter(d => d.phase === 2 && completedDays.includes(d.day)).length;
  const phase3Done = PLAN.filter(d => d.phase === 3 && completedDays.includes(d.day)).length;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 110 }}>

      {/* ── HEADER ── */}
      <div style={{ background: G, padding: "36px 24px 28px", color: "#fff" }}>
        <Link href="/" style={{ color: GOLD, fontSize: 16, fontWeight: 600, textDecoration: "none", display: "block", marginBottom: 16 }}>
          ← Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px 0", lineHeight: 1.3 }}>
              🏆 Bagong Katawan sa 90 Days
            </h1>
            <p style={{ fontSize: 16, opacity: 0.85, margin: 0 }}>Complete Wellness Program • 3 Phases</p>
          </div>
          <div style={{
            textAlign: "center", background: "rgba(255,255,255,0.15)",
            borderRadius: 16, padding: "14px 18px", flexShrink: 0,
          }}>
            <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: GOLD }}>{completedDays.length}</p>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.85 }}>/ 90 araw</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 15, margin: 0, opacity: 0.85, fontWeight: 600 }}>{progress}% kumpleto</p>
            <p style={{ fontSize: 15, margin: 0, color: GOLD, fontWeight: 700 }}>{90 - completedDays.length} araw pa!</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 999, height: 14 }}>
            <div style={{ width: `${progress}%`, background: GOLD, height: 14, borderRadius: 999, transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Phase Mini Progress */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {([1, 2, 3] as const).map(ph => {
            const done = ph === 1 ? phase1Done : ph === 2 ? phase2Done : phase3Done;
            const pct = Math.round((done / 30) * 100);
            const pc = PHASE_COLORS[ph];
            return (
              <div key={ph} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 12px" }}>
                <p style={{ fontSize: 12, margin: "0 0 4px 0", opacity: 0.85 }}>{pc.label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px 0", color: GOLD }}>{done}/30</p>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 999, height: 6 }}>
                  <div style={{ width: `${pct}%`, background: GOLD, height: 6, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: "flex", background: "#fff", borderBottom: `2px solid ${CREAM}` }}>
        {TABS.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            flex: 1, padding: "16px 6px", border: "none", cursor: "pointer",
            background: activeTab === i ? G : "#fff",
            color: activeTab === i ? "#fff" : MID,
            fontSize: 14, fontWeight: activeTab === i ? 700 : 500,
            borderBottom: activeTab === i ? `3px solid ${GOLD}` : "3px solid transparent",
            transition: "all 0.2s",
          }}>{tab}</button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          TAB 0 — 90-DAY PLAN
      ══════════════════════════════════════ */}
      {activeTab === 0 && (
        <div>
          {/* Phase Selector */}
          <div style={{ padding: "20px 20px 0" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 14px 0" }}>Piliin ang Phase</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {([1, 2, 3] as const).map(ph => {
                const pc = PHASE_COLORS[ph];
                const done = ph === 1 ? phase1Done : ph === 2 ? phase2Done : phase3Done;
                return (
                  <button key={ph} onClick={() => { setActivePhase(ph); setExpandedDay(null); }} style={{
                    padding: "18px 20px", borderRadius: 16,
                    border: activePhase === ph ? `3px solid ${pc.border}` : "2px solid #C5B99A",
                    background: activePhase === ph ? pc.bg : "#FFFFFB",
                    cursor: "pointer", textAlign: "left",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <p style={{ fontSize: 18, fontWeight: 700, color: pc.color, margin: "0 0 4px 0" }}>{pc.label} — {pc.sub}</p>
                      <p style={{ fontSize: 15, color: MID, margin: 0 }}>{pc.days} · {done}/30 araw tapos na</p>
                    </div>
                    <span style={{ fontSize: 22, color: pc.color }}>{activePhase === ph ? "▼" : "▶"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Cards */}
          <div style={{ padding: "20px 20px 0" }}>
            {filteredDays.map(d => {
              const isDone = completedDays.includes(d.day);
              const isExpanded = expandedDay === d.day;
              const pc = PHASE_COLORS[d.phase as 1 | 2 | 3];
              const isRest = d.exercise.startsWith("REST");
              const track = trackData[d.day] || emptyDay();

              return (
                <div key={d.day} style={{ marginBottom: 14 }}>
                  {/* Day Header */}
                  <div
                    onClick={() => setExpandedDay(isExpanded ? null : d.day)}
                    style={{
                      background: isDone ? "#E8F5E0" : "#FFFFFB",
                      border: `2px solid ${isDone ? G : "#C5B99A"}`,
                      borderRadius: 18, padding: "18px 20px", cursor: "pointer",
                      minHeight: 80,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        {/* Day circle */}
                        <div style={{
                          width: 54, height: 54, borderRadius: 14,
                          background: isDone ? G : pc.bg,
                          border: `2px solid ${isDone ? G : pc.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <span style={{ fontSize: isDone ? 24 : 18, fontWeight: 700, color: isDone ? "#fff" : pc.color }}>
                            {isDone ? "✓" : d.day}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: 19, fontWeight: 700, color: DARK, margin: "0 0 4px 0" }}>
                            Araw {d.day} {d.day === 90 ? "🏆" : ""}
                          </p>
                          <p style={{ fontSize: 14, color: MID, margin: 0 }}>
                            {pc.label} {d.week} · {isRest ? "💤 Rest Day" : "💪 Active Day"}
                          </p>
                        </div>
                      </div>
                      <div style={{
                        width: 44, height: 44, borderRadius: 999,
                        background: isExpanded ? G : "#F0EAE0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, color: isExpanded ? "#fff" : G, flexShrink: 0,
                      }}>
                        {isExpanded ? "▲" : "▼"}
                      </div>
                    </div>

                    {/* Focus badge */}
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ background: pc.bg, color: pc.color, borderRadius: 20, padding: "5px 14px", fontSize: 14, fontWeight: 600, border: `1px solid ${pc.border}` }}>
                        🎯 {d.focus}
                      </span>
                      {isDone && <span style={{ background: "#E8F5E0", color: G, borderRadius: 20, padding: "5px 12px", fontSize: 14, fontWeight: 700 }}>✅ Tapos na!</span>}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div style={{ background: "#FFFFFB", border: `2px solid #C5B99A`, borderTop: "none", borderRadius: "0 0 18px 18px", padding: "20px" }}>

                      {/* Meal Plan */}
                      <div style={{ background: "#E8F5E0", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: G, margin: "0 0 12px 0" }}>🍽️ Pagkain Ngayon</p>
                        {[
                          { label: "☀️ Agahan", val: d.agahan },
                          { label: "🌤 Tanghalian", val: d.tanghalian },
                          { label: "🫖 Merienda", val: d.merienda },
                          { label: "🌙 Hapunan", val: d.hapunan },
                        ].map((item, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 3 ? 10 : 0, alignItems: "flex-start" }}>
                            <span style={{ fontSize: 15, color: AMBER, fontWeight: 700, minWidth: 100, flexShrink: 0 }}>{item.label}</span>
                            <span style={{ fontSize: 15, color: DARK, lineHeight: 1.5 }}>{item.val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Exercise */}
                      <div style={{ background: isRest ? "#F5F5F5" : "#E6F1FB", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "#185FA5", margin: "0 0 8px 0" }}>💪 Exercise Ngayon</p>
                        <p style={{ fontSize: 16, color: DARK, margin: 0, lineHeight: 1.6 }}>{d.exercise}</p>
                      </div>

                      {/* Easebrew reminder */}
                      <div style={{ background: "#FFFBF0", border: `2px solid ${GOLD}`, borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
                        <p style={{ fontSize: 15, color: AMBER, margin: 0, lineHeight: 1.6 }}>
                          ☕ <strong>Easebrew</strong> — uminom 30 minuto bago kumain<br />
                          🌿 <strong>Avocado Oil</strong> — i-massage gabi bago matulog
                        </p>
                      </div>

                      {/* Daily Tracker */}
                      <div style={{ background: CREAM, borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: G, margin: "0 0 14px 0" }}>📊 I-Track ang Araw na Ito</p>

                        {/* Checkboxes — large */}
                        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                          {[
                            { key: "easebrew", label: "☕ Easebrew", val: track.easebrew },
                            { key: "exercise", label: "💪 Exercise", val: track.exercise },
                            { key: "avocado", label: "🌿 Avocado Oil", val: track.avocado },
                          ].map(item => (
                            <div key={item.key}
                              onClick={e => { e.stopPropagation(); saveTrack(d.day, { ...track, [item.key]: !item.val }); }}
                              style={{
                                flex: 1,
                                background: item.val ? "#E8F5E0" : "#fff",
                                border: `2px solid ${item.val ? G : "#ddd"}`,
                                borderRadius: 12, padding: "14px 8px", cursor: "pointer", textAlign: "center",
                              }}>
                              <p style={{ fontSize: 13, margin: "0 0 6px 0", color: DARK, fontWeight: 600 }}>{item.label}</p>
                              <span style={{ fontSize: 26 }}>{item.val ? "✅" : "⬜"}</span>
                            </div>
                          ))}
                        </div>

                        {/* Number inputs */}
                        <div style={{ display: "flex", gap: 10, marginBottom: 14 }} onClick={e => e.stopPropagation()}>
                          {[
                            { key: "tubig", label: "💧 Tubig", sub: "(glasses)", val: track.tubig, max: 12 },
                            { key: "painScore", label: "😣 Sakit", sub: "(1-10)", val: track.painScore, max: 10 },
                            { key: "energyScore", label: "⚡ Lakas", sub: "(1-10)", val: track.energyScore, max: 10 },
                          ].map(item => (
                            <div key={item.key} style={{ flex: 1, background: "#fff", border: "1.5px solid #ddd", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                              <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 2px 0", color: DARK }}>{item.label}</p>
                              <p style={{ fontSize: 12, color: MID, margin: "0 0 8px 0" }}>{item.sub}</p>
                              <input type="number" min={0} max={item.max} value={item.val || ""}
                                onChange={e => saveTrack(d.day, { ...track, [item.key]: Number(e.target.value) })}
                                style={{ width: "100%", padding: "8px 4px", borderRadius: 8, border: "1.5px solid #ddd", fontSize: 20, textAlign: "center", background: "transparent", color: DARK, boxSizing: "border-box", fontWeight: 700 }} />
                            </div>
                          ))}
                        </div>

                        {/* Notes */}
                        <div onClick={e => e.stopPropagation()}>
                          <p style={{ fontSize: 15, fontWeight: 600, color: MID, margin: "0 0 8px 0" }}>📝 Mga Tala Mo</p>
                          <textarea
                            placeholder="Ano ang naramdaman mo ngayon?..."
                            value={track.notes}
                            onChange={e => saveTrack(d.day, { ...track, notes: e.target.value })}
                            rows={2}
                            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #ddd", fontSize: 16, background: "#fff", resize: "none", boxSizing: "border-box", color: DARK, lineHeight: 1.6 }}
                          />
                        </div>
                      </div>

                      {/* Mark Done — very large button */}
                      <button onClick={e => toggleComplete(d.day, e)} style={{
                        width: "100%", padding: "22px",
                        background: isDone ? "#dc2626" : G,
                        color: "#fff", border: "none", borderRadius: 16,
                        fontSize: 20, fontWeight: 700, cursor: "pointer",
                        letterSpacing: 0.5,
                      }}>
                        {isDone ? "✗ I-undo" : d.day === 90 ? "🏆 90 Days Complete na!" : "✅ Tapos na ang Araw na Ito!"}
                      </button>
                      {!isDone && (
                        <p style={{ textAlign: "center", fontSize: 14, color: MID, margin: "10px 0 0 0" }}>
                          I-tap pagkatapos ma-complete ang araw
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 1 — PROGRESS
      ══════════════════════════════════════ */}
      {activeTab === 1 && (
        <div style={{ padding: "20px 20px 0" }}>

          {/* Big 3 stats */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Araw Tapos", val: completedDays.length, suffix: "/90", color: G },
              { label: "Progress", val: progress + "%", suffix: "", color: AMBER },
              { label: "Nalalabing Araw", val: 90 - completedDays.length, suffix: "", color: "#185FA5" },
            ].map((stat, i) => (
              <div key={i} style={{ flex: 1, background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 16, padding: "18px 10px", textAlign: "center" }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: stat.color, margin: 0 }}>
                  {stat.val}<span style={{ fontSize: 15 }}>{stat.suffix}</span>
                </p>
                <p style={{ fontSize: 13, color: MID, margin: "6px 0 0 0", lineHeight: 1.4 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Phase progress bars */}
          <div style={{ background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 18, padding: "20px", marginBottom: 20 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: G, margin: "0 0 16px 0" }}>📊 Progress bawat Phase</p>
            {([1, 2, 3] as const).map(ph => {
              const done = ph === 1 ? phase1Done : ph === 2 ? phase2Done : phase3Done;
              const pct = Math.round((done / 30) * 100);
              const pc = PHASE_COLORS[ph];
              return (
                <div key={ph} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: pc.color }}>{pc.label} — {pc.sub}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: pc.color }}>{done}/30 ({pct}%)</span>
                  </div>
                  <div style={{ background: CREAM, borderRadius: 999, height: 16 }}>
                    <div style={{ width: `${pct}%`, background: pc.color, height: 16, borderRadius: 999, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Measurements */}
          <div style={{ background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 18, padding: "20px", marginBottom: 20 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: G, margin: "0 0 16px 0" }}>📏 Sukat Mo</p>
            {[
              { key: "timbang", label: "⚖️ Timbang (kg)" },
              { key: "waist", label: "📐 Baywang (cm)" },
              { key: "pain", label: "🩺 Sakit Score (1-10)" },
            ].map(row => (
              <div key={row.key} style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: MID, margin: "0 0 10px 0" }}>{row.label}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {["1", "30", "60", "90"].map(checkpoint => {
                    const k = `${row.key}${checkpoint}` as keyof typeof measurements;
                    return (
                      <div key={checkpoint} style={{ flex: 1, textAlign: "center" }}>
                        <p style={{ fontSize: 13, color: MID, margin: "0 0 6px 0", fontWeight: 600 }}>Araw {checkpoint}</p>
                        <input
                          type="number"
                          value={measurements[k]}
                          onChange={e => saveMeasurements({ ...measurements, [k]: e.target.value })}
                          placeholder="—"
                          style={{
                            width: "100%", padding: "10px 4px", borderRadius: 10, border: "1.5px solid #ddd",
                            fontSize: 18, textAlign: "center",
                            background: measurements[k] ? "#E8F5E0" : "#fff",
                            color: DARK, boxSizing: "border-box", fontWeight: 700,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Milestone celebration */}
          {completedDays.length >= 30 && (
            <div style={{ background: "#FFFBF0", border: `2px solid ${GOLD}`, borderRadius: 18, padding: "24px", marginBottom: 20, textAlign: "center" }}>
              <p style={{ fontSize: 48, margin: "0 0 10px 0" }}>
                {completedDays.length >= 90 ? "🏆" : completedDays.length >= 60 ? "💪" : "🌱"}
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: AMBER, margin: "0 0 8px 0", lineHeight: 1.4 }}>
                {completedDays.length >= 90 ? "BAGONG KATAWAN NA! 90 DAYS COMPLETE!" :
                  completedDays.length >= 60 ? "Phase 2 Done! Papalapit na ang finish line!" :
                    "Phase 1 Complete! Nagtatayo ka na ng bagong katawan!"}
              </p>
              <p style={{ fontSize: 16, color: MID, margin: 0 }}>
                {completedDays.length} araw ng pagsisikap. Kahanga-hanga ka. 🌿☕
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 2 — REFERENCE / GABAY
      ══════════════════════════════════════ */}
      {activeTab === 2 && (
        <div style={{ padding: "20px 20px 0" }}>

          {/* Easebrew guide */}
          <div style={{ background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 18, padding: "20px", marginBottom: 16 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: G, margin: "0 0 14px 0" }}>☕ Tamang Pag-inom ng Easebrew</p>
            {[
              { label: "Paghahanda", val: "1 sachet sa 150-180ml mainit na tubig. Huwag sobrang mainit." },
              { label: "Pinakamainam", val: "Umaga (7-9AM) bago kumain. Phase 2-3: dagdag ng hapon (3-5PM)." },
              { label: "Huwag Dagdag", val: "Puting asukal — gamitin ang muscovado o wala na lang." },
              { label: "May Ulcer", val: "Uminom pagkatapos kumain ng konti. Huwag nang walang laman." },
              { label: "Para sa Best", val: "Consistent na pag-inom. 21 araw para maging gawi. 90 araw — permanent." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 4 ? 12 : 0, alignItems: "flex-start", padding: "12px 14px", background: "#F6F2EA", borderRadius: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: AMBER, minWidth: 110, flexShrink: 0 }}>{item.label}</span>
                <span style={{ fontSize: 15, color: DARK, lineHeight: 1.5 }}>{item.val}</span>
              </div>
            ))}
          </div>

          {/* Emergency pain */}
          <div style={{ background: "#FEF2F2", border: "2px solid #ef4444", borderRadius: 18, padding: "20px", marginBottom: 16 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#dc2626", margin: "0 0 14px 0" }}>🚨 Kapag Sobrang Sakit</p>
            {[
              { icon: "🔥", tip: "Hot Compress — Para sa matigas na joints sa umaga. 15-20 minuto." },
              { icon: "🧊", tip: "Cold Compress — Para sa namamaga at inflamed joints. 15-20 minuto." },
              { icon: "🌿", tip: "Avocado Oil + Massage — Circular motion, 10-15 minuto." },
              { icon: "☕", tip: "Easebrew + Pahinga — Uminom, humiga nang komportable." },
              { icon: "🦵", tip: "I-elevate ang masakit na parte — Para sa tuhod/paa, i-raise itaas ng puso level." },
              { icon: "🫁", tip: "Breathing — 5 counts inhale, 5 counts exhale. Nagpapababa ng sakit." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 5 ? 10 : 0, alignItems: "flex-start", padding: "12px 14px", background: "#FFF5F5", borderRadius: 12 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
                <p style={{ fontSize: 16, margin: 0, color: DARK, lineHeight: 1.5 }}>{item.tip}</p>
              </div>
            ))}
            <p style={{ fontSize: 15, fontWeight: 700, color: "#dc2626", margin: "14px 0 0 0", padding: "12px 14px", background: "#FEE2E2", borderRadius: 12 }}>
              ⚠️ Kung 8+ ang pain score at hindi bumababa kahit 24 oras — kumonsulta sa doktor.
            </p>
          </div>

          {/* Food guide */}
          <div style={{ background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 18, padding: "20px", marginBottom: 16 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: G, margin: "0 0 14px 0" }}>🥗 Anti-Inflammation Food Guide</p>
            {[
              { bg: "#E8F5E0", titleColor: "#2E7D32", title: "🟢 KAININ — MARAMI", text: "Salmon, Bangus, Sardinas (Omega-3) • Malunggay, Ampalaya, Kangkong • Luya, Bawang, Sibuyas • Turmeric/Dilaw • Brown Rice at Oatmeal • Olive Oil / Coconut Oil • Berde at Dilaw na Prutas" },
              { bg: "#FEF9E7", titleColor: AMBER, title: "🟡 KAININ — KONTI LANG", text: "Puting Bigas • Puting Tinapay • Asukal (muscovado na lang) • Pork at Beef (lean cuts) • Itlog (3-4 bawat linggo) • Dairy Products" },
              { bg: "#FEF2F2", titleColor: "#dc2626", title: "🔴 IWASAN", text: "Instant Noodles • Canned Food na may preservatives • Softdrinks • Fastfood • Sobrang pritong pagkain • Alcohol • Margarine" },
            ].map((sec, i) => (
              <div key={i} style={{ background: sec.bg, borderRadius: 14, padding: "14px 16px", marginBottom: i < 2 ? 12 : 0 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: sec.titleColor, margin: "0 0 8px 0" }}>{sec.title}</p>
                <p style={{ fontSize: 15, color: DARK, margin: 0, lineHeight: 1.7 }}>{sec.text}</p>
              </div>
            ))}
          </div>

          {/* Phase goals */}
          <div style={{ background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 18, padding: "20px", marginBottom: 16 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: G, margin: "0 0 14px 0" }}>🎯 Goals bawat Phase</p>
            {[
              { phase: "🌱 Phase 1 (Araw 1-30)", color: "#39613B", bg: "#E8F5E0", goals: ["Easebrew BAWAT umaga — walang skip", "Avocado Oil bawat gabi", "Maglakad 15-20 minuto araw-araw", "Gulay sa bawat kain", "8 glasses ng tubig araw-araw", "Tulog 7-8 oras"] },
              { phase: "💪 Phase 2 (Araw 31-60)", color: "#185FA5", bg: "#E6F1FB", goals: ["Easebrew 2x araw — umaga at hapon", "Exercise — dagdagan ng 10 minuto", "Pain Score: bumaba ng 2-3 points", "100% gulay sa bawat kain", "I-update ang sukat lingguhan"] },
              { phase: "🏆 Phase 3 (Araw 61-90)", color: "#C0863B", bg: "#FEF0E0", goals: ["Pain Score: 50%+ pagbaba vs Araw 1", "Exercise — gawi na, natural na lang", "Anti-inflammation eating — instinct na", "Araw 90: complete assessment at sukat"] },
            ].map((item, i) => (
              <div key={i} style={{ background: item.bg, borderRadius: 14, padding: "16px 18px", marginBottom: i < 2 ? 12 : 0 }}>
                <p style={{ fontSize: 17, fontWeight: 700, color: item.color, margin: "0 0 10px 0" }}>{item.phase}</p>
                {item.goals.map((g, j) => (
                  <p key={j} style={{ fontSize: 15, margin: "0 0 6px 0", color: DARK, lineHeight: 1.5 }}>✅ {g}</p>
                ))}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ── BOTTOM NAV ── */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 680, background: "#fff",
        borderTop: `2px solid ${CREAM}`, padding: "14px 24px",
        display: "flex", justifyContent: "center",
      }}>
        <Link href="/" style={{
          background: G, color: "#fff", borderRadius: 14,
          padding: "16px 48px", fontSize: 18, fontWeight: 700,
          textDecoration: "none",
        }}>
          🏠 Bumalik sa Hub
        </Link>
      </div>

    </div>
  );
}