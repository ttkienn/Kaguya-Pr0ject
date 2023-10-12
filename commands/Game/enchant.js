export default {
  name: "enchant",
  author: "Kaguya Project",
  role: "member",
  cooldowns: 10,
  description: "Convert your text into minecraft enchantment table language",
  async execute({ args }) {
    try {
        const content = args.join(" ").toLowerCase();

        if (!content) return kaguya.reply(`Baka! You must give me something to enchant.`);
      
        const enchantmentMap = {
          a: "ᔑ", b: "ʖ", c: "ᓵ", d: "↸", f: "⎓",
          g: "⊣", h: "⍑", i: "╎", j: "⋮", k: "ꖌ",
          l: "ꖎ", m: "ᒲ", n: "リ", o: "𝙹", p: "!¡",
          q: "ᑑ", r: "∷", s: "ᓭ", t: "ℸ ̣", u: "⚍",
          v: "⍊", w: "∴", x: "·/", y: "||", z: "⨅"
        };
      
        return kaguya.reply(content.replace(/[a-z]/gi, match => enchantmentMap[match] || match));
    } catch (err) {
      console.error(err);
    }
  },
};
