const fs = require("fs");
const babel = require("@babel/core");

const srcPath = "C:\\ClaudeBusiness\\PMS\\VORLAGE HTML PROGRAMM\\Verwaltung_jsx_base.html";
const outPath = "C:\\ClaudeBusiness\\PMS\\VORLAGE HTML PROGRAMM\\Verwaltung.html";

const html = fs.readFileSync(srcPath, "utf8");

// Extract the JSX script content (with data-presets attribute)
const scriptStartTag = '<script type="text/babel" data-presets="react">';
const scriptStart = html.indexOf(scriptStartTag);
const scriptEnd = html.indexOf("</script>", scriptStart) + "</script>".length;

if (scriptStart === -1) {
  console.error("Could not find script tag");
  process.exit(1);
}

const before = html.substring(0, scriptStart);
const jsxCode = html.substring(scriptStart + scriptStartTag.length, scriptEnd - "</script>".length);
const after = html.substring(scriptEnd);

// Transform JSX to JS
const result = babel.transformSync(jsxCode, {
  presets: [["@babel/preset-react", { runtime: "classic" }]],
  filename: "verwaltung.jsx",
  configFile: false,
  babelrc: false,
});

// Remove the Babel standalone script tag
let cleanBefore = before
  .replace('<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\r\n', '')
  .replace('<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n', '');

// Reassemble
const compiled = cleanBefore + "<script>\n" + result.code + "\n</script>" + after;

fs.writeFileSync(outPath, compiled, "utf8");
console.log("Compiled! Output:", outPath);
console.log("Output size:", compiled.length, "chars");
