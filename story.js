/**
 * story.js
 * ---------------------------------------------------------
 * All narrative content for "The Girl Beyond the Window."
 * Edit freely — the book engine (script.js) reads this file
 * to build every page. Nothing about layout lives here.
 *
 * PAGE TYPES
 *  toc          — table of contents
 *  chapter      — chapter opening (roman numeral + title)
 *  text         — a page of story prose
 *  split        — story prose + a supporting illustration
 *  illustration — full-page artwork with a short caption
 *  spread       — one illustration across the full two-page spread
 *  quote        — "A Thought to Keep" reflection page
 *  ending       — closing reflection page
 * ---------------------------------------------------------
 */

const STORY = {
  title: "The Girl Beyond the Window",
  subtitle: "A Story About Courage, Change, and Becoming",
  author: "Jennelyn Portea",

  backCoverReflection:
    "Every ending leaves a blank page. What comes next is yours to write.",

  chapters: [
    {
      number: "I",
      roman: "I",
      title: "The Window",
      theme: "Taking the first step despite fear.",
      quote:
        "Sometimes courage begins with nothing more than opening the door you were afraid to touch.",
      illustration: "assets/illustrations/ch1-window.svg",
      pages: [
        {
          type: "chapter",
        },
        {
          type: "split",
          heading: "The Window",
          illustration: "assets/illustrations/ch1-window.svg",
          caption: "Eleven eleven, every night, without fail.",
          paragraphs: [
            "Mira Alcantara had lived across from the Hollis house for eleven years, and for eleven years it had done nothing but sit there — gray, shuttered, and quiet, the kind of quiet that made the whole street walk a little faster past its gate.",
            "She used to believe the house was simply old. Now she wasn't sure old was the right word for it. Old things faded. The Hollis house waited.",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "It started on a Tuesday, the way most impossible things start — quietly, and on an ordinary day. Mira was finishing her homework by lamplight when the clock on her desk clicked over to 11:11, and for no reason she could name, she looked up.",
            "A light had come on in the top window of the Hollis house. Not a flicker. Not a trick of the streetlamp. A warm, steady light, the kind a person switches on when they've simply come home.",
            "She watched it for eleven minutes, the way you watch a held breath, waiting for someone to exhale. At 11:22, it went out.",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "She told herself it was nothing. A trick of tired eyes, a reflection, a neighbor's forgotten porch light bouncing off old glass. She almost believed it, until the next night, when it happened again — 11:11 exactly, like a door opening on a schedule only the house could keep.",
            "By the third night, Mira stopped pretending to be surprised and started keeping watch. She pulled her desk chair to the window and waited with her chin on her arms, and that was how she first saw the girl.",
            "She was standing where no one had stood in eleven years — pale hands pressed to the inside of the glass, head tilted very slightly, as if she, too, were watching someone watch her.",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "Mira didn't sleep that night. She sat with the lamp off and her heart going too fast, replaying the shape of the girl in the window until the details blurred into something she could almost convince herself she'd imagined.",
            "Almost.",
            "In the morning, the Hollis house looked exactly as it always had — empty, shuttered, unremarkable in the flat gray light. She told herself that was proof enough. And then she opened her bedroom door to leave for school, and found an envelope on the floor of the hallway, addressed to her in handwriting she didn't recognize, sealed with nothing but a fold.",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "She sat down right there on the hallway floor and opened it before she could talk herself out of it.",
            "The letter began:",
            "“If you're reading this, you've already noticed the window.”",
            "Mira read the line four times. Then she read the rest of the letter, and by the time she reached the bottom of the page, her hands were not quite steady — not from fear, exactly, though there was some of that too. Mostly it was the feeling of a door swinging open in a wall she hadn't known was hollow.",
          ],
        },
        { type: "quote" },
      ],
    },

    {
      number: "II",
      roman: "II",
      title: "The Letter",
      theme: "You don't need certainty to begin.",
      quote:
        "You don't need to see the whole path to know that the next step matters.",
      illustration: "assets/illustrations/ch2-letter.svg",
      pages: [
        { type: "chapter" },
        {
          type: "split",
          heading: "The Letter",
          illustration: "assets/illustrations/ch2-letter.svg",
          caption: "Four lines, and a question she couldn't unread.",
          paragraphs: [
            "The letter was short. Four lines, unsigned, written in a careful, old-fashioned hand that slanted slightly to the left, as if the writer were left-handed and had never quite been taught to hide it.",
            "It gave no name. It gave no explanation. What it gave her was a question — do you want to know what's really across the street, or do you want to keep being safely curious? — and beneath that, an address that was not the Hollis house at all, but a bench in the old part of town Mira had passed a hundred times without once stopping.",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "She spent the whole school day arguing with herself. It was almost certainly a prank — Denny Reyes and his friends had pulled worse for less reason. But Denny couldn't write like that, in ink that had bled slightly into the paper the way old ink does, on paper that smelled, faintly, of cedar and dust.",
            "By the final bell she had made up her mind twice and unmade it twice more. In the end, curiosity did what fear couldn't stop it from doing. She walked to the bench after school, half-convinced no one would be there.",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "No one was. But tucked beneath the bench's iron armrest was a second envelope, and inside it, not a letter this time — a key, small and tarnished, and a single line: the door doesn't open for everyone. It opens for people who come back.",
            "Mira turned the key over in her palm the whole walk home. It fit no lock she owned. It looked, if she was honest, exactly like the kind of key that belonged to a house that had been locked for eleven years.",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "That night she didn't wait for 11:11. She sat at her window from nine o'clock on, key in her fist, watching the Hollis house the way you watch a held-out hand — wanting badly to take it, unsure what it would mean to do so.",
            "At 11:11 the light came on, same as always. But this time, just before it went dark again, the girl in the window lifted one hand and pressed it flat against the glass — not a wave, exactly. Closer to an invitation.",
            "Mira didn't decide to go. She simply found, a moment later, that she was already reaching for her coat.",
          ],
        },
        { type: "quote" },
      ],
    },

    {
      number: "III",
      roman: "III",
      title: "The Forest",
      theme: "Sometimes getting lost is how we discover ourselves.",
      quote:
        "Getting lost does not always mean you've gone the wrong way; sometimes it means you're finally leaving the familiar.",
      illustration: "assets/illustrations/ch3-forest.svg",
      pages: [
        { type: "chapter" },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "The key did not fit the Hollis house's front door. It fit a smaller gate around the side, one so overgrown with ivy that Mira had walked past it her whole life without registering it as a door at all.",
            "Beyond the gate was not a garden, or a yard, or anything she expected. It was a path — narrow, uneven, disappearing almost immediately into a stand of trees that had no business being there, packed as tightly as the town's houses were, older than anything else on the street.",
          ],
        },
        {
          type: "split",
          heading: "The Forest",
          illustration: "assets/illustrations/ch3-forest.svg",
          caption: "The trees did not feel unfriendly. They felt like they were waiting.",
          paragraphs: [
            "She should have turned back. She told herself that clearly, in words, the way you tell yourself the true and sensible thing right before you do the opposite. Instead she stepped through the gate, and the gate swung shut behind her with a small, final click.",
            "The path did not feel unfriendly, exactly. It felt like it was waiting to see what she would do next.",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "She walked for what felt like an hour, though her watch, when she checked it, insisted only eleven minutes had passed. The trees thinned and thickened in a rhythm that didn't match anything in nature. Twice she was certain she'd looped back to the same fallen log, though the moss on it looked different each time, as if the forest itself were rearranging its furniture.",
            "It was somewhere in that second hour-that-was-eleven-minutes that she found the photograph, half-buried at the base of an old oak. A girl, seven or eight years old, laughing at something outside the frame. Mira almost dropped it when she recognized the missing front tooth. It was her own baby photo — one she had never seen before, taken in a forest she had never visited, by someone she couldn't remember.",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "She sat down hard on the fallen log and made herself breathe.",
            "There were explanations for this. There had to be. Someone had staged it, planted it, was watching her right now to see how she'd react. She almost convinced herself of that, until she turned the photograph over and found, on the back, in her own mother's handwriting: Mira, age 7 — the day she almost remembered.",
            "The day she almost remembered. Not almost forgot. Almost remembered — as if there were a memory here, in this forest, waiting the way the girl in the window waited, for Mira to come back and claim it.",
          ],
        },
        { type: "quote" },
      ],
    },

    {
      number: "IV",
      roman: "IV",
      title: "The Hidden House",
      theme: "Courage isn't the absence of fear. It's moving forward while afraid.",
      quote:
        "Courage is not the disappearance of fear. It is choosing to move while fear walks beside you.",
      illustration: "assets/illustrations/ch4-house.svg",
      pages: [
        { type: "chapter" },
        {
          type: "split",
          heading: "The Hidden House",
          illustration: "assets/illustrations/ch4-house.svg",
          caption: "It had been waiting behind the trees the whole time.",
          paragraphs: [
            "The path ended, as paths in stories about waiting houses tend to end, at another house — smaller than the Hollis place, half-swallowed by ivy, its windows glowing with the same patient light Mira had watched from her bedroom for two weeks straight.",
            "This time, she didn't hesitate at the door. Whatever waited on the other side, she had come too far to leave it unanswered.",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "Inside, the house was warm in a way the cold evening outside had not prepared her for. A fire she hadn't seen from outside cracked low in a hearth. And there, in a chair that looked older than the house itself, sat the girl from the window — closer now, closer than a girl behind glass has any right to feel, and unmistakably, impossibly familiar.",
            "\"You took your time,\" the girl said, not unkindly. \"Eleven years is a long time to leave someone waiting.\"",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "Mira's mouth had gone dry. \"I don't understand. I don't know you.\"",
            "\"Don't you?\" The girl tilted her head, exactly the way she had in the window, and in the firelight Mira finally let herself see what some quieter part of her had already guessed. The same crooked left eyebrow her mother always said would drive her to distraction someday. The same small scar above the eyebrow, from a bicycle accident Mira couldn't quite remember happening.",
            "\"I'm the part of you that stayed,\" the girl said, \"when you decided, at seven years old, in this forest, that it was safer to forget how to be brave.\"",
          ],
        },
        { type: "quote" },
      ],
    },

    {
      number: "V",
      roman: "V",
      title: "The Truth",
      theme: "You cannot change the pages behind you, but you can choose what comes next.",
      quote:
        "You cannot rewrite the pages behind you, but you can decide what the next page will say.",
      illustration: "assets/illustrations/ch5-truth.svg",
      pages: [
        { type: "chapter" },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "The story came back to Mira slowly, the way a room comes into focus after a light is switched on — not all at once, but in pieces that suddenly, unbearably, made sense.",
            "She had come to this forest once before, at seven, chasing a dog that didn't exist, on a day she'd gotten badly and frighteningly lost. She remembered — really remembered, now — the panic of not knowing which way was home, the hours it took the search party to find her, the promise she made herself afterward, in the small, absolute way children make promises: never again would she wander off the safe and certain path. Never again would she choose the unknown over the known.",
          ],
        },
        {
          type: "spread",
          illustration: "assets/illustrations/ch5-truth.svg",
          caption: "Two versions of the same girl, finally facing each other.",
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "\"I didn't leave you here to punish you,\" the girl said, and her voice, Mira realized with a small shock, was her own — younger, but unmistakably her own. \"I left because somebody had to keep the door open. You closed every other one.\"",
            "\"I was scared,\" Mira said. It wasn't an excuse. It was just, finally, true.",
            "\"I know,\" the girl said. \"I was there. But eleven years of being careful hasn't made you less afraid, Mira. It's only made you smaller.\"",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "Mira wanted to argue. She wanted to list every sensible reason the careful path had been the right one — and found, when she opened her mouth, that she couldn't. Because the girl wasn't wrong. Eleven years of watching the world from a locked window hadn't kept her safe. It had only kept her small, and told her that was the same thing.",
            "\"What happens now?\" she asked instead.",
            "\"Now,\" the girl said, standing, offering her hand the way she had once offered it through glass, \"you decide whether the rest of your story gets written by the girl who stayed at the window, or the one who finally opened it.\"",
          ],
        },
        { type: "quote" },
      ],
    },

    {
      number: "VI",
      roman: "VI",
      title: "The Way Home",
      theme: "The future is not a finished story. It is a page waiting to be written.",
      quote:
        "Your story is not defined by where it began, but by the courage you carry into what comes next.",
      illustration: "assets/illustrations/ch6-morning.svg",
      pages: [
        { type: "chapter" },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "Mira took her own hand.",
            "There was no flash of light, no dramatic unraveling of the world — only a quiet settling, like a held breath finally let go. The girl didn't vanish so much as arrive, folding back into Mira the way a reflection folds back into glass when you finally stop looking at it and start looking through it.",
            "When she opened her eyes, she was standing at the edge of the forest path, the small house behind her dark and unremarkable, as if it had simply been an old house all along, and always would be again.",
          ],
        },
        {
          type: "split",
          heading: "The Way Home",
          illustration: "assets/illustrations/ch6-morning.svg",
          caption: "The window across the street stayed dark. It didn't need her anymore.",
          paragraphs: [
            "The walk home took eleven minutes, though she didn't check her watch to confirm it. She let herself in quietly, climbed the stairs, and sat, one more time, at her bedroom window.",
            "Across the street, the Hollis house was dark. It stayed dark at 11:11 that night, and every night after. It didn't need her at the window anymore. She had already answered the only question it had ever really been asking.",
          ],
        },
        {
          type: "text",
          heading: null,
          paragraphs: [
            "Weeks later, Mira signed up for the school trip she'd talked herself out of twice before. She raised her hand in class without rehearsing the sentence first. She still felt afraid, more often than she let anyone see — that part hadn't magically disappeared, and some part of her suspected it never entirely would.",
            "But she noticed, now, that fear and smallness were not the same thing, and that she got to choose, every single day, which one she let drive.",
          ],
        },
        { type: "quote" },
        {
          type: "ending",
          paragraphs: [
            "There is a version of this story where Mira never opens the letter. Where the light in the window flickers, unanswered, until it simply stops. That story exists in every one of us, in the doors we leave shut because shut is safer than what might be behind them.",
            "This isn't that story.",
            "This is the one where she opens the door anyway — afraid, unready, and certain of nothing except that staying at the window had already cost her more than crossing the street ever could.",
          ],
        },
      ],
    },
  ],
};

if (typeof module !== "undefined") {
  module.exports = STORY;
}
