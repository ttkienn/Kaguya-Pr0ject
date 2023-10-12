export default {
  name: "godtext",
  author: "Kaguya Project",
  role: "member",
  cooldowns: 10,
  description: "Convert your text into special characters!",
  async execute({ args }) {
    try {
      const content = args.join(" ").toLowerCase();

      if (!content) return kaguya.reply(`Thiếu đoạn văn bản bạn cần convert\nVui lòng nhập đầy đủ!`);

      const characterMap = {
        a: "ꋫ", b: "ꃃ", c: "ꏸ", d: "ꁕ",
        e: "ꍟ", f: "ꄘ", g: "ꁍ", h: "ꑛ",
        i: "ꂑ", j: "ꀭ", k: "ꀗ", l: "꒒",
        m: "ꁒ", n: "ꁹ", o: "ꆂ", p: "ꉣ",
        q: "ꁸ", r: "꒓", s: "ꌚ", t: "꓅",
        u: "ꐇ", v: "ꏝ", w: "ꅐ", x: "ꇓ",
        y: "ꐟ", z: "ꁴ"
      };

      return kaguya.reply(content.replace(/[a-z]/g, (char) => characterMap[char] || char));
    } catch (err) {
      console.error(err);
    }
  },
};
