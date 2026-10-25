// node test.js
const assert = require("assert");
const { nameError, buildFile, prUrl, fillTemplate } = require("./app.js");

for (const ok of ["getme", "deep-shah", "a1"]) assert.strictEqual(nameError(ok), "", ok);
for (const bad of ["", "Deep", "a--b", "-a", "a-", "a.b", "_x", "my-is-a-dev", "a b"]) assert.ok(nameError(bad), bad);

assert.deepStrictEqual(JSON.parse(buildFile({ username: "Deepshah0308", email: "a@b.co", host: "github" })),
  { owner: { username: "Deepshah0308", email: "a@b.co" }, records: { CNAME: "deepshah0308.github.io" } });
assert.deepStrictEqual(JSON.parse(buildFile({ username: "x", host: "redirect", target: "https://x.dev" })).records, { URL: "https://x.dev" });

assert.ok(prUrl("getme", "{}").startsWith("https://github.com/is-a-dev/register/new/main/domains?filename=getme.json&value="));
assert.ok(fillTemplate("<!-- WEBSITE_PREVIEW_START -->\n<!-- WEBSITE_PREVIEW_END -->", "https://x", "").includes("START -->\nhttps://x\n<!-- WEBSITE_PREVIEW_END"));
console.log("ok");
