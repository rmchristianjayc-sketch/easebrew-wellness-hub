"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";

const G = "#39613B";
const GOLD = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK = "#1B201A";
const MID = "#4E504F";

type Recipe = {
  id: number; name: string; category: string; benefit: string;
  servings: string; prepTime: string; cookTime: string; calories: string;
  difficulty: string; stars: number; description: string; easebrewTip: string;
  ingredients: { qty: string; unit: string; ingredient: string; notes: string }[];
  steps: string[];
  nutrition: Record<string, string>;
};

const CATEGORY_COLORS: Record<string, { bg: string; color: string; icon: string }> = {
  "Soup / Sabaw":      { bg: "#E6F1FB", color: "#185FA5", icon: "🍲" },
  "Gulay Dish":        { bg: "#E8F5E0", color: "#39613B", icon: "🥬" },
  "Fish Dish":         { bg: "#E0F7FA", color: "#00838F", icon: "🐟" },
  "Meat Dish":         { bg: "#FEF0E0", color: "#C0863B", icon: "🍖" },
  "Lugaw / Porridge":  { bg: "#FFFBF0", color: "#B8860B", icon: "🍚" },
  "Breakfast":         { bg: "#FFF3E0", color: "#E65100", icon: "☀️" },
  "Salad / Side":      { bg: "#F3E5F5", color: "#7B1FA2", icon: "🥗" },
  "Salad / Dessert":   { bg: "#FCE4EC", color: "#C2185B", icon: "🥗" },
  "Dessert / Merienda":{ bg: "#FCE4EC", color: "#C2185B", icon: "🍮" },
  "Power Bowl":        { bg: "#E8F5E0", color: "#2E7D32", icon: "🏆" },
};

const NUTRITION_HIGHLIGHT: Record<string, string> = {
  MAXIMUM:    "#7B1FA2",
  EXCELLENT:  "#2E7D32",
  "VERY HIGH":"#1565C0",
  HIGH:       "#39613B",
  GOOD:       "#C0863B",
  MEDIUM:     "#9E9E9E",
  YES:        "#2E7D32",
};

const RECIPES: Recipe[] = [
  {
    id: 1, name: "Sinigang na Salmon", category: "Soup / Sabaw", benefit: "Omega-3 Anti-Inflammation",
    servings: "4", prepTime: "15 mins", cookTime: "30 mins", calories: "320 kcal", difficulty: "Easy", stars: 5,
    description: "Ang sinigang na salmon ay isa sa pinaka-anti-inflammatory na pagkain sa Pilipinas. Ang salmon ay puno ng omega-3 fatty acids na nakakatulong na bawasan ang inflammation sa joints.",
    easebrewTip: "Inumin ang Easebrew Herbal Coffee 30 minuto bago kumain para mapalakas ang epekto ng anti-inflammatory ingredients ng salmon.",
    ingredients: [
      { qty: "400g", unit: "", ingredient: "Salmon fillet", notes: "hiwain ng 4 piraso" },
      { qty: "2L", unit: "", ingredient: "Tubig", notes: "para sa sabaw" },
      { qty: "1 pack 40g", unit: "", ingredient: "Sinigang mix (sampalok)", notes: "o 3 pcs sariwang sampalok" },
      { qty: "2 medium", unit: "", ingredient: "Kamatis", notes: "hati ng apat" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hati ng apat" },
      { qty: "200g", unit: "", ingredient: "Kangkong", notes: "hiwain" },
      { qty: "100g", unit: "", ingredient: "Sitaw", notes: "hiwain ng 2-inch" },
      { qty: "1 medium", unit: "", ingredient: "Labanos", notes: "hiwain ng bilog" },
      { qty: "2 pcs", unit: "", ingredient: "Siling haba", notes: "buong piraso" },
      { qty: "1.5 tsp", unit: "", ingredient: "Patis (fish sauce)", notes: "i-adjust sa panlasa" },
    ],
    steps: [
      "Pakuluan ang tubig sa malaking palayok sa medium-high heat. Idagdag ang sibuyas at kamatis.",
      "Kapag kumulo na, idagdag ang labanos. Lutuin ng 5 minuto hanggang lumambot ng konti.",
      "Idagdag ang sinigang mix. Haluin ng maigi. Tikman — dapat medyo maasim na.",
      "Idagdag ang salmon fillet at sitaw. Lutuin ng 5-7 minuto sa medium heat.",
      "Idagdag ang kangkong at siling haba. Lutuin ng 2 minuto pa.",
      "Season ng patis. Huwag sobrang lutuin ang isda para hindi matuyo.",
      "Ihain nang mainit kasama ang 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "320 kcal", Protein: "35g", Fat: "12g", Carbs: "18g", Fiber: "4g", "Omega-3": "HIGH", "Vitamin C": "HIGH" },
  },
  {
    id: 2, name: "Ginisang Ampalaya with Egg", category: "Gulay Dish", benefit: "Blood Sugar + Anti-Inflammation",
    servings: "4", prepTime: "10 mins", cookTime: "15 mins", calories: "180 kcal", difficulty: "Easy", stars: 5,
    description: "Ang ampalaya ay isa sa mga pinakamakapangyarihang anti-inflammatory na gulay sa Pilipinas. Nakakatulong ito sa pag-regulate ng blood sugar at may compounds na naglalaban sa inflammation.",
    easebrewTip: "Pagkatapos kumain, uminom ng Easebrew Herbal Coffee para mapahusay ang digestion at mapalakas ang herbal benefits.",
    ingredients: [
      { qty: "2 medium", unit: "", ingredient: "Ampalaya (bitter melon)", notes: "hiwain ng manipis, alisin ang binhi" },
      { qty: "3 large", unit: "", ingredient: "Itlog", notes: "talunin" },
      { qty: "100g", unit: "", ingredient: "Pork (lean)", notes: "o hipon — optional" },
      { qty: "3 cloves", unit: "", ingredient: "Bawang", notes: "durugin at tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "1 medium", unit: "", ingredient: "Kamatis", notes: "hiwain" },
      { qty: "2 tbsp", unit: "", ingredient: "Canola oil", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Asin", notes: "para ibabad ang ampalaya" },
      { qty: "0.5 tsp", unit: "", ingredient: "Patis", notes: "i-adjust sa panlasa" },
    ],
    steps: [
      "Ibabad ang ampalaya sa maaalat na tubig ng 10 minuto para mabawasan ang pait. Pisilin at alisan ng tubig.",
      "Painitin ang langis sa kawali sa medium heat. Igisa ang bawang hanggang golden.",
      "Idagdag ang sibuyas at kamatis. Igisa ng 2 minuto.",
      "Idagdag ang pork (kung may pork). Lutuin hanggang maluto.",
      "Idagdag ang ampalaya. Igisa ng 3-4 minuto sa medium-high heat.",
      "Ibuhos ang talunang itlog. Haluin ng dahan-dahan. Lutuin hanggang maluto ang itlog.",
      "Season ng patis at pepper. Ihain kasama ang 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "180 kcal", Protein: "12g", Fat: "10g", Carbs: "10g", Fiber: "3g", Iron: "HIGH", "Blood Sugar Control": "EXCELLENT" },
  },
  {
    id: 3, name: "Tinolang Manok with Malunggay", category: "Soup / Sabaw", benefit: "Immune Boost + Joint Support",
    servings: "4", prepTime: "15 mins", cookTime: "35 mins", calories: "290 kcal", difficulty: "Easy", stars: 5,
    description: "Ang tinola ay isa sa mga pinaka-iconic na Pinoy dish na puno ng wellness benefits. Ang malunggay ay superfood na puno ng calcium, iron, at anti-inflammatory compounds.",
    easebrewTip: "Uminom ng Easebrew Herbal Coffee tuwing umaga bago mag-almusal. Ang combination ng herbal coffee at malunggay ay nagpapalakas ng immune system.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Manok (bone-in pieces)", notes: "pwede thighs o drumsticks" },
      { qty: "2 cups", unit: "", ingredient: "Dahon ng malunggay", notes: "o 1 pack frozen malunggay" },
      { qty: "1 medium", unit: "", ingredient: "Green papaya (hilaw)", notes: "hiwain ng wedge" },
      { qty: "2 inch", unit: "", ingredient: "Luya (ginger)", notes: "hiwain ng julienne" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "4 cloves", unit: "", ingredient: "Bawang", notes: "durusin" },
      { qty: "1.5L", unit: "", ingredient: "Tubig o chicken broth", notes: "" },
      { qty: "2 pcs", unit: "", ingredient: "Siling haba", notes: "buong piraso" },
      { qty: "1.5 tbsp", unit: "", ingredient: "Patis", notes: "i-adjust sa panlasa" },
    ],
    steps: [
      "Painitin ang langis sa malaking palayok. Igisa ang bawang at sibuyas ng 2 minuto.",
      "Idagdag ang luya. Igisa ng 1 minuto hanggang mabango.",
      "Idagdag ang manok. Igisa ng 5 minuto hanggang medyo golden ang balat.",
      "Ibuhos ang tubig o broth. Pakuluan, tapos bawasan sa medium heat.",
      "Lutuin ng 20 minuto hanggang maluto ang manok.",
      "Idagdag ang papaya. Lutuin ng 5 minuto.",
      "Idagdag ang siling haba at patis. Lutuin ng 2 minuto pa.",
      "I-off ang apoy. Idagdag ang malunggay. Haluin. Ihain agad.",
    ],
    nutrition: { Calories: "290 kcal", Protein: "32g", Fat: "9g", Carbs: "15g", Calcium: "HIGH", Iron: "HIGH", "Anti-Inflammation": "EXCELLENT" },
  },
  {
    id: 4, name: "Monggo with Malunggay & Ginger", category: "Gulay Dish", benefit: "Anti-Inflammation + Plant Protein",
    servings: "4", prepTime: "10 mins", cookTime: "40 mins", calories: "250 kcal", difficulty: "Easy", stars: 4,
    description: "Ang monggo ay puno ng plant-based protein at fiber. Kapag pinagsama ang malunggay at luya, nagiging mas makapangyarihan ang anti-inflammatory effect nito.",
    easebrewTip: "Ang Easebrew Herbal Coffee ay perpektong kasama ng monggo sa almusal o tanghalian — double ang herbal benefits para sa katawan.",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Monggo (mung beans)", notes: "hugasan at ibabad ng 2 oras" },
      { qty: "1.5 cups", unit: "", ingredient: "Dahon ng malunggay", notes: "sariwa" },
      { qty: "1 inch", unit: "", ingredient: "Luya", notes: "hiwain ng julienne" },
      { qty: "3 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "100g", unit: "", ingredient: "Tinapa o pritong isda", notes: "optional" },
      { qty: "1L", unit: "", ingredient: "Tubig", notes: "" },
      { qty: "1.5 tbsp", unit: "", ingredient: "Patis", notes: "o asin" },
    ],
    steps: [
      "Lutuin ang monggo sa tubig hanggang malambot — mga 30-35 minuto sa medium heat.",
      "Sa ibang kawali, igisa ang bawang, sibuyas, at luya sa langis hanggang mabango.",
      "Idagdag ang tinapa o isda (kung may isda). Igisa ng 2 minuto.",
      "Ibuhos ang lutong monggo sa kawali. Haluin ng maigi.",
      "Idagdag ang malunggay. Lutuin ng 3 minuto pa sa medium heat.",
      "Season ng patis at pepper. Tikman at i-adjust.",
      "Ihain kasama ang 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "250 kcal", Protein: "18g", Fat: "5g", Carbs: "38g", Fiber: "8g", Iron: "HIGH", "Plant Protein": "EXCELLENT" },
  },
  {
    id: 5, name: "Nilagang Baka (Lean Cuts)", category: "Meat Dish", benefit: "Collagen + Bone & Joint Health",
    servings: "4", prepTime: "15 mins", cookTime: "90 mins", calories: "380 kcal", difficulty: "Medium", stars: 4,
    description: "Ang nilagang baka gamit ang lean cuts ay nagbibigay ng natural collagen na nakakatulong sa joint lubrication. Ang bone broth nito ay mayaman sa minerals na nagpapatibay ng buto.",
    easebrewTip: "Para sa mas mabuting joint support, uminom ng Easebrew Herbal Coffee pagkatapos ng nilagang baka.",
    ingredients: [
      { qty: "500g", unit: "", ingredient: "Beef shank o brisket (lean)", notes: "hiwain ng 2-inch" },
      { qty: "1 medium", unit: "", ingredient: "Kamote", notes: "hiwain ng malaki" },
      { qty: "200g", unit: "", ingredient: "Repolyo", notes: "hiwain ng kalahati" },
      { qty: "2 medium", unit: "", ingredient: "Mais (corn)", notes: "hiwain ng tatlo" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "buong piraso" },
      { qty: "1 medium", unit: "", ingredient: "Labanos", notes: "hiwain ng bilog" },
      { qty: "1.5L", unit: "", ingredient: "Tubig", notes: "" },
      { qty: "2 pcs", unit: "", ingredient: "Peppercorn (paminta)", notes: "buong piraso" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "i-adjust sa panlasa" },
    ],
    steps: [
      "Sa malaking palayok, ilagay ang baka at tubig. Pakuluan sa high heat. Alisin ang bula (scum) sa ibabaw.",
      "Idagdag ang sibuyas at peppercorn. Bawasan sa low-medium heat.",
      "Lutuin ng 60-75 minuto hanggang malambot ang karne. (Mas mabilis sa pressure cooker — 30 minuto.)",
      "Idagdag ang mais at kamote. Lutuin ng 10 minuto.",
      "Idagdag ang labanos at repolyo. Lutuin ng 5-7 minuto pa.",
      "Season ng patis at asin. Tikman.",
      "Ihain nang mainit kasama ang 3/4 cup brown rice at patis-kalamansi dipping sauce.",
    ],
    nutrition: { Calories: "380 kcal", Protein: "42g", Fat: "11g", Carbs: "28g", Collagen: "HIGH", Minerals: "HIGH", "Joint Support": "EXCELLENT" },
  },
  {
    id: 6, name: "Pinakbet with Bagoong", category: "Gulay Dish", benefit: "Antioxidant Powerhouse",
    servings: "4", prepTime: "20 mins", cookTime: "25 mins", calories: "210 kcal", difficulty: "Medium", stars: 5,
    description: "Ang pinakbet ay isa sa mga pinaka-nutrient-dense na Pinoy dish. Naglalaman ito ng iba't ibang gulay na mayaman sa antioxidants — ampalaya, kalabasa, kamatis, at okra.",
    easebrewTip: "Ang Easebrew Herbal Coffee ay magandang inumin bago ang pinakbet para mapalakas ang herbal na katangian ng mga gulay.",
    ingredients: [
      { qty: "200g", unit: "", ingredient: "Ampalaya", notes: "hiwain ng manipis" },
      { qty: "200g", unit: "", ingredient: "Kalabasa", notes: "hiwain ng cubes" },
      { qty: "150g", unit: "", ingredient: "Okra", notes: "hiwain ng dalawa" },
      { qty: "150g", unit: "", ingredient: "Talong (eggplant)", notes: "hiwain ng wedge" },
      { qty: "100g", unit: "", ingredient: "Sitaw", notes: "hiwain ng 2-inch" },
      { qty: "100g", unit: "", ingredient: "Kamatis", notes: "hiwain ng kalahati" },
      { qty: "3 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "2 tbsp", unit: "", ingredient: "Bagoong alamang", notes: "o shrimp paste" },
      { qty: "100g", unit: "", ingredient: "Pork belly (manipis)", notes: "o hipon — optional" },
    ],
    steps: [
      "Painitin ang langis. Igisa ang bawang at sibuyas. Idagdag ang pork, lutuin ng 3 minuto.",
      "Idagdag ang kamatis at bagoong. Igisa ng 2 minuto hanggang mabango.",
      "Idagdag ang kalabasa. Idagdag ang konting tubig. Takpan at lutuin ng 5 minuto.",
      "Idagdag ang talong at okra. Haluin ng maingat.",
      "Idagdag ang sitaw at ampalaya. Lutuin ng 5-7 minuto pa sa medium heat.",
      "Huwag sobrang luto ang mga gulay — dapat may crunch pa. Tikman at i-adjust.",
      "Ihain kasama ang 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "210 kcal", Protein: "14g", Fat: "8g", Carbs: "24g", Fiber: "7g", Antioxidants: "VERY HIGH", Vitamins: "EXCELLENT" },
  },
  {
    id: 7, name: "Arroz Caldo with Ginger & Bawang", category: "Lugaw / Porridge", benefit: "Anti-Inflammation + Gut Warmth",
    servings: "4", prepTime: "10 mins", cookTime: "40 mins", calories: "310 kcal", difficulty: "Easy", stars: 5,
    description: "Ang arroz caldo ay hindi lang comfort food — ito ay therapeutic na pagkain. Ang luya ay isa sa pinakamakapangyarihang natural anti-inflammatory available sa Pilipinas.",
    easebrewTip: "BEST PAIRING: Easebrew Herbal Coffee kasama ang arroz caldo sa umaga — double anti-inflammatory effect!",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Malagkit rice o regular rice", notes: "hugasan" },
      { qty: "400g", unit: "", ingredient: "Manok (bone-in)", notes: "hiwain ng maliit" },
      { qty: "3 inch", unit: "", ingredient: "Luya (ginger)", notes: "hiwain ng julienne — huwag tipirin!" },
      { qty: "6 cloves", unit: "", ingredient: "Bawang", notes: "3 tadtarin, 3 iprito para sa topping" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "tadtarin" },
      { qty: "1.5L", unit: "", ingredient: "Chicken broth o tubig", notes: "" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "i-adjust sa panlasa" },
      { qty: "3 stalks", unit: "", ingredient: "Green onion (sibuyas dahon)", notes: "para sa topping" },
    ],
    steps: [
      "Iprito ang 3 cloves bawang sa langis hanggang golden brown. Ilabas at itabi para sa topping.",
      "Sa parehong kawali, igisa ang 3 cloves bawang (tadtarin), sibuyas, at luya ng 3 minuto.",
      "Idagdag ang manok. Igisa ng 5 minuto hanggang medyo luto.",
      "Idagdag ang hugasang bigas. Haluin ng maigi ng 2 minuto.",
      "Ibuhos ang broth o tubig. Pakuluan, tapos bawasan sa medium-low heat.",
      "Lutuin ng 25-30 minuto, haluin paminsan-minsan hanggang malapot ang lugaw.",
      "Season ng patis at pepper. Ihain na may topping na prito na bawang at sibuyas dahon.",
    ],
    nutrition: { Calories: "310 kcal", Protein: "28g", Fat: "8g", Carbs: "32g", "Ginger Content": "HIGH", "Immune Support": "EXCELLENT", "Gut Health": "GOOD" },
  },
  {
    id: 8, name: "Paksiw na Bangus", category: "Fish Dish", benefit: "Omega-3 + Low-Fat Cooking",
    servings: "4", prepTime: "10 mins", cookTime: "25 mins", calories: "260 kcal", difficulty: "Easy", stars: 4,
    description: "Ang paksiw ay isa sa pinaka-healthy na paraan ng pagluluto ng isda — walang labis na langis. Ang bangus ay mayaman sa omega-3 fatty acids at protein para sa muscle repair.",
    easebrewTip: "Uminom ng Easebrew Herbal Coffee kasabay o pagkatapos ng paksiw para sa pinakamabuting anti-inflammation benefit ng araw.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Bangus (milkfish)", notes: "hiwain ng 4 piraso" },
      { qty: "1 cup", unit: "", ingredient: "Suka (cane vinegar)", notes: "o white vinegar" },
      { qty: "0.5 cup", unit: "", ingredient: "Tubig", notes: "" },
      { qty: "2 inch", unit: "", ingredient: "Luya", notes: "hiwain ng julienne" },
      { qty: "4 cloves", unit: "", ingredient: "Bawang", notes: "durusin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "2 pcs", unit: "", ingredient: "Siling pangsigang", notes: "buong piraso" },
      { qty: "1 tsp", unit: "", ingredient: "Asin", notes: "i-adjust" },
    ],
    steps: [
      "Sa palayok, ilagay ang suka, tubig, bawang, sibuyas, at luya. Pakuluan.",
      "Ilagay ang bangus. Season ng asin at pepper.",
      "Takpan. Lutuin sa medium heat ng 15 minuto.",
      "Idagdag ang siling pangsigang. Lutuin ng 5 minuto pa.",
      "Tikman ang sabaw. I-adjust ang suka at asin kung kinakailangan.",
      "Ihain kasama ang 3/4 cup brown rice at diced na kamatis.",
    ],
    nutrition: { Calories: "260 kcal", Protein: "30g", Fat: "9g (omega-3)", Carbs: "8g", "Omega-3": "HIGH", Probiotics: "MEDIUM", "Low Fat": "EXCELLENT" },
  },
  {
    id: 9, name: "Ginataang Sitaw at Kalabasa", category: "Gulay Dish", benefit: "Antioxidant + Fiber Rich",
    servings: "4", prepTime: "15 mins", cookTime: "25 mins", calories: "280 kcal", difficulty: "Easy", stars: 4,
    description: "Ang kalabasa ay mayaman sa beta-carotene, antioxidants, at Vitamin A na nakakatulong sa inflammation. Ang sitaw ay nagbibigay ng plant protein at fiber.",
    easebrewTip: "Ihain ang ginataang sitaw at kalabasa kasama ang Easebrew Herbal Coffee sa hapunan para sa relaxing at anti-inflammatory na gabi.",
    ingredients: [
      { qty: "300g", unit: "", ingredient: "Sitaw (string beans)", notes: "hiwain ng 2-inch" },
      { qty: "400g", unit: "", ingredient: "Kalabasa", notes: "hiwain ng cubes" },
      { qty: "1 can (400ml)", unit: "", ingredient: "Gata (coconut milk)", notes: "o 1 cup gata na piga" },
      { qty: "200g", unit: "", ingredient: "Hipon (shrimp)", notes: "o baboy — optional" },
      { qty: "3 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "2 tbsp", unit: "", ingredient: "Bagoong alamang", notes: "para sa lasa" },
      { qty: "1 cup", unit: "", ingredient: "Tubig", notes: "" },
    ],
    steps: [
      "Igisa ang bawang at sibuyas sa langis. Idagdag ang bagoong, igisa ng 1 minuto.",
      "Idagdag ang hipon o baboy (kung may laman). Lutuin ng 3 minuto.",
      "Idagdag ang kalabasa at tubig. Takpan at lutuin ng 8 minuto hanggang medyo malambot.",
      "Idagdag ang sitaw. Haluin.",
      "Ibuhos ang gata. Haluin ng maingat. Lutuin sa medium heat ng 5-7 minuto. Huwag pakuluin nang malakas.",
      "Season ng asin. Tikman at i-adjust.",
      "Ihain kasama ang 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "280 kcal", Protein: "16g", Fat: "14g (healthy)", Carbs: "26g", "Beta-Carotene": "VERY HIGH", Fiber: "HIGH", Antioxidants: "HIGH" },
  },
  {
    id: 10, name: "Ginger-Turmeric Lugaw", category: "Lugaw / Porridge", benefit: "MAXIMUM Anti-Inflammation",
    servings: "4", prepTime: "10 mins", cookTime: "35 mins", calories: "270 kcal", difficulty: "Easy", stars: 5,
    description: "Ito ang pinaka-anti-inflammatory na lugaw recipe sa book na ito. Ang turmeric (dilaw) ay naglalaman ng curcumin — isa sa pinakamakapangyarihang anti-inflammatory compounds sa mundo.",
    easebrewTip: "ULTIMATE ANTI-INFLAMMATION MORNING: Easebrew Herbal Coffee + Ginger-Turmeric Lugaw = pinakamalakas na anti-inflammatory breakfast!",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Bigas (malagkit o regular)", notes: "hugasan" },
      { qty: "2 inch", unit: "", ingredient: "Luya (ginger)", notes: "hiwain ng manipis" },
      { qty: "1 tsp", unit: "", ingredient: "Turmeric powder (dilaw)", notes: "o 1 inch sariwang turmeric" },
      { qty: "1.5L", unit: "", ingredient: "Tubig o chicken broth", notes: "" },
      { qty: "3 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "tadtarin" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "i-adjust" },
      { qty: "1 tsp", unit: "", ingredient: "Ground black pepper", notes: "nagpapalakas ng curcumin absorption!" },
      { qty: "3 stalks", unit: "", ingredient: "Green onion", notes: "para sa topping" },
    ],
    steps: [
      "Igisa ang bawang, sibuyas, at luya sa langis ng 2 minuto.",
      "Idagdag ang bigas. Haluin ng 2 minuto para ma-coat ang bigas sa langis.",
      "Idagdag ang turmeric. Haluin — magiging dilaw ang lahat, okay lang yan!",
      "Ibuhos ang tubig o broth. Pakuluan.",
      "Bawasan sa medium-low heat. Lutuin ng 25-30 minuto, haluin paminsan-minsan.",
      "Magdagdag ng tubig kung masyadong malapot. Season ng patis.",
      "Ihain na may topping na green onion. HUWAG KALIMUTAN ang black pepper — nagpapalakas ng curcumin absorption ng hanggang 2000%!",
    ],
    nutrition: { Calories: "270 kcal", Protein: "8g", Fat: "5g", Carbs: "48g", Curcumin: "VERY HIGH", "Anti-Inflammation": "MAXIMUM", "Gut Health": "EXCELLENT" },
  },
  {
    id: 11, name: "Chicken Tinola with Papaya", category: "Soup / Sabaw", benefit: "Joint Lubrication + Immune",
    servings: "4", prepTime: "15 mins", cookTime: "35 mins", calories: "285 kcal", difficulty: "Easy", stars: 5,
    description: "Ang papaya sa tinola ay nagdadagdag ng papain enzyme na natural na anti-inflammatory at nakakatulong sa digestion. Ang malunggay ay nagbibigay ng calcium at iron para sa bone health.",
    easebrewTip: "Ang Easebrew Herbal Coffee ay perpektong breakfast drink bago ang tanghaliang tinola.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Manok (bone-in)", notes: "hiwain" },
      { qty: "1 medium", unit: "", ingredient: "Hilaw na papaya", notes: "hiwain ng wedge" },
      { qty: "1.5 cups", unit: "", ingredient: "Malunggay leaves", notes: "o dahon ng sili" },
      { qty: "2 inch", unit: "", ingredient: "Luya", notes: "hiwain" },
      { qty: "4 cloves", unit: "", ingredient: "Bawang", notes: "durusin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "1.5L", unit: "", ingredient: "Tubig", notes: "" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "" },
    ],
    steps: [
      "Igisa ang bawang, sibuyas, at luya sa langis ng 3 minuto.",
      "Idagdag ang manok. Igisa ng 5 minuto.",
      "Ibuhos ang tubig. Pakuluan, tapos medium heat.",
      "Lutuin ng 20 minuto. Season ng patis.",
      "Idagdag ang papaya. Lutuin ng 8 minuto.",
      "I-off ang apoy. Idagdag ang malunggay. Ihain agad.",
    ],
    nutrition: { Calories: "285 kcal", Protein: "30g", Fat: "8g", Carbs: "18g", "Papain Enzyme": "HIGH", Calcium: "HIGH" },
  },
  {
    id: 12, name: "Ensaladang Talong", category: "Salad / Side", benefit: "Antioxidant + Low Calorie",
    servings: "4", prepTime: "10 mins", cookTime: "15 mins", calories: "120 kcal", difficulty: "Easy", stars: 4,
    description: "Ang talong ay mayaman sa nasunin at chlorogenic acid — powerful antioxidants na nakakatulong sa inflammation. Mababang calorie pero filling na side dish.",
    easebrewTip: "Ihain ang ensaladang talong kasama ang Easebrew Herbal Coffee bilang light merienda.",
    ingredients: [
      { qty: "4 medium", unit: "", ingredient: "Talong (eggplant)", notes: "ihaw o ilagay sa open flame" },
      { qty: "3 medium", unit: "", ingredient: "Kamatis", notes: "tadtarin ng maliit" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "tadtarin ng maliit" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "i-adjust sa panlasa" },
      { qty: "2 tbsp", unit: "", ingredient: "Suka (cane vinegar)", notes: "" },
      { qty: "3 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin — raw" },
      { qty: "2 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "para sa freshness" },
    ],
    steps: [
      "Ihaw ang talong sa open flame o sa grill hanggang maluto at medyo burned ang balat.",
      "Hayaang lumamig ng 5 minuto. Balatan at i-mash ng tinidor.",
      "Haluin ang kamatis, sibuyas, bawang, at mashed talong sa bowl.",
      "Season ng patis, suka, kalamansi, asin, at pepper.",
      "Tikman at i-adjust ang seasoning. Ihain ng malamig o room temperature.",
    ],
    nutrition: { Calories: "120 kcal", Protein: "4g", Fat: "1g", Carbs: "24g", Antioxidants: "VERY HIGH", "Low Calorie": "EXCELLENT" },
  },
  {
    id: 13, name: "Grilled Tilapia sa Dahon ng Saging", category: "Fish Dish", benefit: "Lean Protein + Omega-3",
    servings: "4", prepTime: "15 mins", cookTime: "20 mins", calories: "240 kcal", difficulty: "Medium", stars: 4,
    description: "Ang tilapia ay lean fish na puno ng protein at omega-3. Ang pagluluto sa dahon ng saging ay nagdadagdag ng natural na lasa at nagpapanatili ng nutrients ng isda.",
    easebrewTip: "Ihain ang grilled tilapia kasama ang Easebrew Herbal Coffee pagkatapos ng trabaho.",
    ingredients: [
      { qty: "4 pcs", unit: "", ingredient: "Tilapia", notes: "medium size, linisin" },
      { qty: "4 sheets", unit: "", ingredient: "Dahon ng saging", notes: "hugasan at i-wilt sa apoy" },
      { qty: "2 inch", unit: "", ingredient: "Luya", notes: "hiwain ng julienne" },
      { qty: "4 cloves", unit: "", ingredient: "Bawang", notes: "durusin" },
      { qty: "2 pcs", unit: "", ingredient: "Kamatis", notes: "hiwain ng bilog" },
      { qty: "2 stalks", unit: "", ingredient: "Lemongrass (tanglad)", notes: "pukpukin at hiwain" },
      { qty: "2 tbsp", unit: "", ingredient: "Soy sauce", notes: "para sa marinade" },
      { qty: "1 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
    ],
    steps: [
      "Marinade ang tilapia sa soy sauce, kalamansi, bawang, asin, at pepper ng 15 minuto.",
      "Ilagay ang luya, kamatis, at tanglad sa loob ng tilapia.",
      "Balutin ang bawat tilapia sa dahon ng saging. Itali ng toothpick o twig.",
      "Ilagay sa grill o ihaw ng 8-10 minuto sa bawat side.",
      "Buksan ang dahon ng saging. Ihain na mainit kasama ang 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "240 kcal", Protein: "34g", Fat: "7g (omega-3)", Carbs: "6g", "Lean Protein": "EXCELLENT", "Omega-3": "GOOD" },
  },
  {
    id: 14, name: "Ginisang Kangkong with Bawang", category: "Gulay Dish", benefit: "Iron + Anti-Inflammation",
    servings: "4", prepTime: "5 mins", cookTime: "10 mins", calories: "110 kcal", difficulty: "Easy", stars: 4,
    description: "Ang kangkong ay isa sa pinakamurang at pinakanutritional na gulay sa Pilipinas. Mayaman ito sa iron, calcium, at Vitamins A at C.",
    easebrewTip: "Ang kangkong dish ay mabilis gawin — perpekto pag may Easebrew Herbal Coffee ka nang naghihintay.",
    ingredients: [
      { qty: "400g", unit: "", ingredient: "Kangkong", notes: "hugasan at hiwain ang stems at dahon" },
      { qty: "5 cloves", unit: "", ingredient: "Bawang", notes: "marami! — tadtarin ng manipis" },
      { qty: "2 tbsp", unit: "", ingredient: "Oyster sauce", notes: "o patis" },
      { qty: "1 tbsp", unit: "", ingredient: "Soy sauce", notes: "" },
      { qty: "2 tbsp", unit: "", ingredient: "Canola oil", notes: "" },
      { qty: "0.25 cup", unit: "", ingredient: "Tubig", notes: "konti lang" },
    ],
    steps: [
      "Painitin ang langis sa kawali sa high heat. Igisa ang bawang hanggang golden at mabango — 1-2 minuto lang.",
      "Idagdag ang kangkong stems muna. Igisa ng 1 minuto.",
      "Idagdag ang dahon ng kangkong. Haluin agad.",
      "Idagdag ang oyster sauce, soy sauce, at konting tubig.",
      "Haluin ng mabilis sa high heat — 2-3 minuto lang. Huwag sobrang luto.",
      "Season ng pepper. Ihain AGAD.",
    ],
    nutrition: { Calories: "110 kcal", Protein: "5g", Fat: "7g", Carbs: "8g", Iron: "VERY HIGH", Calcium: "HIGH", "Vitamins A & C": "HIGH" },
  },
  {
    id: 15, name: "Champorado with Dark Chocolate", category: "Breakfast", benefit: "Antioxidant + Morning Energy",
    servings: "4", prepTime: "5 mins", cookTime: "20 mins", calories: "320 kcal", difficulty: "Easy", stars: 3,
    description: "Ang dark chocolate ay naglalaman ng flavonoids — powerful antioxidants na nakakatulong sa inflammation at cardiovascular health.",
    easebrewTip: "PERFECT DUO: Easebrew Herbal Coffee + Champorado with Dark Chocolate = masustansiya at anti-inflammatory na breakfast!",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Malagkit rice", notes: "hugasan" },
      { qty: "80g", unit: "", ingredient: "Dark chocolate (70%+ cacao)", notes: "o 4 pcs tablea — tadtarin" },
      { qty: "2 tbsp", unit: "", ingredient: "Cocoa powder (unsweetened)", notes: "para sa mas malalim na lasa" },
      { qty: "3 cups", unit: "", ingredient: "Tubig", notes: "" },
      { qty: "2 cups", unit: "", ingredient: "Low-fat milk o gata", notes: "para sa creaminess" },
      { qty: "3 tbsp", unit: "", ingredient: "Asukal (brown sugar)", notes: "i-adjust sa panlasa" },
      { qty: "1 can", unit: "", ingredient: "Evaporated milk (small)", notes: "para sa topping" },
    ],
    steps: [
      "Lutuin ang malagkit rice sa tubig hanggang malapot — 15 minuto sa medium heat. Haluin paminsan-minsan.",
      "Idagdag ang dark chocolate at cocoa powder. Haluin hanggang matunaw.",
      "Ibuhos ang gata o low-fat milk. Haluin ng maigi.",
      "Idagdag ang brown sugar at asin. Lutuin ng 5 minuto pa sa low heat.",
      "Ihain sa bowl. Lagyan ng topping na evaporated milk.",
    ],
    nutrition: { Calories: "320 kcal", Protein: "8g", Fat: "10g", Carbs: "50g", Flavonoids: "HIGH", Antioxidants: "HIGH", Energy: "GOOD" },
  },
  {
    id: 16, name: "Pesang Isda", category: "Fish Dish", benefit: "Lean Protein + Ginger Detox",
    servings: "4", prepTime: "10 mins", cookTime: "20 mins", calories: "230 kcal", difficulty: "Easy", stars: 4,
    description: "Ang pesang isda ay isa sa pinaka-clean at pinaka-healthy na paraan ng pagluluto ng isda. Walang mantika — pinakuluan lang sa ginger-based broth.",
    easebrewTip: "Uminom ng Easebrew Herbal Coffee bago o pagkatapos ng pesang isda para sa double ginger effect.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Isda (bangus, tilapia, o lapu-lapu)", notes: "hiwain" },
      { qty: "2 inch", unit: "", ingredient: "Luya", notes: "hiwain ng julienne — maraming luya!" },
      { qty: "1 head", unit: "", ingredient: "Repolyo", notes: "hiwain ng apat" },
      { qty: "1 bunch", unit: "", ingredient: "Pechay", notes: "o bok choy" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "1L", unit: "", ingredient: "Tubig", notes: "" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "" },
    ],
    steps: [
      "Pakuluan ang tubig. Idagdag ang luya at sibuyas.",
      "Idagdag ang isda. Lutuin ng 8-10 minuto.",
      "Idagdag ang repolyo. Lutuin ng 3 minuto.",
      "Idagdag ang pechay. Lutuin ng 2 minuto pa.",
      "Season ng patis, asin, at pepper. Ihain nang mainit.",
    ],
    nutrition: { Calories: "230 kcal", Protein: "32g", Fat: "5g", Carbs: "12g", "Ginger Content": "HIGH", Detox: "EXCELLENT" },
  },
  {
    id: 17, name: "Ginisang Upo with Hipon", category: "Gulay Dish", benefit: "Hydrating + Low Calorie",
    servings: "4", prepTime: "10 mins", cookTime: "15 mins", calories: "160 kcal", difficulty: "Easy", stars: 3,
    description: "Ang upo (bottle gourd) ay 95% tubig — isa sa pinakahydrating na gulay. Nakakatulong ito sa joint lubrication dahil sa mataas na water content nito.",
    easebrewTip: "Perpektong light dinner ang ginisang upo kasama ang Easebrew Herbal Coffee.",
    ingredients: [
      { qty: "1 large", unit: "", ingredient: "Upo (bottle gourd)", notes: "balakan at hiwain ng cubes" },
      { qty: "200g", unit: "", ingredient: "Hipon (shrimp)", notes: "o pork — optional" },
      { qty: "3 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "1 medium", unit: "", ingredient: "Kamatis", notes: "hiwain" },
      { qty: "1 tbsp", unit: "", ingredient: "Patis", notes: "" },
    ],
    steps: [
      "Igisa ang bawang at sibuyas sa langis.",
      "Idagdag ang kamatis. Igisa ng 2 minuto.",
      "Idagdag ang hipon. Lutuin ng 3 minuto.",
      "Idagdag ang upo at tubig. Takpan at lutuin ng 8 minuto.",
      "Season ng patis at pepper. Ihain na may brown rice.",
    ],
    nutrition: { Calories: "160 kcal", Protein: "14g", Fat: "5g", Carbs: "16g", Hydration: "EXCELLENT", "Low Calorie": "VERY GOOD" },
  },
  {
    id: 18, name: "Turmeric Chicken Adobo", category: "Meat Dish", benefit: "Anti-Inflammation Twist on Adobo",
    servings: "4", prepTime: "15 mins", cookTime: "40 mins", calories: "350 kcal", difficulty: "Easy", stars: 5,
    description: "Ang adobo ay paboritong Pinoy dish — at naging mas healthy at anti-inflammatory kapag dinagdagan ng turmeric. Ang curcumin sa turmeric ay nagpapalakas ng anti-inflammatory effect.",
    easebrewTip: "Ang Easebrew Herbal Coffee pagkatapos ng turmeric adobo ay nagdadagdag pa ng anti-inflammatory layer.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Manok (bone-in pieces)", notes: "legs, thighs, o pork" },
      { qty: "0.5 cup", unit: "", ingredient: "Suka (cane vinegar)", notes: "" },
      { qty: "0.5 cup", unit: "", ingredient: "Soy sauce", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Turmeric powder", notes: "o 1 inch sariwang turmeric" },
      { qty: "6 cloves", unit: "", ingredient: "Bawang", notes: "durusin" },
      { qty: "2 pcs", unit: "", ingredient: "Bay leaf (laurel)", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Black peppercorn", notes: "buong piraso" },
      { qty: "1 tbsp", unit: "", ingredient: "Brown sugar", notes: "para balansein ang asim" },
    ],
    steps: [
      "Igisa ang bawang sa langis hanggang golden.",
      "Idagdag ang manok. Igisa ng 5 minuto.",
      "Idagdag ang turmeric. Haluin — magiging dilaw ang lahat.",
      "Ibuhos ang suka, soy sauce, at tubig. Idagdag ang laurel at peppercorn.",
      "Pakuluan, tapos bawasan sa medium-low heat. Lutuin ng 30 minuto na nakatakip.",
      "Buksan ang takip. Lutuin ng 10 minuto pa para malapot ang sauce. Ihain na may 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "350 kcal", Protein: "38g", Fat: "14g", Carbs: "10g", Curcumin: "HIGH", "Anti-Inflammation": "EXCELLENT" },
  },
  {
    id: 19, name: "Buko at Papaya Salad", category: "Salad / Dessert", benefit: "Enzyme-Rich + Digestive Aid",
    servings: "4", prepTime: "15 mins", cookTime: "0 mins", calories: "160 kcal", difficulty: "Easy", stars: 4,
    description: "Ang papaya ay naglalaman ng papain enzyme na natural na anti-inflammatory at nakakatulong sa digestion at joint pain.",
    easebrewTip: "Ihain ang buko at papaya salad bilang merienda kasama ang Easebrew Herbal Coffee — fresh, enzyme-rich, at herbal na combination!",
    ingredients: [
      { qty: "2 cups", unit: "", ingredient: "Hinog na papaya", notes: "hiwain ng cubes" },
      { qty: "2 cups", unit: "", ingredient: "Buko meat (young coconut)", notes: "hiwain ng strips" },
      { qty: "2 tbsp", unit: "", ingredient: "Buko juice", notes: "para sa dressing" },
      { qty: "2 tbsp", unit: "", ingredient: "Honey", notes: "o brown sugar" },
      { qty: "2 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
      { qty: "0.5 cup", unit: "", ingredient: "Nata de coco", notes: "optional" },
      { qty: "Fresh mint", unit: "", ingredient: "Mint leaves", notes: "para sa topping" },
    ],
    steps: [
      "Pagsamahin ang papaya at buko sa malaking bowl.",
      "Haluin ang buko juice, honey, kalamansi, at asin para sa dressing.",
      "Ibuhos ang dressing sa papaya at buko. Haluin ng maingat.",
      "Idagdag ang nata de coco kung gusto.",
      "Lagyan ng topping na mint leaves. Ihain nang malamig.",
    ],
    nutrition: { Calories: "160 kcal", Protein: "2g", Fat: "5g (MCT)", Carbs: "28g", "Papain Enzyme": "VERY HIGH", Electrolytes: "HIGH" },
  },
  {
    id: 20, name: "Monggo Soup with Ampalaya", category: "Soup / Sabaw", benefit: "Double Anti-Inflammation Power",
    servings: "4", prepTime: "10 mins", cookTime: "45 mins", calories: "240 kcal", difficulty: "Easy", stars: 5,
    description: "Pinagsama ang dalawang super anti-inflammatory na ingredients — monggo at ampalaya. Ultimate anti-inflammation soup.",
    easebrewTip: "Ang Easebrew Herbal Coffee + Monggo with Ampalaya ay ang ultimate anti-inflammation meal combination para sa mga may arthritis at joint pain.",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Monggo (mung beans)", notes: "ibabad ng 2 oras" },
      { qty: "1 medium", unit: "", ingredient: "Ampalaya", notes: "hiwain ng manipis, ibabad sa asin" },
      { qty: "100g", unit: "", ingredient: "Tinapa o dried fish", notes: "panggatong" },
      { qty: "3 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "1 medium", unit: "", ingredient: "Kamatis", notes: "hiwain" },
      { qty: "1L", unit: "", ingredient: "Tubig", notes: "" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "" },
      { qty: "1 inch", unit: "", ingredient: "Luya", notes: "para sa extra anti-inflammation" },
    ],
    steps: [
      "Lutuin ang monggo sa tubig ng 30-35 minuto hanggang malambot.",
      "Igisa ang bawang, sibuyas, luya, at kamatis. Idagdag ang tinapa.",
      "Ibuhos ang lutong monggo.",
      "Idagdag ang ampalaya (na naibabad na sa asin at pinisil). Lutuin ng 5 minuto.",
      "Season ng patis. Ihain na may brown rice.",
    ],
    nutrition: { Calories: "240 kcal", Protein: "16g", Fat: "5g", Carbs: "36g", Fiber: "9g", "Anti-Inflammation": "MAXIMUM", "Blood Sugar": "EXCELLENT" },
  },
  {
    id: 21, name: "Salmon sa Kamatis at Luya", category: "Fish Dish", benefit: "Omega-3 + Lycopene Boost",
    servings: "4", prepTime: "10 mins", cookTime: "20 mins", calories: "330 kcal", difficulty: "Easy", stars: 5,
    description: "Ang lycopene sa kamatis ay nagpapalakas ng anti-inflammatory effect ng omega-3 ng salmon.",
    easebrewTip: "Easebrew Herbal Coffee pagkatapos ng salmon-kamatis dish para sa maximum anti-inflammation combo.",
    ingredients: [
      { qty: "400g", unit: "", ingredient: "Salmon fillet", notes: "hiwain ng 4" },
      { qty: "3 medium", unit: "", ingredient: "Kamatis", notes: "tadtarin" },
      { qty: "2 inch", unit: "", ingredient: "Luya", notes: "julienne" },
      { qty: "4 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "2 tbsp", unit: "", ingredient: "Soy sauce", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Olive oil", notes: "" },
    ],
    steps: [
      "Igisa ang bawang, sibuyas, at luya sa olive oil ng 2 minuto.",
      "Idagdag ang kamatis. Igisa ng 3 minuto hanggang malambot.",
      "Idagdag ang salmon. Season ng soy sauce, kalamansi, asin, pepper.",
      "Lutuin ng 5-7 minuto sa medium heat. Ihawak ang salmon para hindi masira.",
      "Tikman at i-adjust. Ihain na may 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "330 kcal", Protein: "36g", Fat: "14g (omega-3)", Carbs: "10g", Lycopene: "HIGH", "Omega-3": "VERY HIGH" },
  },
  {
    id: 22, name: "Ginisang Repolyo with Carrots", category: "Gulay Dish", benefit: "Gut Health + Antioxidant",
    servings: "4", prepTime: "10 mins", cookTime: "12 mins", calories: "130 kcal", difficulty: "Easy", stars: 4,
    description: "Ang repolyo ay mayaman sa Vitamin K at sulforaphane na nagpoprotekta sa joints. Ang carrots ay nagdadagdag ng beta-carotene.",
    easebrewTip: "Simple at mabilis na side dish na mapagsamahan ng Easebrew Herbal Coffee para sa healthy meal.",
    ingredients: [
      { qty: "0.5 head", unit: "", ingredient: "Repolyo", notes: "hiwain ng manipis" },
      { qty: "2 medium", unit: "", ingredient: "Carrots", notes: "hiwain ng julienne" },
      { qty: "100g", unit: "", ingredient: "Pork (lean) o hipon", notes: "optional" },
      { qty: "4 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "2 tbsp", unit: "", ingredient: "Oyster sauce", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Soy sauce", notes: "" },
    ],
    steps: [
      "Igisa ang bawang at sibuyas sa high heat.",
      "Idagdag ang pork o hipon. Lutuin ng 3 minuto.",
      "Idagdag ang carrots. Igisa ng 2 minuto.",
      "Idagdag ang repolyo, oyster sauce, soy sauce.",
      "Haluin ng mabilis sa high heat ng 3-4 minuto. Ihain agad.",
    ],
    nutrition: { Calories: "130 kcal", Protein: "8g", Fat: "7g", Carbs: "12g", "Beta-Carotene": "HIGH", "Vitamin K": "HIGH" },
  },
  {
    id: 23, name: "Nilagang Manok (Light Broth)", category: "Soup / Sabaw", benefit: "Collagen + Bone Support",
    servings: "4", prepTime: "15 mins", cookTime: "45 mins", calories: "270 kcal", difficulty: "Easy", stars: 4,
    description: "Ang chicken bone broth ay mayaman sa collagen, glucosamine, at chondroitin — lahat ay natural na nagpoprotekta sa joints.",
    easebrewTip: "Ang combination ng chicken bone broth at Easebrew Herbal Coffee ay nagbibigay ng comprehensive joint support.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Manok (bone-in, whole pieces)", notes: "" },
      { qty: "2 medium", unit: "", ingredient: "Kamote", notes: "hiwain" },
      { qty: "2 medium", unit: "", ingredient: "Mais (corn)", notes: "hiwain ng tatlo" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "buong piraso" },
      { qty: "2 pcs", unit: "", ingredient: "Peppercorn", notes: "" },
      { qty: "1.5L", unit: "", ingredient: "Tubig", notes: "" },
      { qty: "200g", unit: "", ingredient: "Repolyo", notes: "hiwain" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "" },
    ],
    steps: [
      "Pakuluan ang manok at tubig. Alisin ang bula.",
      "Idagdag ang sibuyas at peppercorn. Bawasan sa medium heat.",
      "Lutuin ng 35-40 minuto.",
      "Idagdag ang mais at kamote. Lutuin ng 10 minuto.",
      "Idagdag ang repolyo. Lutuin ng 5 minuto. Season ng patis at asin.",
    ],
    nutrition: { Calories: "270 kcal", Protein: "30g", Fat: "7g", Carbs: "22g", Collagen: "HIGH", "Bone Support": "EXCELLENT" },
  },
  {
    id: 24, name: "Steamed Bangus with Ginger", category: "Fish Dish", benefit: "Clean Protein + Detox",
    servings: "4", prepTime: "10 mins", cookTime: "20 mins", calories: "240 kcal", difficulty: "Easy", stars: 4,
    description: "Ang steaming ay isa sa pinakaclean na paraan ng pagluluto — pinapanatili ang lahat ng nutrients. Walang labis na langis.",
    easebrewTip: "Ihain ang steamed bangus kasama ang Easebrew Herbal Coffee — clean eating para sa mas malusog na katawan.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Bangus", notes: "hiwain ng 4 piraso" },
      { qty: "3 inch", unit: "", ingredient: "Luya", notes: "julienne — maraming luya" },
      { qty: "4 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin" },
      { qty: "3 stalks", unit: "", ingredient: "Green onion", notes: "hiwain" },
      { qty: "2 tbsp", unit: "", ingredient: "Soy sauce", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Sesame oil", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
    ],
    steps: [
      "Ilagay ang bangus sa steaming plate. Lagyan ng luya sa ibabaw.",
      "Steam ng 12-15 minuto hanggang maluto ang isda.",
      "Habang nagluluto, haluin ang soy sauce, sesame oil, at kalamansi.",
      "Kapag maluto ang bangus, ibuhos ang sauce sa ibabaw.",
      "Lagyan ng green onion at bawang bilang topping. Ihain agad.",
    ],
    nutrition: { Calories: "240 kcal", Protein: "32g", Fat: "8g (omega-3)", Carbs: "5g", "Clean Protein": "EXCELLENT", "No Added Fat": "YES" },
  },
  {
    id: 25, name: "Ginataang Monggo", category: "Dessert / Merienda", benefit: "Plant Protein + Satisfying",
    servings: "4", prepTime: "10 mins", cookTime: "40 mins", calories: "290 kcal", difficulty: "Easy", stars: 3,
    description: "Ang ginataang monggo ay masustansiya at nakakarelax na dessert. Ang monggo ay nagbibigay ng plant protein at fiber.",
    easebrewTip: "Ihain ang ginataang monggo kasama ang Easebrew Herbal Coffee bilang merienda — satisfying at anti-inflammatory na pair.",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Monggo", notes: "ibabad ng 2 oras" },
      { qty: "1 can (400ml)", unit: "", ingredient: "Gata (coconut milk)", notes: "" },
      { qty: "0.5 cup", unit: "", ingredient: "Asukal (brown sugar)", notes: "i-adjust sa panlasa" },
      { qty: "0.25 tsp", unit: "", ingredient: "Asin", notes: "" },
      { qty: "1 cup", unit: "", ingredient: "Tubig", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Vanilla extract", notes: "optional" },
      { qty: "Sago pearls", unit: "", ingredient: "Sago (cooked)", notes: "optional" },
    ],
    steps: [
      "Lutuin ang monggo sa tubig ng 30 minuto hanggang malambot.",
      "Idagdag ang gata at brown sugar.",
      "Lutuin sa medium-low heat ng 10 minuto pa. Haluin paminsan-minsan.",
      "Idagdag ang asin at vanilla. I-adjust ang tamis.",
      "Idagdag ang sago kung gusto. Ihain nang mainit o malamig.",
    ],
    nutrition: { Calories: "290 kcal", Protein: "10g", Fat: "12g (MCT)", Carbs: "38g", "Plant Protein": "GOOD", Fiber: "HIGH" },
  },
  {
    id: 26, name: "Ginisang Talbos ng Kamote", category: "Gulay Dish", benefit: "Antioxidant Superfood",
    servings: "4", prepTime: "5 mins", cookTime: "10 mins", calories: "100 kcal", difficulty: "Easy", stars: 5,
    description: "Ang talbos ng kamote (sweet potato leaves) ay isa sa pinakanutritional na gulay — mas mataas pa sa Vitamin C kaysa orange! Mayaman sa antioxidants, iron, at anti-inflammatory compounds. At mura pa!",
    easebrewTip: "Ang talbos ng kamote ay perfect kasama ng Easebrew Herbal Coffee — simple meal pero puno ng health benefits.",
    ingredients: [
      { qty: "400g", unit: "", ingredient: "Talbos ng kamote", notes: "hugasan" },
      { qty: "5 cloves", unit: "", ingredient: "Bawang", notes: "marami — tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hiwain" },
      { qty: "2 tbsp", unit: "", ingredient: "Bagoong alamang", notes: "o patis" },
      { qty: "2 tbsp", unit: "", ingredient: "Canola oil", notes: "" },
      { qty: "0.25 cup", unit: "", ingredient: "Tubig", notes: "" },
    ],
    steps: [
      "Igisa ang bawang at sibuyas sa high heat.",
      "Idagdag ang bagoong. Igisa ng 1 minuto.",
      "Idagdag ang talbos ng kamote.",
      "Haluin ng mabilis. Idagdag ang konting tubig.",
      "Lutuin ng 3-4 minuto lang. Huwag sobrang luto. Ihain agad.",
    ],
    nutrition: { Calories: "100 kcal", Protein: "5g", Fat: "6g", Carbs: "8g", "Vitamin C": "VERY HIGH", Iron: "HIGH", Antioxidants: "EXCELLENT" },
  },
  {
    id: 27, name: "Lentil at Malunggay Soup", category: "Soup / Sabaw", benefit: "Iron + Bone Density",
    servings: "4", prepTime: "10 mins", cookTime: "30 mins", calories: "260 kcal", difficulty: "Easy", stars: 4,
    description: "Ang lentil ay puno ng iron, folate, at plant protein. Kapag pinagsama ang lentil at malunggay, nagiging bone-density-boosting powerhouse soup ito.",
    easebrewTip: "Ang Easebrew Herbal Coffee pagkatapos ng lentil-malunggay soup ay nagkukumpleto ng wellness routine.",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Red lentils", notes: "hugasan" },
      { qty: "1.5 cups", unit: "", ingredient: "Malunggay leaves", notes: "sariwa" },
      { qty: "3 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "tadtarin" },
      { qty: "1 medium", unit: "", ingredient: "Kamatis", notes: "tadtarin" },
      { qty: "1L", unit: "", ingredient: "Vegetable broth o tubig", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Turmeric powder", notes: "para sa extra anti-inflammation" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "o asin" },
      { qty: "0.5 tsp", unit: "", ingredient: "Cumin", notes: "optional" },
    ],
    steps: [
      "Igisa ang bawang, sibuyas, at kamatis sa olive oil ng 3 minuto.",
      "Idagdag ang turmeric at cumin. Igisa ng 30 segundo.",
      "Idagdag ang lentils at broth. Pakuluan.",
      "Bawasan sa medium heat. Lutuin ng 20-25 minuto hanggang malambot ang lentils.",
      "Season ng patis. I-off ang apoy. Idagdag ang malunggay. Ihain agad.",
    ],
    nutrition: { Calories: "260 kcal", Protein: "18g", Fat: "4g", Carbs: "38g", Iron: "VERY HIGH", Folate: "HIGH", "Bone Density": "EXCELLENT" },
  },
  {
    id: 28, name: "Baked Tilapia with Herbs", category: "Fish Dish", benefit: "Lean Protein + Low Fat",
    servings: "4", prepTime: "15 mins", cookTime: "25 mins", calories: "220 kcal", difficulty: "Easy", stars: 4,
    description: "Ang baked fish ay mas healthy kaysa pritong isda. Ang herbs tulad ng rosemary at oregano ay nagdadagdag ng anti-inflammatory compounds.",
    easebrewTip: "Ihain ang baked tilapia kasama ang Easebrew Herbal Coffee — healthy dinner na parang nasa restaurant!",
    ingredients: [
      { qty: "4 medium", unit: "", ingredient: "Tilapia", notes: "linisin" },
      { qty: "3 cloves", unit: "", ingredient: "Bawang", notes: "tadtarin" },
      { qty: "2 tbsp", unit: "", ingredient: "Olive oil", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Oregano (dried)", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Rosemary (dried)", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Paprika", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Asin", notes: "" },
    ],
    steps: [
      "Ihanda ang oven — pre-heat sa 200°C o 400°F.",
      "Haluin ang olive oil, bawang, kalamansi, at lahat ng spices.",
      "I-coat ang tilapia sa herb mixture.",
      "Ilagay sa baking pan na may kamatis at sibuyas sa paligid.",
      "I-bake ng 20-25 minuto hanggang golden at maluto. Ihain agad.",
    ],
    nutrition: { Calories: "220 kcal", Protein: "32g", Fat: "8g", Carbs: "4g", "Lean Protein": "EXCELLENT", "Herbs Anti-Inflam": "HIGH" },
  },
  {
    id: 29, name: "Pork Sinigang (Lean Cuts)", category: "Soup / Sabaw", benefit: "Vitamin C + Joint Support",
    servings: "4", prepTime: "15 mins", cookTime: "45 mins", calories: "350 kcal", difficulty: "Medium", stars: 4,
    description: "Ang sinigang na baboy ay masustansiya kapag ginagamit ang lean cuts. Ang sampalok ay nagbibigay ng Vitamin C na mahalaga sa collagen production para sa joint health.",
    easebrewTip: "Ang Easebrew Herbal Coffee pagkatapos ng sinigang ay nagdadagdag ng herbal warmth at anti-inflammatory boost.",
    ingredients: [
      { qty: "500g", unit: "", ingredient: "Pork kasim o loin (lean)", notes: "hiwain ng 2-inch" },
      { qty: "1 pack (40g)", unit: "", ingredient: "Sinigang mix (sampalok)", notes: "o 4 pcs sariwang sampalok" },
      { qty: "1.5L", unit: "", ingredient: "Tubig", notes: "" },
      { qty: "1 medium", unit: "", ingredient: "Labanos", notes: "hiwain ng bilog" },
      { qty: "200g", unit: "", ingredient: "Kangkong", notes: "hiwain" },
      { qty: "100g", unit: "", ingredient: "Sitaw", notes: "hiwain ng 2-inch" },
      { qty: "2 medium", unit: "", ingredient: "Kamatis", notes: "hati ng apat" },
      { qty: "1 medium", unit: "", ingredient: "Sibuyas", notes: "hati ng apat" },
      { qty: "2 pcs", unit: "", ingredient: "Siling haba", notes: "buong piraso" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "" },
    ],
    steps: [
      "Pakuluan ang tubig. Idagdag ang baboy at alisin ang bula.",
      "Idagdag ang sibuyas at kamatis. Lutuin ng 30 minuto.",
      "Idagdag ang sinigang mix at labanos. Lutuin ng 8 minuto.",
      "Idagdag ang sitaw at siling haba. Lutuin ng 3 minuto.",
      "Idagdag ang kangkong. Season ng patis. Lutuin ng 2 minuto. Ihain agad.",
    ],
    nutrition: { Calories: "350 kcal", Protein: "38g", Fat: "12g", Carbs: "18g", "Vitamin C": "VERY HIGH", "Collagen Support": "HIGH" },
  },
  {
    id: 30, name: "Anti-Inflammation Power Bowl", category: "Power Bowl", benefit: "COMPLETE Anti-Inflammation Meal",
    servings: "4", prepTime: "20 mins", cookTime: "30 mins", calories: "420 kcal", difficulty: "Medium", stars: 5,
    description: "Pinagsama ang pinakamabuting anti-inflammatory ingredients — brown rice, salmon, malunggay, turmeric, at ginger. Pinaka-complete na anti-inflammatory meal.",
    easebrewTip: "CELEBRATION MEAL: Easebrew Herbal Coffee + Anti-Inflammation Power Bowl = ang pinaka-anti-inflammatory na meal combo sa buong recipe book!",
    ingredients: [
      { qty: "1.5 cups", unit: "", ingredient: "Brown rice (cooked)", notes: "3/4 cup per person" },
      { qty: "300g", unit: "", ingredient: "Salmon fillet", notes: "grilled o baked" },
      { qty: "1 cup", unit: "", ingredient: "Malunggay leaves", notes: "blanched" },
      { qty: "1 medium", unit: "", ingredient: "Avocado", notes: "hiwain — kung available" },
      { qty: "1 medium", unit: "", ingredient: "Kamatis", notes: "tadtarin" },
      { qty: "1 cup", unit: "", ingredient: "Edamame o sitaw", notes: "blanched" },
      { qty: "2 tbsp", unit: "", ingredient: "Olive oil", notes: "para sa dressing" },
      { qty: "1 tbsp", unit: "", ingredient: "Soy sauce", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Turmeric powder", notes: "para sa dressing" },
      { qty: "0.5 inch", unit: "", ingredient: "Luya", notes: "grated — para sa dressing" },
      { qty: "1 tbsp", unit: "", ingredient: "Sesame seeds", notes: "para sa topping" },
    ],
    steps: [
      "Ihanda ang brown rice. Grilled o baked ang salmon — season ng asin, pepper, at kalamansi.",
      "I-blanch ang malunggay at edamame/sitaw ng 2 minuto sa mainit na tubig.",
      "Haluin ang olive oil, soy sauce, kalamansi, turmeric, at luya para sa dressing.",
      "I-assemble ang bowl: brown rice base, salmon sa gitna, at mga gulay sa paligid.",
      "Ibuhos ang turmeric-ginger dressing. Lagyan ng sesame seeds bilang topping.",
      "Ihain agad. Bawat kutsara ay may balanced nutrition na anti-inflammatory!",
    ],
    nutrition: { Calories: "420 kcal", Protein: "40g", Fat: "18g (healthy)", Carbs: "32g", "Anti-Inflammation": "MAXIMUM", "Complete Nutrition": "EXCELLENT" },
  },
];

const ALL_CATEGORIES = ["All", "❤️ Favorites", ...Array.from(new Set(RECIPES.map(r => r.category)))];

export default function RecipesPage() {
  const { checking, session } = useSessionGuard();
  const favoritesStorageKey = progressStorageKey("easebrew-recipe-favorites", session?.code);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // ✅ PALITAN NG — localStorage muna (instant), tapos cloud override
useEffect(() => {
  if (checking || !session) return;
  async function load() {
    // Local cache muna — instant display
    try {
      setFavorites(readProgressCache<number[]>(favoritesStorageKey, []));
    } catch {}

    // Cloud sync — source of truth
    try {
      const res = await fetch(`/api/progress?type=recipe_favorites`);
      const json = await res.json();
      if (res.ok && json.data?.favorites) {
        setFavorites(json.data.favorites);
        writeProgressCache(favoritesStorageKey, json.data.favorites);
      }
    } catch {}
  }
  load();
}, [checking, favoritesStorageKey, session]);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, margin: "0 0 12px 0" }}>🍽️</p>
        <p style={{ fontSize: 22, color: G, fontWeight: 700 }}>Loading Recipes...</p>
      </div>
    </div>
  );

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(updated);
    writeProgressCache(favoritesStorageKey, updated);
  
    // Cloud sync — same pattern ng ibang pages
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "recipe_favorites", data: { favorites: updated } }),
    }).catch(() => {}); // Silent fail OK — may localStorage backup naman
  };

  const filtered = RECIPES.filter(r => {
    const matchCat =
      selectedCategory === "All" ? true :
      selectedCategory === "❤️ Favorites" ? favorites.includes(r.id) :
      r.category === selectedCategory;
    const matchSearch = search === "" ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.benefit.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="customer-shell" style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 110 }}>

      {/* ── HEADER ── */}
      <div style={{ background: G, color: "#fff" }}>
        {/* Hero image */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
          <Image src="/images/meal-banner.jpg" alt="Filipino Recipes" fill style={{ objectFit: "cover", objectPosition: "center" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} priority />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(24,59,40,0.1) 0%, rgba(24,59,40,0.80) 100%)" }} />
          <div style={{ position: "absolute", bottom: 16, left: 20, right: 80 }}>
            <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 999, padding: "4px 14px", fontSize: 12, fontWeight: 900, letterSpacing: 1, marginBottom: 6 }}>
              🍽️ RECIPE BOOK
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: "#fff", lineHeight: 1.2, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>Pinoy Anti-Inflammation<br />Recipes</h1>
          </div>
          <div style={{ position: "absolute", bottom: 16, right: 20, textAlign: "center", background: "rgba(0,0,0,0.45)", borderRadius: 14, padding: "10px 14px", backdropFilter: "blur(4px)" }}>
            <p style={{ fontSize: 26, fontWeight: 900, margin: 0, color: GOLD }}>{favorites.length}</p>
            <p style={{ fontSize: 13, margin: 0, color: "rgba(255,255,255,0.85)" }}>favorites</p>
          </div>
        </div>
        <div style={{ padding: "16px 24px 24px" }}>
        <Link href="/" style={{ color: GOLD, fontSize: 18, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", minHeight: 44, marginBottom: 16 }}>
          ← Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <p style={{ fontSize: 16, opacity: 0.85, margin: 0 }}>30 Masustansiyang Lutong Pilipino</p>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ marginTop: 16 }}>
          <input
            type="text"
            placeholder="🔍  Hanapin ang recipe..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "14px 18px", borderRadius: 14, border: "none",
              fontSize: 17, background: "rgba(255,255,255,0.97)", color: DARK,
              boxSizing: "border-box",
            }}
          />
        </div>
        </div>{/* /inner padding */}
      </div>

      {/* ── DAILY TIP STRIP ── */}
      <div style={{ background: GOLD, padding: "12px 20px", display: "flex", gap: 20, overflowX: "auto" }}>
        {[
          { icon: "☕", text: "Easebrew 30 mins bago kumain" },
          { icon: "💧", text: "8+ glasses tubig araw-araw" },
          { icon: "🫚", text: "Brown rice bilang base" },
        ].map((tip, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 20 }}>{tip.icon}</span>
            <span style={{ fontSize: 16, color: G, fontWeight: 700, whiteSpace: "nowrap" }}>{tip.text}</span>
          </div>
        ))}
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {ALL_CATEGORIES.map(cat => {
            const raw = cat.replace("❤️ ", "");
            const info = CATEGORY_COLORS[raw];
            const isActive = selectedCategory === cat;
            return (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                padding: "12px 16px", borderRadius: 22, flexShrink: 0,
                minHeight: 48,
                border: isActive ? `2px solid ${G}` : "2px solid #C5B99A",
                background: isActive ? G : "#FFFFFB",
                color: isActive ? "#fff" : MID,
                fontSize: 16, fontWeight: isActive ? 700 : 500, cursor: "pointer",
                whiteSpace: "nowrap",
              }}>
                {info ? `${info.icon} ` : ""}{cat}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 16, color: MID, margin: "12px 0 0 0", fontWeight: 600 }}>
          {filtered.length} recipe{filtered.length !== 1 ? "s" : ""} ang nahanap
        </p>
      </div>

      {/* ── RECIPE CARDS ── */}
      <div style={{ padding: "16px 20px 0" }}>
        {filtered.map(recipe => {
          const isExpanded = expandedRecipe === recipe.id;
          const isFav = favorites.includes(recipe.id);
          const catInfo = CATEGORY_COLORS[recipe.category] || { bg: CREAM, color: G, icon: "🍴" };

          const recipePhotoMap: Record<number, string> = {
            1: "/images/recipe-sinigang.jpg",
            2: "/images/recipe-tinola.jpg",
            5: "/images/recipe-lugaw.jpg",
          };
          const recipePhoto = recipePhotoMap[recipe.id];

          return (
            <div key={recipe.id} style={{ marginBottom: 16 }}>
              <div
                onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                style={{
                  background: "#FFFFFB",
                  border: `2px solid ${isFav ? AMBER : "#C5B99A"}`,
                  borderRadius: 18, overflow: "hidden", cursor: "pointer",
                  boxShadow: isFav ? `0 4px 16px rgba(192,134,59,0.2)` : "0 2px 8px rgba(27,32,26,0.06)",
                }}
              >
                {/* Recipe photo for featured recipes */}
                {recipePhoto && (
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
                    <Image src={recipePhoto} alt={recipe.name} fill style={{ objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div style={{ position: "absolute", top: 10, left: 10, background: catInfo.color, borderRadius: 8, padding: "3px 10px" }}>
                      <span style={{ fontSize: 12, color: "#fff", fontWeight: 900 }}>{recipe.benefit}</span>
                    </div>
                    {isFav && (
                      <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "3px 10px" }}>
                        <span style={{ fontSize: 14 }}>❤️</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Card Header */}
                <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                    <div style={{
                      width: 58, height: 58, borderRadius: 14,
                      background: catInfo.bg, display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0, fontSize: 28,
                      border: `2px solid ${catInfo.color}`,
                    }}>
                      {catInfo.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "0 0 4px 0", lineHeight: 1.3 }}>
                        #{recipe.id} {recipe.name}
                      </p>
                      <p style={{ fontSize: 16, color: MID, margin: 0 }}>
                        {"⭐".repeat(recipe.stars)} · {recipe.calories}
                      </p>
                    </div>
                  </div>
                  <button onClick={e => toggleFavorite(recipe.id, e)} style={{
                    background: "none", border: "none", fontSize: 30,
                    cursor: "pointer", flexShrink: 0,
                    width: 48, height: 48,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isFav ? "❤️" : "🤍"}
                  </button>
                </div>

                {/* Badges */}
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ background: catInfo.bg, color: catInfo.color, borderRadius: 20, padding: "6px 14px", fontSize: 16, fontWeight: 700, border: `1px solid ${catInfo.color}` }}>
                    {catInfo.icon} {recipe.category}
                  </span>
                  <span style={{ background: "#E8F5E0", color: G, borderRadius: 20, padding: "6px 14px", fontSize: 16, fontWeight: 600 }}>
                    🌿 {recipe.benefit}
                  </span>
                  <span style={{ background: "#FFFBF0", color: AMBER, borderRadius: 20, padding: "6px 14px", fontSize: 16 }}>
                    ⏱ {recipe.prepTime} + {recipe.cookTime}
                  </span>
                </div>

                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <span style={{ fontSize: 16, color: MID, fontWeight: 600 }}>
                    {isExpanded ? "▲ I-collapse" : "▼ Tingnan ang recipe"}
                  </span>
                </div>

                {/* ── EXPANDED CONTENT ── */}
                {isExpanded && (
                  <div style={{ marginTop: 16, borderTop: `2px solid ${CREAM}`, paddingTop: 16 }}>

                    <p style={{ fontSize: 16, color: MID, lineHeight: 1.7, margin: "0 0 16px 0" }}>
                      📝 {recipe.description}
                    </p>

                    {/* Easebrew Tip */}
                    <div style={{ background: "#FFFBF0", border: `2px solid ${GOLD}`, borderRadius: 14, padding: "14px 18px", marginBottom: 16 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: AMBER, margin: "0 0 6px 0" }}>☕ Easebrew Tip</p>
                      <p style={{ fontSize: 16, color: DARK, margin: 0, lineHeight: 1.6 }}>{recipe.easebrewTip}</p>
                    </div>

                    {/* Quick Info — 4 tiles */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                      {[
                        { label: "Servings", value: recipe.servings + " pax" },
                        { label: "Prep",     value: recipe.prepTime },
                        { label: "Luto",     value: recipe.cookTime },
                        { label: "Hirap",    value: recipe.difficulty },
                      ].map((info, i) => (
                        <div key={i} style={{ background: CREAM, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                          <p style={{ fontSize: 16, color: MID, margin: "0 0 4px 0" }}>{info.label}</p>
                          <p style={{ fontSize: 16, fontWeight: 700, color: G, margin: 0 }}>{info.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Ingredients */}
                    <div style={{ background: "#E8F5E0", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: G, margin: "0 0 12px 0" }}>🥬 Mga Sangkap</p>
                      {recipe.ingredients.map((ing, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                          paddingBottom: 10, borderBottom: i < recipe.ingredients.length - 1 ? `1px solid rgba(57,97,59,0.15)` : "none",
                          marginBottom: 10,
                        }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: AMBER, minWidth: 70, flexShrink: 0 }}>{ing.qty}</span>
                            <span style={{ fontSize: 16, color: DARK, lineHeight: 1.4 }}>{ing.ingredient}</span>
                          </div>
                          {ing.notes && (
                            <span style={{ fontSize: 16, color: MID, textAlign: "right", marginLeft: 8, maxWidth: "42%", flexShrink: 0, lineHeight: 1.4 }}>
                              — {ing.notes}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Steps */}
                    <div style={{ background: "#FFFFFB", border: `2px solid ${AMBER}`, borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: AMBER, margin: "0 0 14px 0" }}>👨‍🍳 Paano Lutuin</p>
                      {recipe.steps.map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%", background: G,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: 16, fontWeight: 700, flexShrink: 0, marginTop: 1,
                          }}>
                            {i + 1}
                          </div>
                          <p style={{ fontSize: 16, color: DARK, margin: 0, lineHeight: 1.6 }}>{step}</p>
                        </div>
                      ))}
                    </div>

                    {/* Nutrition */}
                    <div style={{ background: CREAM, borderRadius: 14, padding: "16px 18px" }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: G, margin: "0 0 12px 0" }}>📊 Nutrition (per serving)</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {Object.entries(recipe.nutrition).map(([key, val]) => {
                          const hl = NUTRITION_HIGHLIGHT[val];
                          return (
                            <div key={key} style={{
                              background: hl ? `${hl}18` : "#fff",
                              border: `1.5px solid ${hl || "#ddd"}`,
                              borderRadius: 10, padding: "8px 14px",
                              display: "flex", flexDirection: "column", alignItems: "center",
                            }}>
                              <span style={{ fontSize: 16, color: MID }}>{key}</span>
                              <span style={{ fontSize: 16, fontWeight: 700, color: hl || DARK }}>{val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
                </div>{/* /inner padding */}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: MID }}>
            <p style={{ fontSize: 48, margin: "0 0 14px 0" }}>🔍</p>
            <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px 0" }}>Walang nahanap</p>
            <p style={{ fontSize: 16 }}>Subukan ng ibang search o category</p>
          </div>
        )}
      </div>

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
          textDecoration: "none", minHeight: 52,
          display: "flex", alignItems: "center",
        }}>
          🏠 Bumalik sa Hub
        </Link>
      </div>

    </div>
  );
}
