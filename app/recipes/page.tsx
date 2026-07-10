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
    description: "Sinigang na salmon is a hearty Filipino favorite. Salmon is rich in omega-3 fatty acids, a nutrient commonly associated with heart and joint wellness.",
    easebrewTip: "Drink Easebrew Herbal Coffee 30 minutes before eating to boost the effect of salmon's anti-inflammatory ingredients.",
    ingredients: [
      { qty: "400g", unit: "", ingredient: "Salmon fillet", notes: "cut into 4 pieces" },
      { qty: "2L", unit: "", ingredient: "Water", notes: "for the broth" },
      { qty: "1 pack 40g", unit: "", ingredient: "Sinigang mix (tamarind)", notes: "or 3 pcs fresh tamarind" },
      { qty: "2 medium", unit: "", ingredient: "Kamatis", notes: "quartered" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "quartered" },
      { qty: "200g", unit: "", ingredient: "Kangkong", notes: "sliced" },
      { qty: "100g", unit: "", ingredient: "String beans", notes: "cut into 2-inch pieces" },
      { qty: "1 medium", unit: "", ingredient: "Radish", notes: "sliced into rounds" },
      { qty: "2 pcs", unit: "", ingredient: "Long green chili", notes: "left whole" },
      { qty: "1.5 tsp", unit: "", ingredient: "Patis (fish sauce)", notes: "adjust to taste" },
    ],
    steps: [
      "Boil the water in a large pot over medium-high heat. Add the onion and kamatis.",
      "Once boiling, add the radish. Cook for 5 minutes until slightly softened.",
      "Add the sinigang mix. Stir well. Taste — it should be slightly sour.",
      "Add the salmon fillet and string beans. Cook for 5-7 minutes over medium heat.",
      "Add the kangkong and long green chili. Cook for 2 more minutes.",
      "Season with patis. Don't overcook the fish so it doesn't dry out.",
      "Serve hot with 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "320 kcal", Protein: "35g", Fat: "12g", Carbs: "18g", Fiber: "4g", "Omega-3": "HIGH", "Vitamin C": "HIGH" },
  },
  {
    id: 2, name: "Ginisang Ampalaya with Egg", category: "Gulay Dish", benefit: "Blood Sugar + Anti-Inflammation",
    servings: "4", prepTime: "10 mins", cookTime: "15 mins", calories: "180 kcal", difficulty: "Easy", stars: 5,
    description: "Ampalaya is one of the most powerful anti-inflammatory vegetables in the Philippines. It helps regulate blood sugar and has compounds that fight inflammation.",
    easebrewTip: "After eating, drink Easebrew Herbal Coffee to improve digestion and boost the herbal benefits.",
    ingredients: [
      { qty: "2 medium", unit: "", ingredient: "Ampalaya (bitter melon)", notes: "sliced thin, seeds removed" },
      { qty: "3 large", unit: "", ingredient: "Eggs", notes: "beaten" },
      { qty: "100g", unit: "", ingredient: "Pork (lean)", notes: "or shrimp — optional" },
      { qty: "3 cloves", unit: "", ingredient: "Garlic", notes: "crushed and minced" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "1 medium", unit: "", ingredient: "Kamatis", notes: "sliced" },
      { qty: "2 tbsp", unit: "", ingredient: "Canola oil", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Salt", notes: "for soaking the ampalaya" },
      { qty: "0.5 tsp", unit: "", ingredient: "Patis", notes: "adjust to taste" },
    ],
    steps: [
      "Soak the ampalaya in salted water for 10 minutes to reduce bitterness. Squeeze and drain.",
      "Heat oil in a pan over medium heat. Sauté the garlic until golden.",
      "Add the onion and kamatis. Sauté for 2 minutes.",
      "Add the pork (if using). Cook until done.",
      "Add the ampalaya. Sauté for 3-4 minutes over medium-high heat.",
      "Pour in the beaten eggs. Stir gently. Cook until the eggs are set.",
      "Season with patis and pepper. Serve with 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "180 kcal", Protein: "12g", Fat: "10g", Carbs: "10g", Fiber: "3g", Iron: "HIGH", "Blood Sugar Control": "EXCELLENT" },
  },
  {
    id: 3, name: "Tinolang Manok with Malunggay", category: "Soup / Sabaw", benefit: "Immune Boost + Joint Support",
    servings: "4", prepTime: "15 mins", cookTime: "35 mins", calories: "290 kcal", difficulty: "Easy", stars: 5,
    description: "Tinola is one of the most iconic Filipino dishes full of wellness benefits. Malunggay is a superfood full of calcium, iron, and anti-inflammatory compounds.",
    easebrewTip: "Drink Easebrew Herbal Coffee every morning before breakfast. The combination of herbal coffee and malunggay strengthens the immune system.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Chicken (bone-in pieces)", notes: "thighs or drumsticks work" },
      { qty: "2 cups", unit: "", ingredient: "Malunggay leaves", notes: "or 1 pack frozen malunggay" },
      { qty: "1 medium", unit: "", ingredient: "Green papaya (unripe)", notes: "cut into wedges" },
      { qty: "2 inch", unit: "", ingredient: "Luya (ginger)", notes: "julienned" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "4 cloves", unit: "", ingredient: "Garlic", notes: "crushed" },
      { qty: "1.5L", unit: "", ingredient: "Water or chicken broth", notes: "" },
      { qty: "2 pcs", unit: "", ingredient: "Long green chili", notes: "left whole" },
      { qty: "1.5 tbsp", unit: "", ingredient: "Patis", notes: "adjust to taste" },
    ],
    steps: [
      "Heat oil in a large pot. Sauté the garlic and onion for 2 minutes.",
      "Add the ginger. Sauté for 1 minute until fragrant.",
      "Add the chicken. Sauté for 5 minutes until the skin is slightly golden.",
      "Pour in the water or broth. Bring to a boil, then reduce to medium heat.",
      "Cook for 20 minutes until the chicken is done.",
      "Add the papaya. Cook for 5 minutes.",
      "Add the long green chili and patis. Cook for 2 more minutes.",
      "Turn off the heat. Add the malunggay. Stir. Serve immediately.",
    ],
    nutrition: { Calories: "290 kcal", Protein: "32g", Fat: "9g", Carbs: "15g", Calcium: "HIGH", Iron: "HIGH", "Anti-Inflammation": "EXCELLENT" },
  },
  {
    id: 4, name: "Monggo with Malunggay & Ginger", category: "Gulay Dish", benefit: "Anti-Inflammation + Plant Protein",
    servings: "4", prepTime: "10 mins", cookTime: "40 mins", calories: "250 kcal", difficulty: "Easy", stars: 4,
    description: "Monggo is full of plant-based protein and fiber. When combined with malunggay and ginger, its anti-inflammatory effect becomes even more powerful.",
    easebrewTip: "Easebrew Herbal Coffee is a perfect pairing with monggo at breakfast or lunch — double the herbal benefits for the body.",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Monggo (mung beans)", notes: "washed and soaked for 2 hours" },
      { qty: "1.5 cups", unit: "", ingredient: "Malunggay leaves", notes: "fresh" },
      { qty: "1 inch", unit: "", ingredient: "Ginger", notes: "julienned" },
      { qty: "3 cloves", unit: "", ingredient: "Garlic", notes: "minced" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "100g", unit: "", ingredient: "Smoked fish or fried fish", notes: "optional" },
      { qty: "1L", unit: "", ingredient: "Water", notes: "" },
      { qty: "1.5 tbsp", unit: "", ingredient: "Patis", notes: "or salt" },
    ],
    steps: [
      "Cook the monggo in water until soft — about 30-35 minutes over medium heat.",
      "In another pan, sauté the garlic, onion, and ginger in oil until fragrant.",
      "Add the smoked fish or fish (if using). Sauté for 2 minutes.",
      "Pour the cooked monggo into the pan. Mix well.",
      "Add the malunggay. Cook for 3 more minutes over medium heat.",
      "Season with patis and pepper. Taste and adjust.",
      "Serve with 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "250 kcal", Protein: "18g", Fat: "5g", Carbs: "38g", Fiber: "8g", Iron: "HIGH", "Plant Protein": "EXCELLENT" },
  },
  {
    id: 5, name: "Nilagang Baka (Lean Cuts)", category: "Meat Dish", benefit: "Collagen + Bone & Joint Health",
    servings: "4", prepTime: "15 mins", cookTime: "90 mins", calories: "380 kcal", difficulty: "Medium", stars: 4,
    description: "Nilagang baka made with lean cuts provides natural collagen that helps with joint lubrication. Its bone broth is rich in minerals that strengthen bones.",
    easebrewTip: "For better joint support, drink Easebrew Herbal Coffee after eating nilagang baka.",
    ingredients: [
      { qty: "500g", unit: "", ingredient: "Beef shank or brisket (lean)", notes: "cut into 2-inch pieces" },
      { qty: "1 medium", unit: "", ingredient: "Sweet potato", notes: "cut into large pieces" },
      { qty: "200g", unit: "", ingredient: "Cabbage", notes: "cut in half" },
      { qty: "2 medium", unit: "", ingredient: "Corn", notes: "cut into three" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "left whole" },
      { qty: "1 medium", unit: "", ingredient: "Radish", notes: "sliced into rounds" },
      { qty: "1.5L", unit: "", ingredient: "Water", notes: "" },
      { qty: "2 pcs", unit: "", ingredient: "Peppercorn", notes: "left whole" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "adjust to taste" },
    ],
    steps: [
      "In a large pot, place the beef and water. Bring to a boil over high heat. Remove the scum on the surface.",
      "Add the onion and peppercorn. Reduce to low-medium heat.",
      "Cook for 60-75 minutes until the meat is tender. (Faster in a pressure cooker — 30 minutes.)",
      "Add the corn and sweet potato. Cook for 10 minutes.",
      "Add the radish and cabbage. Cook for 5-7 more minutes.",
      "Season with patis and salt. Taste.",
      "Serve hot with 3/4 cup brown rice and patis-kalamansi dipping sauce.",
    ],
    nutrition: { Calories: "380 kcal", Protein: "42g", Fat: "11g", Carbs: "28g", Collagen: "HIGH", Minerals: "HIGH", "Joint Support": "EXCELLENT" },
  },
  {
    id: 6, name: "Pinakbet with Bagoong", category: "Gulay Dish", benefit: "Antioxidant Powerhouse",
    servings: "4", prepTime: "20 mins", cookTime: "25 mins", calories: "210 kcal", difficulty: "Medium", stars: 5,
    description: "Pinakbet is one of the most nutrient-dense Filipino dishes. It contains a variety of vegetables rich in antioxidants — ampalaya, squash, kamatis, and okra.",
    easebrewTip: "Easebrew Herbal Coffee is a great drink before pinakbet to boost the herbal properties of the vegetables.",
    ingredients: [
      { qty: "200g", unit: "", ingredient: "Ampalaya", notes: "sliced thin" },
      { qty: "200g", unit: "", ingredient: "Squash", notes: "cut into cubes" },
      { qty: "150g", unit: "", ingredient: "Okra", notes: "cut in half" },
      { qty: "150g", unit: "", ingredient: "Eggplant", notes: "cut into wedges" },
      { qty: "100g", unit: "", ingredient: "String beans", notes: "cut into 2-inch pieces" },
      { qty: "100g", unit: "", ingredient: "Kamatis", notes: "cut in half" },
      { qty: "3 cloves", unit: "", ingredient: "Garlic", notes: "minced" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "2 tbsp", unit: "", ingredient: "Bagoong alamang", notes: "or shrimp paste" },
      { qty: "100g", unit: "", ingredient: "Pork belly (thin sliced)", notes: "or shrimp — optional" },
    ],
    steps: [
      "Heat the oil. Sauté the garlic and onion. Add the pork, cook for 3 minutes.",
      "Add the kamatis and bagoong. Sauté for 2 minutes until fragrant.",
      "Add the squash. Add a little water. Cover and cook for 5 minutes.",
      "Add the eggplant and okra. Stir gently.",
      "Add the string beans and ampalaya. Cook for 5-7 more minutes over medium heat.",
      "Don't overcook the vegetables — they should still have some crunch. Taste and adjust.",
      "Serve with 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "210 kcal", Protein: "14g", Fat: "8g", Carbs: "24g", Fiber: "7g", Antioxidants: "VERY HIGH", Vitamins: "EXCELLENT" },
  },
  {
    id: 7, name: "Arroz Caldo with Ginger & Bawang", category: "Lugaw / Porridge", benefit: "Anti-Inflammation + Gut Warmth",
    servings: "4", prepTime: "10 mins", cookTime: "40 mins", calories: "310 kcal", difficulty: "Easy", stars: 5,
    description: "Arroz caldo is a beloved Filipino comfort dish. Ginger is a traditional Pinoy ingredient often used for its warming and wellness-supporting properties.",
    easebrewTip: "BEST PAIRING: Easebrew Herbal Coffee with arroz caldo — perfect Filipino morning routine.",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Sticky rice or regular rice", notes: "washed" },
      { qty: "400g", unit: "", ingredient: "Chicken (bone-in)", notes: "cut into small pieces" },
      { qty: "3 inch", unit: "", ingredient: "Luya (ginger)", notes: "julienned — don't skimp!" },
      { qty: "6 cloves", unit: "", ingredient: "Garlic", notes: "3 minced, 3 fried for topping" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "minced" },
      { qty: "1.5L", unit: "", ingredient: "Chicken broth or water", notes: "" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "adjust to taste" },
      { qty: "3 stalks", unit: "", ingredient: "Green onion", notes: "for topping" },
    ],
    steps: [
      "Fry the 3 cloves of garlic in oil until golden brown. Remove and set aside for topping.",
      "In the same pan, sauté the 3 cloves of minced garlic, onion, and ginger for 3 minutes.",
      "Add the chicken. Sauté for 5 minutes until partially cooked.",
      "Add the washed rice. Mix well for 2 minutes.",
      "Pour in the broth or water. Bring to a boil, then reduce to medium-low heat.",
      "Cook for 25-30 minutes, stirring occasionally, until the porridge thickens.",
      "Season with patis and pepper. Serve topped with fried garlic and green onion.",
    ],
    nutrition: { Calories: "310 kcal", Protein: "28g", Fat: "8g", Carbs: "32g", "Ginger Content": "HIGH", "Immune Support": "EXCELLENT", "Gut Health": "GOOD" },
  },
  {
    id: 8, name: "Paksiw na Bangus", category: "Fish Dish", benefit: "Omega-3 + Low-Fat Cooking",
    servings: "4", prepTime: "10 mins", cookTime: "25 mins", calories: "260 kcal", difficulty: "Easy", stars: 4,
    description: "Paksiw is one of the healthiest ways to cook fish — no excess oil. Bangus is rich in omega-3 fatty acids and protein for muscle repair.",
    easebrewTip: "Enjoy Easebrew Herbal Coffee alongside or after paksiw — perfect Pinoy pairing.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Bangus (milkfish)", notes: "cut into 4 pieces" },
      { qty: "1 cup", unit: "", ingredient: "Suka (cane vinegar)", notes: "or white vinegar" },
      { qty: "0.5 cup", unit: "", ingredient: "Water", notes: "" },
      { qty: "2 inch", unit: "", ingredient: "Ginger", notes: "julienned" },
      { qty: "4 cloves", unit: "", ingredient: "Garlic", notes: "crushed" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "2 pcs", unit: "", ingredient: "Siling pangsigang", notes: "left whole" },
      { qty: "1 tsp", unit: "", ingredient: "Salt", notes: "adjust" },
    ],
    steps: [
      "In a pot, place the vinegar, water, garlic, onion, and ginger. Bring to a boil.",
      "Add the bangus. Season with salt and pepper.",
      "Cover. Cook over medium heat for 15 minutes.",
      "Add the siling pangsigang. Cook for 5 more minutes.",
      "Taste the broth. Adjust the vinegar and salt if needed.",
      "Serve with 3/4 cup brown rice and diced kamatis.",
    ],
    nutrition: { Calories: "260 kcal", Protein: "30g", Fat: "9g (omega-3)", Carbs: "8g", "Omega-3": "HIGH", Probiotics: "MEDIUM", "Low Fat": "EXCELLENT" },
  },
  {
    id: 9, name: "Ginataang Sitaw at Kalabasa", category: "Gulay Dish", benefit: "Antioxidant + Fiber Rich",
    servings: "4", prepTime: "15 mins", cookTime: "25 mins", calories: "280 kcal", difficulty: "Easy", stars: 4,
    description: "Kalabasa is rich in beta-carotene, antioxidants, and Vitamin A which helps with inflammation. Sitaw provides plant protein and fiber.",
    easebrewTip: "Serve ginataang sitaw at kalabasa with Easebrew Herbal Coffee at dinner for a relaxing and anti-inflammatory evening.",
    ingredients: [
      { qty: "300g", unit: "", ingredient: "Sitaw (string beans)", notes: "cut into 2-inch pieces" },
      { qty: "400g", unit: "", ingredient: "Kalabasa", notes: "cut into cubes" },
      { qty: "1 can (400ml)", unit: "", ingredient: "Gata (coconut milk)", notes: "or 1 cup pressed coconut milk" },
      { qty: "200g", unit: "", ingredient: "Shrimp", notes: "or pork — optional" },
      { qty: "3 cloves", unit: "", ingredient: "Garlic", notes: "minced" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "2 tbsp", unit: "", ingredient: "Bagoong alamang", notes: "for flavor" },
      { qty: "1 cup", unit: "", ingredient: "Water", notes: "" },
    ],
    steps: [
      "Sauté the garlic and onion in oil. Add the bagoong, sauté for 1 minute.",
      "Add the shrimp or pork (if using). Cook for 3 minutes.",
      "Add the kalabasa and water. Cover and cook for 8 minutes until slightly soft.",
      "Add the sitaw. Stir.",
      "Pour in the gata. Stir gently. Cook over medium heat for 5-7 minutes. Don't let it boil hard.",
      "Season with salt. Taste and adjust.",
      "Serve with 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "280 kcal", Protein: "16g", Fat: "14g (healthy)", Carbs: "26g", "Beta-Carotene": "VERY HIGH", Fiber: "HIGH", Antioxidants: "HIGH" },
  },
  {
    id: 10, name: "Ginger-Turmeric Lugaw", category: "Lugaw / Porridge", benefit: "MAXIMUM Anti-Inflammation",
    servings: "4", prepTime: "10 mins", cookTime: "35 mins", calories: "270 kcal", difficulty: "Easy", stars: 5,
    description: "This is the most anti-inflammatory lugaw recipe in this book. Turmeric contains curcumin — one of the most powerful anti-inflammatory compounds in the world.",
    easebrewTip: "COMFORTING MORNING: Easebrew Herbal Coffee + Ginger-Turmeric Lugaw — warming and satisfying breakfast.",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Rice (sticky or regular)", notes: "washed" },
      { qty: "2 inch", unit: "", ingredient: "Luya (ginger)", notes: "sliced thin" },
      { qty: "1 tsp", unit: "", ingredient: "Turmeric powder", notes: "or 1 inch fresh turmeric" },
      { qty: "1.5L", unit: "", ingredient: "Water or chicken broth", notes: "" },
      { qty: "3 cloves", unit: "", ingredient: "Garlic", notes: "minced" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "minced" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "adjust" },
      { qty: "1 tsp", unit: "", ingredient: "Ground black pepper", notes: "boosts curcumin absorption!" },
      { qty: "3 stalks", unit: "", ingredient: "Green onion", notes: "for topping" },
    ],
    steps: [
      "Sauté the garlic, onion, and ginger in oil for 2 minutes.",
      "Add the rice. Stir for 2 minutes to coat the rice in oil.",
      "Add the turmeric. Stir — everything will turn yellow, that's fine!",
      "Pour in the water or broth. Bring to a boil.",
      "Reduce to medium-low heat. Cook for 25-30 minutes, stirring occasionally.",
      "Add more water if it gets too thick. Season with patis.",
      "Serve topped with green onion. DON'T FORGET the black pepper — it boosts curcumin absorption by up to 2000%!",
    ],
    nutrition: { Calories: "270 kcal", Protein: "8g", Fat: "5g", Carbs: "48g", Curcumin: "VERY HIGH", "Anti-Inflammation": "MAXIMUM", "Gut Health": "EXCELLENT" },
  },
  {
    id: 11, name: "Chicken Tinola with Papaya", category: "Soup / Sabaw", benefit: "Joint Lubrication + Immune",
    servings: "4", prepTime: "15 mins", cookTime: "35 mins", calories: "285 kcal", difficulty: "Easy", stars: 5,
    description: "Papaya in tinola adds papain enzyme, a natural anti-inflammatory that also aids digestion. Malunggay provides calcium and iron for bone health.",
    easebrewTip: "Easebrew Herbal Coffee is a perfect breakfast drink before a lunchtime tinola.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Chicken (bone-in)", notes: "cut up" },
      { qty: "1 medium", unit: "", ingredient: "Unripe papaya", notes: "cut into wedges" },
      { qty: "1.5 cups", unit: "", ingredient: "Malunggay leaves", notes: "or chili leaves" },
      { qty: "2 inch", unit: "", ingredient: "Ginger", notes: "sliced" },
      { qty: "4 cloves", unit: "", ingredient: "Garlic", notes: "crushed" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "1.5L", unit: "", ingredient: "Water", notes: "" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "" },
    ],
    steps: [
      "Sauté the garlic, onion, and ginger in oil for 3 minutes.",
      "Add the chicken. Sauté for 5 minutes.",
      "Pour in the water. Bring to a boil, then reduce to medium heat.",
      "Cook for 20 minutes. Season with patis.",
      "Add the papaya. Cook for 8 minutes.",
      "Turn off the heat. Add the malunggay. Serve immediately.",
    ],
    nutrition: { Calories: "285 kcal", Protein: "30g", Fat: "8g", Carbs: "18g", "Papain Enzyme": "HIGH", Calcium: "HIGH" },
  },
  {
    id: 12, name: "Ensaladang Talong", category: "Salad / Side", benefit: "Antioxidant + Low Calorie",
    servings: "4", prepTime: "10 mins", cookTime: "15 mins", calories: "120 kcal", difficulty: "Easy", stars: 4,
    description: "Talong is rich in nasunin and chlorogenic acid — powerful antioxidants that help with inflammation. A low-calorie but filling side dish.",
    easebrewTip: "Serve ensaladang talong with Easebrew Herbal Coffee as a light merienda.",
    ingredients: [
      { qty: "4 medium", unit: "", ingredient: "Talong (eggplant)", notes: "grilled or charred over open flame" },
      { qty: "3 medium", unit: "", ingredient: "Kamatis", notes: "finely chopped" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "finely chopped" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "adjust to taste" },
      { qty: "2 tbsp", unit: "", ingredient: "Suka (cane vinegar)", notes: "" },
      { qty: "3 cloves", unit: "", ingredient: "Garlic", notes: "minced — raw" },
      { qty: "2 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "for freshness" },
    ],
    steps: [
      "Grill the talong over an open flame or on a grill until cooked and the skin is slightly charred.",
      "Let it cool for 5 minutes. Peel and mash with a fork.",
      "Mix the kamatis, onion, garlic, and mashed talong in a bowl.",
      "Season with patis, suka, kalamansi, salt, and pepper.",
      "Taste and adjust the seasoning. Serve cold or at room temperature.",
    ],
    nutrition: { Calories: "120 kcal", Protein: "4g", Fat: "1g", Carbs: "24g", Antioxidants: "VERY HIGH", "Low Calorie": "EXCELLENT" },
  },
  {
    id: 13, name: "Grilled Tilapia sa Dahon ng Saging", category: "Fish Dish", benefit: "Lean Protein + Omega-3",
    servings: "4", prepTime: "15 mins", cookTime: "20 mins", calories: "240 kcal", difficulty: "Medium", stars: 4,
    description: "Tilapia is a lean fish full of protein and omega-3. Cooking it in banana leaves adds natural flavor and preserves the fish's nutrients.",
    easebrewTip: "Serve grilled tilapia with Easebrew Herbal Coffee after work.",
    ingredients: [
      { qty: "4 pcs", unit: "", ingredient: "Tilapia", notes: "medium size, cleaned" },
      { qty: "4 sheets", unit: "", ingredient: "Banana leaves", notes: "washed and wilted over flame" },
      { qty: "2 inch", unit: "", ingredient: "Ginger", notes: "julienned" },
      { qty: "4 cloves", unit: "", ingredient: "Garlic", notes: "crushed" },
      { qty: "2 pcs", unit: "", ingredient: "Kamatis", notes: "sliced into rounds" },
      { qty: "2 stalks", unit: "", ingredient: "Lemongrass (tanglad)", notes: "bruised and sliced" },
      { qty: "2 tbsp", unit: "", ingredient: "Soy sauce", notes: "for the marinade" },
      { qty: "1 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
    ],
    steps: [
      "Marinate the tilapia in soy sauce, kalamansi, garlic, salt, and pepper for 15 minutes.",
      "Place the ginger, kamatis, and tanglad inside the tilapia.",
      "Wrap each tilapia in banana leaves. Tie with a toothpick or twig.",
      "Place on the grill and cook for 8-10 minutes per side.",
      "Unwrap the banana leaves. Serve hot with 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "240 kcal", Protein: "34g", Fat: "7g (omega-3)", Carbs: "6g", "Lean Protein": "EXCELLENT", "Omega-3": "GOOD" },
  },
  {
    id: 14, name: "Ginisang Kangkong with Bawang", category: "Gulay Dish", benefit: "Iron + Anti-Inflammation",
    servings: "4", prepTime: "5 mins", cookTime: "10 mins", calories: "110 kcal", difficulty: "Easy", stars: 4,
    description: "Kangkong is one of the cheapest and most nutritious vegetables in the Philippines. It's rich in iron, calcium, and Vitamins A and C.",
    easebrewTip: "This kangkong dish is quick to make — perfect when you have Easebrew Herbal Coffee waiting.",
    ingredients: [
      { qty: "400g", unit: "", ingredient: "Kangkong", notes: "washed, stems and leaves separated" },
      { qty: "5 cloves", unit: "", ingredient: "Garlic", notes: "lots of it! — thinly minced" },
      { qty: "2 tbsp", unit: "", ingredient: "Oyster sauce", notes: "or patis" },
      { qty: "1 tbsp", unit: "", ingredient: "Soy sauce", notes: "" },
      { qty: "2 tbsp", unit: "", ingredient: "Canola oil", notes: "" },
      { qty: "0.25 cup", unit: "", ingredient: "Water", notes: "just a little" },
    ],
    steps: [
      "Heat the oil in a pan over high heat. Sauté the garlic until golden and fragrant — just 1-2 minutes.",
      "Add the kangkong stems first. Sauté for 1 minute.",
      "Add the kangkong leaves. Stir immediately.",
      "Add the oyster sauce, soy sauce, and a little water.",
      "Stir quickly over high heat — just 2-3 minutes. Don't overcook.",
      "Season with pepper. Serve IMMEDIATELY.",
    ],
    nutrition: { Calories: "110 kcal", Protein: "5g", Fat: "7g", Carbs: "8g", Iron: "VERY HIGH", Calcium: "HIGH", "Vitamins A & C": "HIGH" },
  },
  {
    id: 15, name: "Champorado with Dark Chocolate", category: "Breakfast", benefit: "Antioxidant + Morning Energy",
    servings: "4", prepTime: "5 mins", cookTime: "20 mins", calories: "320 kcal", difficulty: "Easy", stars: 3,
    description: "Dark chocolate contains flavonoids — powerful antioxidants that help with inflammation and cardiovascular health.",
    easebrewTip: "PERFECT DUO: Easebrew Herbal Coffee + Champorado with Dark Chocolate = a nourishing and anti-inflammatory breakfast!",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Sticky rice", notes: "washed" },
      { qty: "80g", unit: "", ingredient: "Dark chocolate (70%+ cacao)", notes: "or 4 pcs tablea — chopped" },
      { qty: "2 tbsp", unit: "", ingredient: "Cocoa powder (unsweetened)", notes: "for a deeper flavor" },
      { qty: "3 cups", unit: "", ingredient: "Water", notes: "" },
      { qty: "2 cups", unit: "", ingredient: "Low-fat milk or gata", notes: "for creaminess" },
      { qty: "3 tbsp", unit: "", ingredient: "Asukal (brown sugar)", notes: "adjust to taste" },
      { qty: "1 can", unit: "", ingredient: "Evaporated milk (small)", notes: "for topping" },
    ],
    steps: [
      "Cook the sticky rice in water until thick — 15 minutes over medium heat. Stir occasionally.",
      "Add the dark chocolate and cocoa powder. Stir until melted.",
      "Pour in the gata or low-fat milk. Mix well.",
      "Add the brown sugar and salt. Cook for 5 more minutes over low heat.",
      "Serve in a bowl. Top with evaporated milk.",
    ],
    nutrition: { Calories: "320 kcal", Protein: "8g", Fat: "10g", Carbs: "50g", Flavonoids: "HIGH", Antioxidants: "HIGH", Energy: "GOOD" },
  },
  {
    id: 16, name: "Pesang Isda", category: "Fish Dish", benefit: "Lean Protein + Ginger Detox",
    servings: "4", prepTime: "10 mins", cookTime: "20 mins", calories: "230 kcal", difficulty: "Easy", stars: 4,
    description: "Pesang isda is one of the cleanest and healthiest ways to cook fish. No oil — just simmered in a ginger-based broth.",
    easebrewTip: "Drink Easebrew Herbal Coffee before or after pesang isda for a double ginger effect.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Fish (bangus, tilapia, or lapu-lapu)", notes: "cut up" },
      { qty: "2 inch", unit: "", ingredient: "Ginger", notes: "julienned — lots of ginger!" },
      { qty: "1 head", unit: "", ingredient: "Cabbage", notes: "cut into quarters" },
      { qty: "1 bunch", unit: "", ingredient: "Pechay", notes: "or bok choy" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "1L", unit: "", ingredient: "Water", notes: "" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "" },
    ],
    steps: [
      "Boil the water. Add the ginger and onion.",
      "Add the fish. Cook for 8-10 minutes.",
      "Add the cabbage. Cook for 3 minutes.",
      "Add the pechay. Cook for 2 more minutes.",
      "Season with patis, salt, and pepper. Serve hot.",
    ],
    nutrition: { Calories: "230 kcal", Protein: "32g", Fat: "5g", Carbs: "12g", "Ginger Content": "HIGH", Detox: "EXCELLENT" },
  },
  {
    id: 17, name: "Ginisang Upo with Hipon", category: "Gulay Dish", benefit: "Hydrating + Low Calorie",
    servings: "4", prepTime: "10 mins", cookTime: "15 mins", calories: "160 kcal", difficulty: "Easy", stars: 3,
    description: "Upo (bottle gourd) is 95% water — one of the most hydrating vegetables. It helps with joint lubrication due to its high water content.",
    easebrewTip: "Ginisang upo with Easebrew Herbal Coffee makes a perfect light dinner.",
    ingredients: [
      { qty: "1 large", unit: "", ingredient: "Upo (bottle gourd)", notes: "peeled and cut into cubes" },
      { qty: "200g", unit: "", ingredient: "Shrimp", notes: "or pork — optional" },
      { qty: "3 cloves", unit: "", ingredient: "Garlic", notes: "minced" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "1 medium", unit: "", ingredient: "Kamatis", notes: "sliced" },
      { qty: "1 tbsp", unit: "", ingredient: "Patis", notes: "" },
    ],
    steps: [
      "Sauté the garlic and onion in oil.",
      "Add the kamatis. Sauté for 2 minutes.",
      "Add the shrimp. Cook for 3 minutes.",
      "Add the upo and water. Cover and cook for 8 minutes.",
      "Season with patis and pepper. Serve with brown rice.",
    ],
    nutrition: { Calories: "160 kcal", Protein: "14g", Fat: "5g", Carbs: "16g", Hydration: "EXCELLENT", "Low Calorie": "VERY GOOD" },
  },
  {
    id: 18, name: "Turmeric Chicken Adobo", category: "Meat Dish", benefit: "Anti-Inflammation Twist on Adobo",
    servings: "4", prepTime: "15 mins", cookTime: "40 mins", calories: "350 kcal", difficulty: "Easy", stars: 5,
    description: "Adobo is a favorite Filipino dish — and it becomes healthier and anti-inflammatory when turmeric is added. The curcumin in turmeric boosts the anti-inflammatory effect.",
    easebrewTip: "Easebrew Herbal Coffee after turmeric adobo adds another anti-inflammatory layer.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Chicken (bone-in pieces)", notes: "legs, thighs, or pork" },
      { qty: "0.5 cup", unit: "", ingredient: "Suka (cane vinegar)", notes: "" },
      { qty: "0.5 cup", unit: "", ingredient: "Soy sauce", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Turmeric powder", notes: "or 1 inch fresh turmeric" },
      { qty: "6 cloves", unit: "", ingredient: "Garlic", notes: "crushed" },
      { qty: "2 pcs", unit: "", ingredient: "Bay leaf (laurel)", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Black peppercorn", notes: "left whole" },
      { qty: "1 tbsp", unit: "", ingredient: "Brown sugar", notes: "to balance the sourness" },
    ],
    steps: [
      "Sauté the garlic in oil until golden.",
      "Add the chicken. Sauté for 5 minutes.",
      "Add the turmeric. Stir — everything will turn yellow.",
      "Pour in the suka, soy sauce, and water. Add the laurel and peppercorn.",
      "Bring to a boil, then reduce to medium-low heat. Cook for 30 minutes covered.",
      "Uncover. Cook for 10 more minutes to thicken the sauce. Serve with 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "350 kcal", Protein: "38g", Fat: "14g", Carbs: "10g", Curcumin: "HIGH", "Anti-Inflammation": "EXCELLENT" },
  },
  {
    id: 19, name: "Buko at Papaya Salad", category: "Salad / Dessert", benefit: "Enzyme-Rich + Digestive Aid",
    servings: "4", prepTime: "15 mins", cookTime: "0 mins", calories: "160 kcal", difficulty: "Easy", stars: 4,
    description: "Papaya contains papain enzyme, a natural anti-inflammatory that also helps with digestion and joint pain.",
    easebrewTip: "Serve buko at papaya salad as a merienda with Easebrew Herbal Coffee — a fresh, enzyme-rich, and herbal combination!",
    ingredients: [
      { qty: "2 cups", unit: "", ingredient: "Ripe papaya", notes: "cut into cubes" },
      { qty: "2 cups", unit: "", ingredient: "Buko meat (young coconut)", notes: "cut into strips" },
      { qty: "2 tbsp", unit: "", ingredient: "Buko juice", notes: "for the dressing" },
      { qty: "2 tbsp", unit: "", ingredient: "Honey", notes: "or brown sugar" },
      { qty: "2 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
      { qty: "0.5 cup", unit: "", ingredient: "Nata de coco", notes: "optional" },
      { qty: "Fresh mint", unit: "", ingredient: "Mint leaves", notes: "for topping" },
    ],
    steps: [
      "Combine the papaya and buko in a large bowl.",
      "Mix the buko juice, honey, kalamansi, and salt for the dressing.",
      "Pour the dressing over the papaya and buko. Mix gently.",
      "Add the nata de coco if desired.",
      "Top with mint leaves. Serve chilled.",
    ],
    nutrition: { Calories: "160 kcal", Protein: "2g", Fat: "5g (MCT)", Carbs: "28g", "Papain Enzyme": "VERY HIGH", Electrolytes: "HIGH" },
  },
  {
    id: 20, name: "Monggo Soup with Ampalaya", category: "Soup / Sabaw", benefit: "Double Anti-Inflammation Power",
    servings: "4", prepTime: "10 mins", cookTime: "45 mins", calories: "240 kcal", difficulty: "Easy", stars: 5,
    description: "Combines two super anti-inflammatory ingredients — monggo and ampalaya. The ultimate anti-inflammation soup.",
    easebrewTip: "Easebrew Herbal Coffee + Monggo with Ampalaya — a hearty, nutrient-rich Filipino meal combination.",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Monggo (mung beans)", notes: "soaked for 2 hours" },
      { qty: "1 medium", unit: "", ingredient: "Ampalaya", notes: "sliced thin, soaked in salt" },
      { qty: "100g", unit: "", ingredient: "Smoked fish or dried fish", notes: "for flavor" },
      { qty: "3 cloves", unit: "", ingredient: "Garlic", notes: "minced" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "1 medium", unit: "", ingredient: "Kamatis", notes: "sliced" },
      { qty: "1L", unit: "", ingredient: "Water", notes: "" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "" },
      { qty: "1 inch", unit: "", ingredient: "Ginger", notes: "for extra anti-inflammation" },
    ],
    steps: [
      "Cook the monggo in water for 30-35 minutes until soft.",
      "Sauté the garlic, onion, ginger, and kamatis. Add the smoked fish.",
      "Pour in the cooked monggo.",
      "Add the ampalaya (already soaked in salt and squeezed). Cook for 5 minutes.",
      "Season with patis. Serve with brown rice.",
    ],
    nutrition: { Calories: "240 kcal", Protein: "16g", Fat: "5g", Carbs: "36g", Fiber: "9g", "Anti-Inflammation": "MAXIMUM", "Blood Sugar": "EXCELLENT" },
  },
  {
    id: 21, name: "Salmon sa Kamatis at Luya", category: "Fish Dish", benefit: "Omega-3 + Lycopene Boost",
    servings: "4", prepTime: "10 mins", cookTime: "20 mins", calories: "330 kcal", difficulty: "Easy", stars: 5,
    description: "Lycopene in kamatis boosts the anti-inflammatory effect of salmon's omega-3.",
    easebrewTip: "Enjoy Easebrew Herbal Coffee after this salmon-kamatis dish — a satisfying Pinoy pairing.",
    ingredients: [
      { qty: "400g", unit: "", ingredient: "Salmon fillet", notes: "cut into 4" },
      { qty: "3 medium", unit: "", ingredient: "Kamatis", notes: "chopped" },
      { qty: "2 inch", unit: "", ingredient: "Ginger", notes: "julienned" },
      { qty: "4 cloves", unit: "", ingredient: "Garlic", notes: "minced" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "2 tbsp", unit: "", ingredient: "Soy sauce", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Olive oil", notes: "" },
    ],
    steps: [
      "Sauté the garlic, onion, and ginger in olive oil for 2 minutes.",
      "Add the kamatis. Sauté for 3 minutes until soft.",
      "Add the salmon. Season with soy sauce, kalamansi, salt, pepper.",
      "Cook for 5-7 minutes over medium heat. Handle the salmon gently so it doesn't break apart.",
      "Taste and adjust. Serve with 3/4 cup brown rice.",
    ],
    nutrition: { Calories: "330 kcal", Protein: "36g", Fat: "14g (omega-3)", Carbs: "10g", Lycopene: "HIGH", "Omega-3": "VERY HIGH" },
  },
  {
    id: 22, name: "Ginisang Repolyo with Carrots", category: "Gulay Dish", benefit: "Gut Health + Antioxidant",
    servings: "4", prepTime: "10 mins", cookTime: "12 mins", calories: "130 kcal", difficulty: "Easy", stars: 4,
    description: "Cabbage is rich in Vitamin K and sulforaphane which protects the joints. Carrots add beta-carotene.",
    easebrewTip: "A simple and quick side dish that pairs well with Easebrew Herbal Coffee for a healthy meal.",
    ingredients: [
      { qty: "0.5 head", unit: "", ingredient: "Cabbage", notes: "sliced thin" },
      { qty: "2 medium", unit: "", ingredient: "Carrots", notes: "julienned" },
      { qty: "100g", unit: "", ingredient: "Pork (lean) or shrimp", notes: "optional" },
      { qty: "4 cloves", unit: "", ingredient: "Garlic", notes: "minced" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "2 tbsp", unit: "", ingredient: "Oyster sauce", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Soy sauce", notes: "" },
    ],
    steps: [
      "Sauté the garlic and onion over high heat.",
      "Add the pork or shrimp. Cook for 3 minutes.",
      "Add the carrots. Sauté for 2 minutes.",
      "Add the cabbage, oyster sauce, soy sauce.",
      "Stir quickly over high heat for 3-4 minutes. Serve immediately.",
    ],
    nutrition: { Calories: "130 kcal", Protein: "8g", Fat: "7g", Carbs: "12g", "Beta-Carotene": "HIGH", "Vitamin K": "HIGH" },
  },
  {
    id: 23, name: "Nilagang Manok (Light Broth)", category: "Soup / Sabaw", benefit: "Collagen + Bone Support",
    servings: "4", prepTime: "15 mins", cookTime: "45 mins", calories: "270 kcal", difficulty: "Easy", stars: 4,
    description: "Chicken bone broth is rich in collagen, glucosamine, and chondroitin — all of which naturally protect the joints.",
    easebrewTip: "The combination of chicken bone broth and Easebrew Herbal Coffee provides comprehensive joint support.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Chicken (bone-in, whole pieces)", notes: "" },
      { qty: "2 medium", unit: "", ingredient: "Sweet potato", notes: "cut up" },
      { qty: "2 medium", unit: "", ingredient: "Corn", notes: "cut into three" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "left whole" },
      { qty: "2 pcs", unit: "", ingredient: "Peppercorn", notes: "" },
      { qty: "1.5L", unit: "", ingredient: "Water", notes: "" },
      { qty: "200g", unit: "", ingredient: "Cabbage", notes: "cut up" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "" },
    ],
    steps: [
      "Boil the chicken and water. Remove the scum.",
      "Add the onion and peppercorn. Reduce to medium heat.",
      "Cook for 35-40 minutes.",
      "Add the corn and sweet potato. Cook for 10 minutes.",
      "Add the cabbage. Cook for 5 minutes. Season with patis and salt.",
    ],
    nutrition: { Calories: "270 kcal", Protein: "30g", Fat: "7g", Carbs: "22g", Collagen: "HIGH", "Bone Support": "EXCELLENT" },
  },
  {
    id: 24, name: "Steamed Bangus with Ginger", category: "Fish Dish", benefit: "Clean Protein + Detox",
    servings: "4", prepTime: "10 mins", cookTime: "20 mins", calories: "240 kcal", difficulty: "Easy", stars: 4,
    description: "Steaming is one of the cleanest ways to cook — it preserves all the nutrients. No excess oil.",
    easebrewTip: "Serve steamed bangus with Easebrew Herbal Coffee — clean eating for a healthier body.",
    ingredients: [
      { qty: "600g", unit: "", ingredient: "Bangus", notes: "cut into 4 pieces" },
      { qty: "3 inch", unit: "", ingredient: "Ginger", notes: "julienned — lots of ginger" },
      { qty: "4 cloves", unit: "", ingredient: "Garlic", notes: "minced" },
      { qty: "3 stalks", unit: "", ingredient: "Green onion", notes: "sliced" },
      { qty: "2 tbsp", unit: "", ingredient: "Soy sauce", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Sesame oil", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
    ],
    steps: [
      "Place the bangus on a steaming plate. Top with ginger.",
      "Steam for 12-15 minutes until the fish is cooked.",
      "While cooking, mix the soy sauce, sesame oil, and kalamansi.",
      "Once the bangus is cooked, pour the sauce over it.",
      "Top with green onion and garlic. Serve immediately.",
    ],
    nutrition: { Calories: "240 kcal", Protein: "32g", Fat: "8g (omega-3)", Carbs: "5g", "Clean Protein": "EXCELLENT", "No Added Fat": "YES" },
  },
  {
    id: 25, name: "Ginataang Monggo", category: "Dessert / Merienda", benefit: "Plant Protein + Satisfying",
    servings: "4", prepTime: "10 mins", cookTime: "40 mins", calories: "290 kcal", difficulty: "Easy", stars: 3,
    description: "Ginataang monggo is a nourishing and relaxing dessert. Monggo provides plant protein and fiber.",
    easebrewTip: "Serve ginataang monggo with Easebrew Herbal Coffee as a merienda — a satisfying and anti-inflammatory pair.",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Monggo", notes: "soaked for 2 hours" },
      { qty: "1 can (400ml)", unit: "", ingredient: "Gata (coconut milk)", notes: "" },
      { qty: "0.5 cup", unit: "", ingredient: "Asukal (brown sugar)", notes: "adjust to taste" },
      { qty: "0.25 tsp", unit: "", ingredient: "Salt", notes: "" },
      { qty: "1 cup", unit: "", ingredient: "Water", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Vanilla extract", notes: "optional" },
      { qty: "Sago pearls", unit: "", ingredient: "Sago (cooked)", notes: "optional" },
    ],
    steps: [
      "Cook the monggo in water for 30 minutes until soft.",
      "Add the gata and brown sugar.",
      "Cook over medium-low heat for 10 more minutes. Stir occasionally.",
      "Add the salt and vanilla. Adjust the sweetness.",
      "Add the sago if desired. Serve hot or cold.",
    ],
    nutrition: { Calories: "290 kcal", Protein: "10g", Fat: "12g (MCT)", Carbs: "38g", "Plant Protein": "GOOD", Fiber: "HIGH" },
  },
  {
    id: 26, name: "Ginisang Talbos ng Kamote", category: "Gulay Dish", benefit: "Antioxidant Superfood",
    servings: "4", prepTime: "5 mins", cookTime: "10 mins", calories: "100 kcal", difficulty: "Easy", stars: 5,
    description: "Talbos ng kamote (sweet potato leaves) is one of the most nutritious vegetables — even higher in Vitamin C than an orange! Rich in antioxidants, iron, and anti-inflammatory compounds. And cheap too!",
    easebrewTip: "Talbos ng kamote pairs perfectly with Easebrew Herbal Coffee — a simple meal packed with health benefits.",
    ingredients: [
      { qty: "400g", unit: "", ingredient: "Talbos ng kamote", notes: "washed" },
      { qty: "5 cloves", unit: "", ingredient: "Garlic", notes: "lots — minced" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "sliced" },
      { qty: "2 tbsp", unit: "", ingredient: "Bagoong alamang", notes: "or patis" },
      { qty: "2 tbsp", unit: "", ingredient: "Canola oil", notes: "" },
      { qty: "0.25 cup", unit: "", ingredient: "Water", notes: "" },
    ],
    steps: [
      "Sauté the garlic and onion over high heat.",
      "Add the bagoong. Sauté for 1 minute.",
      "Add the talbos ng kamote.",
      "Stir quickly. Add a little water.",
      "Cook for just 3-4 minutes. Don't overcook. Serve immediately.",
    ],
    nutrition: { Calories: "100 kcal", Protein: "5g", Fat: "6g", Carbs: "8g", "Vitamin C": "VERY HIGH", Iron: "HIGH", Antioxidants: "EXCELLENT" },
  },
  {
    id: 27, name: "Lentil at Malunggay Soup", category: "Soup / Sabaw", benefit: "Iron + Bone Density",
    servings: "4", prepTime: "10 mins", cookTime: "30 mins", calories: "260 kcal", difficulty: "Easy", stars: 4,
    description: "Lentils are full of iron, folate, and plant protein. When combined with malunggay, this becomes a bone-density-boosting powerhouse soup.",
    easebrewTip: "Easebrew Herbal Coffee after lentil-malunggay soup completes the wellness routine.",
    ingredients: [
      { qty: "1 cup (200g)", unit: "", ingredient: "Red lentils", notes: "washed" },
      { qty: "1.5 cups", unit: "", ingredient: "Malunggay leaves", notes: "fresh" },
      { qty: "3 cloves", unit: "", ingredient: "Garlic", notes: "minced" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "minced" },
      { qty: "1 medium", unit: "", ingredient: "Kamatis", notes: "minced" },
      { qty: "1L", unit: "", ingredient: "Vegetable broth or water", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Turmeric powder", notes: "for extra anti-inflammation" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "or salt" },
      { qty: "0.5 tsp", unit: "", ingredient: "Cumin", notes: "optional" },
    ],
    steps: [
      "Sauté the garlic, onion, and kamatis in olive oil for 3 minutes.",
      "Add the turmeric and cumin. Sauté for 30 seconds.",
      "Add the lentils and broth. Bring to a boil.",
      "Reduce to medium heat. Cook for 20-25 minutes until the lentils are soft.",
      "Season with patis. Turn off the heat. Add the malunggay. Serve immediately.",
    ],
    nutrition: { Calories: "260 kcal", Protein: "18g", Fat: "4g", Carbs: "38g", Iron: "VERY HIGH", Folate: "HIGH", "Bone Density": "EXCELLENT" },
  },
  {
    id: 28, name: "Baked Tilapia with Herbs", category: "Fish Dish", benefit: "Lean Protein + Low Fat",
    servings: "4", prepTime: "15 mins", cookTime: "25 mins", calories: "220 kcal", difficulty: "Easy", stars: 4,
    description: "Baked fish is healthier than fried fish. Herbs like rosemary and oregano add anti-inflammatory compounds.",
    easebrewTip: "Serve baked tilapia with Easebrew Herbal Coffee — a healthy dinner that feels like a restaurant meal!",
    ingredients: [
      { qty: "4 medium", unit: "", ingredient: "Tilapia", notes: "cleaned" },
      { qty: "3 cloves", unit: "", ingredient: "Garlic", notes: "minced" },
      { qty: "2 tbsp", unit: "", ingredient: "Olive oil", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Oregano (dried)", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Rosemary (dried)", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Paprika", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Salt", notes: "" },
    ],
    steps: [
      "Prepare the oven — preheat to 200°C or 400°F.",
      "Mix the olive oil, garlic, kalamansi, and all the spices.",
      "Coat the tilapia in the herb mixture.",
      "Place in a baking pan surrounded by kamatis and onion.",
      "Bake for 20-25 minutes until golden and cooked. Serve immediately.",
    ],
    nutrition: { Calories: "220 kcal", Protein: "32g", Fat: "8g", Carbs: "4g", "Lean Protein": "EXCELLENT", "Herbs Anti-Inflam": "HIGH" },
  },
  {
    id: 29, name: "Pork Sinigang (Lean Cuts)", category: "Soup / Sabaw", benefit: "Vitamin C + Joint Support",
    servings: "4", prepTime: "15 mins", cookTime: "45 mins", calories: "350 kcal", difficulty: "Medium", stars: 4,
    description: "Pork sinigang is nourishing when made with lean cuts. Sampalok provides Vitamin C, which is important for collagen production for joint health.",
    easebrewTip: "Easebrew Herbal Coffee after sinigang adds herbal warmth and an anti-inflammatory boost.",
    ingredients: [
      { qty: "500g", unit: "", ingredient: "Pork kasim or loin (lean)", notes: "cut into 2-inch pieces" },
      { qty: "1 pack (40g)", unit: "", ingredient: "Sinigang mix (tamarind)", notes: "or 4 pcs fresh tamarind" },
      { qty: "1.5L", unit: "", ingredient: "Water", notes: "" },
      { qty: "1 medium", unit: "", ingredient: "Radish", notes: "sliced into rounds" },
      { qty: "200g", unit: "", ingredient: "Kangkong", notes: "sliced" },
      { qty: "100g", unit: "", ingredient: "String beans", notes: "cut into 2-inch pieces" },
      { qty: "2 medium", unit: "", ingredient: "Kamatis", notes: "quartered" },
      { qty: "1 medium", unit: "", ingredient: "Onion", notes: "quartered" },
      { qty: "2 pcs", unit: "", ingredient: "Long green chili", notes: "left whole" },
      { qty: "2 tbsp", unit: "", ingredient: "Patis", notes: "" },
    ],
    steps: [
      "Boil the water. Add the pork and remove the scum.",
      "Add the onion and kamatis. Cook for 30 minutes.",
      "Add the sinigang mix and radish. Cook for 8 minutes.",
      "Add the string beans and long green chili. Cook for 3 minutes.",
      "Add the kangkong. Season with patis. Cook for 2 minutes. Serve immediately.",
    ],
    nutrition: { Calories: "350 kcal", Protein: "38g", Fat: "12g", Carbs: "18g", "Vitamin C": "VERY HIGH", "Collagen Support": "HIGH" },
  },
  {
    id: 30, name: "Anti-Inflammation Power Bowl", category: "Power Bowl", benefit: "COMPLETE Anti-Inflammation Meal",
    servings: "4", prepTime: "20 mins", cookTime: "30 mins", calories: "420 kcal", difficulty: "Medium", stars: 5,
    description: "Combines the best anti-inflammatory ingredients — brown rice, salmon, malunggay, turmeric, and ginger. The most complete anti-inflammatory meal.",
    easebrewTip: "CELEBRATION MEAL: Easebrew Herbal Coffee + Anti-Inflammation Power Bowl — a nourishing feast to celebrate your progress!",
    ingredients: [
      { qty: "1.5 cups", unit: "", ingredient: "Brown rice (cooked)", notes: "3/4 cup per person" },
      { qty: "300g", unit: "", ingredient: "Salmon fillet", notes: "grilled or baked" },
      { qty: "1 cup", unit: "", ingredient: "Malunggay leaves", notes: "blanched" },
      { qty: "1 medium", unit: "", ingredient: "Avocado", notes: "sliced — if available" },
      { qty: "1 medium", unit: "", ingredient: "Kamatis", notes: "chopped" },
      { qty: "1 cup", unit: "", ingredient: "Edamame or sitaw", notes: "blanched" },
      { qty: "2 tbsp", unit: "", ingredient: "Olive oil", notes: "for the dressing" },
      { qty: "1 tbsp", unit: "", ingredient: "Soy sauce", notes: "" },
      { qty: "1 tbsp", unit: "", ingredient: "Kalamansi juice", notes: "" },
      { qty: "1 tsp", unit: "", ingredient: "Turmeric powder", notes: "for the dressing" },
      { qty: "0.5 inch", unit: "", ingredient: "Ginger", notes: "grated — for the dressing" },
      { qty: "1 tbsp", unit: "", ingredient: "Sesame seeds", notes: "for topping" },
    ],
    steps: [
      "Prepare the brown rice. Grill or bake the salmon — season with salt, pepper, and kalamansi.",
      "Blanch the malunggay and edamame/sitaw for 2 minutes in hot water.",
      "Mix the olive oil, soy sauce, kalamansi, turmeric, and ginger for the dressing.",
      "Assemble the bowl: brown rice base, salmon in the middle, and vegetables around it.",
      "Pour the turmeric-ginger dressing over it. Top with sesame seeds.",
      "Serve immediately. Every spoonful has balanced, anti-inflammatory nutrition!",
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
            <p style={{ fontSize: 13, margin: 0, color: "rgba(255,255,255,0.85)" }}>paborito</p>
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
          { icon: "💧", text: "8+ baso ng tubig araw-araw" },
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
          {filtered.length} recipe{filtered.length !== 1 ? "s" : ""} found
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
                    {isExpanded ? "▲ Collapse" : "▼ View Recipe"}
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
                      <p style={{ fontSize: 16, fontWeight: 700, color: G, margin: "0 0 12px 0" }}>🥬 Ingredients</p>
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
                      <p style={{ fontSize: 16, fontWeight: 700, color: AMBER, margin: "0 0 14px 0" }}>👨‍🍳 How to Cook</p>
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
            <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px 0" }}>No results found</p>
            <p style={{ fontSize: 16 }}>Try a different search or category</p>
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
