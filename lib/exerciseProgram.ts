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

// ============================================================
// 30-DAY EXERCISE PROGRAM PARA SA SENIORS
//
// Design principles (based on senior-safe exercise guidelines):
//  1. Chair, wall, o tabi ng kama ay palaging available bilang support.
//  2. Kailangan lang na equipment: chair (matibay), wall, tuwalyang
//     nakarolyo (kapalit ng resistance band), water bottle 500ml
//     (kapalit ng weights).
//  3. Walang exercise na kailangan ng floor work na mahirap bumangon —
//     nasa chair o nakatayo lang.
//  4. Balance exercises PALAGING may support (chair o wall).
//  5. Bawat araw may Warm-up → Main → Cool-down structure na
//     nakapaloob sa exercises.
//  6. Modification na pang-seated na version para sa may joint issues.
//  7. Rest days spaced strategically para sa recovery.
//
// Structure: 3 Phases × 10 days each = 30 days total.
// ============================================================

export const EXERCISE_PROGRAM: Phase[] = [
  {
    phase: 1, name: "Foundation at Mobility", weeks: "Linggo 1–2", color: "#39613B", bg: "#E8F5E0",
    days: [
      { day: 1, title: "Umagang Aktibidad", exercises: [
        { name: "Malalim na Paghinga", sets: 1, reps: "10 hinga", rest: "N/A", instruction: "Magsimula sa pag-upo. Huminga nang malalim sa ilong (4 segundo), i-hold (4 segundo), ilabas sa bibig (6 segundo). Warm-up ito ng katawan.", modification: "Kung may hika, huwag pilitin ang hold." },
        { name: "Neck Rolls (Pag-ikot ng Leeg)", sets: 2, reps: "5 bawat direksyon", rest: "30s", instruction: "Nakaupo. Dahan-dahang ikutin ang ulo — pababa, kanan, taas, kaliwa. Huwag pilitin.", modification: "Kung may vertigo, gawin ang half-circles lang (pababa-kanan-pababa-kaliwa)." },
        { name: "Shoulder Circles (Pag-ikot ng Balikat)", sets: 2, reps: "10 bawat direksyon", rest: "30s", instruction: "Nakaupo o nakatayo. Ikutin ang balikat pauna, tapos paatras — mabagal at pantay." },
        { name: "Ankle Pumps (Pag-galaw ng Bukong-bukong)", sets: 2, reps: "15 bawat paa", rest: "20s", instruction: "Nakaupo. Ituring ang bukong-bukong: itaas ang mga daliri paitaas, tapos pababa. Pinapaganda ang circulation." },
        { name: "Cool-down Stretch", sets: 1, duration: "2 minuto", rest: "N/A", instruction: "Nakaupo. Hilahin dahan-dahan ang bawat braso sa harap ng dibdib. Bawat side 20 segundo." },
      ]},
      { day: 2, title: "Paglakad at Paghinga", exercises: [
        { name: "Warm-up Kalog-kalog", sets: 1, duration: "1 minuto", rest: "N/A", instruction: "Nakatayo, hawak sa upuan. Kalog-kalog ang mga braso at ilog-ilog ang balakang — magpainit ng katawan.", modification: "Nakaupo kung mahirap tumayo." },
        { name: "Madaling Paglakad", duration: "10–15 minuto", rest: "N/A", instruction: "Maglakad sa loob ng bahay o labas. Relaxed lang, hindi kailangang bilisan. Kung may walking cane, gamitin.", modification: "Simulan sa 5 minuto lang kung bagong nag-uumpisa." },
        { name: "Malalim na Paghinga", sets: 1, reps: "10 hinga", rest: "N/A", instruction: "Nakaupo pagkatapos maglakad. Deep breathing pattern — 4 in, 4 hold, 6 out. Pinapababa ang blood pressure." },
        { name: "Gentle Leg Stretch", sets: 2, duration: "20s bawat paa", rest: "N/A", instruction: "Nakaupo. Iunat ang isang paa, i-flex ang paa pauna. Ramdam ang stretch sa likod ng binti." },
      ]},
      { day: 3, title: "Upper Body Mobility", exercises: [
        { name: "Warm-up Paghinga", sets: 1, reps: "5 hinga", rest: "N/A", instruction: "Magsimula sa deep breathing para bumaba ang blood pressure at magpainit ng katawan." },
        { name: "Wall Angels", sets: 2, reps: "8 pag-taas", rest: "45s", instruction: "Nakatayo, likod nakadikit sa wall. Iangat ang mga braso pataas at pababa, palagi kang nakadikit sa wall. Pinapaganda ang posture.", modification: "Pwede nakaupo, likod nakadikit sa upuan." },
        { name: "Chest Opener", sets: 2, duration: "20 segundo", rest: "30s", instruction: "Nakaupo o nakatayo. Ikuyom ang mga kamay sa likod, buksan ang dibdib. Malalim na paghinga. Mahusay pagkatapos ng maraming oras ng pag-upo." },
        { name: "Seated Rows na May Tuwalya", sets: 2, reps: "12 hila", rest: "45s", instruction: "Nakaupo, hawak ang mga dulo ng tuwalyang matibay. Hilahin patungo sa dibdib mo, pisilin ang mga balikat." },
        { name: "Wrist Rolls", sets: 2, reps: "10 bawat direksyon", rest: "20s", instruction: "Nakaupo. Ikutin ang mga pulso sa hangin. Mahusay para sa arthritis at carpal tunnel." },
        { name: "Cool-down Neck Stretch", sets: 1, duration: "30s bawat side", rest: "N/A", instruction: "Ihilig ang ulo pakanan, hilahin ng kanang kamay ang left ear side pa-kanan. Ulitin sa kabila." },
      ]},
      { day: 4, title: "Chair Yoga — Flexibility Day", exercises: [
        { name: "Seated Mountain Pose", sets: 1, duration: "1 minuto", rest: "N/A", instruction: "Nakaupo, tuwid ang likod, paa nakadikit sa sahig. Malalim na paghinga. Grounding pose ito." },
        { name: "Seated Cat-Cow", sets: 2, reps: "8 pag-galaw", rest: "30s", instruction: "Nakaupo, kamay sa tuhod. Habang huminga papasok, iarko ang likod (cow). Habang lumalabas ang hinga, i-round ang likod (cat)." },
        { name: "Seated Side Stretch", sets: 2, duration: "20s bawat side", rest: "N/A", instruction: "Nakaupo. Itaas ang isang braso, hilig sa kabilang direksyon. Ramdam ang stretch sa side." },
        { name: "Seated Forward Fold", sets: 2, duration: "20s", rest: "20s", instruction: "Nakaupo, magpahinga pauna. Iabot ang mga kamay patungo sa mga paa. Huwag pilitin.", modification: "Ilagay ang mga kamay sa hita lang kung mahirap makarating sa paa." },
        { name: "Gentle Seated Twist", sets: 2, duration: "20s bawat side", rest: "N/A", instruction: "Nakaupo, isang kamay sa likod ng upuan, kabila sa tuhod. Dahan-dahang paikutin ang katawan." },
      ]},
      { day: 5, title: "Lower Body Gentle Strength", exercises: [
        { name: "Warm-up Marching", sets: 1, duration: "1 minuto", rest: "N/A", instruction: "Nakaupo. Alternately itaas ang mga tuhod parang naglalakad. Pinapainit ang katawan." },
        { name: "Chair Squats", sets: 3, reps: "8–10 pag-tayo", rest: "60s", instruction: "Simula nakaupo sa matibay na upuan. Tumayo nang dahan-dahan, tapos umupo ulit. Ilan segundong pause pagtayo. Hawak sa armrest kung kailangan.", modification: "Gawin ang half-squat lang (medyo tumayo, umupo agad) kung may knee issues." },
        { name: "Standing Calf Raises (May Wall)", sets: 2, reps: "12 pag-taas", rest: "45s", instruction: "Nakatayo, kamay nakadikit sa wall para sa balance. Itaas ang katawan gamit ang dulo ng paa. Ibaba nang dahan-dahan.", modification: "Pwedeng nakaupo. Itaas lang ang sakong habang nakadikit ang daliri ng paa sa sahig." },
        { name: "Side Leg Raises (May Chair)", sets: 2, reps: "10 bawat paa", rest: "45s", instruction: "Nakatayo, hawak sa upuan. Dahan-dahang itaas ang isang paa sa gilid. Huwag mataas — konti lang, mga 6 pulgada.", modification: "Nakaupo, pwedeng gawin habang nakaupo — itaas ang tuhod pagilid." },
        { name: "Seated Marching", sets: 2, duration: "30 segundo", rest: "30s", instruction: "Nakaupo. Alternately itaas ang mga tuhod parang naglalakad. Painting ito ng heart at legs." },
        { name: "Cool-down Leg Stretch", sets: 1, duration: "30s bawat leg", rest: "N/A", instruction: "Nakaupo, iunat ang isang paa pauna. Iflex ang paa. Ramdam ang stretch sa binti." },
      ]},
      { day: 6, title: "Buong Katawan Flexibility", exercises: [
        { name: "Warm-up Deep Breathing", sets: 1, reps: "5 hinga", rest: "N/A", instruction: "Magsimula sa upo. Deep breathing para magpainit." },
        { name: "Standing Side Bend (May Wall)", sets: 2, reps: "5 bawat side", rest: "30s", instruction: "Nakatayo, kamay sa wall. Ihilig ang katawan sa gilid — konti lang. Ramdam ang stretch sa side.", modification: "Pwedeng nakaupo — pareho ang gawi." },
        { name: "Ankle Circles", sets: 2, reps: "10 bawat direksyon", rest: "20s", instruction: "Nakaupo, isang paa nasa itaas. Ikutin ang bukong-bukong. Prevention ng balance issues." },
        { name: "Seated Spinal Twist", sets: 2, duration: "20s bawat side", rest: "20s", instruction: "Nakaupo, isang kamay sa likod ng upuan. Dahan-dahang paikutin ang katawan. Huwag pilitin ang leeg." },
        { name: "Butterfly Stretch (Nakaupo)", sets: 2, duration: "30s", rest: "N/A", instruction: "Nakaupo sa upuan o kama. Pagsamahin ang mga talampakan, tuhod sa gilid. Konti lang na baba, huwag pilitin.", modification: "Kung mahirap, iuunat ang isang paa lang, hinawakan ang tuhod." },
        { name: "Cool-down Deep Breathing", sets: 1, reps: "5 hinga", rest: "N/A", instruction: "Sarahin sa deep breathing. Ramdam ang katahimikan ng katawan." },
      ]},
      { day: 7, title: "Pahinga (Rest Day)", exercises: [
        { name: "Malumanay na Stretching", duration: "5–10 minuto", rest: "N/A", instruction: "Ganitong araw, magpahinga. Gumawa lang ng magaan na stretch kung gusto mo — walang pressure. Uminom ng EaseBrew at maraming tubig." },
        { name: "Pahinga at Hydration", duration: "Buong araw", rest: "N/A", instruction: "Rest day ito. Mag-inom ng 8 baso ng tubig. Matulog ng maaga — 7-8 oras. Recovery ang goal ngayon." },
      ]},
      { day: 8, title: "Balance na May Chair", exercises: [
        { name: "Warm-up Ankle Pumps", sets: 2, reps: "15 bawat paa", rest: "N/A", instruction: "Nakaupo. Iflex ang paa paitaas at pababa. Pinapainit ang bukong-bukong para sa balance." },
        { name: "Seated Weight Shifts", sets: 2, reps: "10 bawat side", rest: "30s", instruction: "Nakaupo, ilipat ang timbang sa kanan, tapos sa kaliwa. Feel the muscles engage." },
        { name: "Standing Weight Shifts (May Chair)", sets: 2, reps: "10 bawat side", rest: "45s", instruction: "Nakatayo, kamay sa upuan. Ilipat ang timbang sa isang paa, tapos sa kabila. Konti lang na tagal.", modification: "Nakaupo pa rin kung may vertigo." },
        { name: "Sit-to-Stand (Slow)", sets: 3, reps: "6 pag-tayo", rest: "60s", instruction: "Nakaupo. Tumayo nang dahan-dahan (3 segundo), tumayo ng tuwid (1 segundo), umupo nang dahan-dahan (3 segundo). Pinapaganda ang balance at strength." },
        { name: "Heel-Toe Stand (May Wall)", sets: 2, duration: "20s bawat position", rest: "45s", instruction: "Nakatayo, kamay sa wall. Ilagay ang sakong ng isang paa sa harap ng daliri ng kabilang paa. Hold. Palitan ng paa.", modification: "Kung mahirap, mahiwalayan lang ng konti ang mga paa, huwag lubos." },
        { name: "Cool-down Breathing", sets: 1, reps: "5 hinga", rest: "N/A", instruction: "Umupo, huminga nang malalim. Ang balance training ay mahusay para maiwasan ang pagkakadapa." },
      ]},
      { day: 9, title: "Posture Check-in", exercises: [
        { name: "Warm-up Shoulder Rolls", sets: 2, reps: "10 bawat direksyon", rest: "N/A", instruction: "Nakaupo. Ikutin ang balikat pauna, tapos paatras. Nakaka-relax ng upper back." },
        { name: "Wall Posture Check", sets: 2, duration: "30s", rest: "30s", instruction: "Nakatayo, ang buong likod nakadikit sa wall — batok, balikat, likod, puwet, sakong. Ramdam ang tamang posture." },
        { name: "Chin Tucks", sets: 2, reps: "10 tuck", rest: "30s", instruction: "Nakatayo o nakaupo. Hilahin pauna ang baba, parang gumagawa ng double chin. Pinapaganda ang neck posture — mabuti para sa mga nakatingala sa cellphone." },
        { name: "Chest Opener", sets: 2, duration: "20s", rest: "30s", instruction: "Nakaupo, ikuyom ang mga kamay sa likod. Buksan ang dibdib. Pinapababa ang stress sa upper back." },
        { name: "Standing Back Extension (May Wall)", sets: 2, reps: "8 pag-taas", rest: "45s", instruction: "Nakatayo, mga kamay nasa lower back. Konti lang na leaning back. Huwag pilitin.", modification: "Pwedeng nakaupo — konti lang na tumingin sa taas." },
        { name: "Cool-down Neck Stretch", sets: 1, duration: "20s bawat side", rest: "N/A", instruction: "Ihilig ang ulo sa side, ramdam ang stretch sa leeg." },
      ]},
      { day: 10, title: "Linggo 1–2 Review", exercises: [
        { name: "Warm-up Deep Breathing", sets: 1, reps: "5 hinga", rest: "N/A", instruction: "Simulan sa deep breathing. Handa ka na para sa buod ng nakaraang 2 linggo." },
        { name: "Neck Rolls", sets: 2, reps: "5 bawat direksyon", rest: "20s", instruction: "Balik-tanawin ang exercises mula Day 1. Dahan-dahan lang." },
        { name: "Chair Squats", sets: 2, reps: "10 pag-tayo", rest: "60s", instruction: "Isa sa pinaka-important na exercise. Ulitin natin para maging matibay." },
        { name: "Wall Angels", sets: 2, reps: "8 pag-taas", rest: "45s", instruction: "Para sa posture." },
        { name: "Seated Marching", sets: 2, duration: "45 segundo", rest: "30s", instruction: "Pinapabilis ang heart rate nang light." },
        { name: "Cool-down Full Stretch", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "Magpahinga at i-stretch ang buong katawan — leeg, balikat, likod, paa. Congrats sa 10 araw!" },
      ]},
    ]
  },
  {
    phase: 2, name: "Strength Building", weeks: "Linggo 3–4", color: "#C0863B", bg: "#FEF9E7",
    days: [
      { day: 11, title: "Wall Push-Ups (Upper Body)", exercises: [
        { name: "Warm-up Shoulder Rolls", sets: 2, reps: "10 bawat direksyon", rest: "N/A", instruction: "Nakaupo o nakatayo. Ikutin ang balikat para magpainit." },
        { name: "Wall Push-Ups", sets: 3, reps: "8–12 pag-taboy", rest: "60s", instruction: "Harapin ang wall, kamay sa wall sa taas ng balikat. Yumuko papunta sa wall, tapos itulak paatras. Mas madali kaysa sa floor push-up.", modification: "Mas malapit sa wall = mas madali. Mas malayo = mas mahirap." },
        { name: "Bicep Curls (Water Bottle)", sets: 2, reps: "12 pag-baluktot", rest: "45s", instruction: "Nakaupo. Hawakan ang bawat kamay ng 500ml water bottle. Baluktutin ang siko, itaas ang bote sa balikat.", modification: "Kung mabigat, gamitin ang half-filled na bote lang." },
        { name: "Shoulder Press (Nakaupo)", sets: 2, reps: "10 pag-taas", rest: "45s", instruction: "Nakaupo, hawak ang water bottles sa taas ng balikat. Itaas nang dahan-dahan pataas.", modification: "Isang kamay lang muna kung mabigat." },
        { name: "Tricep Extensions", sets: 2, reps: "12 pag-baluktot", rest: "45s", instruction: "Nakaupo. Isang kamay may hawak na bote sa likod ng ulo. Itaas ang bote nang tuwid, tapos ibaba." },
        { name: "Cool-down Shoulder Stretch", sets: 1, duration: "20s bawat side", rest: "N/A", instruction: "Hilahin ang isang braso sa harap ng dibdib. Ramdam ang stretch sa balikat." },
      ]},
      { day: 12, title: "Paglakad + Balance", exercises: [
        { name: "Warm-up Marching", sets: 1, duration: "1 minuto", rest: "N/A", instruction: "Nakatayo, hawak sa upuan. Simulan sa mabagal na march sa lugar." },
        { name: "Katamtamang Paglakad", duration: "10–15 minuto", rest: "N/A", instruction: "Konting bilisan sa normal — dapat kayang mag-usap. Sa loob ng bahay o labas. Kung nangangapos ng hinga, bumagal.", modification: "5–10 minuto lang okay na. Sit-down break kung kailangan." },
        { name: "Seated Balance (Isang Paa Nasa Taas)", sets: 3, duration: "15s bawat paa", rest: "30s", instruction: "Nakaupo. Itaas ang isang paa 6 pulgada, hold. Palitan.", modification: "Hawak sa upuan kung mahirap." },
        { name: "Standing Single-Leg (May Chair)", sets: 2, duration: "10s bawat paa", rest: "45s", instruction: "Nakatayo, HAWAK SA UPUAN o wall. Itaas ang isang paa konti lang. Konti-konti lang muna.", modification: "Nakaupo — itaas ang isang tuhod sa taas at hawakan doon." },
        { name: "Cool-down Leg Stretch", sets: 1, duration: "30s bawat leg", rest: "N/A", instruction: "Iunat ang binti para sa cool-down." },
      ]},
      { day: 13, title: "Chair Squats + Leg Strength", exercises: [
        { name: "Warm-up Ankle Circles", sets: 2, reps: "10 bawat direksyon", rest: "N/A", instruction: "Nakaupo. Ikutin ang mga bukong-bukong." },
        { name: "Modified Chair Squats", sets: 3, reps: "10 pag-tayo", rest: "60s", instruction: "Dahan-dahan pa kesa dati — 3 segundo pababa, 1 pause, 3 segundo pataas. Slower = stronger.", modification: "Half-squat lang kung may knee pain." },
        { name: "Seated Leg Extensions", sets: 3, reps: "10 bawat leg", rest: "45s", instruction: "Nakaupo. Iunat ang isang paa tuwid, hold 3 segundo, ibaba. Pinapaganda ang tuhod." },
        { name: "Standing Hip Extensions (May Chair)", sets: 2, reps: "10 bawat paa", rest: "45s", instruction: "Nakatayo, kamay sa upuan. Itaas ang isang paa papuntang likod nang konti — pinapasama ang puwet." },
        { name: "Glute Squeeze (Nakaupo)", sets: 2, reps: "15 pisil", rest: "30s", instruction: "Nakaupo. Pisilin ang puwet para 5 segundo, i-release. Nag-eexercise ng gluteals nang walang risk." },
        { name: "Cool-down Hip Flexor Stretch", sets: 1, duration: "20s bawat side", rest: "N/A", instruction: "Nakatayo, hawak sa upuan. Isang paa nasa harap, hulog ng katawan pauna. Ramdam ang stretch sa harap ng hita." },
      ]},
      { day: 14, title: "Active Recovery — Stretching", exercises: [
        { name: "Deep Breathing", sets: 1, reps: "10 hinga", rest: "N/A", instruction: "Umupo o humiga. Deep breathing para umpisahan ang recovery day." },
        { name: "Full Body Stretch Routine", duration: "15 minuto", rest: "N/A", instruction: "Stretch ang bawat muscle group — leeg, balikat, dibdib, likod, hita, binti. 20-30 segundo bawat stretch. Huwag pilitin kailanman." },
        { name: "Malumanay na Paglakad", duration: "10 minuto", rest: "N/A", instruction: "Optional — kung may energy pa, mag-lakad nang mabagal. Hindi kailangang matibay ngayong araw." },
        { name: "Malalim na Paghinga", sets: 1, reps: "10 hinga", rest: "N/A", instruction: "Sarahin sa deep breathing. Rest day mode." },
      ]},
      { day: 15, title: "Seated Core Work", exercises: [
        { name: "Warm-up Twists", sets: 2, reps: "10 bawat side", rest: "N/A", instruction: "Nakaupo. Slow twists left at right, para painitin ang core." },
        { name: "Seated Core Twist (May Bote)", sets: 3, reps: "10 bawat side", rest: "45s", instruction: "Nakaupo, hawak ang isang water bottle sa harap ng dibdib. Slow twist left at right.", modification: "Walang bote muna kung bagong beginner." },
        { name: "Seated Knee Raises", sets: 3, reps: "10 bawat tuhod", rest: "45s", instruction: "Nakaupo. Itaas ang isang tuhod papuntang dibdib, ibaba nang dahan-dahan. Ramdam ang lower core." },
        { name: "Pelvic Tilts (Nakaupo)", sets: 2, reps: "10 tilts", rest: "30s", instruction: "Nakaupo, likod tuwid. Ihilig ang pelvis pauna, tapos paatras. Delicate, para sa lower back." },
        { name: "Wall Plank", sets: 2, duration: "20–30 segundo", rest: "60s", instruction: "Nakatayo, kamay sa wall parang push-up position pero nakatayo. Hold lang, huwag umalog.", modification: "Mas malapit sa wall = mas madali." },
        { name: "Cool-down Cat-Cow", sets: 2, reps: "8 pag-galaw", rest: "N/A", instruction: "Nakaupo o nakadapa sa upuan. Slow cat-cow para relax ang spine." },
      ]},
      { day: 16, title: "Full Body Circuit (Light)", exercises: [
        { name: "Warm-up Marching", sets: 1, duration: "1 minuto", rest: "N/A", instruction: "Simulan sa magaan na march." },
        { name: "Wall Push-Up + Chair Squat Combo", sets: 3, reps: "5 wall push-ups + 5 chair squats", rest: "90s", instruction: "Gawin agad ang 5 wall push-ups, tapos 5 chair squats. Yun ang isang round." },
        { name: "Bicep Curls + Seated March", sets: 2, reps: "10 curls + 30s march", rest: "60s", instruction: "Water bottle bicep curls, tapos seated march agad." },
        { name: "Standing Balance (May Chair)", sets: 2, duration: "20s bawat side", rest: "45s", instruction: "Nakatayo, kamay sa upuan. Iangat ang isang paa sa gilid. Slow lang." },
        { name: "Cool-down Deep Stretch", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "I-stretch ang buong katawan. Focus sa pinaka-hard na parts today." },
      ]},
      { day: 17, title: "Tai Chi-Style Flow", exercises: [
        { name: "Warm-up Breathing", sets: 1, reps: "5 hinga", rest: "N/A", instruction: "Simulan sa deep, slow breathing. Ito ay flow day — puro slow at gentle." },
        { name: "Standing Wave (May Chair)", sets: 3, reps: "8 wave", rest: "30s", instruction: "Nakatayo, kamay sa upuan. Itaas ang parehong braso pataas nang dahan-dahan (parang wave), tapos ibaba. Malalim na hinga habang gumagalaw." },
        { name: "Cloud Hands (Nakaupo)", sets: 2, reps: "10 galaw", rest: "30s", instruction: "Nakaupo. Iimagine ang isang bola sa harap. Igalaw ang mga kamay parang nagbo-bola sa hangin — smooth, mabagal." },
        { name: "Standing Sway", sets: 2, duration: "1 minuto", rest: "45s", instruction: "Nakatayo, hawak sa upuan. Slow sway left at right, parang puno na hinahampas ng hangin. Ramdam ang balance." },
        { name: "Seated Flowing Arms", sets: 2, duration: "1 minuto", rest: "N/A", instruction: "Nakaupo. Slow flowing arm movements, parang ballet. Huwag stiff — flowing lang." },
        { name: "Cool-down Sitting Meditation", sets: 1, duration: "2 minuto", rest: "N/A", instruction: "Nakaupo, sarahan ang mata. Focus sa hinga. Nakakatulong sa stress at sleep." },
      ]},
      { day: 18, title: "Balance Confidence Day", exercises: [
        { name: "Warm-up Weight Shifts", sets: 2, reps: "10 bawat side", rest: "N/A", instruction: "Nakatayo, hawak sa upuan. Ilipat ang timbang left at right." },
        { name: "Single-Leg Stand (May Chair)", sets: 3, duration: "15s bawat paa", rest: "45s", instruction: "Nakatayo, HAWAK SA UPUAN palagi. Itaas ang isang paa konti lang. Pahaba habang lumilipas ang araw.", modification: "Nakaupo pa muna kung nawawalan ng balance." },
        { name: "Tandem Stance (May Wall)", sets: 2, duration: "20s bawat position", rest: "45s", instruction: "Nakatayo tabi ng wall. Isang paa sa harap, sakong nakadikit sa daliri ng kabila. Hawak sa wall." },
        { name: "Slow March in Place (May Chair)", sets: 2, duration: "30 segundo", rest: "30s", instruction: "Nakatayo, kamay sa upuan. Slow march — itaas ang tuhod ng mataas." },
        { name: "Backward Step (May Wall)", sets: 2, reps: "8 step bawat paa", rest: "45s", instruction: "Nakatayo tabi ng wall. Step paatras nang dahan-dahan, tapos step pauna. Balance drill." },
        { name: "Cool-down Ankle Stretches", sets: 1, duration: "30s bawat paa", rest: "N/A", instruction: "Nakaupo. Iflex at iunat ang bukong-bukong. Mahalaga sa balance." },
      ]},
      { day: 19, title: "Paglakad + Chair Strength", exercises: [
        { name: "Warm-up Deep Breathing + March", sets: 1, duration: "2 minuto", rest: "N/A", instruction: "Simulan sa deep breathing tapos magaan na march." },
        { name: "Walking + Chair Squat Circuit", sets: 3, reps: "3-minutong walk + 8 chair squats", rest: "60s", instruction: "Maglakad ng 3 minuto (loob o labas), tapos gawin ang chair squats. Rest, ulitin.", modification: "Maglakad lang kung mahirap magsquat pagkatapos maglakad." },
        { name: "Standing Bicep Curls (May Chair)", sets: 2, reps: "12 curls", rest: "45s", instruction: "Nakatayo, one hand on chair. Curl the water bottle." },
        { name: "Cool-down Deep Stretch", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "Focus sa binti at hita — yun ang pinakahard today." },
      ]},
      { day: 20, title: "Deep Stretch Day", exercises: [
        { name: "Warm-up Breathing", sets: 1, reps: "5 hinga", rest: "N/A", instruction: "Simulan sa deep, slow breathing." },
        { name: "Full Body Stretch Sequence", duration: "20 minuto", rest: "N/A", instruction: "Sistematiko: leeg (30s bawat side) → balikat (30s bawat arm) → dibdib (30s) → likod (30s) → hita (30s bawat leg) → binti (30s bawat leg) → sole (roll a bottle underfoot 1 minuto bawat side). Slow at deep." },
        { name: "Malumanay na Meditation", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "Nakaupo, sarahan mata. Focus sa hinga. Rest ng utak." },
      ]},
    ]
  },
  {
    phase: 3, name: "Habit at Endurance", weeks: "Linggo 5+ (at higit pa)", color: "#2D4A8F", bg: "#F0F4FF",
    days: [
      { day: 21, title: "Power Walking", exercises: [
        { name: "Warm-up Marching + Breathing", sets: 1, duration: "2 minuto", rest: "N/A", instruction: "Painitin ang katawan sa marching at malalim na paghinga." },
        { name: "Malumanay na Power Walking", duration: "15–20 minuto", rest: "N/A", instruction: "Konting bilisan sa normal na lakad — pero dapat kayang mag-usap habang naglalakad. Kung mahirap huminga, bumagal agad.", modification: "10 minuto lang okay na — huwag ipilit. Simulan sa loob ng bahay bago labas." },
        { name: "Post-Walk Leg Stretch", sets: 2, duration: "30s bawat leg", rest: "N/A", instruction: "Nakatayo, kamay sa upuan. Iunat ang binti — calf stretch at hamstring stretch." },
        { name: "Cool-down Deep Breathing", sets: 1, reps: "10 hinga", rest: "N/A", instruction: "Nakaupo. Recovery breathing." },
      ]},
      { day: 22, title: "Chair Strength (Malumanay)", exercises: [
        { name: "Warm-up Shoulder Rolls + Ankle Pumps", sets: 2, reps: "10 bawat", rest: "N/A", instruction: "Painitin ang katawan." },
        { name: "Chair Squats (Slow Tempo)", sets: 2, reps: "10 pag-tayo", rest: "90s", instruction: "Slow lang — 4 segundo pababa, pause, 2 segundo pataas. Ramdam ang muscles. Kung pagod, mag-rest ng matagal.", modification: "1 set lang kung nauubos ang energy — okay na yun." },
        { name: "Wall Push-Ups (Slow)", sets: 2, reps: "10 pag-taboy", rest: "90s", instruction: "Slow tempo — mas kontrolado. Mas malapit sa wall = mas madali; huwag mag-force ng lalayo.", modification: "1 set lang kung mahapo." },
        { name: "Standing Bicep Curls (Water Bottle)", sets: 3, reps: "12 curls", rest: "45s", instruction: "Nakatayo, kamay sa upuan sa side. Full range of motion." },
        { name: "Standing Calf Raises (Free)", sets: 3, reps: "15 pag-taas", rest: "45s", instruction: "Nakatayo, kamay LIGHT touch lang sa wall — mas free na. Itaas ang katawan sa daliri ng paa.", modification: "Kamay ng buo sa wall pa rin kung kailangan." },
        { name: "Cool-down Full Stretch", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "Deep stretch of everything worked today." },
      ]},
      { day: 23, title: "Deep Flexibility Day", exercises: [
        { name: "Warm-up Cat-Cow", sets: 2, reps: "10 pag-galaw", rest: "N/A", instruction: "Nakaupo. Slow cat-cow para painitin ang spine." },
        { name: "Chair Yoga Sequence", duration: "15 minuto", rest: "N/A", instruction: "Mountain pose (nakaupo) → seated side bend (bawat side) → seated twist (bawat side) → forward fold → shoulder rolls → cool-down. Bawat pose 30 segundo. Kumpleto flow." },
        { name: "Wall Stretches", duration: "10 minuto", rest: "N/A", instruction: "Chest opener sa wall (hold 30s) → calf stretch sa wall (30s bawat paa) → hip flexor sa wall (30s bawat side). Sistematiko lang." },
        { name: "Cool-down Meditation", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "Nakaupo, sarahan mata, focus sa hinga." },
      ]},
      { day: 24, title: "Pahinga at Pagninilay", exercises: [
        { name: "Magaan na Paglakad", duration: "10 minuto", rest: "N/A", instruction: "Rest day — optional na maglakad nang magaan para umikot." },
        { name: "Pahinga at Hydration", duration: "Buong araw", rest: "N/A", instruction: "Uminom ng 8 baso ng tubig. Matulog ng maaga. Rest ang goal ngayon." },
        { name: "Pagninilay: Ano Nakita Mo?", duration: "5 minuto", rest: "N/A", instruction: "Umupo nang tahimik. Isipin: Ano na ang napansin mong pagbabago sa katawan? Ano ang paborito mong exercise? Isulat kung gusto." },
      ]},
      { day: 25, title: "Buong Katawan Practice", exercises: [
        { name: "Malumanay na Warm-up", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "Marching, ankle circles, shoulder rolls, ankle pumps — pumainit lahat ng joints. Slow lang." },
        { name: "3 Ehersisyo x 2 Rounds", sets: 2, reps: "6 wall push-ups + 6 chair squats + 30s seated march", rest: "2 minuto", instruction: "Isang round: 6 wall push-ups → 6 chair squats → 30 segundong seated march. Rest ng 2 minuto. 2 rounds lang — huwag mag-force ng higit pa.", modification: "1 round lang kung mahapo, or bumaba ang reps sa 4 kada exercise." },
        { name: "Balance (Opsyonal)", sets: 1, duration: "20s bawat paa", rest: "60s", instruction: "Opsyonal ito — kung kaya lang. Nakatayo, HAWAK PARIN SA UPUAN. Itaas ang isang paa konti. Skip kung hindi confident.", modification: "Nakaupo — itaas ang tuhod. Same benefit, safer." },
        { name: "Cool-down Complete Stretch", sets: 1, duration: "5 minuto", rest: "N/A", instruction: "Full body stretch — 30s bawat major muscle group. Deep breathing." },
      ]},
      { day: 26, title: "Balance Mastery", exercises: [
        { name: "Warm-up Ankle Work", sets: 2, reps: "15 pumps bawat paa", rest: "N/A", instruction: "Iflex at iunat ang bukong-bukong. Sole tapping." },
        { name: "Single-Leg Stand Progression (May Chair)", sets: 3, duration: "20–30s bawat paa", rest: "45s", instruction: "Nakatayo, HAWAK SA UPUAN. Isang paa sa hangin. Pag-longer ka na, LIGHT touch lang sa upuan.", modification: "Hawak na buong palad kung nauubos ang balance." },
        { name: "Tandem Walking (Sa Tabi ng Wall)", sets: 2, reps: "10 steps", rest: "60s", instruction: "Tabi ng wall, isang kamay sa wall. Sakong sa harap ng daliri, tapos step. Slow, controlled." },
        { name: "Slow Backward Walking (May Wall)", sets: 2, reps: "10 steps", rest: "60s", instruction: "Nakatayo tabi ng wall. Step paatras nang dahan-dahan, isang paa muna, tapos ang isa." },
        { name: "Seated Balance (Isang Paa Nakataas)", sets: 3, duration: "30s bawat paa", rest: "30s", instruction: "Nakaupo. Iunat ang isang paa sa hangin, hold. Ramdam ang core na nag-eengage." },
        { name: "Cool-down Deep Stretch", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "Focus sa paa at bukong-bukong." },
      ]},
      { day: 27, title: "Breathing at Meditation", exercises: [
        { name: "Setup Breathing", sets: 1, reps: "5 hinga", rest: "N/A", instruction: "Nakaupo sa upuan o kama. Straight ang likod. Sarahan mata." },
        { name: "4-7-8 Breathing", sets: 1, reps: "8 cycles", rest: "N/A", instruction: "Ilalim ng hinga papasok — 4 segundo. Hold — 7 segundo. Ilabas — 8 segundo. Nakakatulong sa sleep at stress.", modification: "Kung mahirap ang 7 hold, gawing 4-4-6." },
        { name: "Body Scan Meditation", sets: 1, duration: "5 minuto", rest: "N/A", instruction: "Isa-isa isipin ang bawat parte ng katawan mula ulo hanggang paa. Ramdam ang tension, tapos relax. Pinapababa ng blood pressure." },
        { name: "Gratitude Reflection", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "Isipin ang 3 bagay na thankful ka ngayon. Simple lang — pamilya, kalusugan, pagkain, tahanan." },
        { name: "Final Deep Breaths", sets: 1, reps: "5 hinga", rest: "N/A", instruction: "Simulan ang araw nang tahimik at handa." },
      ]},
      { day: 28, title: "Chair Yoga Full Flow", exercises: [
        { name: "Seated Mountain Pose", sets: 1, duration: "1 minuto", rest: "N/A", instruction: "Setup — tuwid na upo, deep breathing, grounding." },
        { name: "Chair Yoga Sequence Complete", duration: "18 minuto", rest: "As needed", instruction: "Buong flow: Mountain → Cat-Cow (10x) → Side Bend (bawat side, 20s) → Twist (bawat side, 20s) → Forward Fold (30s) → Shoulder Rolls (10x) → Neck Stretch (bawat side, 20s) → Butterfly (30s) → Warrior seated (bawat side, 30s) → Final rest sa upuan (1 min). Slow at malalim." },
        { name: "Malumanay na Meditation", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "Sarahan mata, focus sa hinga. Ramdam ang buong katawan pagkatapos ng flow." },
      ]},
      { day: 29, title: "Paborito Mo!", exercises: [
        { name: "Warm-up", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "Marching, shoulder rolls, deep breathing." },
        { name: "Piliin ang 5 Paborito Mong Exercises", duration: "20 minuto", rest: "As needed", instruction: "Ngayong araw, ikaw ang bahala. Piliin ang 5 exercises mula sa nakaraang 28 araw na paborito mo. Ulitin ang mga yun. Ito ang habit — gawin ang gustong-gusto mo." },
        { name: "Cool-down Stretch", sets: 1, duration: "5 minuto", rest: "N/A", instruction: "Buong katawan stretch." },
      ]},
      { day: 30, title: "🎉 KUMPLETO! Celebration Day", exercises: [
        { name: "Celebration Warm-up", sets: 1, duration: "3 minuto", rest: "N/A", instruction: "Simulan sa deep breathing at pagninilay. Ikaw ay 30 araw completed!" },
        { name: "Best of 30 Days Circuit", sets: 2, reps: "5 chair squats + 5 wall push-ups + 30s seated march + 30s standing balance", rest: "90s", instruction: "Isang mini-circuit ng pinakamahalagang movements: strength, upper body, cardio, balance. Yumaman ka na sa isang buwan." },
        { name: "Reflect on Your Journey", sets: 1, duration: "5 minuto", rest: "N/A", instruction: "Nakaupo. Isipin: Ano ang natutunan ko? Ano ang mas madali na sa akin ngayon? Sino ang gustong ko iparating para thank you sa suporta?" },
        { name: "Final Cool-down + Deep Breathing", sets: 1, duration: "5 minuto", rest: "N/A", instruction: "Full body stretch para sa huling araw. Ipagpatuloy ang movement na ito sa susunod na buwan. Congrats!" },
        { name: "Ano Susunod?", duration: "Ongoing", rest: "N/A", instruction: "Ulitin ang Phase 3 (Day 21–30) para mag-maintain. O bumalik sa Phase 1 kung may mga araw na hindi mo pa napi-perfect. Ang goal ay LIFELONG movement — hindi one-time program." },
      ]},
    ]
  }
];
