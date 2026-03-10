"""
Generate screenshots for the Ścieżka Prawa technical documentation.
Creates realistic HTML mock pages and captures them using Playwright.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = Path(__file__).parent / "screenshots"
SCREENSHOTS_DIR.mkdir(exist_ok=True)

COMMON_STYLES = """
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0a0a0b; color: #f4f4f5; }
  .sidebar { width: 260px; background: #111113; border-right: 1px solid #27272a; height: 100vh; position: fixed; left: 0; top: 0; padding: 16px; display: flex; flex-direction: column; }
  .sidebar-logo { font-size: 16px; font-weight: 700; color: #fff; padding: 12px 8px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
  .sidebar-logo .icon { width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .sidebar-section { font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; padding: 16px 8px 8px; font-weight: 600; }
  .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; font-size: 14px; color: #a1a1aa; cursor: pointer; transition: all 0.15s; }
  .sidebar-item:hover { background: #1c1c1f; color: #fff; }
  .sidebar-item.active { background: #1c1c1f; color: #fff; font-weight: 500; }
  .sidebar-item .badge { margin-left: auto; background: #3b82f6; color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
  .main { margin-left: 260px; padding: 24px 32px; min-height: 100vh; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .header h1 { font-size: 24px; font-weight: 600; color: #fff; }
  .header .subtitle { font-size: 14px; color: #71717a; margin-top: 4px; }
  .search-bar { display: flex; align-items: center; gap: 8px; background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 8px 16px; width: 320px; }
  .search-bar input { background: transparent; border: none; color: #a1a1aa; font-size: 14px; width: 100%; outline: none; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; }
  .stat-card .label { font-size: 13px; color: #71717a; margin-bottom: 8px; }
  .stat-card .value { font-size: 28px; font-weight: 700; color: #fff; }
  .stat-card .change { font-size: 12px; margin-top: 4px; }
  .stat-card .change.up { color: #22c55e; }
  .stat-card .change.down { color: #ef4444; }
  .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; }
  .card-header { padding: 16px 20px; border-bottom: 1px solid #27272a; display: flex; justify-content: space-between; align-items: center; }
  .card-header h3 { font-size: 15px; font-weight: 600; color: #fff; }
  .card-body { padding: 16px 20px; }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
  .badge-blue { background: #1e3a5f; color: #60a5fa; }
  .badge-green { background: #14532d; color: #4ade80; }
  .badge-yellow { background: #422006; color: #facc15; }
  .badge-purple { background: #3b0764; color: #c084fc; }
  .badge-red { background: #450a0a; color: #f87171; }
  .badge-orange { background: #431407; color: #fb923c; }
  .badge-cyan { background: #083344; color: #22d3ee; }
  .btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
  .btn-primary { background: #3b82f6; color: #fff; }
  .btn-outline { background: transparent; border: 1px solid #27272a; color: #a1a1aa; }
  .filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .filter-btn { padding: 6px 14px; border-radius: 6px; font-size: 13px; background: #18181b; border: 1px solid #27272a; color: #a1a1aa; cursor: pointer; }
  .filter-btn.active { background: #1e3a5f; border-color: #3b82f6; color: #60a5fa; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #fff; }
  .user-menu { display: flex; align-items: center; gap: 12px; }
  .user-menu .name { font-size: 14px; color: #d4d4d8; }
  .notification-bell { width: 36px; height: 36px; background: #18181b; border: 1px solid #27272a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #71717a; font-size: 16px; position: relative; }
  .notification-bell .dot { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid #18181b; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 12px 16px; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #27272a; font-weight: 600; }
  td { padding: 14px 16px; font-size: 14px; color: #d4d4d8; border-bottom: 1px solid #1c1c1f; }
  tr:hover td { background: #1c1c1f; }
  .timeline { display: flex; align-items: center; gap: 0; margin: 16px 0; }
  .timeline-step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; }
  .timeline-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #27272a; background: #18181b; z-index: 1; }
  .timeline-dot.completed { background: #22c55e; border-color: #22c55e; }
  .timeline-dot.current { background: #3b82f6; border-color: #3b82f6; box-shadow: 0 0 12px rgba(59,130,246,0.5); }
  .timeline-line { position: absolute; top: 5px; left: 50%; width: 100%; height: 2px; background: #27272a; z-index: 0; }
  .timeline-line.completed { background: #22c55e; }
  .timeline-label { font-size: 10px; color: #71717a; margin-top: 6px; text-align: center; white-space: nowrap; }
  .timeline-label.active { color: #3b82f6; font-weight: 600; }
  .live-banner { background: linear-gradient(135deg, #dc2626, #991b1b); padding: 10px 20px; border-radius: 8px; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
  .live-dot { width: 8px; height: 8px; background: #fff; border-radius: 50%; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .live-banner span { color: #fff; font-size: 14px; font-weight: 500; }
  .tab-bar { display: flex; gap: 0; border-bottom: 1px solid #27272a; margin-bottom: 20px; }
  .tab { padding: 12px 20px; font-size: 14px; color: #71717a; cursor: pointer; border-bottom: 2px solid transparent; }
  .tab.active { color: #3b82f6; border-bottom-color: #3b82f6; font-weight: 500; }
  .ai-panel { background: #111827; border: 1px solid #1e3a5f; border-radius: 12px; padding: 20px; }
  .ai-panel h4 { color: #60a5fa; font-size: 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .ai-text { color: #d4d4d8; font-size: 14px; line-height: 1.7; }
  .ai-text p { margin-bottom: 10px; }
</style>
"""

SIDEBAR_HTML = """
<div class="sidebar">
  <div class="sidebar-logo">
    <div class="icon">⚖️</div>
    Ścieżka Prawa
  </div>
  <div class="sidebar-section">Menu główne</div>
  <div class="sidebar-item {active_dashboard}">📊 Panel główny</div>
  <div class="sidebar-item {active_bills}">📜 Projekty ustaw <span class="badge">124</span></div>
  <div class="sidebar-item {active_calendar}">📅 Kalendarz</div>
  <div class="sidebar-item {active_search}">🔍 Wyszukiwarka AI</div>
  <div class="sidebar-item {active_consultations}">💬 Konsultacje</div>
  <div class="sidebar-section">Osobiste</div>
  <div class="sidebar-item {active_alerts}">🔔 Powiadomienia</div>
  <div class="sidebar-item {active_saved}">⭐ Zapisane</div>
  <div class="sidebar-item {active_settings}">⚙️ Ustawienia</div>
  <div class="sidebar-section">Administracja</div>
  <div class="sidebar-item {active_admin}">🛡️ Panel admina</div>
  <div style="margin-top: auto; padding: 12px; border-top: 1px solid #27272a; display: flex; align-items: center; gap: 10px;">
    <div class="avatar">FC</div>
    <div>
      <div style="font-size: 13px; color: #fff; font-weight: 500;">Filip Czerwiński</div>
      <div style="font-size: 11px; color: #71717a;">Super Admin</div>
    </div>
  </div>
</div>
"""

def sidebar(active=""):
    replacements = {
        "active_dashboard": "", "active_bills": "", "active_calendar": "",
        "active_search": "", "active_consultations": "", "active_alerts": "",
        "active_saved": "", "active_settings": "", "active_admin": ""
    }
    if active:
        replacements[f"active_{active}"] = "active"
    result = SIDEBAR_HTML
    for key, val in replacements.items():
        result = result.replace("{" + key + "}", val)
    return result


# ===== PAGE 1: LANDING PAGE =====
LANDING_HTML = """<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #09090b; color: #f4f4f5; }
  .nav { position: fixed; top: 0; width: 100%; background: rgba(9,9,11,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid #27272a; z-index: 50; }
  .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
  .nav-logo { font-size: 16px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
  .nav-logo .dot { width: 28px; height: 28px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .nav-links { display: flex; gap: 32px; font-size: 14px; color: #71717a; }
  .nav-links a { color: inherit; text-decoration: none; }
  .nav-links a:hover { color: #fff; }
  .nav-actions { display: flex; gap: 12px; align-items: center; }
  .nav-actions .login { font-size: 14px; color: #a1a1aa; text-decoration: none; }
  .nav-actions .signup { font-size: 14px; background: #fff; color: #09090b; padding: 8px 20px; border-radius: 50px; font-weight: 500; text-decoration: none; }
  .hero { padding: 140px 24px 80px; text-align: center; position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%); }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: #18181b; border: 1px solid #27272a; border-radius: 50px; padding: 6px 16px; font-size: 13px; color: #a1a1aa; margin-bottom: 24px; }
  .hero-badge .dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; }
  .hero h1 { font-size: 64px; font-weight: 600; line-height: 1.1; background: linear-gradient(to bottom right, #fff, #a1a1aa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px; max-width: 700px; margin-left: auto; margin-right: auto; }
  .hero p { font-size: 18px; color: #71717a; max-width: 600px; margin: 0 auto 40px; line-height: 1.6; }
  .hero-buttons { display: flex; gap: 16px; justify-content: center; }
  .hero-buttons .primary { background: #fff; color: #09090b; padding: 12px 28px; border-radius: 50px; font-size: 15px; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 8px; }
  .hero-buttons .secondary { background: transparent; border: 1px solid #3f3f46; color: #d4d4d8; padding: 12px 28px; border-radius: 50px; font-size: 15px; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 8px; }
  .mockup { max-width: 1100px; margin: 60px auto 0; background: rgba(24,24,27,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.5); position: relative; }
  .mockup::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to top, #09090b, transparent); pointer-events: none; }
  .mockup-bar { height: 44px; background: #111; border-bottom: 1px solid #27272a; display: flex; align-items: center; padding: 0 16px; gap: 8px; }
  .mockup-bar .dot { width: 12px; height: 12px; border-radius: 50%; background: #27272a; }
  .mockup-bar .url { margin-left: 20px; background: #09090b; border: 1px solid #27272a; border-radius: 6px; padding: 4px 16px; font-size: 12px; color: #71717a; flex: 1; max-width: 400px; }
  .mockup-body { display: grid; grid-template-columns: 220px 1fr; min-height: 420px; }
  .mockup-sidebar { background: #0f0f11; border-right: 1px solid #1c1c1f; padding: 16px; }
  .mockup-sidebar .item { padding: 8px 12px; border-radius: 6px; font-size: 13px; color: #71717a; margin-bottom: 2px; }
  .mockup-sidebar .item.active { background: #1c1c1f; color: #fff; }
  .mockup-main { padding: 20px; }
  .mockup-main .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
  .mockup-main .mini-stat { background: #111; border: 1px solid #1c1c1f; border-radius: 8px; padding: 14px; }
  .mockup-main .mini-stat .num { font-size: 22px; font-weight: 700; color: #fff; }
  .mockup-main .mini-stat .lbl { font-size: 11px; color: #52525b; margin-top: 2px; }
  .mockup-bill { padding: 14px; border-bottom: 1px solid #1c1c1f; }
  .mockup-bill .title { font-size: 13px; color: #d4d4d8; margin-bottom: 4px; }
  .mockup-bill .meta { font-size: 11px; color: #52525b; }
  .mockup-bill .status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; margin-right: 8px; }
  .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; padding: 80px 24px; }
  .feature { padding: 28px; border: 1px solid #27272a; border-radius: 16px; background: #111113; }
  .feature .icon { width: 44px; height: 44px; border-radius: 10px; background: #18181b; border: 1px solid #27272a; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; }
  .feature h3 { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 8px; }
  .feature p { font-size: 14px; color: #71717a; line-height: 1.6; }
  .stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; padding: 60px 24px; border-top: 1px solid #1c1c1f; text-align: center; }
  .stats-bar .num { font-size: 32px; font-weight: 700; color: #fff; }
  .stats-bar .lbl { font-size: 12px; color: #52525b; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
</style></head><body>
<nav class="nav"><div class="nav-inner">
  <div class="nav-logo"><div class="dot">⚖️</div> Ścieżka Prawa</div>
  <div class="nav-links"><a href="#">Funkcje</a><a href="#">Na żywo</a><a href="#">O projekcie</a></div>
  <div class="nav-actions"><a class="login" href="#">Zaloguj się</a><a class="signup" href="#">Załóż konto</a></div>
</div></nav>
<div class="hero">
  <div class="hero-badge"><span class="dot"></span> 🏆 Zwycięski projekt HackNation PL 2025</div>
  <h1>Przejrzystość prawa w Twoich rękach.</h1>
  <p>Platforma monitorująca proces legislacyjny w Polsce. Śledź projekty ustaw, otrzymuj powiadomienia AI i bądź świadomym obywatelem.</p>
  <div class="hero-buttons">
    <a class="primary" href="#">Rozpocznij monitoring →</a>
    <a class="secondary" href="#">🔍 Przeglądaj ustawy</a>
  </div>
  <div class="mockup">
    <div class="mockup-bar"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="url">sciezka-prawa.vercel.app/dashboard</div></div>
    <div class="mockup-body">
      <div class="mockup-sidebar">
        <div style="font-size: 14px; font-weight: 600; color: #fff; padding: 8px 12px; margin-bottom: 12px;">⚖️ Ścieżka Prawa</div>
        <div class="item active">📊 Panel główny</div>
        <div class="item">📜 Projekty ustaw</div>
        <div class="item">📅 Kalendarz</div>
        <div class="item">🔍 Wyszukiwarka AI</div>
        <div class="item">💬 Konsultacje</div>
        <div class="item">🔔 Powiadomienia</div>
      </div>
      <div class="mockup-main">
        <div class="stat-row">
          <div class="mini-stat"><div class="num">124</div><div class="lbl">Projekty ustaw</div></div>
          <div class="mini-stat"><div class="num">47</div><div class="lbl">W trakcie prac</div></div>
          <div class="mini-stat"><div class="num">38</div><div class="lbl">Opublikowane</div></div>
          <div class="mini-stat"><div class="num">12</div><div class="lbl">Twoje alerty</div></div>
        </div>
        <div class="mockup-bill"><span class="status" style="background:#1e3a5f;color:#60a5fa;">I Czytanie</span><span class="title">Projekt ustawy o zmianie ustawy o podatku dochodowym od osób fizycznych</span><div class="meta">Ministerstwo Finansów · Wpłynięcie: 2025-01-15 · Druk nr 321</div></div>
        <div class="mockup-bill"><span class="status" style="background:#14532d;color:#4ade80;">Senat</span><span class="title">Rządowy projekt ustawy o ochronie ludności i obronie cywilnej</span><div class="meta">Ministerstwo Spraw Wewnętrznych · Druk nr 105</div></div>
        <div class="mockup-bill"><span class="status" style="background:#3b0764;color:#c084fc;">Komisja</span><span class="title">Poselski projekt ustawy o zmianie Kodeksu pracy</span><div class="meta">Komisja Polityki Społecznej · Druk nr 219</div></div>
        <div class="mockup-bill"><span class="status" style="background:#422006;color:#facc15;">Prezydent</span><span class="title">Projekt ustawy o sygnalistach</span><div class="meta">Ministerstwo Rodziny · Druk nr 317</div></div>
      </div>
    </div>
  </div>
</div>
<div class="features">
  <div class="feature"><div class="icon">⚡</div><h3>Aktualizacje w czasie rzeczywistym</h3><p>Automatyczne pobieranie danych z API Sejmu RP i systemu ELI. Natychmiastowe powiadomienia o zmianach statusu.</p></div>
  <div class="feature"><div class="icon">🤖</div><h3>Analiza AI (Gemini 2.0)</h3><p>Tłumaczenie ustaw na prosty język, analiza skutków, streszczenia i wyjaśnienia terminologii prawnej.</p></div>
  <div class="feature"><div class="icon">🔔</div><h3>Spersonalizowane alerty</h3><p>Ustaw powiadomienia email dla konkretnych ustaw, ministerstw lub słów kluczowych. Nie przegap ważnych głosowań.</p></div>
</div>
<div class="stats-bar">
  <div><div class="num">X kadencja</div><div class="lbl">Sejm RP</div></div>
  <div><div class="num">460</div><div class="lbl">Posłów</div></div>
  <div><div class="num">120+</div><div class="lbl">Projektów / miesiąc</div></div>
  <div><div class="num">24/7</div><div class="lbl">Monitoring</div></div>
</div>
</body></html>"""


# ===== PAGE 2: DASHBOARD =====
DASHBOARD_HTML = f"""<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8">
{COMMON_STYLES}
</head><body>
{sidebar("dashboard")}
<div class="main">
  <div class="header">
    <div><h1>Panel główny</h1><div class="subtitle">Przegląd procesu legislacyjnego w Polsce</div></div>
    <div class="user-menu">
      <div class="notification-bell">🔔<div class="dot"></div></div>
      <div class="avatar">FC</div>
      <div class="name">Filip Czerwiński</div>
    </div>
  </div>

  <div class="live-banner">
    <div class="live-dot"></div>
    <span>🔴 Sejm RP — Transmisja na żywo: 23. posiedzenie Sejmu X kadencji</span>
    <span style="margin-left:auto;font-size:12px;opacity:0.8;">Oglądaj na YouTube →</span>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><div class="label">Wszystkie projekty</div><div class="value">124</div><div class="change up">↑ +8 w tym miesiącu</div></div>
    <div class="stat-card"><div class="label">W trakcie prac</div><div class="value">47</div><div class="change up">↑ +3 nowe</div></div>
    <div class="stat-card"><div class="label">Opublikowane ustawy</div><div class="value">38</div><div class="change up">↑ +2 w tym tygodniu</div></div>
    <div class="stat-card"><div class="label">Twoje alerty</div><div class="value">12</div><div class="change">3 aktywne zmiany</div></div>
  </div>

  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
    <div class="card">
      <div class="card-header"><h3>📜 Ostatnie aktualizacje</h3><span class="btn btn-outline" style="font-size:12px;">Zobacz wszystkie →</span></div>
      <div class="card-body" style="padding:0;">
        <table>
          <thead><tr><th>Projekt</th><th>Status</th><th>Aktualizacja</th></tr></thead>
          <tbody>
            <tr><td style="font-weight:500;">Ustawa o podatku dochodowym</td><td><span class="badge badge-blue">I Czytanie</span></td><td style="color:#71717a;font-size:13px;">2 godz. temu</td></tr>
            <tr><td style="font-weight:500;">Ustawa o ochronie ludności</td><td><span class="badge badge-green">Senat</span></td><td style="color:#71717a;font-size:13px;">Wczoraj</td></tr>
            <tr><td style="font-weight:500;">Zmiana Kodeksu pracy</td><td><span class="badge badge-purple">Komisja</span></td><td style="color:#71717a;font-size:13px;">2 dni temu</td></tr>
            <tr><td style="font-weight:500;">Ustawa o sygnalistach</td><td><span class="badge badge-yellow">Prezydent</span></td><td style="color:#71717a;font-size:13px;">3 dni temu</td></tr>
            <tr><td style="font-weight:500;">Prawo o szkolnictwie wyższym</td><td><span class="badge badge-orange">II Czytanie</span></td><td style="color:#71717a;font-size:13px;">4 dni temu</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>📊 Statusy projektów</h3></div>
      <div class="card-body">
        <div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span style="color:#d4d4d8;">Opublikowane</span><span style="color:#71717a;">38</span></div><div style="height:8px;background:#27272a;border-radius:4px;overflow:hidden;"><div style="width:31%;height:100%;background:#22c55e;border-radius:4px;"></div></div></div>
        <div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span style="color:#d4d4d8;">Komisja</span><span style="color:#71717a;">22</span></div><div style="height:8px;background:#27272a;border-radius:4px;overflow:hidden;"><div style="width:18%;height:100%;background:#8b5cf6;border-radius:4px;"></div></div></div>
        <div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span style="color:#d4d4d8;">I Czytanie</span><span style="color:#71717a;">18</span></div><div style="height:8px;background:#27272a;border-radius:4px;overflow:hidden;"><div style="width:15%;height:100%;background:#3b82f6;border-radius:4px;"></div></div></div>
        <div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span style="color:#d4d4d8;">Senat</span><span style="color:#71717a;">15</span></div><div style="height:8px;background:#27272a;border-radius:4px;overflow:hidden;"><div style="width:12%;height:100%;background:#06b6d4;border-radius:4px;"></div></div></div>
        <div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span style="color:#d4d4d8;">Odrzucone</span><span style="color:#71717a;">11</span></div><div style="height:8px;background:#27272a;border-radius:4px;overflow:hidden;"><div style="width:9%;height:100%;background:#ef4444;border-radius:4px;"></div></div></div>
        <div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span style="color:#d4d4d8;">Konsultacje</span><span style="color:#71717a;">8</span></div><div style="height:8px;background:#27272a;border-radius:4px;overflow:hidden;"><div style="width:6%;height:100%;background:#f59e0b;border-radius:4px;"></div></div></div>
      </div>
    </div>
  </div>
</div>
</body></html>"""


# ===== PAGE 3: BILLS LIST =====
BILLS_HTML = f"""<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8">
{COMMON_STYLES}
</head><body>
{sidebar("bills")}
<div class="main">
  <div class="header">
    <div><h1>Projekty ustaw</h1><div class="subtitle">Przeglądaj i filtruj projekty legislacyjne X kadencji Sejmu RP</div></div>
    <div class="search-bar"><span style="color:#52525b;">🔍</span><input type="text" placeholder="Szukaj projektów..." value=""></div>
  </div>

  <div class="filters">
    <div class="filter-btn active">Wszystkie (124)</div>
    <div class="filter-btn">Wpłynięcie (12)</div>
    <div class="filter-btn">I Czytanie (18)</div>
    <div class="filter-btn">Komisja (22)</div>
    <div class="filter-btn">II Czytanie (8)</div>
    <div class="filter-btn">III Czytanie (5)</div>
    <div class="filter-btn">Senat (15)</div>
    <div class="filter-btn">Prezydent (6)</div>
    <div class="filter-btn">Opublikowane (38)</div>
  </div>

  <div style="display:flex;gap:8px;margin-bottom:20px;">
    <select style="background:#18181b;border:1px solid #27272a;color:#a1a1aa;padding:8px 14px;border-radius:6px;font-size:13px;"><option>Sortuj: Ostatnia aktualizacja</option></select>
    <select style="background:#18181b;border:1px solid #27272a;color:#a1a1aa;padding:8px 14px;border-radius:6px;font-size:13px;"><option>Wnioskodawca: Wszyscy</option></select>
    <select style="background:#18181b;border:1px solid #27272a;color:#a1a1aa;padding:8px 14px;border-radius:6px;font-size:13px;"><option>Kategoria: Wszystkie</option></select>
    <select style="background:#18181b;border:1px solid #27272a;color:#a1a1aa;padding:8px 14px;border-radius:6px;font-size:13px;"><option>Rok: 2025</option></select>
  </div>

  <div class="card">
    <div class="card-body" style="padding:0;">
      <table>
        <thead><tr><th>Projekt</th><th>Wnioskodawca</th><th>Status</th><th>Ministerstwo</th><th>Data</th><th></th></tr></thead>
        <tbody>
          <tr><td style="font-weight:500;">Ustawa o zmianie ustawy o podatku dochodowym od osób fizycznych</td><td style="font-size:13px;color:#a1a1aa;">Rząd</td><td><span class="badge badge-blue">I Czytanie</span></td><td style="font-size:13px;color:#a1a1aa;">Min. Finansów</td><td style="font-size:13px;color:#71717a;">15.01.2025</td><td><span class="btn btn-outline" style="font-size:11px;">Szczegóły</span></td></tr>
          <tr><td style="font-weight:500;">Rządowy projekt ustawy o ochronie ludności i obronie cywilnej</td><td style="font-size:13px;color:#a1a1aa;">Rząd</td><td><span class="badge badge-green">Senat</span></td><td style="font-size:13px;color:#a1a1aa;">MSWiA</td><td style="font-size:13px;color:#71717a;">03.12.2024</td><td><span class="btn btn-outline" style="font-size:11px;">Szczegóły</span></td></tr>
          <tr><td style="font-weight:500;">Poselski projekt ustawy o zmianie Kodeksu pracy</td><td style="font-size:13px;color:#a1a1aa;">Posłowie</td><td><span class="badge badge-purple">Komisja</span></td><td style="font-size:13px;color:#a1a1aa;">Min. Rodziny</td><td style="font-size:13px;color:#71717a;">22.11.2024</td><td><span class="btn btn-outline" style="font-size:11px;">Szczegóły</span></td></tr>
          <tr><td style="font-weight:500;">Projekt ustawy o sygnalistach</td><td style="font-size:13px;color:#a1a1aa;">Rząd</td><td><span class="badge badge-yellow">Prezydent</span></td><td style="font-size:13px;color:#a1a1aa;">Min. Rodziny</td><td style="font-size:13px;color:#71717a;">10.11.2024</td><td><span class="btn btn-outline" style="font-size:11px;">Szczegóły</span></td></tr>
          <tr><td style="font-weight:500;">Prawo o szkolnictwie wyższym i nauce</td><td style="font-size:13px;color:#a1a1aa;">Rząd</td><td><span class="badge badge-orange">II Czytanie</span></td><td style="font-size:13px;color:#a1a1aa;">MNiSW</td><td style="font-size:13px;color:#71717a;">01.11.2024</td><td><span class="btn btn-outline" style="font-size:11px;">Szczegóły</span></td></tr>
          <tr><td style="font-weight:500;">Ustawa o krajowym systemie cyberbezpieczeństwa</td><td style="font-size:13px;color:#a1a1aa;">Rząd</td><td><span class="badge badge-cyan">Konsultacje</span></td><td style="font-size:13px;color:#a1a1aa;">Min. Cyfryzacji</td><td style="font-size:13px;color:#71717a;">15.10.2024</td><td><span class="btn btn-outline" style="font-size:11px;">Szczegóły</span></td></tr>
          <tr><td style="font-weight:500;">Nowelizacja ustawy o ochronie danych osobowych</td><td style="font-size:13px;color:#a1a1aa;">Senat</td><td><span class="badge badge-green">Opublikowana</span></td><td style="font-size:13px;color:#a1a1aa;">Min. Cyfryzacji</td><td style="font-size:13px;color:#71717a;">01.09.2024</td><td><span class="btn btn-outline" style="font-size:11px;">Szczegóły</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
    <span style="font-size:13px;color:#71717a;">Wyświetlono 1-10 z 124 projektów</span>
    <div style="display:flex;gap:8px;">
      <span class="btn btn-outline" style="font-size:12px;opacity:0.5;">← Poprzednia</span>
      <span class="btn btn-primary" style="font-size:12px;">Następna →</span>
    </div>
  </div>
</div>
</body></html>"""


# ===== PAGE 4: BILL DETAIL =====
BILL_DETAIL_HTML = f"""<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8">
{COMMON_STYLES}
</head><body>
{sidebar("bills")}
<div class="main">
  <div style="margin-bottom:8px;font-size:13px;color:#71717a;">← Powrót do listy projektów</div>
  <div class="header">
    <div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;"><span class="badge badge-blue">I Czytanie</span><span style="font-size:13px;color:#52525b;">Druk nr 321</span></div>
      <h1 style="font-size:22px;">Projekt ustawy o zmianie ustawy o podatku dochodowym od osób fizycznych</h1>
      <div class="subtitle">Ministerstwo Finansów · Wnioskodawca: Rada Ministrów · Wpłynięcie: 15.01.2025</div>
    </div>
    <div style="display:flex;gap:8px;">
      <span class="btn btn-outline">🔔 Śledź projekt</span>
      <span class="btn btn-outline">🔗 Sejm.gov.pl</span>
    </div>
  </div>

  <!-- Timeline -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-header"><h3>Ścieżka legislacyjna</h3></div>
    <div class="card-body">
      <div class="timeline">
        <div class="timeline-step"><div class="timeline-line completed"></div><div class="timeline-dot completed"></div><div class="timeline-label">Wpłynięcie</div></div>
        <div class="timeline-step"><div class="timeline-line" style="background:linear-gradient(to right, #22c55e, #3b82f6);"></div><div class="timeline-dot current"></div><div class="timeline-label active">I Czytanie</div></div>
        <div class="timeline-step"><div class="timeline-line"></div><div class="timeline-dot"></div><div class="timeline-label">Komisja</div></div>
        <div class="timeline-step"><div class="timeline-line"></div><div class="timeline-dot"></div><div class="timeline-label">II Czytanie</div></div>
        <div class="timeline-step"><div class="timeline-line"></div><div class="timeline-dot"></div><div class="timeline-label">III Czytanie</div></div>
        <div class="timeline-step"><div class="timeline-line"></div><div class="timeline-dot"></div><div class="timeline-label">Senat</div></div>
        <div class="timeline-step"><div class="timeline-line"></div><div class="timeline-dot"></div><div class="timeline-label">Prezydent</div></div>
        <div class="timeline-step"><div class="timeline-dot"></div><div class="timeline-label">Publikacja</div></div>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="tab-bar">
    <div class="tab active">Ogólne</div>
    <div class="tab">Ścieżka legislacyjna</div>
    <div class="tab">Głosowania</div>
    <div class="tab">🤖 AI Pomoc</div>
    <div class="tab">Ocena skutków</div>
    <div class="tab">Konsultacje</div>
    <div class="tab">Propozycje</div>
  </div>

  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
    <div>
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3>Opis projektu</h3></div>
        <div class="card-body" style="font-size:14px;color:#a1a1aa;line-height:1.8;">
          <p>Celem projektu jest podwyższenie kwoty wolnej od podatku do 60 000 zł oraz zmiana progów podatkowych. 
          Projekt przewiduje również uproszczenie systemu ulg podatkowych dla osób fizycznych prowadzących 
          jednoosobową działalność gospodarczą.</p>
          <p style="margin-top:12px;">Szacowany koszt reform dla budżetu państwa wynosi ok. 15 mld zł rocznie, co ma zostać 
          częściowo skompensowane przez wzrost konsumpcji i poszerzenie bazy podatkowej.</p>
        </div>
      </div>
      <div class="ai-panel">
        <h4>🤖 Analiza AI — Prosty język</h4>
        <div class="ai-text">
          <p><strong>📋 Najważniejsze zmiany:</strong></p>
          <p>• Kwota wolna od podatku wzrośnie z 30 000 do 60 000 zł — oznacza to, że osoby zarabiające do 5 000 zł miesięcznie brutto nie zapłacą podatku dochodowego.</p>
          <p>• Drugi próg podatkowy (32%) będzie obowiązywał od 200 000 zł zamiast 120 000 zł rocznego dochodu.</p>
          <p>• Uproszczony system ulg dla jednoosobowych firm — jedna wspólna ulga zamiast kilku oddzielnych.</p>
          <p style="margin-top: 12px;"><strong>👤 Jak to wpływa na Ciebie?</strong></p>
          <p>Jeśli zarabiasz poniżej 5000 zł brutto — nie zapłacisz podatku dochodowego. Osoby zarabiające 8000-12000 zł mogą zaoszczędzić nawet 200-400 zł miesięcznie.</p>
        </div>
      </div>
    </div>
    <div>
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3>Szczegóły</h3></div>
        <div class="card-body" style="font-size:13px;">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1c1c1f;"><span style="color:#71717a;">Status</span><span class="badge badge-blue">I Czytanie</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1c1c1f;"><span style="color:#71717a;">Kadencja</span><span style="color:#d4d4d8;">X</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1c1c1f;"><span style="color:#71717a;">Druk nr</span><span style="color:#d4d4d8;">321</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1c1c1f;"><span style="color:#71717a;">Wnioskodawca</span><span style="color:#d4d4d8;">Rada Ministrów</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1c1c1f;"><span style="color:#71717a;">Kategoria</span><span style="color:#d4d4d8;">Podatki</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="color:#71717a;">Ministerstwo</span><span style="color:#d4d4d8;">Min. Finansów</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>📅 Historia zmian</h3></div>
        <div class="card-body" style="font-size:13px;">
          <div style="padding:8px 0;border-bottom:1px solid #1c1c1f;"><div style="color:#d4d4d8;font-weight:500;">Skierowanie do I Czytania</div><div style="color:#52525b;font-size:12px;margin-top:2px;">15 stycznia 2025</div></div>
          <div style="padding:8px 0;border-bottom:1px solid #1c1c1f;"><div style="color:#d4d4d8;font-weight:500;">Wpłynięcie projektu</div><div style="color:#52525b;font-size:12px;margin-top:2px;">10 stycznia 2025</div></div>
          <div style="padding:8px 0;"><div style="color:#d4d4d8;font-weight:500;">Publikacja druku nr 321</div><div style="color:#52525b;font-size:12px;margin-top:2px;">8 stycznia 2025</div></div>
        </div>
      </div>
    </div>
  </div>
</div>
</body></html>"""


# ===== PAGE 5: ADMIN PANEL =====
ADMIN_HTML = f"""<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8">
{COMMON_STYLES}
</head><body>
{sidebar("admin")}
<div class="main">
  <div class="header">
    <div><h1>🛡️ Panel administracyjny</h1><div class="subtitle">Zarządzanie systemem Ścieżka Prawa</div></div>
    <div><span class="badge" style="background:#422006;color:#facc15;padding:6px 14px;font-size:13px;">Super Admin</span></div>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><div class="label">👥 Użytkownicy</div><div class="value">2,847</div><div class="change up">↑ +156 ten miesiąc</div></div>
    <div class="stat-card"><div class="label">📜 Projekty ustaw</div><div class="value">124</div><div class="change up">↑ +8 nowych</div></div>
    <div class="stat-card"><div class="label">🔒 Ukryte projekty</div><div class="value">3</div><div class="change" style="color:#71717a;">Brak zmian</div></div>
    <div class="stat-card"><div class="label">⚡ Status systemu</div><div class="value" style="color:#22c55e;font-size:22px;">Operacyjny</div><div class="change" style="color:#71717a;">Uptime: 99.9%</div></div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;margin-bottom:24px;">
    <div class="card" style="cursor:pointer;"><div class="card-body" style="text-align:center;padding:24px;">
      <div style="font-size:32px;margin-bottom:8px;">👥</div>
      <div style="font-size:15px;font-weight:600;color:#fff;">Zarządzaj użytkownikami</div>
      <div style="font-size:12px;color:#71717a;margin-top:4px;">Role, blokowanie, usuwanie</div>
    </div></div>
    <div class="card" style="cursor:pointer;"><div class="card-body" style="text-align:center;padding:24px;">
      <div style="font-size:32px;margin-bottom:8px;">📜</div>
      <div style="font-size:15px;font-weight:600;color:#fff;">Zarządzaj projektami</div>
      <div style="font-size:12px;color:#71717a;margin-top:4px;">Edycja, ukrywanie, szczegóły</div>
    </div></div>
    <div class="card" style="cursor:pointer;"><div class="card-body" style="text-align:center;padding:24px;">
      <div style="font-size:32px;margin-bottom:8px;">🔄</div>
      <div style="font-size:15px;font-weight:600;color:#fff;">Synchronizacja</div>
      <div style="font-size:12px;color:#71717a;margin-top:4px;">Sejm API, RCL sync</div>
    </div></div>
    <div class="card" style="cursor:pointer;"><div class="card-body" style="text-align:center;padding:24px;">
      <div style="font-size:32px;margin-bottom:8px;">⚙️</div>
      <div style="font-size:15px;font-weight:600;color:#fff;">Ustawienia systemu</div>
      <div style="font-size:12px;color:#71717a;margin-top:4px;">Konfiguracja, tryb serwisowy</div>
    </div></div>
  </div>

  <div class="card">
    <div class="card-header"><h3>📋 Ostatnia aktywność administracyjna</h3></div>
    <div class="card-body" style="padding:0;">
      <table>
        <thead><tr><th>Administrator</th><th>Akcja</th><th>Cel</th><th>Data</th></tr></thead>
        <tbody>
          <tr><td><div style="display:flex;align-items:center;gap:8px;"><div class="avatar" style="width:28px;height:28px;font-size:11px;">FC</div>Filip Czerwiński</div></td><td>Synchronizacja API Sejmu</td><td>124 projektów</td><td style="color:#71717a;font-size:13px;">Dzisiaj, 14:32</td></tr>
          <tr><td><div style="display:flex;align-items:center;gap:8px;"><div class="avatar" style="width:28px;height:28px;font-size:11px;background:#8b5cf6;">AK</div>Anna Kowalska</div></td><td>Zmiana roli użytkownika</td><td>jan.nowak@mail.pl → moderator</td><td style="color:#71717a;font-size:13px;">Dzisiaj, 11:15</td></tr>
          <tr><td><div style="display:flex;align-items:center;gap:8px;"><div class="avatar" style="width:28px;height:28px;font-size:11px;">FC</div>Filip Czerwiński</div></td><td>Ukrycie projektu</td><td>Druk nr 89 — tymczasowo</td><td style="color:#71717a;font-size:13px;">Wczoraj, 18:45</td></tr>
          <tr><td><div style="display:flex;align-items:center;gap:8px;"><div class="avatar" style="width:28px;height:28px;font-size:11px;background:#8b5cf6;">AK</div>Anna Kowalska</div></td><td>Zmiana ustawień</td><td>auto_sync_interval: 30 → 15 min</td><td style="color:#71717a;font-size:13px;">Wczoraj, 09:30</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</body></html>"""


# ===== PAGE 6: AI SEARCH =====
AI_SEARCH_HTML = f"""<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8">
{COMMON_STYLES}
</head><body>
{sidebar("search")}
<div class="main">
  <div class="header">
    <div><h1>🔍 Wyszukiwarka AI</h1><div class="subtitle">Inteligentne wyszukiwanie projektów legislacyjnych</div></div>
  </div>

  <div class="card" style="margin-bottom:24px;">
    <div class="card-body">
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;">
        <div class="search-bar" style="flex:1;"><span style="color:#52525b;">🔍</span><input type="text" value="ustawy dotyczące ochrony środowiska i zmian klimatycznych" style="background:transparent;border:none;color:#fff;font-size:14px;width:100%;outline:none;"></div>
        <span class="btn btn-primary">Szukaj z AI</span>
      </div>
      <div class="ai-panel" style="background:#0f1729;">
        <h4>🤖 Analiza wyszukiwania AI</h4>
        <div class="ai-text" style="font-size:13px;">
          <p>Na podstawie Twojego zapytania zidentyfikowałem następujące kategorie:</p>
          <p>📂 <strong>Kategoria:</strong> Ochrona środowiska, Energia, Klimat</p>
          <p>📊 <strong>Sugerowane statusy:</strong> Konsultacje, I Czytanie, Komisja</p>
          <p>🏢 <strong>Ministerstwa:</strong> Min. Klimatu i Środowiska, Min. Infrastruktury</p>
          <p>Znaleziono <strong>8 projektów</strong> pasujących do zapytania.</p>
        </div>
      </div>
    </div>
  </div>

  <div style="font-size:14px;color:#71717a;margin-bottom:16px;">Wyniki wyszukiwania (8)</div>

  <div class="card" style="margin-bottom:12px;">
    <div class="card-body" style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;"><span class="badge badge-cyan">Konsultacje</span><span style="font-size:12px;color:#52525b;">Druk nr 456</span></div>
        <div style="font-size:15px;font-weight:500;color:#fff;">Projekt ustawy o systemie handlu emisjami gazów cieplarnianych</div>
        <div style="font-size:13px;color:#71717a;margin-top:4px;">Min. Klimatu i Środowiska · Rząd · 2025</div>
      </div>
      <span class="btn btn-outline" style="font-size:12px;">Szczegóły →</span>
    </div>
  </div>
  <div class="card" style="margin-bottom:12px;">
    <div class="card-body" style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;"><span class="badge badge-purple">Komisja</span><span style="font-size:12px;color:#52525b;">Druk nr 389</span></div>
        <div style="font-size:15px;font-weight:500;color:#fff;">Nowelizacja Prawa ochrony środowiska</div>
        <div style="font-size:13px;color:#71717a;margin-top:4px;">Min. Klimatu i Środowiska · Posłowie · 2025</div>
      </div>
      <span class="btn btn-outline" style="font-size:12px;">Szczegóły →</span>
    </div>
  </div>
  <div class="card" style="margin-bottom:12px;">
    <div class="card-body" style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;"><span class="badge badge-blue">I Czytanie</span><span style="font-size:12px;color:#52525b;">Druk nr 412</span></div>
        <div style="font-size:15px;font-weight:500;color:#fff;">Projekt ustawy o odnawialnych źródłach energii</div>
        <div style="font-size:13px;color:#71717a;margin-top:4px;">Min. Klimatu i Środowiska · Rząd · 2025</div>
      </div>
      <span class="btn btn-outline" style="font-size:12px;">Szczegóły →</span>
    </div>
  </div>
</div>
</body></html>"""


# ===== PAGE 7: CONSULTATIONS =====
CONSULTATIONS_HTML = f"""<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8">
{COMMON_STYLES}
</head><body>
{sidebar("consultations")}
<div class="main">
  <div class="header">
    <div><h1>💬 Konsultacje publiczne</h1><div class="subtitle">Weź udział w konsultacjach społecznych projektów legislacyjnych</div></div>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><div class="label">🟢 Aktywne</div><div class="value">5</div></div>
    <div class="stat-card"><div class="label">📅 Nadchodzące</div><div class="value">3</div></div>
    <div class="stat-card"><div class="label">🔵 Prekonsultacje</div><div class="value">2</div></div>
    <div class="stat-card"><div class="label">✅ Zakończone</div><div class="value">18</div></div>
  </div>

  <div class="tab-bar">
    <div class="tab active">Aktywne (5)</div>
    <div class="tab">Nadchodzące (3)</div>
    <div class="tab">Zakończone (18)</div>
  </div>

  <div class="card" style="margin-bottom:12px;">
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
            <span class="badge badge-cyan">Konsultacje</span>
            <span style="font-size:12px;color:#71717a;">Min. Klimatu i Środowiska</span>
          </div>
          <div style="font-size:16px;font-weight:500;color:#fff;margin-bottom:4px;">System handlu emisjami gazów cieplarnianych</div>
          <div style="font-size:13px;color:#71717a;">Konsultacje trwają: 1.12.2024 – 31.01.2025 · 💬 24 komentarze</div>
        </div>
        <span class="btn btn-primary" style="font-size:13px;">Weź udział →</span>
      </div>
    </div>
  </div>
  <div class="card" style="margin-bottom:12px;">
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
            <span class="badge" style="background:#1e1b4b;color:#818cf8;">Prekonsultacja</span>
            <span style="font-size:12px;color:#71717a;">Min. Zdrowia</span>
          </div>
          <div style="font-size:16px;font-weight:500;color:#fff;margin-bottom:4px;">Reforma systemu opieki zdrowotnej</div>
          <div style="font-size:13px;color:#71717a;">Prekonsultacja: 15.12.2024 – 15.02.2025 · 💬 12 komentarzy</div>
        </div>
        <span class="btn btn-primary" style="font-size:13px;">Weź udział →</span>
      </div>
    </div>
  </div>
  <div class="card" style="margin-bottom:12px;">
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
            <span class="badge badge-cyan">Konsultacje</span>
            <span style="font-size:12px;color:#71717a;">Min. Edukacji</span>
          </div>
          <div style="font-size:16px;font-weight:500;color:#fff;margin-bottom:4px;">Nowelizacja ustawy o systemie oświaty</div>
          <div style="font-size:13px;color:#71717a;">Konsultacje trwają: 10.12.2024 – 10.02.2025 · 💬 8 komentarzy</div>
        </div>
        <span class="btn btn-primary" style="font-size:13px;">Weź udział →</span>
      </div>
    </div>
  </div>
</div>
</body></html>"""


# ===== SCREENSHOT CAPTURE =====
async def take_screenshots():
    pages_config = [
        ("landing", LANDING_HTML, 1400, 900, "Strona główna"),
        ("dashboard", DASHBOARD_HTML, 1400, 900, "Panel główny"),
        ("bills", BILLS_HTML, 1400, 900, "Lista projektów ustaw"),
        ("bill-detail", BILL_DETAIL_HTML, 1400, 1050, "Szczegóły projektu ustawy"),
        ("admin", ADMIN_HTML, 1400, 900, "Panel administracyjny"),
        ("ai-search", AI_SEARCH_HTML, 1400, 900, "Wyszukiwarka AI"),
        ("consultations", CONSULTATIONS_HTML, 1400, 850, "Konsultacje publiczne"),
    ]

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for name, html, width, height, desc in pages_config:
            print(f"  Capturing: {desc} ({name}.png)")
            page = await browser.new_page(viewport={"width": width, "height": height})
            await page.set_content(html, wait_until="networkidle")
            await page.wait_for_timeout(500)
            path = SCREENSHOTS_DIR / f"{name}.png"
            await page.screenshot(path=str(path), full_page=False)
            await page.close()
            print(f"  ✓ Saved: {path}")

        await browser.close()
    print(f"\nAll screenshots saved to {SCREENSHOTS_DIR}")


if __name__ == "__main__":
    asyncio.run(take_screenshots())
