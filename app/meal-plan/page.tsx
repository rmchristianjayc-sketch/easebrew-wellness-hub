"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";
import { ChevronLeft, Home, Coffee, UtensilsCrossed, Pill, Lightbulb, Target, CircleCheck, Undo2, ChevronUp, ChevronDown } from "lucide-react";

const G     = "#39613B";
const GOLD  = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK  = "#1B201A";
const MID   = "#4E504F";
const WHITE = "#FFFFFB";

// ── PROGRESS SYNC HELPER ────────────────────────────────────
async function syncMealPlanProgress(days: number[]) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'mealplan', data: { days } }),
    });
  } catch {
    // Silent fail — localStorage is the fallback
  }
}

function getStoredMealPlanDays(storageKey: string): number[] {
  return readProgressCache<number[]>(storageKey, []);
}

const MEAL_PLAN = [
  { day: 1,  week: "Week 1", weekday: "Monday",        agahan: "Easebrew + Oatmeal na may saging na saba at honey",                          tanghalian: "Sinigang na salmon + Brown rice + Kangkong",                             merienda: "Boiled kamote + Ginger tea",                     hapunan: "Ginisang ampalaya with itlog + Brown rice",                       calories: "~1,650 kcal", nutrients: "Omega-3, Iron, Vit C",              focus: "Anti-inflammation" },
  { day: 2,  week: "Week 1", weekday: "Tuesday",       agahan: "Easebrew + Itlog na maalat + Sariwa na kamatis",                             tanghalian: "Monggo na may malunggay at hipon + Brown rice",                          merienda: "Buko juice (fresh, walang asukal)",              hapunan: "Tinolang manok + Brown rice (may malunggay)",             calories: "~1,600 kcal", nutrients: "Calcium, Protein, Vit A",           focus: "Bone & Joint Health" },
  { day: 3,  week: "Week 1", weekday: "Wednesday",   agahan: "Easebrew + Pandesal (2) + Peanut butter",                                    tanghalian: "Nilagang baka (lean) + Sayote, sitaw, pechay + Brown rice",              merienda: "Turmeric-ginger juice (luya + gatas)",           hapunan: "Ginataang kalabasa at sitaw + Grilled tilapia + Brown rice", calories: "~1,700 kcal", nutrients: "Curcumin, Protein, Zinc",           focus: "Joint Lubrication" },
  { day: 4,  week: "Week 1", weekday: "Thursday",      agahan: "Easebrew + Scrambled eggs (2) + Sautéed kangkong",                           tanghalian: "Paksiw na bangus + Ampalaya salad + Brown rice",                         merienda: "Banana + Unsalted peanuts",                      hapunan: "Chicken tinola + May papaya at malunggay + Brown rice",   calories: "~1,620 kcal", nutrients: "Iron, Potassium, Vit B12",          focus: "Muscle Recovery" },
  { day: 5,  week: "Week 1", weekday: "Friday",     agahan: "Easebrew + Lugaw with luya at bawang + Boiled egg",                          tanghalian: "Sinigang na baboy (lean) + Kangkong, labanos + Brown rice",              merienda: "Cucumber water + Boiled saging na saba",         hapunan: "Grilled tilapia + Ensaladang talong + Brown rice",        calories: "~1,580 kcal", nutrients: "Omega-3, Antioxidants, Fiber",      focus: "Detox & Digestion" },
  { day: 6,  week: "Week 1", weekday: "Saturday",       agahan: "Easebrew + Champorado (dark chocolate) + Tuyo",                              tanghalian: "Kare-kare (lean beef) + Mga gulay + Brown rice",                         merienda: "Fresh fruit salad (mangga, papaya, melon)",      hapunan: "Nilagang baka (lean) + Labanos, pechay + Brown rice",     calories: "~1,750 kcal", nutrients: "Antioxidants, Vit C, Collagen",     focus: "Skin & Joint Repair" },
  { day: 7,  week: "Week 1", weekday: "Sunday",       agahan: "Easebrew + Arroz caldo (brown rice) + May luya + Boiled egg",                tanghalian: "Pinakbet + Grilled tanigue + Brown rice",                                merienda: "Buko pandan (homemade, kaunting asukal)",        hapunan: "Pork sinigang (lean) + May labanos, sitaw, kangkong + Brown rice", calories: "~1,680 kcal", nutrients: "Immune Boosters, Fiber, Vit C", focus: "Full Body Wellness" },
  { day: 8,  week: "Week 2", weekday: "Monday",        agahan: "Easebrew + Toasted wheat bread (2) + Scrambled eggs + Tomato",               tanghalian: "Tinolang bangus + May malunggay at luya + Brown rice",                   merienda: "Boiled mais + Ginger tea",                       hapunan: "Ginisang repolyo at carrots with chicken strips + Brown rice", calories: "~1,600 kcal", nutrients: "Vit C, Beta-carotene, Protein",  focus: "Immune Support" },
  { day: 9,  week: "Week 2", weekday: "Tuesday",       agahan: "Easebrew + Boiled kamote at saging na saba",                                 tanghalian: "Sinigang na hipon + May labanos at kangkong + Brown rice",               merienda: "Watermelon slices + Sparkling water",            hapunan: "Tortang talong + Fresh tomato salad + Brown rice",        calories: "~1,550 kcal", nutrients: "Lycopene, Omega-3, Vit A",          focus: "Heart Health" },
  { day: 10, week: "Week 2", weekday: "Wednesday",   agahan: "Easebrew + Oatmeal with papaya at chia seeds",                               tanghalian: "Chicken adobo (konting suka at toyo) + Ensaladang pako + Brown rice",    merienda: "Apple + Unsalted almonds",                       hapunan: "Ginataang gulay + Grilled isda + Brown rice",             calories: "~1,650 kcal", nutrients: "Fiber, Healthy Fats, Antioxidants", focus: "Anti-inflammation" },
  { day: 11, week: "Week 2", weekday: "Thursday",      agahan: "Easebrew + Pandesal (2) + Hard-boiled eggs (2) + Cucumber",                  tanghalian: "Beef bulalo (lean) + May mais at pechay + Brown rice",                   merienda: "Banana shake (gatas, saging, walang asukal)",    hapunan: "Ginisang ampalaya with ground pork (lean) + Brown rice",  calories: "~1,680 kcal", nutrients: "Collagen, Calcium, Fiber",          focus: "Bone Strength" },
  { day: 12, week: "Week 2", weekday: "Friday",     agahan: "Easebrew + Lugaw with malunggay + Boiled egg",                               tanghalian: "Paksiw na pata (konti lang) + Kangkong + Brown rice",                    merienda: "Buko juice (fresh) + Crackers (3 pcs)",          hapunan: "Sinigang na manok + May kamatis at kangkong + Brown rice", calories: "~1,590 kcal", nutrients: "Protein, Vit C, Iron",             focus: "Energy Restore" },
  { day: 13, week: "Week 2", weekday: "Saturday",       agahan: "Easebrew + Whole wheat sinangag + Pritong itlog (2) + Tomato",               tanghalian: "Laing (gabi leaves sa gata) + Grilled bangus + Brown rice",              merienda: "Mixed fruit (mangga, pakwan, papaya)",           hapunan: "Beef caldereta (lean) + May patatas at carrots + Brown rice", calories: "~1,780 kcal", nutrients: "Vit A, C, Calcium, Iron",         focus: "Full Nutrition" },
  { day: 14, week: "Week 2", weekday: "Sunday",       agahan: "Easebrew + Arroz caldo (brown rice) + Baby boiled eggs (2)",                 tanghalian: "Lechon manok (1/4, walang balat) + Pinakbet + Brown rice",               merienda: "Mais con hielo (brown sugar, konti gatas)",      hapunan: "Seafood sinigang (hipon at isda) + Brown rice",           calories: "~1,700 kcal", nutrients: "Omega-3, Protein, Vit C",           focus: "Weekend Recovery" },
  { day: 15, week: "Week 3", weekday: "Monday",        agahan: "Easebrew + Oatmeal pancake (oats, itlog, saging)",                           tanghalian: "Sinigang na salmon sa miso + May sitaw at kangkong + Brown rice",        merienda: "Celery sticks + Peanut butter dip",              hapunan: "Ginisang repolyo with tuna + Brown rice",                 calories: "~1,600 kcal", nutrients: "Omega-3, Fiber, Probiotics",        focus: "Gut Health" },
  { day: 16, week: "Week 3", weekday: "Tuesday",       agahan: "Easebrew + Boiled itlog (2) + Kamatis at pipino salad + Wheat toast",        tanghalian: "Nilaga (manok) + May patatas, sayote, pechay + Brown rice",              merienda: "Green mango shake (walang asukal, may gatas)",   hapunan: "Ginataang sitaw at kalabasa + Grilled tanigue + Brown rice", calories: "~1,640 kcal", nutrients: "Vit C, Beta-carotene, Healthy Fats", focus: "Skin Glow" },
  { day: 17, week: "Week 3", weekday: "Wednesday",   agahan: "Easebrew + Lugaw with chicken at malunggay + Boiled egg",                    tanghalian: "Fish tinola (lapu-lapu o tanigue) + May malunggay + Brown rice",         merienda: "Buko juice (fresh, walang asukal)",              hapunan: "Chopsuey (carrots, sayote, atay ng manok) + Brown rice",  calories: "~1,620 kcal", nutrients: "Iron, Vit A, B12, Folate",          focus: "Blood Building" },
  { day: 18, week: "Week 3", weekday: "Thursday",      agahan: "Easebrew + Whole wheat pandesal (2) + Cheese + Tomato",                      tanghalian: "Pinangat na isda (pompano o tilapia) + May kamatis at luya + Brown rice", merienda: "Papaya slices + Warm luya tea",                  hapunan: "Beef stir fry (lean, broccoli, carrots) + Brown rice",    calories: "~1,700 kcal", nutrients: "Calcium, Vit K, Protein",           focus: "Joint Support" },
  { day: 19, week: "Week 3", weekday: "Friday",     agahan: "Easebrew + Champorado (brown glutinous rice) + Tuyo",                        tanghalian: "Sinigang na manok + May kangkong, labanos, sitaw + Brown rice",          merienda: "Banana (2 pcs) + Unsalted peanuts",              hapunan: "Paksiw na bangus + Ensaladang talong at kamatis + Brown rice", calories: "~1,580 kcal", nutrients: "Antioxidants, Potassium, Omega-3", focus: "Stress Relief" },
  { day: 20, week: "Week 3", weekday: "Saturday",       agahan: "Easebrew + Whole wheat sinangag + Lechon manok (2 pcs) + Tomato",            tanghalian: "Kare-kare (oxtail, lean) + Mga gulay + 1 tsp bagoong + Brown rice",     merienda: "Halo-halo (light version, walang ice cream)",    hapunan: "Tinolang hipon + May papaya at malunggay + Brown rice",   calories: "~1,820 kcal", nutrients: "Collagen, Fiber, Vit A",            focus: "Cheat Day (Balanced)" },
  { day: 21, week: "Week 3", weekday: "Sunday",       agahan: "Easebrew + Arroz caldo (brown rice) + May luya, bawang + 2 boiled eggs",     tanghalian: "Lechon manok (1/4, walang balat) + Ensalada + Brown rice",               merienda: "Mais con buko (natural, kaunting asukal)",       hapunan: "Beef nilaga + May repolyo at pechay + Brown rice",        calories: "~1,720 kcal", nutrients: "Protein, Iron, Vit C",              focus: "Family Wellness" },
  { day: 22, week: "Week 4", weekday: "Monday",        agahan: "Easebrew + Oatmeal with mangga at flaxseeds",                                tanghalian: "Sinigang na baboy (lean) + May labanos, kangkong, sitaw + Brown rice",   merienda: "Guyabano juice (fresh, walang asukal)",          hapunan: "Ginisang pechay with shrimp + Brown rice",                calories: "~1,590 kcal", nutrients: "ALA Omega-3, Vit C, Fiber",         focus: "Cholesterol Control" },
  { day: 23, week: "Week 4", weekday: "Tuesday",       agahan: "Easebrew + Boiled kamote + Scrambled eggs (2) + Cucumber",                   tanghalian: "Tinolang manok + May papaya, malunggay, luya + Brown rice",              merienda: "Watermelon (2 cups) + Warm turmeric milk",       hapunan: "Ginataang isda (tilapia sa gata) + May sili at luya + Brown rice", calories: "~1,650 kcal", nutrients: "Curcumin, Omega-3, Vit A",      focus: "Anti-inflammation" },
  { day: 24, week: "Week 4", weekday: "Wednesday",   agahan: "Easebrew + Pandesal (2) + Boiled itlog (2) + Kamatis salad",                 tanghalian: "Monggo na may pork ribs at malunggay + Brown rice",                      merienda: "Buko juice (fresh) + Boiled saging na saba",     hapunan: "Chicken adobo (white) + Ensaladang pako + Brown rice",    calories: "~1,700 kcal", nutrients: "Calcium, Folate, Protein",          focus: "Bone & Muscle" },
  { day: 25, week: "Week 4", weekday: "Thursday",      agahan: "Easebrew + Lugaw (brown rice) + May luya at bawang + Boiled egg",            tanghalian: "Grilled liempo (lean part) + Atsarang papaya + Brown rice",              merienda: "Apple at celery sticks + Peanut butter dip",     hapunan: "Sinigang na bangus sa miso + May talong at kangkong + Brown rice", calories: "~1,660 kcal", nutrients: "Probiotics, Omega-3, Fiber",    focus: "Gut & Joint Health" },
  { day: 26, week: "Week 4", weekday: "Friday",     agahan: "Easebrew + Oatmeal with papaya at honey",                                    tanghalian: "Seafood chopsuey (hipon, squid, gulay) + Brown rice",                    merienda: "Green mango with bagoong (konti)",               hapunan: "Ginisang kamote tops with tinapa + Brown rice",           calories: "~1,580 kcal", nutrients: "Iodine, Vit C, Antioxidants",       focus: "Thyroid & Energy" },
  { day: 27, week: "Week 4", weekday: "Saturday",       agahan: "Easebrew + Tapsilog (beef tapa, sinangag, itlog)",                           tanghalian: "Kare-kare (tanigue) + Mga gulay + 1 tsp bagoong + Brown rice",          merienda: "Fruit salad (papaya, mangga, melon) walang condensada", hapunan: "Beef caldereta (lean) + May patatas at carrots + Brown rice", calories: "~1,800 kcal", nutrients: "Protein, Vit A, C, Iron",        focus: "Weekend Boost" },
  { day: 28, week: "Week 4", weekday: "Sunday",       agahan: "Easebrew + Arroz caldo + May luya, bawang + Boiled eggs (2)",                tanghalian: "Lechon kawali (konti, walang taba) + Pinakbet + Brown rice",             merienda: "Buko pandan (homemade) + Warm luya tea",         hapunan: "Sinigang na isda (tanigue) + May labanos at pechay + Brown rice", calories: "~1,720 kcal", nutrients: "Omega-3, Antioxidants, Vit C",  focus: "Rest Day Reset" },
  { day: 29, week: "Week 5", weekday: "Monday",        agahan: "Easebrew + Oatmeal with chia seeds at fresh strawberry",                     tanghalian: "Sinigang na salmon + May kangkong at labanos + Brown rice",              merienda: "Papaya slices + Ginger tea",                     hapunan: "Ginisang ampalaya with tinapa (flaked) + Brown rice",     calories: "~1,580 kcal", nutrients: "Omega-3, Vit C, Antioxidants",     focus: "Week 5 Reset" },
  { day: 30, week: "Week 5", weekday: "Tuesday",       agahan: "Easebrew + Boiled saging na saba (2) + Scrambled eggs (2) + Kamatis",        tanghalian: "Monggo na may malunggay at hipon + Brown rice",                          merienda: "Banana shake (walang asukal)",                   hapunan: "Tinolang isda + May malunggay at luya + Brown rice",      calories: "~1,600 kcal", nutrients: "Calcium, Protein, Vit A",           focus: "Midpoint Check" },
  { day: 31, week: "Week 5", weekday: "Wednesday",   agahan: "Easebrew + Pandesal (2) + Peanut butter + Sliced banana",                    tanghalian: "Chicken curry Filipino style + May patatas at carrots + Brown rice",     merienda: "Boiled kamote + Turmeric ginger juice",          hapunan: "Ginataang kalabasa at hipon + Brown rice",                calories: "~1,680 kcal", nutrients: "Beta-carotene, Curcumin, Omega-3",  focus: "Anti-inflammation" },
  { day: 32, week: "Week 5", weekday: "Thursday",      agahan: "Easebrew + Scrambled eggs (2) + Sautéed malunggay + Wheat toast",            tanghalian: "Paksiw na isda (pompano) + Ensaladang talong + Brown rice",              merienda: "Mixed nuts (almonds, peanuts, cashews)",         hapunan: "Ginisang sitaw with ground chicken + Brown rice",         calories: "~1,640 kcal", nutrients: "Healthy Fats, Calcium, Protein",    focus: "Muscle Build" },
  { day: 33, week: "Week 5", weekday: "Friday",     agahan: "Easebrew + Lugaw with toasted bawang + Boiled egg + Sliced luya",            tanghalian: "Sinigang na baboy (lean) + May sitaw at kangkong + Brown rice",          merienda: "Fresh buko juice + Unsalted crackers",           hapunan: "Grilled tanigue + Pickled atsarang papaya + Brown rice",  calories: "~1,590 kcal", nutrients: "Probiotics, Omega-3, Enzymes",      focus: "Digestion Day" },
  { day: 34, week: "Week 5", weekday: "Saturday",       agahan: "Easebrew + Sinangag (brown rice) + Itlog na maalat + Sliced kamatis",        tanghalian: "Kare-kare (beef tripe, lean) + Mga gulay + 1 tsp bagoong + Brown rice", merienda: "Mangga at papaya slices + Buko water",           hapunan: "Pinakbet na may bagnet (konti) + Grilled bangus + Brown rice", calories: "~1,790 kcal", nutrients: "Collagen, Vit A, C, Fiber",     focus: "Weekend Recharge" },
  { day: 35, week: "Week 5", weekday: "Sunday",       agahan: "Easebrew + Arroz caldo + May malunggay at luya + 2 boiled eggs",             tanghalian: "Chicken inasal (walang balat) + Ensalada + Brown rice",                  merienda: "Buko salad (homemade, kaunting gatas)",          hapunan: "Sinigang na hipon + May labanos at kangkong + Brown rice", calories: "~1,700 kcal", nutrients: "Protein, Vit C, Omega-3",          focus: "Family Sunday" },
  { day: 36, week: "Week 6", weekday: "Monday",        agahan: "Easebrew + Oatmeal with saging at honey + Chia seeds",                       tanghalian: "Sinigang na salmon sa bayabas + May kangkong at sitaw + Brown rice",     merienda: "Guava juice (fresh) + Boiled saging na saba",    hapunan: "Ginisang kangkong with tokwa at bagoong + Brown rice",    calories: "~1,610 kcal", nutrients: "Vit C, Plant Protein, Omega-3",     focus: "Plant Boost" },
  { day: 37, week: "Week 6", weekday: "Tuesday",       agahan: "Easebrew + Whole wheat toast (2) + Avocado spread + Boiled egg",             tanghalian: "Beef nilaga + May sayote, patatas, pechay + Brown rice",                 merienda: "Cucumber infused water + Apple slices",          hapunan: "Ginataang sitaw at kalabasa + Grilled bangus + Brown rice", calories: "~1,670 kcal", nutrients: "Healthy Fats, Vit K, Fiber",      focus: "Heart Health" },
  { day: 38, week: "Week 6", weekday: "Wednesday",   agahan: "Easebrew + Lugaw with chicken at malunggay",                                 tanghalian: "Fish kinilaw (tanigue, suka, luya, sibuyas) + Brown rice",               merienda: "Warm luya-calamansi juice + Boiled kamote",      hapunan: "Chicken pochero + May saging na saba at repolyo + Brown rice", calories: "~1,630 kcal", nutrients: "Probiotics, Vit C, Protein",    focus: "Immunity Boost" },
  { day: 39, week: "Week 6", weekday: "Thursday",      agahan: "Easebrew + Pandesal (2) + Scrambled eggs (2) + Kamatis at pipino",           tanghalian: "Pinangat na tilapia + May kamatis at luya + Brown rice",                 merienda: "Papaya shake (walang asukal)",                   hapunan: "Beef stir fry (lean, sitaw, carrots, broccoli) + Brown rice", calories: "~1,700 kcal", nutrients: "Enzymes, Vit K, Protein",        focus: "Flexibility Support" },
  { day: 40, week: "Week 6", weekday: "Friday",     agahan: "Easebrew + Oatmeal pancake (oats, itlog, saging) + Honey drizzle",           tanghalian: "Sinigang na manok + May labanos at kangkong + Brown rice",               merienda: "Pineapple chunks + Warm ginger tea",             hapunan: "Paksiw na bangus + Ensaladang kamatis at sibuyas + Brown rice", calories: "~1,600 kcal", nutrients: "Bromelain, Vit C, Omega-3",     focus: "End-of-Week Cleanse" },
  { day: 41, week: "Week 6", weekday: "Saturday",       agahan: "Easebrew + Sinangag + Lechon manok (2, walang balat) + Kamatis",             tanghalian: "Crispy pata (konti, lean part) + Sawsawan: suka at toyo + Brown rice",  merienda: "Halo-halo (light version, walang ice cream)",    hapunan: "Seafood sinigang (hipon, squid, isda) + May labanos + Brown rice", calories: "~1,830 kcal", nutrients: "Collagen, Iodine, Fiber, Vit C", focus: "Treat Day (Balanced)" },
  { day: 42, week: "Week 6", weekday: "Sunday",       agahan: "Easebrew + Arroz caldo + May luya at bawang + 2 boiled eggs",                tanghalian: "Lechon manok (1/4, walang balat) + Pinakbet + Brown rice",               merienda: "Buko pandan (homemade) + Buko juice",            hapunan: "Chicken tinola + May papaya at malunggay + Brown rice",   calories: "~1,710 kcal", nutrients: "Immune Boosters, Vit A, Protein",   focus: "Family Sunday" },
  { day: 43, week: "Week 7", weekday: "Monday",        agahan: "Easebrew + Oatmeal with turmeric at ginger + Sliced banana",                 tanghalian: "Sinigang na bangus sa sampalok + May kangkong, labanos, sitaw + Brown rice", merienda: "Luya-calamansi juice + Boiled mais",           hapunan: "Ginisang ampalaya with egg at hipon + Brown rice",        calories: "~1,620 kcal", nutrients: "Curcumin, Omega-3, Vit C",         focus: "Anti-inflammation" },
  { day: 44, week: "Week 7", weekday: "Tuesday",       agahan: "Easebrew + Boiled kamote at saging + Scrambled eggs (2)",                    tanghalian: "Monggo na may malunggay at bangus (fried, konti) + Brown rice",          merienda: "Watermelon slices + Warm turmeric milk",         hapunan: "Ginataang isda (tilapia) + May sili at luya + Brown rice", calories: "~1,660 kcal", nutrients: "Calcium, Vit A, Curcumin",         focus: "Bone & Joint Day" },
  { day: 45, week: "Week 7", weekday: "Wednesday",   agahan: "Easebrew + Lugaw with malunggay at boiled egg + Toasted bawang",             tanghalian: "Chicken adobo (white/gata) + Ensaladang pako + Brown rice",              merienda: "Buko juice (fresh) + Papaya slices",             hapunan: "Beef at gulay stir fry (broccoli, carrots, bawang) + Brown rice", calories: "~1,650 kcal", nutrients: "Vit K, Protein, Fiber",         focus: "Midweek Strength" },
  { day: 46, week: "Week 7", weekday: "Thursday",      agahan: "Easebrew + Pandesal (2) + Hard-boiled eggs (2) + Tomato at pipino",          tanghalian: "Tinolang bangus + May malunggay at papaya + Brown rice",                 merienda: "Mixed nuts at fruit (apple, almonds, peanuts)",  hapunan: "Ginisang sitaw at kalabasa with ground pork (lean) + Brown rice", calories: "~1,680 kcal", nutrients: "Fiber, Beta-carotene, Healthy Fats", focus: "Sustained Energy" },
  { day: 47, week: "Week 7", weekday: "Friday",     agahan: "Easebrew + Champorado (brown malagkit) + Tuyo",                              tanghalian: "Sinigang na hipon sa sampalok + May labanos at kangkong + Brown rice",   merienda: "Banana (2 pcs) + Warm luya tea",                 hapunan: "Grilled tanigue + Ensaladang kamatis at sibuyas + Brown rice", calories: "~1,590 kcal", nutrients: "Antioxidants, Omega-3, Vit C",   focus: "Pre-Weekend Cleanse" },
  { day: 48, week: "Week 7", weekday: "Saturday",       agahan: "Easebrew + Sinangag (brown rice) + Tapsilog (beef tapa, itlog)",             tanghalian: "Kare-kare (seafood: hipon, tahong, pusit) + 1 tsp bagoong + Brown rice", merienda: "Mango shake (walang asukal) + Unsalted crackers", hapunan: "Pinakbet na may bagnet (konti) + Grilled bangus + Brown rice", calories: "~1,810 kcal", nutrients: "Iodine, Protein, Vit A, C",     focus: "Last Saturday Boost" },
  { day: 49, week: "Week 7", weekday: "Sunday",       agahan: "Easebrew + Arroz caldo + May luya, bawang, malunggay + 2 boiled eggs",       tanghalian: "Lechon manok (1/4, walang balat) + Sautéed kangkong + Brown rice",      merienda: "Buko pandan + Buko juice",                       hapunan: "Beef sinigang + May labanos, kangkong, sitaw + Brown rice", calories: "~1,720 kcal", nutrients: "Immune Boosters, Omega-3, Iron",  focus: "Almost There!" },
  { day: 50, week: "Week 7", weekday: "Monday",     agahan: "Easebrew + Special arroz caldo (brown rice, luya, bawang, malunggay) + 2 boiled eggs", tanghalian: "Sinigang na salmon sa sampalok + May kangkong, labanos, sitaw + Brown rice", merienda: "Fruit platter (mangga, papaya, pakwan) + Easebrew 2nd cup", hapunan: "Special nilaga (beef + gulay) + Grilled bangus + Brown rice", calories: "~1,750 kcal", nutrients: "Full Spectrum Nutrients", focus: "Day 50 Complete!" },
];

const WEEKS = ["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6","Week 7"];

const FOCUS_COLORS: Record<string, string> = {
  "Anti-inflammation":      "#E8F5E0",
  "Bone & Joint Health":    "#E6F1FB",
  "Joint Lubrication":      "#E8F5E0",
  "Muscle Recovery":        "#FEF9E7",
  "Detox & Digestion":      "#E8F5E0",
  "Skin & Joint Repair":    "#FEF9E7",
  "Full Body Wellness":     "#E8F5E0",
  "Heart Health":           "#FEF0F0",
  "Gut Health":             "#E8F5E0",
  "Blood Building":         "#FEF0F0",
  "Bone Strength":          "#E6F1FB",
  "Cheat Day (Balanced)":   "#FFFBF0",
  "Family Wellness":        "#E8F5E0",
  "Weekend Boost":          "#FEF9E7",
  "Cholesterol Control":    "#E8F5E0",
  "Treat Day (Balanced)":   "#FFFBF0",
  "Day 50 Complete!":       "#FEF9E7",
};

export default function MealPlanPage() {
  const { checking, session } = useSessionGuard();
  const storageKey = progressStorageKey("easebrew-mealplan", session?.code);
  const [selectedWeek, setSelectedWeek]   = useState("Week 1");
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [expandedDay, setExpandedDay]     = useState<number | null>(null);
  const [autoNavigated, setAutoNavigated] = useState(false);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (checking || !session) return;

    async function loadProgress() {
      setCompletedDays(getStoredMealPlanDays(storageKey));

      fetch('/api/progress?type=mealplan')
        .then(r => r.json())
        .then(res => {
          const remoteDays: number[] = Array.isArray(res?.data?.days) ? res.data.days : [];
          if (remoteDays.length === 0) return;
          setCompletedDays(prev => {
            const merged = Array.from(new Set([...prev, ...remoteDays])).sort((a, b) => a - b);
            writeProgressCache(storageKey, merged);
            return merged;
          });
        })
        .catch(() => {});
    }

    loadProgress();
  }, [checking, session, storageKey]);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: G, fontSize: 22, fontWeight: 700, fontFamily: "Georgia, serif", display: "flex", alignItems: "center", gap: 8 }}><Coffee size={22} /> Sandali lang...</p>
    </div>
  );

  const triggerSync = (days: number[]) => {
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      syncMealPlanProgress(days);
    }, 1000);
  };

  const toggleComplete = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = completedDays.includes(day)
      ? completedDays.filter(d => d !== day)
      : [...completedDays, day];
    setCompletedDays(updated);
    writeProgressCache(storageKey, updated);
    triggerSync(updated);
  };

  const filteredDays = MEAL_PLAN.filter(d => d.week === selectedWeek);
  const progress = Math.round((completedDays.length / 50) * 100);

  // Auto-navigate to the customer's next uncompleted day on first load only.
  // Manual week switches after that are respected.
  useEffect(() => {
    if (autoNavigated || completedDays.length === 0) return;
    const done = new Set(completedDays);
    let nextDay = 1;
    for (let d = 1; d <= 50; d++) { if (!done.has(d)) { nextDay = d; break; } }
    const nextEntry = MEAL_PLAN.find(d => d.day === nextDay);
    if (nextEntry && nextEntry.week !== selectedWeek) setSelectedWeek(nextEntry.week);
    setExpandedDay(nextDay);
    setAutoNavigated(true);
  }, [completedDays, autoNavigated, selectedWeek]);

  return (
    <div className="customer-shell" style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 100 }}>

      {/* ── HEADER ── */}
      <div style={{ background: G, color: WHITE }}>
        {/* Hero image banner */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
          <Image src="/images/meal-banner.jpg" alt="Healthy Filipino Food" fill style={{ objectFit: "cover", objectPosition: "center" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} priority />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(24,59,40,0.1) 0%, rgba(24,59,40,0.75) 100%)" }} />
          <div style={{ position: "absolute", bottom: 16, left: 20 }}>
            <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 999, padding: "4px 14px", fontSize: 12, fontWeight: 900, letterSpacing: 1, marginBottom: 6 }}>
              50-DAY PROGRAM
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: WHITE, lineHeight: 1.2, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>Anti-Inflammation<br />na Meal Plan</h1>
          </div>
        </div>
        <div style={{ padding: "18px 24px 24px" }}>
        <Link href="/" style={{ color: GOLD, fontSize: 18, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, minHeight: 44, marginBottom: 14, fontWeight: 600 }}>
          <ChevronLeft size={20} /> Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><UtensilsCrossed size={22} /> 50-Day Meal Plan</h1>
            <p style={{ fontSize: 16, opacity: 0.85, margin: "4px 0 0 0" }}>Anti-Inflammation Pinoy Meals</p>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 18px" }}>
            <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: GOLD }}>{completedDays.length}</p>
            <p style={{ fontSize: 16, margin: 0, opacity: 0.8 }}>sa 50 araw</p>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <p style={{ fontSize: 16, margin: 0, opacity: 0.85 }}>Progress mo</p>
          <p style={{ fontSize: 16, margin: 0, color: GOLD, fontWeight: 700 }}>{progress}%</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 999, height: 10 }}>
          <div style={{ width: `${progress}%`, background: GOLD, height: 10, borderRadius: 999, transition: "width 0.5s ease" }} />
        </div>

        {/* 2x per day reminder */}
        <div style={{ marginTop: 16, background: "rgba(254,210,85,0.15)", borderRadius: 14, padding: "12px 16px", border: "1.5px solid rgba(254,210,85,0.4)" }}>
          <p style={{ fontSize: 16, color: GOLD, fontWeight: 700, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 6 }}><Coffee size={16} /> Huwag kalimutan!</p>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", margin: 0 }}>
            Uminom ng EaseBrew <strong style={{ color: GOLD }}>2x bawat araw</strong> — Umaga at Gabi
          </p>
        </div>
        </div>{/* /inner padding */}
      </div>

      {/* ── WEEK SELECTOR ── */}
      <div style={{ padding: "20px 20px 0" }}>
        <p style={{ fontSize: 17, color: MID, fontWeight: 700, margin: "0 0 12px 0" }}>Pumili ng linggo:</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
          {WEEKS.map(w => (
            <button key={w} onClick={() => { setSelectedWeek(w); setExpandedDay(null); }} style={{
              padding: "14px 18px",
              minHeight: 52,
              borderRadius: 14,
              border: selectedWeek === w ? `2.5px solid ${G}` : "2px solid #C5B99A",
              background: selectedWeek === w ? G : WHITE,
              color: selectedWeek === w ? WHITE : MID,
              fontSize: 16, fontWeight: selectedWeek === w ? 700 : 500,
              cursor: "pointer", fontFamily: "Georgia, serif",
              transition: "all 0.15s",
            }}>{w}</button>
          ))}
        </div>
      </div>

      {/* ── DAY CARDS ── */}
      <div style={{ padding: "20px 20px 0" }}>
        {filteredDays.map(d => {
          const isDone     = completedDays.includes(d.day);
          const isExpanded = expandedDay === d.day;
          const bgColor    = FOCUS_COLORS[d.focus] || WHITE;

          return (
            <div key={d.day}
              onClick={() => setExpandedDay(isExpanded ? null : d.day)}
              style={{
                background: isDone ? "#E8F5E0" : WHITE,
                border: `2.5px solid ${isDone ? G : "#C5B99A"}`,
                borderRadius: 18, padding: "18px 20px",
                marginBottom: 14, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                transition: "all 0.15s",
              }}
            >
              {/* Card header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: isDone ? G : CREAM,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ fontSize: isDone ? 28 : 18, fontWeight: 700, color: isDone ? WHITE : G }}>
                      {isDone ? <CircleCheck size={22} color={WHITE} /> : d.day}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: 0 }}>
                      Day {d.day} — {d.weekday}
                    </p>
                    <p style={{ fontSize: 16, color: MID, margin: "3px 0 0 0" }}>{d.calories}</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={22} color={MID} /> : <ChevronDown size={22} color={MID} />}
              </div>

              {/* Focus badge */}
              <div style={{ marginTop: 10 }}>
                <span style={{ background: bgColor, color: G, borderRadius: 20, padding: "6px 16px", fontSize: 16, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Target size={14} /> {d.focus}
                </span>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ marginTop: 18, borderTop: `1.5px solid ${CREAM}`, paddingTop: 16 }}>
                  {[
                    { label: "Agahan",       value: d.agahan    },
                    { label: "Tanghalian",   value: d.tanghalian },
                    { label: "Merienda",     value: d.merienda  },
                    { label: "Hapunan",      value: d.hapunan   },
                  ].map((meal, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: G, margin: "0 0 5px 0", textTransform: "uppercase" as const, letterSpacing: 1 }}>
                        {meal.label}
                      </p>
                      <p style={{ fontSize: 17, color: DARK, margin: 0, lineHeight: 1.6 }}>{meal.value}</p>
                    </div>
                  ))}

                  <div style={{ background: CREAM, borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                    <p style={{ fontSize: 16, color: AMBER, fontWeight: 700, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 6 }}><Pill size={16} /> Mga Nutrients</p>
                    <p style={{ fontSize: 16, color: DARK, margin: 0 }}>{d.nutrients}</p>
                  </div>

                  <button
                    onClick={e => toggleComplete(d.day, e)}
                    style={{
                      width: "100%", padding: "18px",
                      minHeight: 56,
                      background: isDone ? "#dc2626" : G,
                      color: WHITE, border: "none", borderRadius: 14,
                      fontSize: 18, fontWeight: 700, cursor: "pointer",
                      fontFamily: "Georgia, serif", transition: "background 0.2s",
                    }}
                  >
                    {isDone ? <><Undo2 size={18} /> I-undo</> : <><CircleCheck size={18} /> Tapos na ngayon!</>}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── REMINDERS ── */}
      <div style={{ padding: "8px 20px 20px" }}>
        <div style={{ background: G, borderRadius: 20, padding: "22px 24px", color: WHITE }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 14px 0", color: GOLD, display: "flex", alignItems: "center", gap: 8 }}><Lightbulb size={20} /> Mga Paalala Araw-araw</h3>
          {[
            "EaseBrew — 2 sachet bawat araw (Umaga at Gabi)",
            "8 baso ng tubig — mahalaga sa katawan",
            "15-min lakad pagkatapos kumain — mabuti sa digestion",
            "Brown rice (3/4 cup luto) — mas maraming fiber kaysa white rice",
            "Luya at bawang — naka-tradition sa Pinoy cooking",
          ].map((tip, i) => (
            <p key={i} style={{ fontSize: 16, margin: "0 0 10px 0", opacity: 0.95, lineHeight: 1.5 }}>{tip}</p>
          ))}
        </div>

        {/* Medical disclaimer */}
        <div style={{ marginTop: 14, padding: "12px 14px", background: "#f3f4f6", borderRadius: 10, border: "1px solid #d1d5db" }}>
          <p style={{ fontSize: 12, color: "#4E504F", margin: 0, lineHeight: 1.5 }}>
            <strong>Paalala:</strong> Ang meal plan na ito ay general guide lang. Kung may diabetes, kidney condition, allergies, o iba pang health issue, magpakonsulta muna sa doctor o nutritionist bago sundin.
          </p>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 680, background: WHITE,
        borderTop: `2px solid ${CREAM}`, padding: "14px 24px",
        display: "flex", justifyContent: "center",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
      }}>
        <Link href="/" style={{
          background: G, color: WHITE, borderRadius: 14,
          padding: "16px 40px",
          minHeight: 52,
          display: "flex", alignItems: "center",
          fontSize: 18, fontWeight: 700,
          textDecoration: "none", fontFamily: "Georgia, serif",
        }}>
          <Home size={18} /> Bumalik sa Hub
        </Link>
      </div>
    </div>
  );
}
