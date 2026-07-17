import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — R&M EaseBrew",
  description: "Kung paano namin inaalagaan ang data mo sa R&M EaseBrew Wellness Hub.",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 80px", fontFamily: "Georgia, serif", color: "#1B201A", lineHeight: 1.7 }}>
      <p style={{ margin: "0 0 12px" }}>
        <Link href="/" style={{ color: "#39613B", fontWeight: 700 }}>← Bumalik sa Home</Link>
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#39613B", margin: "0 0 8px" }}>Privacy Policy</h1>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 24px" }}>Huling na-update: 2026-07-17</p>

      <h2 style={{ fontSize: 20, color: "#39613B", marginTop: 24 }}>Ano ang data na nakikita namin?</h2>
      <p>Kapag ginamit mo ang R&M EaseBrew Wellness Hub, nag-i-store kami ng mga sumusunod:</p>
      <ul>
        <li>Iyong access code (EASE-XXXX-XXXX) at package tier.</li>
        <li>Iyong health tracker entries (pain, mood, BP, weight, medication) — para makita mo ang progress mo.</li>
        <li>Iyong medical info card (kung nag-fill in ka) — para ma-share mo sa emergency contacts.</li>
        <li>Isang device ID para ma-lock sa isang phone ang code mo.</li>
      </ul>

      <h2 style={{ fontSize: 20, color: "#39613B", marginTop: 24 }}>Sino ang nakakakita ng data mo?</h2>
      <ul>
        <li>Ikaw — sa loob ng iyong app.</li>
        <li>Ang R&M EaseBrew admin at coach team — para tulungan kang mag-monitor ng iyong wellness journey.</li>
        <li>Ang iyong nominated family member — kung nag-generate ka ng family share link.</li>
      </ul>
      <p>Hindi kami nag-share ng iyong personal na data sa ibang kumpanya o advertiser.</p>

      <h2 style={{ fontSize: 20, color: "#39613B", marginTop: 24 }}>Paano ligtas ang data mo?</h2>
      <ul>
        <li>Naka-encrypt (HTTPS) ang bawat connection.</li>
        <li>Nasa secure Supabase database ang lahat ng entries mo.</li>
        <li>Naka-httpOnly cookie ang login mo — hindi mabubukas ng ibang website.</li>
      </ul>

      <h2 style={{ fontSize: 20, color: "#39613B", marginTop: 24 }}>Ano ang mga karapatan mo?</h2>
      <ul>
        <li>Pwede mong i-log out anumang oras (sa Log out button sa taas ng home page).</li>
        <li>Pwede kang humingi ng kopya, pag-edit, o pag-delete ng data mo — i-message ang coach mo.</li>
        <li>Kapag mag-expire na ang package mo, mananatili ang data mo hanggang mag-request ka ng deletion.</li>
      </ul>

      <h2 style={{ fontSize: 20, color: "#39613B", marginTop: 24 }}>Contact</h2>
      <p>Para sa privacy questions, i-message ang coach mo sa Coach tab ng app o mag-Facebook sa R&M EaseBrew page.</p>

      <p style={{ fontSize: 13, color: "#666", marginTop: 40, borderTop: "1px solid #ddd", paddingTop: 16 }}>
        Sumusunod kami sa Republic Act 10173 (Data Privacy Act of 2012) ng Pilipinas.
        Palaging magpakonsulta sa doctor mo para sa medical decisions — hindi kapalit ang app na ito sa professional medical advice.
      </p>
    </main>
  );
}
