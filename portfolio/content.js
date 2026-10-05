/* ------------------------------------------------------------------
   EDIT THIS FILE to change what the site says. No other file needs
   touching for normal updates.

   - Drop images into portfolio/images/ and list them in `images: []`
     (e.g. images: ["images/studio-1.jpg", "images/studio-2.jpg"]).
   - Projects with no images get a generated plan drawing as a stand-in.
   - Replace every URL marked TODO.
------------------------------------------------------------------- */
window.PORTFOLIO = {
  name: ["Grant", "Schurman"],
  tagline: "Architecture · Design · Making",

  links: {
    resume: "resume.pdf",                              // TODO: put your PDF at portfolio/resume.pdf
    rosie: "https://www.ruralstudio.org/",             // TODO: paste the direct "Rosie's Home" project page URL
    fullNineYards: "https://example.com/full-9-yards", // TODO
    etsy: "https://www.etsy.com/shop/YOURSHOP"         // TODO
  },

  sections: {
    school: {
      title: "School Work",
      blurb: "Studio projects, research and competitions from my architecture education.",
      projects: [
        { title: "Studio Project One", year: "2023", kind: "Studio", place: "Location",
          desc: "Short description: the site, the idea, and what you were proud of." },
        { title: "Studio Project Two", year: "2022", kind: "Studio", place: "Location",
          desc: "Short description." },
        { title: "Competition Entry", year: "2022", kind: "Competition", place: "Location",
          desc: "Short description." },
        { title: "Thesis / Research", year: "2024", kind: "Research", place: "Location",
          desc: "Short description." }
      ]
    },
    work: {
      title: "Professional Work",
      blurb: "Built and in-progress work from my time in practice.",
      projects: [
        { title: "Professional Project One", year: "2025", kind: "Residential", place: "Location",
          desc: "Your role, the scope, and the outcome." },
        { title: "Professional Project Two", year: "2024", kind: "Commercial", place: "Location",
          desc: "Your role, the scope, and the outcome." },
        { title: "Professional Project Three", year: "2024", kind: "Interiors", place: "Location",
          desc: "Your role, the scope, and the outcome." }
      ]
    },
    personal: {
      title: "Personal Work",
      blurb: "What I make on my own time.",
      cards: [
        { title: "Full 9 Yards", sub: "The full personal portfolio", link: "fullNineYards" },
        { title: "Etsy Shop", sub: "Things I design and sell", link: "etsy" }
      ]
    }
  }
};
