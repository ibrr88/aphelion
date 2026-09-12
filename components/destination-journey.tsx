"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { asset, journeys, type JourneyId } from "@/lib/journeys";
import { scrollToScene } from "@/lib/use-smooth-scroll";
import { StarField } from "@/components/star-field";

export function DestinationJourney({ reduced, onSelect }: { reduced: boolean; onSelect: (id: JourneyId) => void }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    section.classList.add("is-horizontal"); setEnhanced(true);
    const context = gsap.context(() => {
      const rail = section.querySelector<HTMLElement>(".destination-rail")!;
      const panels = [...section.querySelectorAll<HTMLElement>(".destination-panel")];
      gsap.to(rail, { x: () => -(rail.scrollWidth - section.clientWidth), ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: .65, invalidateOnRefresh: true,
          onUpdate: self => setActive(Math.round(self.progress * (journeys.length - 1))),
        },
      });
      panels.forEach((panel, i) => {
        const planet = panel.querySelector(".destination-planet");
        gsap.fromTo(planet, { rotate: -7, scale: .87 }, { rotate: 7, scale: 1.02, ease: "none", scrollTrigger: {
          trigger: section, start: () => `top+=${i * (section.offsetHeight - innerHeight) / 4} top`,
          end: () => `top+=${(i + 1.5) * (section.offsetHeight - innerHeight) / 4} top`, scrub: .8,
        } });
      });
    }, section);
    ScrollTrigger.refresh();
    return () => { context.revert(); section.classList.remove("is-horizontal"); setEnhanced(false); };
  }, [reduced]);
  function goTo(index: number) {
    const section = root.current!;
    if (enhanced) scrollToScene(section.getBoundingClientRect().top + scrollY + index / (journeys.length - 1) * (section.offsetHeight - innerHeight));
    else section.querySelectorAll<HTMLElement>(".destination-panel")[index].scrollIntoView({ behavior: "instant", block: "center" });
  }
  return <section id="journeys" ref={root} className="journey-scroll" aria-label="Explore four imagined destinations">
    <div className="journey-stage">
      <StarField reduced={reduced} />
      <div className="destination-header"><p className="eyebrow">02 / BEYOND THE FAMILIAR</p><a href="#experience">Continue the journey <ArrowDown size={14} /></a></div>
      <div className="destination-rail">
        {journeys.map((journey, i) => <article className={"destination-panel world-" + journey.id} key={journey.id} inert={enhanced && active !== i ? true : undefined}>
          <div className="destination-copy"><p className="eyebrow">{journey.code} <span> / {journey.label}</span></p><h2>{["Earth.","The Moon.","Mars.","Saturn."][i]}</h2><p className="destination-poem">{journey.subtitle}</p><div className="destination-meta"><span>{journey.duration}</span><span>{journey.distance}</span></div><button className="destination-cta" onClick={() => onSelect(journey.id)}>Explore {journey.shortName} <ArrowUpRight size={20} /></button></div>
          <button className="destination-visual" onClick={() => onSelect(journey.id)} aria-label={"Explore " + journey.name}><span className="destination-planet"><img src={asset(`/images/planet-${journey.id}.webp`)} alt="" width={1000} height={1000} loading={i === 0 ? "eager" : "lazy"} /></span></button>
          <span className="destination-number" aria-hidden="true">0{i+1}</span>
        </article>)}
      </div>
      <div className="destination-bottom"><nav aria-label="Choose a destination">{journeys.map((j,i) => <button key={j.id} aria-current={active === i ? "step" : undefined} onClick={() => goTo(i)}><span>0{i+1}</span>{["Earth","Moon","Mars","Saturn"][i]}</button>)}</nav><span className="destination-disclosure">IMAGINED WORLDS / CONCEPT JOURNEYS</span></div>
    </div>
  </section>;
}
