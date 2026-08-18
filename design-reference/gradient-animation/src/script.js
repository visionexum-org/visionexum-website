const t = gsap.timeline()
.from("img", {rotationX:90, transformOrigin:"50% 100%", duration:3})


GSDevTools.create({animation:t, css:{top:0}})

// LEARN GSAP
// https://www.creativecodingclub.com/bundles/creative-coding-club