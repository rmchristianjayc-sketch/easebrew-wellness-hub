// ============================================================
// COACHES — single source of truth
// Ginagamit ng: app/page.tsx, app/verify/page.tsx
// I-update dito lang kapag nagbago ang coach info
// ============================================================

export type Coach = {
    name: string;
    number: string;
    display: string;
    facebook: string;
    photo: string;
  };
  
  export const DEFAULT_COACHES: Coach[] = [
    { name: "Coach Josephine", number: "09177011252", display: "0917 701 1252", facebook: "https://www.facebook.com/josephine.easebrew.main",         photo: "/coaches/josephine.jpg" },
    { name: "Coach Niña",      number: "09688804440", display: "0968 880 4440", facebook: "https://www.facebook.com/easebrew.nina",                   photo: "/coaches/niña.jpg"      },
    { name: "Coach Mark",      number: "09171178216", display: "0917 117 8216", facebook: "https://www.facebook.com/profile.php?id=61577427472374",    photo: "/coaches/mark.jpg"      },
    { name: "Coach Rai",       number: "09709689164", display: "0970 968 9164", facebook: "https://www.facebook.com/profile.php?id=61579641330542",    photo: "/coaches/rai.jpg"       },
    { name: "Coach Jo Ann",    number: "09516851019", display: "0951 685 1019", facebook: "https://www.facebook.com/profile.php?id=61590474596913",    photo: "/coaches/joann.jpg"     },
    { name: "Coach Mike",      number: "09515986840", display: "0951 598 6840", facebook: "https://www.facebook.com/profile.php?id=61576324811239",    photo: "/coaches/mike.jpg"      },
  ];
  
  // Build coaches array from /api/content response (fallback to defaults per slot)
  export function buildCoaches(c: Record<string, string>, defaults: Coach[]): Coach[] {
    return defaults.map((def, i) => {
      const n = i + 1;
      return {
        name:     c[`coach_${n}_name`]?.trim()     || def.name,
        number:   c[`coach_${n}_number`]?.trim()   || def.number,
        display:  c[`coach_${n}_display`]?.trim()  || def.display,
        facebook: c[`coach_${n}_facebook`]?.trim() || def.facebook,
        photo:    c[`coach_${n}_photo`]?.trim()    || def.photo,
      };
    });
  }