"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const G = "#39613B";
const GOLD = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK = "#1B201A";
const MID = "#4E504F";

const PHASE_COLORS = {
  1: { bg: "#E8F5E0", color: "#39613B", border: "#39613B", label: "🌱 PHASE 1", sub: "FOUNDATION", days: "Araw 1–30" },
  2: { bg: "#E6F1FB", color: "#185FA5", border: "#185FA5", label: "💪 PHASE 2", sub: "PROGRESSION", days: "Araw 31–60" },
  3: { bg: "#FEF0E0", color: "#C0863B", border: "#C0863B", label: "🏆 PHASE 3", sub: "TRANSFORMATION", days: "Araw 61–90" },
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

const TABS = ["📅 90-Day Plan", "📊 Progress", "🌿 Reference"];

export default function BagongKatawanPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [activePhase, setActivePhase] = useState(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [trackData, setTrackData] = useState<Record<number, DayEntry>>({});

  // Progress tracker state
  const [measurements, setMeasurements] = useState({
    timbang1: "", timbang30: "", timbang60: "", timbang90: "",
    waist1: "", waist30: "", waist60: "", waist90: "",
    pain1: "", pain30: "", pain60: "", pain90: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("easebrew-90days");
    const savedTrack = localStorage.getItem("easebrew-90days-track");
    const savedMeas = localStorage.getItem("easebrew-90days-meas");
    if (saved) setCompletedDays(JSON.parse(saved));
    if (savedTrack) setTrackData(JSON.parse(savedTrack));
    if (savedMeas) setMeasurements(JSON.parse(savedMeas));
  }, []);

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
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 100 }}>

      {/* HEADER */}
      <div style={{ background: G, padding: "24px 24px 20px", color: "#fff" }}>
        <Link href="/" style={{ color: GOLD, fontSize: 14, textDecoration: "none", display: "block", marginBottom: 12 }}>
          ← Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>🏆 Bagong Katawan sa 90 Days</h1>
            <p style={{ fontSize: 14, opacity: 0.8, margin: "4px 0 0 0" }}>Kumpleto na Wellness Program • 3 Phases</p>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px", flexShrink: 0 }}>
            <p style={{ fontSize: 26, fontWeight: 700, margin: 0, color: GOLD }}>{completedDays.length}</p>
            <p style={{ fontSize: 11, margin: 0, opacity: 0.8 }}>/ 90 araw</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.8 }}>{progress}% kumpleto</p>
            <p style={{ fontSize: 13, margin: 0, color: GOLD, fontWeight: 700 }}>{90 - completedDays.length} araw na lang!</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 999, height: 10 }}>
            <div style={{ width: `${progress}%`, background: GOLD, height: 10, borderRadius: 999, transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Phase Mini Progress */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {([1, 2, 3] as const).map(ph => {
            const done = ph === 1 ? phase1Done : ph === 2 ? phase2Done : phase3Done;
            const pct = Math.round((done / 30) * 100);
            const pc = PHASE_COLORS[ph];
            return (
              <div key={ph} style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 10px" }}>
                <p style={{ fontSize: 11, margin: "0 0 4px 0", opacity: 0.8 }}>{pc.label}</p>
                <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px 0", color: GOLD }}>{done}/30</p>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 999, height: 4 }}>
                  <div style={{ width: `${pct}%`, background: GOLD, height: 4, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", background: "#fff", borderBottom: `2px solid ${CREAM}` }}>
        {TABS.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            flex: 1, padding: "14px 8px", border: "none", cursor: "pointer",
            background: activeTab === i ? G : "#fff",
            color: activeTab === i ? "#fff" : MID,
            fontSize: 13, fontWeight: activeTab === i ? 700 : 500,
            borderBottom: activeTab === i ? `3px solid ${GOLD}` : "3px solid transparent",
          }}>{tab}</button>
        ))}
      </div>

      {/* TAB: 90-DAY PLAN */}
      {activeTab === 0 && (
        <div>
          {/* Phase Selector */}
          <div style={{ padding: "16px 20px 0" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {([1, 2, 3] as const).map(ph => {
                const pc = PHASE_COLORS[ph];
                return (
                  <button key={ph} onClick={() => { setActivePhase(ph); setExpandedDay(null); }} style={{
                    flex: 1, padding: "12px 8px", borderRadius: 14,
                    border: activePhase === ph ? `2.5px solid ${pc.border}` : "2px solid #C5B99A",
                    background: activePhase === ph ? pc.bg : "#FFFFFB",
                    color: activePhase === ph ? pc.color : MID,
                    cursor: "pointer", textAlign: "center" as const,
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{pc.label}</p>
                    <p style={{ fontSize: 11, margin: "2px 0 0 0" }}>{pc.days}</p>
                    <p style={{ fontSize: 11, margin: "2px 0 0 0", fontWeight: 600 }}>{pc.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Cards */}
          <div style={{ padding: "16px 20px 0" }}>
            {filteredDays.map(d => {
              const isDone = completedDays.includes(d.day);
              const isExpanded = expandedDay === d.day;
              const pc = PHASE_COLORS[d.phase as 1 | 2 | 3];
              const isRest = d.exercise.startsWith("REST");
              const track = trackData[d.day] || emptyDay();

              return (
                <div key={d.day} style={{ marginBottom: 12 }}>
                  <div
                    onClick={() => setExpandedDay(isExpanded ? null : d.day)}
                    style={{
                      background: isDone ? "#E8F5E0" : "#FFFFFB",
                      border: `2px solid ${isDone ? G : "#C5B99A"}`,
                      borderRadius: 16, padding: "14px 16px", cursor: "pointer",
                    }}
                  >
                    {/* Card Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: isDone ? G : pc.bg,
                          border: `2px solid ${isDone ? G : pc.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: isDone ? "#fff" : pc.color }}>
                            {isDone ? "✓" : d.day}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0 }}>
                            Araw {d.day} {d.day === 90 ? "🏆" : ""}
                          </p>
                          <p style={{ fontSize: 12, color: MID, margin: "2px 0 0 0" }}>
                            {pc.label} {d.week} • {isRest ? "💤 Rest Day" : "💪 Active Day"}
                          </p>
                        </div>
                      </div>
                      <span style={{ fontSize: 18, color: MID }}>{isExpanded ? "▲" : "▼"}</span>
                    </div>

                    {/* Focus badge */}
                    <div style={{ marginTop: 8 }}>
                      <span style={{ background: pc.bg, color: pc.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, border: `1px solid ${pc.border}` }}>
                        🎯 {d.focus}
                      </span>
                      {isDone && <span style={{ marginLeft: 8, background: "#E8F5E0", color: G, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>✅ Tapos na!</span>}
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div style={{ marginTop: 14, borderTop: `1px solid ${CREAM}`, paddingTop: 14 }}>

                        {/* Meal Plan */}
                        <div style={{ background: "#E8F5E0", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: G, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: 0.8 }}>🍽️ Meal Plan ng Araw</p>
                          {[
                            { label: "☀️ Agahan", val: d.agahan },
                            { label: "🌤 Tanghalian", val: d.tanghalian },
                            { label: "🫖 Merienda", val: d.merienda },
                            { label: "🌙 Hapunan", val: d.hapunan },
                          ].map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 13, color: AMBER, minWidth: 90, flexShrink: 0 }}>{item.label}</span>
                              <span style={{ fontSize: 13, color: DARK }}>{item.val}</span>
                            </div>
                          ))}
                        </div>

                        {/* Exercise */}
                        <div style={{ background: isRest ? "#F5F5F5" : "#E6F1FB", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#185FA5", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: 0.8 }}>💪 Exercise</p>
                          <p style={{ fontSize: 14, color: DARK, margin: 0 }}>{d.exercise}</p>
                        </div>

                        {/* Easebrew reminder */}
                        <div style={{ background: "#FFFBF0", border: `1.5px solid ${GOLD}`, borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
                          <p style={{ fontSize: 13, color: AMBER, margin: 0 }}>
                            ☕ <strong>Easebrew</strong> — 30 mins bago mag-almusal • 🌿 <strong>Avocado Oil</strong> — gabi bago matulog
                          </p>
                        </div>

                        {/* Daily Tracker */}
                        <div style={{ background: CREAM, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: G, margin: "0 0 10px 0" }}>📊 I-track ang araw na ito</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                            {[
                              { key: "easebrew", label: "☕ Easebrew", val: track.easebrew },
                              { key: "exercise", label: "💪 Exercise", val: track.exercise },
                              { key: "avocado", label: "🌿 Avocado Oil", val: track.avocado },
                            ].map(item => (
                              <div key={item.key}
                                onClick={e => { e.stopPropagation(); saveTrack(d.day, { ...track, [item.key]: !item.val }); }}
                                style={{
                                  background: item.val ? "#E8F5E0" : "#fff",
                                  border: `1.5px solid ${item.val ? G : "#ddd"}`,
                                  borderRadius: 10, padding: "10px 8px", cursor: "pointer", textAlign: "center" as const,
                                }}>
                                <p style={{ fontSize: 12, margin: "0 0 4px 0", color: DARK }}>{item.label}</p>
                                <span style={{ fontSize: 20 }}>{item.val ? "✅" : "⬜"}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}
                            onClick={e => e.stopPropagation()}>
                            {[
                              { key: "tubig", label: "💧 Tubig (glasses)", val: track.tubig, max: 12 },
                              { key: "painScore", label: "😣 Pain (1-10)", val: track.painScore, max: 10 },
                              { key: "energyScore", label: "⚡ Energy (1-10)", val: track.energyScore, max: 10 },
                            ].map(item => (
                              <div key={item.key} style={{ background: "#fff", border: "1.5px solid #ddd", borderRadius: 10, padding: "8px" }}>
                                <p style={{ fontSize: 11, margin: "0 0 4px 0", color: DARK }}>{item.label}</p>
                                <input type="number" min={0} max={item.max} value={item.val || ""}
                                  onChange={e => saveTrack(d.day, { ...track, [item.key]: Number(e.target.value) })}
                                  style={{ width: "100%", padding: "4px", borderRadius: 6, border: "1px solid #ddd", fontSize: 16, textAlign: "center", background: "transparent", color: DARK, boxSizing: "border-box" as const }} />
                              </div>
                            ))}
                          </div>
                          <div onClick={e => e.stopPropagation()}>
                            <textarea placeholder="Notes ng araw na ito..." value={track.notes}
                              onChange={e => saveTrack(d.day, { ...track, notes: e.target.value })}
                              rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, background: "#fff", resize: "none", boxSizing: "border-box" as const, color: DARK }} />
                          </div>
                        </div>

                        <button onClick={e => toggleComplete(d.day, e)} style={{
                          width: "100%", padding: "13px",
                          background: isDone ? "#ef4444" : G,
                          color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer",
                        }}>
                          {isDone ? "✗ I-undo" : d.day === 90 ? "🏆 90 Days Complete!" : "✅ Araw na Ito — Tapos Na!"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: PROGRESS */}
      {activeTab === 1 && (
        <div style={{ padding: "20px 20px 0" }}>

          {/* Overall Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Araw Tapos", val: completedDays.length, total: "/90", color: G },
              { label: "Progress", val: progress + "%", total: "", color: AMBER },
              { label: "Natitirang Araw", val: 90 - completedDays.length, total: "", color: "#185FA5" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 14, padding: "16px 12px", textAlign: "center" as const }}>
                <p style={{ fontSize: 26, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.val}<span style={{ fontSize: 14 }}>{stat.total}</span></p>
                <p style={{ fontSize: 12, color: MID, margin: "4px 0 0 0" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Phase Progress */}
          <div style={{ background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 16, padding: "18px 18px", marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: G, margin: "0 0 14px 0" }}>📊 Progress per Phase</p>
            {([1, 2, 3] as const).map(ph => {
              const done = ph === 1 ? phase1Done : ph === 2 ? phase2Done : phase3Done;
              const pct = Math.round((done / 30) * 100);
              const pc = PHASE_COLORS[ph];
              return (
                <div key={ph} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: pc.color }}>{pc.label} — {pc.sub}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: pc.color }}>{done}/30 ({pct}%)</span>
                  </div>
                  <div style={{ background: CREAM, borderRadius: 999, height: 12 }}>
                    <div style={{ width: `${pct}%`, background: pc.color, height: 12, borderRadius: 999, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Measurements */}
          <div style={{ background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 16, padding: "18px 18px", marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: G, margin: "0 0 14px 0" }}>📏 Body Measurements</p>
            {[
              { key: "timbang", label: "⚖️ Timbang (kg)" },
              { key: "waist", label: "📐 Baywang / Waist (cm)" },
              { key: "pain", label: "🩺 Pain Score (1-10)" },
            ].map(row => (
              <div key={row.key} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: MID, margin: "0 0 8px 0" }}>{row.label}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                  {["1", "30", "60", "90"].map(checkpoint => {
                    const k = `${row.key}${checkpoint}` as keyof typeof measurements;
                    return (
                      <div key={checkpoint} style={{ textAlign: "center" as const }}>
                        <p style={{ fontSize: 11, color: MID, margin: "0 0 4px 0" }}>Day {checkpoint}</p>
                        <input
                          type="number"
                          value={measurements[k]}
                          onChange={e => saveMeasurements({ ...measurements, [k]: e.target.value })}
                          placeholder="—"
                          style={{
                            width: "100%", padding: "8px 4px", borderRadius: 8, border: "1.5px solid #ddd",
                            fontSize: 15, textAlign: "center", background: measurements[k] ? "#E8F5E0" : "#fff",
                            color: DARK, boxSizing: "border-box" as const,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Motivation */}
          {completedDays.length >= 30 && (
            <div style={{ background: "#FFFBF0", border: `2px solid ${GOLD}`, borderRadius: 16, padding: "18px 18px", marginBottom: 20, textAlign: "center" as const }}>
              <p style={{ fontSize: 30, margin: "0 0 8px 0" }}>
                {completedDays.length >= 90 ? "🏆" : completedDays.length >= 60 ? "💪" : "🌱"}
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: AMBER, margin: "0 0 6px 0" }}>
                {completedDays.length >= 90 ? "BAGONG KATAWAN NA! 90 DAYS COMPLETE!" :
                  completedDays.length >= 60 ? "Phase 2 Tapos Na! Papalapit na ang finish line!" :
                    "Phase 1 Complete! Nagtatayo ka na ng bagong katawan!"}
              </p>
              <p style={{ fontSize: 14, color: MID, margin: 0 }}>
                {completedDays.length} araw ng pagsisikap. Ikaw ay kahanga-hanga. 🌿☕
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB: REFERENCE */}
      {activeTab === 2 && (
        <div style={{ padding: "20px 20px 0" }}>

          {/* Easebrew Guide */}
          <div style={{ background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 16, padding: "18px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: G, margin: "0 0 12px 0" }}>☕ Easebrew — Tamang Paggamit</p>
            {[
              { label: "Paghahanda", val: "1 sachet sa 150-180ml mainit na tubig (80-85°C). Huwag sobrang mainit." },
              { label: "Pinakamabuting Oras", val: "Umaga (7-9AM) bago kumain. Phase 2-3: dagdag ng hapon (3-5PM)." },
              { label: "Iwasang Lagyan Ng", val: "Puting asukal — gamitin ang muscovado o wala na lang." },
              { label: "Kung May Ulcer", val: "Uminom pagkatapos kumain ng konti. Huwag inumin nang walang laman." },
              { label: "Para sa Max Benefit", val: "Consistent na pag-inom. 21 araw para maging gawi. 90 araw — permanent." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: AMBER, minWidth: 130, flexShrink: 0 }}>{item.label}</span>
                <span style={{ fontSize: 13, color: DARK, lineHeight: 1.5 }}>{item.val}</span>
              </div>
            ))}
          </div>

          {/* Emergency Pain Tips */}
          <div style={{ background: "#FEF0F0", border: "2px solid #ef4444", borderRadius: 16, padding: "18px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#ef4444", margin: "0 0 12px 0" }}>🚨 Emergency Pain Management</p>
            {[
              { icon: "🔥", tip: "Mainit na Compress — Para sa stiff joints sa umaga. 15-20 min." },
              { icon: "🧊", tip: "Malamig na Compress — Para sa namamaga at inflamed joints. 15-20 min." },
              { icon: "🌿", tip: "Avocado Oil + Gentle Massage — Circular motion, 10-15 min." },
              { icon: "☕", tip: "Easebrew + Rest — Uminom, humiga nang komportable." },
              { icon: "🦵", tip: "I-elevate ang affected limb — Para sa tuhod/paa, i-raise itaas ng puso level." },
              { icon: "🫁", tip: "Breathing Exercise — 5 counts inhale, 5 counts exhale. Nagpapababa ng pain." },
            ].map((item, i) => (
              <p key={i} style={{ fontSize: 14, margin: "0 0 8px 0", color: DARK, lineHeight: 1.6 }}>
                {item.icon} {item.tip}
              </p>
            ))}
            <p style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", margin: "10px 0 0 0" }}>
              ⚠️ Kung 8+ ang pain score at hindi bumababa kahit 24 hrs — kumonsulta sa doktor.
            </p>
          </div>

          {/* Food Guide */}
          <div style={{ background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 16, padding: "18px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: G, margin: "0 0 12px 0" }}>🥗 Anti-Inflammation Food Guide</p>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#2E7D32", margin: "0 0 6px 0" }}>🟢 KUMAIN NG MARAMI</p>
              <p style={{ fontSize: 13, color: DARK, lineHeight: 1.7 }}>Salmon, Bangus, Sardinas (Omega-3) • Malunggay, Ampalaya, Kangkong • Luya, Bawang, Sibuyas • Turmeric/Dilaw • Brown Rice at Oatmeal • Olive Oil / Coconut Oil • Berde at Dilaw na Prutas</p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#C0863B", margin: "0 0 6px 0" }}>🟡 KAUNTING KAUNTI LANG</p>
              <p style={{ fontSize: 13, color: DARK, lineHeight: 1.7 }}>Puting Bigas • Puting Tinapay • Asukal (muscovado na lang) • Pork at Beef (lean cuts) • Itlog (3-4/linggo) • Dairy Products</p>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", margin: "0 0 6px 0" }}>🔴 IWASAN HABANG BUHAY</p>
              <p style={{ fontSize: 13, color: DARK, lineHeight: 1.7 }}>Instant Noodles • Canned Food na may preservatives • Softdrinks • Fastfood • Sobrang pritong pagkain • Alcohol • Margarine</p>
            </div>
          </div>

          {/* Phase Goals Summary */}
          <div style={{ background: "#FFFFFB", border: "2px solid #C5B99A", borderRadius: 16, padding: "18px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: G, margin: "0 0 12px 0" }}>🎯 Phase Goals Summary</p>
            {([
              { phase: "🌱 Phase 1 (Araw 1-30)", color: "#39613B", bg: "#E8F5E0", goals: ["Easebrew EVERY morning — 0 skip", "Avocado Oil bawat gabi", "Maglakad 15-20 min araw-araw", "Gulay sa bawat kain", "8 glasses tubig araw-araw", "Tulog ng 7-8 oras"] },
              { phase: "💪 Phase 2 (Araw 31-60)", color: "#185FA5", bg: "#E6F1FB", goals: ["Easebrew 2x daily — umaga + hapon", "Exercise intensity — dagdag 10 min", "Pain Score: bumaba ng 2-3 points", "100% gulay sa bawat kain", "Weekly measurements update"] },
              { phase: "🏆 Phase 3 (Araw 61-90)", color: "#C0863B", bg: "#FEF0E0", goals: ["Pain Score: 50%+ reduction vs Day 1", "Exercise — gawi na, hindi kailangan ng reminder", "Anti-inflammation eating — natural na", "Day 90 full assessment at measurements"] },
            ]).map((item, i) => (
              <div key={i} style={{ background: item.bg, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: item.color, margin: "0 0 8px 0" }}>{item.phase}</p>
                {item.goals.map((g, j) => (
                  <p key={j} style={{ fontSize: 13, margin: "0 0 4px 0", color: DARK }}>✅ {g}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 680, background: "#fff",
        borderTop: `2px solid ${CREAM}`, padding: "12px 24px",
        display: "flex", justifyContent: "center",
      }}>
        <Link href="/" style={{ background: G, color: "#fff", borderRadius: 12, padding: "12px 32px", fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
          🏠 Bumalik sa Hub
        </Link>
      </div>
    </div>
  );
}