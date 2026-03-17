import grewebImage from "../../public/blog-assets/plottable-golden-train-by-greweb/bafybeihfy52llgg3jejvzx7y4ppxs3lrfhk4hbmp6vgwasmfhvuzziepdm.png";
import { StaticImageData } from "next/image";
export interface Blog {
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  author: string;
  authorAddress: string;
  creator: string;
  creatorAddress: string;
  enabled: boolean;
  blurb: string;
  image?: string;
}

const blogs: Blog[] = [
  {
    slug: "repetition-by-math-bird",
    title: "Repetition by mathbird.stars",
    author: "skymagic",
    authorAddress: "stars1euu359d2cwe46j8a8fqkmcrhzjq6j642htt7rn",
    blurb: `In this blog post, Math Bird talks about generative art, repetition, and the future of generative art.`,
    content: `![Repetition #35](/blog-assets/repetition-by-math-bird/bafybeienmv7bkwf56riaft74igcv4hogis2alk7uznhpfznw66f2jhqtza.png "Repetition #35")

Q: In your own words, what is generative art?
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget nisl in purus pellentesque ornare. Curabitur molestie laoreet erat, eget ultricies lectus venenatis sit amet. Integer luctus, erat at elementum varius, risus magna consectetur ante, a tincidunt risus mi vitae lacus. Integer pharetra sapien ac massa facilisis, in dapibus sem maximus. Ut cursus ultricies elit, quis consectetur augue faucibus at. Nunc vehicula et est ut semper. Vivamus dictum ut est at aliquet. Pellentesque placerat odio ac nibh volutpat rhoncus. Proin sem nisl, malesuada eu odio pharetra, lobortis consequat quam. Praesent pellentesque mi interdum dui tempor, a vehicula lectus tristique. Proin aliquet, nisl consequat feugiat fermentum, ligula ligula scelerisque felis, at fermentum dolor purus ut justo. Pellentesque faucibus ex at purus porta imperdiet. Vivamus dignissim, lorem quis porta euismod, est lacus mattis velit, vitae tempor enim ante eu nulla. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ultrices vulputate sem, vitae feugiat justo. Nam et erat leo.

Q: How did you first hear about generative art? What was the first generative art you saw?
Phasellus vestibulum est non felis ultrices laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Maecenas mollis nulla quis congue dictum. Donec id dolor sollicitudin, sodales neque quis, ornare leo. Duis at mauris non augue tristique egestas ac at mi. Sed pellentesque placerat blandit. Phasellus ac magna iaculis, egestas leo ut, volutpat libero. In in est eros. Nulla lobortis consequat odio, ut aliquam odio aliquet vitae. Nam sed euismod diam, nec placerat risus. Fusce aliquam ac lorem tincidunt laoreet. Suspendisse vitae interdum libero, a dignissim magna. Suspendisse volutpat venenatis diam non suscipit. Nam quam ligula, lacinia non tempus vel, dignissim vel neque. Nulla in ligula vel leo semper hendrerit. Cras quam velit, mollis nec magna non, feugiat feugiat augue.

Q: Repetition is blah blah blah to you?
Praesent ante nisi, congue quis aliquam quis, facilisis quis nulla. Mauris vel neque vitae augue ultrices maximus. Fusce fermentum sem at sapien sodales, vel pellentesque sapien elementum. Nullam tempor imperdiet diam at facilisis. Cras et semper nulla, mattis rutrum nisl. Phasellus eu metus orci. Curabitur rutrum metus a efficitur dictum. Donec pellentesque consectetur orci, id luctus elit faucibus quis. Curabitur sit amet lorem est. Nam fermentum ac elit iaculis sollicitudin. Quisque quis feugiat ipsum. In nibh nisi, bibendum a nibh vel, iaculis consectetur lectus. Vestibulum a pretium lectus. Nullam felis elit, blandit quis sagittis a, volutpat placerat tellus.

Q: Inspriations for this project and in general

Q: Why are interested in gen art

Q: Where do you think gen art is going?

#### Work information:
Work page: [Repetition](/work/repetition)

Secondary: [Repetition on Staragaze Marketplace](https://www.stargaze.zone/marketplace/stars137r938q7942pjqy3ajfjt7yu3xl59xk2l046mqv3lrtcwdqw4qrqt5p84w)

Repetition public sale February 24, 2023.

Edition of 99 at 99 $STARS each.
`,
    creator: "Math Bird",
    creatorAddress: "stars17008jvthx25xc7wurll7f45z3n852pv7u889mj",
    createdAt: "2023-02-26T00:00:00.000Z",
    enabled: false,
  },

  {
    slug: "plottable-golden-train-by-greweb",
    enabled: true,
    title: "Plottable Golden Train by greweb.stars",
    author: "skymagic.stars",
    authorAddress: "stars1euu359d2cwe46j8a8fqkmcrhzjq6j642htt7rn",
    blurb: `In this blog post, greweb talks about analog generative art and his inspirations.`,
    // image: "/blog-assets/plottable-golden-train-by-greweb/797-ego-sm.jpg",
    image:
      "/blog-assets/plottable-golden-train-by-greweb/bafybeihfy52llgg3jejvzx7y4ppxs3lrfhk4hbmp6vgwasmfhvuzziepdm-sm.jpg",

    content: `I had an insightful discussion with [greweb](https://twitter.com/greweb) about generative art and his work, Plottable Golden Train, releasing on https://publicworks.art / stargaze blockchain on March 3, 2023. Enjoy!
    
![greweb](/blog-assets/plottable-golden-train-by-greweb/profile.jpg "greweb")

**skymagic: I like to start with the basics and hear in your own words-- how would you describe generative art?**

greweb: Generative art is a paradigm where the artist becomes the architect of a system that generates many unique variations of art pieces. This highly exploratory process requires the artist to build something from scratch rather than simply drawing a specific art piece. They focus on randomizing as many characteristics as possible into code and continuously fine-tune the system to maintain a balance between adding variability and maintaining control over the general art direction and constraints.

This art process is highly iterative and requires continuous exploration, curation, and refinement. Often, generativity is achieved through combining digital and analog processes, such as using a pen plotter or simulating paint.

Composing many generative systems together makes it exponentially interesting and allows a wider range of possibilities than what could be achieved through manual creation. In this aspect, generative art represents a new paradigm in art-making, where the artist is guiding the system to produce unexpected and interesting results.
![Plot 367](/blog-assets/plottable-golden-train-by-greweb/367.jpg "greweb, Plot 367, recursively slicing polygons, A4 watercolor paper, fountain pen with Black ink, 2022")

**skymagic: What was the first generative artwork that made an impression on you?**

greweb: I believe my interest in generative art is related to my interest in game development and dates back to around 2010, when I first started learning about Canvas and WebGL. At the time, I was truly impressed by the demos created by the demoscene community (I can't remember a specific one, but there has been many stunning work), not only because they were able to generate stunning visuals and music from scratch, but also because they had to work within tight technical limitations and compress their creations into just a few kilobytes.

Around the same time, I was also participating in game jams, which share some similarities with generative art in terms of using randomness to create procedural textures and terrains.

So to go back to your question and this may be a surprising answer but I will say: Minecraft! Exploring the procedurally generated worlds in Minecraft, digging into the infinite map, discovering caves teeming with life, was an incredible experience and great source of inspiration for me.
![Plot 797](/blog-assets/plottable-golden-train-by-greweb/797-ego.jpg "greweb, Plot 797, fountain pen on A6 paper, 2022")

**skymagic: Can you share what inspired Plottable Golden Train and how plotters play into your work?**

greweb: The use of a plotter is to me a fundamental part in my creative process: there is an interesting aspect in that you can plan something very detailed but then "lose" a bit of detail by making it small, which creates the illusion of realism, by using small strokes on a plotter, the analog process will nicely blends the details into a more realistic representation.

Last year, I published a collection on fxhash called "Plottable Era: Primitive" that aims to be the first collection of a sequel that explores various eras of humankind while showcasing a sunset falling on a mountain. This project marked the beginning of my journey into figurative artwork. I find it fascinating how challenging it is to make figurative from code (most generative art work today is abstract art because it's the easiest to achieve, but making something realistic is very challenging). Since then, I have continuously explored various ways to create mountains by combining different kinds of noises, most notably perlin noise. During Inktober 2022, I challenged myself to enter every day with a figurative work on mountains ( https://greweb.me/plots/tags/inktober ). For 'Trip' I first developed this idea for a train on a bridge. However, the generator were manually curated and there were a lot of bad cases to fix. ensuring that all the results were "logical" and finding the "best bridge" on the mountains posed a significant challenge. There were numerous instances where things went wrong, and this is the most difficult part of creating a successful generator release. I added way more references in this release and push to a more "Far West" scenery. 
![Plot 709](/blog-assets/plottable-golden-train-by-greweb/709.jpg "greweb, Plot 709, fountain pen on A6 paper, 2022")

**skymagic: It's fascinating how integrated your generative work is with plotters. There's a feedback loop of inspiration between the plotter, code and you. Where do you think generative art is going?**

greweb: Predicting the future is difficult, and generative art is not a new concept. However, what makes it revolutionary in recent years is its seamless integration into the world of cryptocurrency and NFTs. It almost seems as though NFTs were designed for generative art, as exemplified by CryptoKitties, which was fundamentally generative art that was a first-class citizen in the contract. These years are still very innovative and exploratory, and new concepts are being created every day on various blockchains. With time, more maturity will come, and a merger or singularity could emerge between different worlds such as games, VR, AI, and art. The current art pieces produced by art generators are still very "pure" and minimalistic, but the potential for wider integration across different worlds is exciting. Imagine the interoperability between your art and the games people play, or your daily life in the real world (e.g; on street advertisement screens). There are many ways to connect these different worlds, (and plotters are indeed another way to bond digitals and physicals).


**skymagic: Is there anything else you would like to share that would help viewers and collectors appreciate Plottable Golden Train and your work in general?**

greweb: The Plottable Golden Train editions are designed to be plotted as small A6 postcards using gel pens, but they can also be enjoyed digitally. In fact, a majority of my collectors prefer to just enjoy the digital version, which is why I place great importance on making the digital version as good as possible. These "plottable" generators produce artwork that is visually appealing, with a custom WebGL shader that accurately simulates the physical ink effects and includes unique animations. These generators also act as a recipe for producing a physical work of art. By simply dragging and dropping the "live" version, you can export an .SVG file that can be plotted. If you have a plotter or any CNC machine, feel free to plot it, or use your NFT to ask another plotter artist (but I will also offer my services), at the end of the day, that NFT is an utility that contains that physical possibility!

Unlike prints, plotted artwork are always unique because it is analog. Plotting the same thing multiple times yields different results, and there are various choices of pen and paper to consider, making the process generative in itself. There are therefore no 1:1 relationship with the physical, things can remain fully decoupled. <3
![Plottable Golden Train](/blog-assets/plottable-golden-train-by-greweb/bafybeihfy52llgg3jejvzx7y4ppxs3lrfhk4hbmp6vgwasmfhvuzziepdm.png "Plottable Golden Train")

**skymagic: Where can viewers and collectors learn more about your work and connect with you?**

I hope you enjoy the collection. You can find more of my work at https://greweb.me/ , I also often stream my process on https://twitch.tv/greweb and do other live performance with my plotters if you are interested to dig more that aspect!


#### Work information:
Work page: [Plottable Golden Train](/work/plottable-golden-train)

Public sale March 3, 2023.

Edition of 400. 500 $STARS each.
`, //Secondary: [Plottable Golden Train on Staragaze Marketplace](https://www.stargaze.zone/marketplace/stars137r938q7942pjqy3ajfjt7yu3xl59xk2l046mqv3lrtcwdqw4qrqt5p84w)
    creator: "greweb",
    creatorAddress: "stars15rce70qlpcztvvekjwpv4fx3s5k2ujjeedm5ng",
    createdAt: "2023-03-01T20:00:00.000Z",
  },
  {
    slug: "thanks",
    enabled: true,
    title: "Thanks for the support!",
    author: "skymagic.stars",
    authorAddress: "stars1euu359d2cwe46j8a8fqkmcrhzjq6j642htt7rn",
    image: "/blog-assets/archived.jpg",
    blurb: `In this blog post, skymagic thanks the community for their support.`,

    content: `Publicworks.art minted over 3500 one of a kind artworks on Stargaze. This would not have been possible without the support of the community.

Thank you to all the artists who have created works on PublicWorks.art.

Thank you to all the collectors who have supported the artists and the community.

Thank you to all the community members who have supported the artists and the community.

I'm moving this platform into archive mode. As of today, no more works can be created. Thanks for participating.

-skymagic.stars
`, //Secondary: [Plottable Golden Train on Staragaze Marketplace](https://www.stargaze.zone/marketplace/stars137r938q7942pjqy3ajfjt7yu3xl59xk2l046mqv3lrtcwdqw4qrqt5p84w)
    creator: "skymagic.stars",
    creatorAddress: "stars1euu359d2cwe46j8a8fqkmcrhzjq6j642htt7rn",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export const getEnabledBlogs = () => {
  return blogs.filter((blog) => blog.enabled);
};
