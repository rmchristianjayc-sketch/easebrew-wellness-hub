export type Exercise = {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest: string;
  instruction: string;
  modification?: string;
};
export type Day = { day: number; title: string; exercises: Exercise[] };
export type Phase = { phase: number; name: string; weeks: string; color: string; bg: string; days: Day[] };

export const EXERCISE_PROGRAM: Phase[] = [
  {
    phase: 1, name: "Foundation & Mobility", weeks: "Week 1–2", color: "#39613B", bg: "#E8F5E0",
    days: [
      { day: 1, title: "Gentle Morning Activation", exercises: [
        { name: "Neck Rolls", sets: 2, reps: "5 each direction", rest: "30s", instruction: "Slowly roll your head in a circular motion. Don't force it.", modification: "Can be done while seated" },
        { name: "Shoulder Circles", sets: 2, reps: "10 each direction", rest: "30s", instruction: "Rotate your shoulders forward and backward slowly." },
        { name: "Seated Hip Circles", sets: 2, reps: "8 each direction", rest: "30s", instruction: "While seated, rotate your hips in a circular motion.", modification: "Hold the chair for balance" },
        { name: "Ankle Pumps", sets: 2, reps: "15 each foot", rest: "20s", instruction: "Flex and point your feet repeatedly to improve circulation." },
        { name: "Seated Knee Extensions", sets: 2, reps: "10 each leg", rest: "30s", instruction: "While seated, straighten your leg and hold for 3 seconds.", modification: "Reduce the range if there's pain" },
      ]},
      { day: 2, title: "Rest & Light Walking", exercises: [
        { name: "Easy Walking", duration: "10–15 mins", rest: "N/A", instruction: "Walk around the house or outside. Keep it relaxed, no need to rush." },
        { name: "Deep Breathing", sets: 1, reps: "10 breaths", rest: "N/A", instruction: "Breathe in deeply for 4 seconds, hold for 4 seconds, exhale for 4 seconds." },
      ]},
      { day: 3, title: "Upper Body Mobility", exercises: [
        { name: "Wall Angels", sets: 2, reps: "8 reps", rest: "45s", instruction: "Stand facing the wall. Slide your hands up and down while keeping them against the wall.", modification: "Can be done while seated" },
        { name: "Chest Stretch", sets: 2, duration: "20 seconds", rest: "30s", instruction: "Clasp your hands behind your back and open your chest. Breathe deeply." },
        { name: "Seated Rows (with towel)", sets: 2, reps: "12 reps", rest: "45s", instruction: "Use a towel. Hold both ends and pull toward your body." },
        { name: "Wrist Circles", sets: 2, reps: "10 each direction", rest: "20s", instruction: "Rotate your wrists in a circular motion. Good for carpal tunnel." },
      ]},
      { day: 4, title: "Rest Day", exercises: [
        { name: "Gentle Stretching", duration: "10 mins", rest: "N/A", instruction: "Stretch your whole body slowly. Don't force it." },
        { name: "Easebrew + Hydration", duration: "Throughout the day", rest: "N/A", instruction: "Make sure to drink Easebrew and 8 glasses of water today." },
      ]},
      { day: 5, title: "Lower Body Strength", exercises: [
        { name: "Chair Squats", sets: 3, reps: "8–10 reps", rest: "60s", instruction: "Stand up from the chair and sit back down slowly. Hold armrests if needed.", modification: "Use a sturdy chair" },
        { name: "Standing Calf Raises", sets: 2, reps: "12 reps", rest: "45s", instruction: "Stand and raise up onto your toes. Hold the wall for balance.", modification: "Can be done while seated" },
        { name: "Side Leg Raises", sets: 2, reps: "10 each leg", rest: "45s", instruction: "Stand and raise your leg to the side slowly. Hold the wall.", modification: "Reduce the height if there's hip pain" },
        { name: "Seated Marching", sets: 2, duration: "30 seconds", rest: "30s", instruction: "While seated, alternately lift your knees as if marching." },
      ]},
      { day: 6, title: "Full Body Flexibility", exercises: [
        { name: "Cat-Cow Stretch", sets: 2, reps: "10 reps", rest: "30s", instruction: "On hands and knees, alternate between arching and rounding your back slowly.", modification: "Can also be done on a chair" },
        { name: "Child's Pose", sets: 2, duration: "30 seconds", rest: "20s", instruction: "From hands and knees, sit back onto your heels and stretch your arms forward.", modification: "Place a pillow between your hips and heels" },
        { name: "Seated Spinal Twist", sets: 2, duration: "20s each side", rest: "20s", instruction: "While seated, twist your body to the right and left slowly." },
        { name: "Lying Hip Flexor Stretch", sets: 2, duration: "25s each side", rest: "20s", instruction: "Lie down and hug one knee to your chest.", modification: "Do it on the bed if the floor is too difficult" },
      ]},
      { day: 7, title: "Complete Rest", exercises: [
        { name: "Full Rest Day", duration: "All day", rest: "N/A", instruction: "Rest your body. Drink EaseBrew and sleep early." },
      ]},
    ]
  },
  {
    phase: 2, name: "Strength Building", weeks: "Week 3–4", color: "#C0863B", bg: "#FEF9E7",
    days: [
      { day: 8, title: "Upper Body Strength", exercises: [
        { name: "Wall Push-Ups", sets: 3, reps: "10–12 reps", rest: "60s", instruction: "Face the wall and push your body away and back. Easier than floor push-ups.", modification: "Adjust the distance from the wall" },
        { name: "Resistance Band Rows", sets: 3, reps: "12 reps", rest: "60s", instruction: "Attach the band to a door or hold it firmly. Pull toward your body.", modification: "Use a towel if no band is available" },
        { name: "Bicep Curls (light weight)", sets: 2, reps: "12 reps", rest: "45s", instruction: "Use a light weight (water bottle or 1kg). Curl your hands upward.", modification: "Can be done while seated" },
        { name: "Shoulder Press (seated)", sets: 2, reps: "10 reps", rest: "45s", instruction: "Hold light weights at shoulder level and press upward slowly." },
      ]},
      { day: 9, title: "Cardio Walk + Balance", exercises: [
        { name: "Brisk Walking", duration: "20 mins", rest: "N/A", instruction: "Walk faster than usual. You should feel your heart rate increasing." },
        { name: "Single Leg Stand", sets: 3, duration: "20s each leg", rest: "30s", instruction: "Stand on one foot. Hold the wall if needed.", modification: "Hold a chair for balance" },
        { name: "Heel-to-Toe Walking", sets: 2, reps: "10 steps", rest: "30s", instruction: "Walk as if on a tightrope — each step, your heel touches the toes of your previous foot." },
      ]},
      { day: 10, title: "Lower Body Strength", exercises: [
        { name: "Modified Squats", sets: 3, reps: "12 reps", rest: "60s", instruction: "Chair squats but slower — 3 seconds going down, 3 seconds standing up.", modification: "Still use a chair if needed" },
        { name: "Step-Ups (low step)", sets: 2, reps: "8 each leg", rest: "60s", instruction: "Use a low step or book. Step up and step down slowly.", modification: "Hold the handrail or wall" },
        { name: "Glute Bridge", sets: 3, reps: "12 reps", rest: "45s", instruction: "Lie down, bend your knees, lift your hips up and hold for 3 seconds.", modification: "Reduce the height if there's lower back pain" },
        { name: "Seated Leg Press (wall)", sets: 2, reps: "10 each leg", rest: "45s", instruction: "Lie near a wall, place your feet on the wall and push." },
      ]},
      { day: 11, title: "Active Recovery", exercises: [
        { name: "Swimming or Water Walking", duration: "20–30 mins", rest: "N/A", instruction: "If you have access to a pool — water provides resistance without joint impact.", modification: "Just walk in the water if you can't swim" },
        { name: "Full Body Stretch", duration: "15 mins", rest: "N/A", instruction: "Stretch all muscle groups. Hold each stretch for 20–30 seconds." },
      ]},
      { day: 12, title: "Core & Stability", exercises: [
        { name: "Seated Core Twist", sets: 3, reps: "12 each side", rest: "45s", instruction: "While seated, hold a light weight at your chest and twist your upper body.", modification: "Do it without weight first" },
        { name: "Dead Bug (modified)", sets: 2, reps: "8 each side", rest: "60s", instruction: "Lie down, extend alternating arm and leg while keeping your back flat.", modification: "Extend only the leg, not the arm" },
        { name: "Plank (wall or knees)", sets: 2, duration: "20–30 seconds", rest: "60s", instruction: "Start with wall plank — stand and lean against the wall, like a push-up without moving.", modification: "Knee plank if you're ready for more" },
        { name: "Pelvic Tilts", sets: 2, reps: "15 reps", rest: "30s", instruction: "Lie down, flatten your back against the floor and release. Good for lower back pain." },
      ]},
      { day: 13, title: "Full Body Integration", exercises: [
        { name: "Warm-Up Walk", duration: "5 mins", rest: "N/A", instruction: "Walk slowly to warm up your body." },
        { name: "Squat to Press", sets: 3, reps: "10 reps", rest: "60s", instruction: "Combine a squat and shoulder press. Go down for the squat, press up for the press." },
        { name: "Lateral Band Walk", sets: 2, reps: "10 steps each way", rest: "45s", instruction: "Use a resistance band around your knees. Step sideways repeatedly.", modification: "Do it without a band first" },
        { name: "Cool-Down Stretch", duration: "10 mins", rest: "N/A", instruction: "Stretch all major muscle groups. Focus on the ones you worked today." },
      ]},
      { day: 14, title: "Rest & Recovery", exercises: [
        { name: "Rest Day", duration: "All day", rest: "N/A", instruction: "Rest your body. If something hurts — just do light stretching and rest." },
      ]},
    ]
  },
  {
    phase: 3, name: "Endurance & Maintenance", weeks: "Week 5–8 (and beyond)", color: "#2D4A8F", bg: "#F0F4FF",
    days: [
      { day: 15, title: "Progressive Cardio", exercises: [
        { name: "Power Walking", duration: "25–30 mins", rest: "N/A", instruction: "Faster and longer than before. Maintain a conversational pace." },
        { name: "Stair Climbing (if available)", sets: 2, reps: "2 flights", rest: "2 mins", instruction: "Use stairs for a natural lower body workout.", modification: "Always hold the handrail" },
      ]},
      { day: 16, title: "Strength Maintenance", exercises: [
        { name: "All Phase 2 exercises", duration: "30–40 mins", rest: "As needed", instruction: "Repeat your favorite exercises from Phase 2. Increase reps or sets if you can.", modification: "Maintain current level if there's pain" },
      ]},
      { day: 17, title: "Flexibility & Yoga-Inspired", exercises: [
        { name: "Sun Salutation (Modified)", sets: 3, reps: "5 rounds", rest: "60s", instruction: "Modified sun salutation — standing only, no floor work if you can't.", modification: "Do everything while standing" },
        { name: "Yin-Style Hold Stretches", sets: 1, duration: "3–5 mins each", rest: "30s", instruction: "Hold stretches longer — 2–5 minutes each for deep tissue release." },
      ]},
    ]
  }
];
