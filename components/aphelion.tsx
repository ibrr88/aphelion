"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowDown, ArrowUpRight, Check, Download, Menu, MoveUpRight, Pause, Play, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { asset, journeys, seasons, type JourneyId } from "@/lib/journeys";
import { useSceneMotion } from "@/lib/use-scene-motion";
import { ScrollFilm } from "@/components/scroll-film";
import { DestinationJourney } from "@/components/destination-journey";
import { useSmoothScroll } from "@/lib/use-smooth-scroll";

function Planet({ id }: { id: JourneyId }) {
  return <span className={"planet-object planet-" + id}><img src={asset("/images/planet-" + id + ".webp")} alt="" width={700} height={700} loading="lazy" decoding="async" /></span>;
}

function Art({ name, className = "", alt = "", priority = false, sizes = "100vw" }: { name: string; className?: string; alt?: string; priority?: boolean; sizes?: string }) {
  return <img className={className} src={asset("/images/" + name + "-1280.webp")}
    srcSet={[768, 1280, 1920, 2560].map(w => asset("/images/" + name + "-" + w + ".webp") + " " + w + "w").join(", ")}
    sizes={sizes} alt={alt} width={2560} height={1440} fetchPriority={priority ? "high" : "auto"}
    loading={priority ? "eager" : "lazy"} decoding="async" />;
}

function IntroOrbits() {
  return <div className="intro-orbits" aria-hidden="true">
    {(["orbit", "lunar", "mars", "saturn"] as JourneyId[]).map((id, i) => <i className={`intro-orbit orbit-${i + 1}`} key={id}><span><img src={asset(`/images/planet-${id}.webp`)} alt="" /></span></i>)}
    <b><span /></b>
  </div>;
}

function Brand({ large = false }: { large?: boolean }) {
  return <a className={"wordmark" + (large ? " wordmark-large" : "")} href="#top" aria-label="Aphelion home"><span className="brand-orbit" aria-hidden="true" />APHELION</a>;
}

export default function Aphelion() {
  const root = useRef<HTMLElement>(null);
  const [loaderLeaving, setLoaderLeaving] = useState(false);
  const [loaderComplete, setLoaderComplete] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(.02);
  const [motionOff, setMotionOff] = useState(false);
  const [systemMotionOff, setSystemMotionOff] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [journeyId, setJourneyId] = useState<JourneyId>("orbit");
  const [season, setSeason] = useState<string>(seasons[0]);
  const [travelers, setTravelers] = useState("2");
  const [confirmed, setConfirmed] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const itineraryTitle = useRef<HTMLHeadingElement>(null);
  const bookingTrigger = useRef<HTMLElement | null>(null);
  const navigationDestination = useRef<string | null>(null);
  const otherTrigger = useRef<HTMLElement | null>(null);
  const journey = journeys.find(j => j.id === journeyId)!;
  const reduceMotion = motionOff || systemMotionOff;
  useSceneMotion(root, reduceMotion);
  useSmoothScroll(reduceMotion, menuOpen || bookingOpen || aboutOpen);

  useEffect(() => {
    const page = document.documentElement;
    page.classList.add("aphelion-loading");
    const progress = new Map<string, number>([["departure", .02], ["observatory", .02]]);
    const finished = new Set<string>();
    let minimumElapsed = false, leaving = false, removeTimer = 0;
    const updateProgress = () => setLoaderProgress((progress.get("departure")! + progress.get("observatory")!) / 2);
    const leave = () => {
      if (leaving) return;
      leaving = true;
      setLoaderProgress(1);
      setLoaderLeaving(true);
      removeTimer = window.setTimeout(() => {
        setLoaderComplete(true);
        page.classList.remove("aphelion-loading");
      }, 900);
    };
    const maybeLeave = () => { if (minimumElapsed && finished.size === 2) leave(); };
    const syncStoredState = () => {
      for (const name of ["departure", "observatory"]) {
        const key = name === "departure" ? "filmDeparture" : "filmObservatory";
        const stored = Number(page.dataset[key + "Progress"]);
        if (Number.isFinite(stored)) progress.set(name, stored);
        if (page.dataset[key] === "ready") { progress.set(name, 1); finished.add(name); }
      }
      updateProgress();
      maybeLeave();
    };
    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ name?: string; progress?: number }>).detail;
      if (!detail || !progress.has(detail.name || "") || !Number.isFinite(detail.progress)) return;
      progress.set(detail.name!, Math.max(0, Math.min(1, detail.progress!)));
      updateProgress();
    };
    const onReady = (event: Event) => {
      const name = (event as CustomEvent<{ name?: string }>).detail?.name;
      if (!name || !progress.has(name)) return;
      progress.set(name, 1); finished.add(name); updateProgress(); maybeLeave();
    };
    window.addEventListener("aphelion:film-progress", onProgress);
    window.addEventListener("aphelion:film-ready", onReady);
    syncStoredState();
    const minimumTimer = window.setTimeout(() => { minimumElapsed = true; maybeLeave(); }, 750);
    // A failed codec or interrupted request must not permanently lock the page.
    const safetyTimer = window.setTimeout(leave, 20000);
    return () => {
      window.removeEventListener("aphelion:film-progress", onProgress);
      window.removeEventListener("aphelion:film-ready", onReady);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(safetyTimer);
      window.clearTimeout(removeTimer);
      page.classList.remove("aphelion-loading");
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemMotionOff(query.matches);
    update(); query.addEventListener("change", update);
    try {
      // Restore the visitor's explicit preference after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMotionOff(localStorage.getItem("aphelion-reduce-motion") === "true");
    } catch { /* Device preferences are optional. */ }
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => { if (confirmed) itineraryTitle.current?.focus(); }, [confirmed]);

  const openBooking = useCallback((id: JourneyId = "orbit") => {
    bookingTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setJourneyId(id); setConfirmed(false); setDownloaded(false); setBookingOpen(true);
  }, []);

  useEffect(() => {
    type Tool = { name: string; title: string; description: string; inputSchema: object; annotations: object; execute: (input: unknown) => unknown };
    const context = (document as Document & { modelContext?: { registerTool: (tool: Tool, options: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tool: Tool = {
      name: "configure_demo_journey", title: "Configure an Aphelion demo journey",
      description: "Open the visible fictional mission planner and select a journey. Does not book travel, charge money, submit personal information, or create a real reservation.",
      inputSchema: { type: "object", properties: { journey: { type: "string", enum: journeys.map(j => j.id) } }, required: ["journey"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== "object" || Object.keys(input).some(k => k !== "journey")) throw new Error("Expected only a journey field.");
        const id = (input as { journey?: unknown }).journey;
        if (!journeys.some(j => j.id === id)) throw new Error("Unknown journey.");
        flushSync(() => openBooking(id as JourneyId));
        return { status: "demo_configured", journey: id, realReservation: false };
      },
    };
    try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Progressive enhancement only. */ }
    return () => lifecycle.abort();
  }, [openBooking]);

  function toggleMotion() {
    const next = !motionOff; setMotionOff(next);
    try { localStorage.setItem("aphelion-reduce-motion", String(next)); } catch { /* Keep working without storage. */ }
  }

  function openAbout() {
    otherTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setAboutOpen(true);
  }

  function openMenu() {
    otherTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    navigationDestination.current = null;
    setMenuOpen(true);
  }

  function downloadItinerary() {
    const text = ["APHELION / YOUR IMAGINED JOURNEY", "Independent concept by Ebrahim Alhebshi", "", journey.name,
      season + " | " + travelers + (travelers === "1" ? " traveler" : " travelers"), journey.duration, "",
      ...journey.itinerary.flatMap(s => [s.time + " — " + s.title, s.detail, ""]),
      "CONCEPT DEMO ONLY. This is not a ticket or a real reservation. No booking, payment, or personal information has been submitted."].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "aphelion-" + journeyId + "-concept-itinerary.txt"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setDownloaded(true);
  }

  return (
    <main id="top" ref={root} className={reduceMotion ? "motion-reduced" : ""}>
      {!loaderComplete && (
        <div className="site-loader" data-state={loaderLeaving ? "leaving" : "loading"} role="status" aria-label="Loading Aphelion">
          <div className="loader-mark" aria-hidden="true">
            <div className="loader-orbits"><i /><i /><i /><span /></div>
            <div className="loader-name"><span className="brand-orbit" />APHELION</div>
            <p>A DIFFERENT PERSPECTIVE</p>
          </div>
          <div className="loader-readout" aria-hidden="true">
            <span>{loaderProgress < 1 ? "LOADING FLIGHT FILMS" : "PERSPECTIVE READY"}</span>
            <div><i style={{ animation: "none", transform: `scaleX(${loaderProgress})` }} /></div>
            <span>{String(Math.round(loaderProgress * 100)).padStart(3, "0")} / 100</span>
          </div>
        </div>
      )}
      <a className="skip-link" href="#intro">Skip to content</a>
      <header className="site-header">
        <Brand />
        <nav aria-label="Main navigation"><a href="#intro">The perspective</a><a href="#journeys">Our journeys</a><a href="#experience">Life above</a></nav>
        <div className="header-actions"><button className="nav-cta" onClick={() => openBooking()}>Find your orbit <ArrowUpRight size={16} aria-hidden="true" /></button>
          <button className="menu-button" aria-label="Open navigation" onClick={openMenu}><Menu size={23} /></button></div>
      </header>

      <section className="hero-sequence" aria-labelledby="hero-title"><div className="hero">
        <div className="hero-art"><ScrollFilm name="departure" section=".hero-sequence" reduced={reduceMotion} idle /></div>
        <div className="hero-content">
          <p className="eyebrow hero-reveal"><span className="signal" /> THE NEXT CHAPTER OF HUMAN WONDER</p>
          <h1 id="hero-title"><span className="headline-line">A different</span><span className="headline-line headline-second">perspective.</span></h1>
          <div className="hero-bottom-copy hero-reveal"><p>You have seen the world.<br />Now, see it from here.</p><a className="round-link" href="#journeys" aria-label="Explore our journeys"><MoveUpRight size={29} aria-hidden="true" /></a></div>
        </div>
        <div className="hero-coordinate" aria-hidden="true"><span className="crosshair" /><span>BEYOND THE FAMILIAR</span><strong>04 <small>WORLDS</small></strong><span>ONE LIMITLESS<br />SENSE OF WONDER</span></div>
        <div className="hero-passage-caption"><p className="eyebrow">THE EDGE OF EVERYTHING YOU KNOW</p><p>Let a little distance<br />bring you closer.</p></div>
        <div className="hero-foot"><a href="#intro"><ArrowDown size={17} aria-hidden="true" /> SCROLL TO CROSS THE EDGE</a><span>EARTH, AS YOU’VE NEVER SEEN IT</span><button className="concept-label" onClick={openAbout}>INDEPENDENT CONCEPT / 2026 <Plus size={12} aria-hidden="true" /></button></div>
        <div className="hero-progress" aria-hidden="true"><span /></div>
      </div></section>

      <section id="intro" className="intro section-pad">
        <div><p className="eyebrow">01 / A SHIFT IN PERSPECTIVE</p><IntroOrbits /></div>
        <h2 className="perspective-copy">Some journeys change<br />where you are.<br /><span>This one changes<br />how you see.</span></h2>
        <div className="intro-end"><span className="tiny-label">HOME IS A FEELING.<br />AND A PALE BLUE WORLD.</span><p className="intro-copy">Beyond the noise. Beyond the familiar. A considered passage into the extraordinary, with the time and space to take it all in.</p></div>
      </section>

      <section className="ascent" id="ascent" aria-label="An imagined journey from Earth to orbit">
        <div className="ascent-sticky">
          <div className="ascent-art"><ScrollFilm name="observatory" section=".ascent" reduced={reduceMotion} /></div>
          <div className="ascent-shade" />
          <div className="ascent-top"><span className="eyebrow">THE ASCENT / AN IMAGINED PASSAGE</span><a className="text-link" href="#journeys">Skip to journeys <ArrowDown size={15} aria-hidden="true" /></a></div>
          <div className="ascent-heading"><p className="eyebrow">A WORLD WITHOUT EDGES</p><h2>No borders.<br />Just possibility.</h2></div>
          <div className="ascent-track" aria-hidden="true"><div className="ascent-track-fill" /><span /><span /><span /></div>
          <div className="ascent-readout" aria-hidden="true"><span className="eyebrow">YOUR PERSPECTIVE</span><div><span className="altitude-number">400</span><span className="altitude-unit">KM</span></div><span className="altitude-label">THE FAMILIAR</span></div>
          <ol className="ascent-chapters"><li><span>01 / DEPARTURE</span><p>The world grows quiet.</p></li><li><span>02 / ASCENT</span><p>The horizon begins to bend.</p></li><li><span>03 / PERSPECTIVE</span><p>Everything is connected.</p></li></ol>
        </div>
      </section>

      <DestinationJourney reduced={reduceMotion} onSelect={openBooking} />

      <section id="experience" className="experience">
        <div className="experience-photo"><Art name="cabin" sizes="(max-width: 800px) 100vw, 65vw" alt="A quiet titanium observatory with a single seat facing Earth through a large circular window." /><span className="eyebrow photo-caption">THE OBSERVATORY / SPACE TO FEEL SMALL</span></div>
        <div className="experience-copy"><p className="eyebrow">03 / LIFE ABOVE</p><h2 className="reveal">Less gravity.<br />More presence.</h2><p>The rarest luxury is a moment that asks nothing of you. Just a window. A world. And all the time to notice.</p><div className="experience-details"><div><span>01</span><p><strong>A front-row seat to Earth</strong>Uninterrupted views from a quiet observatory.</p></div><div><span>02</span><p><strong>A slower kind of extraordinary</strong>Room to drift, reflect, and find a new rhythm.</p></div><div><span>03</span><p><strong>A journey, made personal</strong>An intimate crew and a carefully imagined stay.</p></div></div></div>
      </section>

      <section className="questions section-pad" id="questions"><div className="faq-intro"><p className="eyebrow">04 / BEFORE YOU GO</p><h2 className="reveal">A little<br />more clarity.</h2><p className="faq-lead">Everything you need to know before leaving the familiar behind.</p><div className="faq-orbit" aria-hidden="true"><i /><i /><i /><span /><b>APH / SIGNAL 04</b></div></div>
        <Accordion type="single" collapsible className="faq-list">
          {[["Is Aphelion a real space-travel company?", "Aphelion is an independent design and development concept by Ebrahim Alhebshi. Its journeys, spacecraft, availability, and travel experiences are fictional. This site does not sell travel."], ["What happens when I plan a journey?", "You can explore four fictional itineraries, select an imagined departure season and group size, and download a concept itinerary. No personal information is requested, and no payment or real reservation is made."], ["Why journey into space?", "The concept explores the power of a different vantage point: distance as a way to feel closer to home. Every part of Aphelion is designed around curiosity, perspective, and the wonder of seeing Earth from afar."], ["Can I explore with less animation?", "Yes. Use the motion control in the footer to reduce animation. Aphelion also respects your device’s reduced-motion preference automatically. All content and journey controls remain available."]].map(([q,a],i) => <AccordionItem className="faq-item" key={q} value={"faq-"+i}><AccordionTrigger className="faq-trigger"><span className="faq-number">0{i+1}</span><span className="faq-question">{q}</span></AccordionTrigger><AccordionContent className="faq-answer">{a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </section>

      <section className="closing section-pad">
        <div className="closing-cosmos" aria-hidden="true"><i /><i /><i /><span className="closing-core" /><span className="closing-scan" /></div>
        <div className="closing-index" aria-hidden="true"><span>05 / THE NEXT PERSPECTIVE</span><span>34° 12′ 18″ N&nbsp;&nbsp;118° 14′ 37″ W</span></div>
        <div className="closing-copy"><p className="eyebrow">A SMALL STEP INTO SOMETHING EXTRAORDINARY</p><h2><span className="closing-line">Your world.</span><span className="closing-line closing-line-accent">Reimagined.</span></h2><p className="closing-lead">The distance changes everything.<br />Especially how close home feels.</p><button className="closing-cta" onClick={() => openBooking()}><span>Find your orbit</span><ArrowUpRight size={23} aria-hidden="true" /></button></div>
        <div className="closing-status" aria-hidden="true"><span>ORBITAL WINDOW</span><strong>OPEN</strong><i /></div>
      </section>
      <footer className="site-footer">
        <div className="footer-upper"><div className="footer-statement"><p className="eyebrow">THE UNIVERSE IS CALLING</p><h2>Stay curious.<br /><span>Go beyond.</span></h2><button className="text-link" onClick={() => openBooking()}>Begin your journey <ArrowUpRight size={20} /></button></div>
          <nav className="footer-nav" aria-label="Footer navigation"><div><p className="eyebrow">EXPLORE</p><a href="#intro">The perspective</a><a href="#journeys">Our worlds</a><a href="#experience">Life above</a><a href="#questions">Before you go</a></div><div><p className="eyebrow">DESTINATIONS</p>{journeys.map(j => <button key={j.id} onClick={() => openBooking(j.id)}>{j.shortName}<ArrowUpRight size={14} /></button>)}</div></nav>
        </div>
        <div className="footer-signature" aria-hidden="true">APHELION<span>↗</span></div>
        <div className="footer-bottom"><span className="footer-copyright">© 2026 APHELION <em>· INDEPENDENT CONCEPT</em></span><button onClick={openAbout}>Ebrahim Alhebshi <Plus size={13} aria-hidden="true" /></button><button className="motion-button" onClick={toggleMotion} disabled={systemMotionOff} aria-pressed={reduceMotion} aria-label={systemMotionOff ? "Reduced motion enabled by your device" : "Reduce motion"}>{reduceMotion ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}{systemMotionOff ? "MOTION / DEVICE SETTING" : reduceMotion ? "MOTION / REDUCED" : "MOTION / ON"}</button><a className="back-top" href="#top">BACK TO TOP <ArrowUpRight size={17} /></a></div>
        <p className="art-credit">Cinematic direction inspired by the supplied references · Planet imagery: NASA / ESA. <a href={asset("/image-credits.txt")}>Image credits</a></p>
      </footer>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}><DialogContent className="menu-dialog" onCloseAutoFocus={event => { event.preventDefault(); const href = navigationDestination.current; if (href) { const target = document.querySelector<HTMLElement>(href); target?.setAttribute("tabindex", "-1"); target?.focus({ preventScroll: true }); } else { otherTrigger.current?.focus(); } }}><DialogTitle className="sr-only">Navigation</DialogTitle><DialogDescription className="eyebrow">APHELION / EXPLORE</DialogDescription><nav aria-label="Mobile navigation">{[["The perspective","#intro"],["Our journeys","#journeys"],["Life above","#experience"],["Before you go","#questions"]].map(([label,href],i) => <a key={href} href={href} onClick={() => { navigationDestination.current = href; setMenuOpen(false); }}><span>0{i+1}</span>{label}<ArrowUpRight size={23} aria-hidden="true" /></a>)}</nav><p className="tiny-label">AN INDEPENDENT CONCEPT BY EBRAHIM ALHEBSHI</p></DialogContent></Dialog>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}><DialogContent className="about-dialog" onCloseAutoFocus={event => { event.preventDefault(); otherTrigger.current?.focus(); }}><p className="eyebrow">BEHIND THE CONCEPT</p><DialogTitle>A different perspective<br />on what a website can be.</DialogTitle><DialogDescription>Aphelion is an independent portfolio project by Ebrahim Alhebshi, reimagining his original Pixiu space-travel concept.</DialogDescription><p>Original art direction, cinematic imagery, and an interactive narrative explore a fictional future of travel. Made with React, TypeScript, and GSAP, with Seedream imagery, NASA and ESA planetary photographs, and a light-ring reference by Dogan Ural.</p><div className="about-credit"><span>CONCEPT & CREATIVE DIRECTION</span><strong>Ebrahim Alhebshi</strong><span>DESIGN & DEVELOPMENT</span><strong>Created in collaboration with Codex</strong></div><p className="about-small">All travel offerings are fictional. This project is not affiliated with any space agency or operator.</p></DialogContent></Dialog>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}><DialogContent className="booking-dialog" onCloseAutoFocus={event => { event.preventDefault(); bookingTrigger.current?.focus(); }}>
        <div className="booking-art"><Planet id={journey.id} /><span className="eyebrow">{journey.code}</span><div><p className="eyebrow">YOUR NEXT PERSPECTIVE</p><h3>{journey.name}</h3><p>{journey.duration} · {journey.distance}</p></div></div>
        <div className="booking-body"><p className="eyebrow orange">{confirmed ? "02 / YOUR IMAGINED JOURNEY" : "01 / MAKE IT YOURS"}</p>
          <DialogTitle className="booking-title">{confirmed ? "A journey to remember." : "Where will you go?"}</DialogTitle>
          <DialogDescription className="booking-description">{confirmed ? "Your concept itinerary is ready. No real reservation has been made." : "Explore a future worth imagining. This planner is an interactive concept demo."}</DialogDescription>
          {!confirmed ? <form onSubmit={event => { event.preventDefault(); setConfirmed(true); }}>
            <label className="field-label" id="journey-label">Your journey</label><RadioGroup value={journeyId} onValueChange={v => setJourneyId(v as JourneyId)} aria-labelledby="journey-label" className="journey-radio">{journeys.map(j => <label key={j.id} className={journeyId === j.id ? "selected" : ""}><RadioGroupItem value={j.id} id={"select-"+j.id} /><span>{j.shortName}<small>{j.duration}</small></span></label>)}</RadioGroup>
            <div className="form-row"><div><label className="field-label" htmlFor="season">Imagined departure</label><NativeSelect id="season" value={season} onChange={e => setSeason(e.target.value)}>{seasons.map(s => <NativeSelectOption key={s}>{s}</NativeSelectOption>)}</NativeSelect></div><div><label className="field-label" htmlFor="travelers">Travelers</label><NativeSelect id="travelers" value={travelers} onChange={e => setTravelers(e.target.value)}>{["1","2","3","4"].map(n => <NativeSelectOption key={n} value={n}>{n} {n === "1" ? "traveler" : "travelers"}</NativeSelectOption>)}</NativeSelect></div></div>
            <p className="mission-description">{journey.description}</p><button className="solid-button" type="submit">Create my itinerary <ArrowUpRight size={19} aria-hidden="true" /></button><p className="form-disclosure">DEMO ONLY · NO PAYMENT · NO PERSONAL DATA</p>
          </form> : <div className="itinerary-result"><h3 ref={itineraryTitle} tabIndex={-1} className="result-heading"><Check size={18} aria-hidden="true" />{season} · {travelers} {travelers === "1" ? "traveler" : "travelers"}</h3><ol>{journey.itinerary.map(step => <li key={step.time}><span>{step.time}</span><h4>{step.title}</h4><p>{step.detail}</p></li>)}</ol><button className="solid-button" onClick={downloadItinerary}>{downloaded ? "Download again" : "Keep this itinerary"}<Download size={18} aria-hidden="true" /></button><p className="download-status" role="status">{downloaded ? "Concept itinerary downloaded as a text file." : "A keepsake of an imagined journey. Not a ticket."}</p><button className="edit-journey" onClick={() => { setConfirmed(false); setDownloaded(false); }}>Edit my journey</button></div>}
        </div>
      </DialogContent></Dialog>
    </main>
  );
}

