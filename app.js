// getme: check and claim an is-a.dev subdomain. Rules mirror is-a-dev/register tests/json.test.js.
const RAW = "https://raw.githubusercontent.com/is-a-dev/register/main/";
const HOSTNAME = /^(?=.{1,253}$)(?:(?:[_a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,63}$/;
const EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// shortcut: root subdomains only; nested ones (a.b.is-a.dev) need the parent first, add if asked.
function nameError(name) {
  if (!name) return "Enter a name.";
  if (name !== name.toLowerCase()) return "Use lowercase only.";
  if (name.includes(".")) return "Pick a single label, without dots.";
  if (name.includes("--")) return "No consecutive hyphens.";
  if (name.startsWith("_")) return "Can't start with an underscore.";
  if (name.includes("is-a-dev")) return "Can't contain \"is-a-dev\".";
  if (!HOSTNAME.test(name + ".is-a.dev")) return "Letters, numbers and single hyphens only; no hyphen at the start or end.";
  return "";
}

const TARGETS = {
  github: (o) => ({ CNAME: o.username.toLowerCase() + ".github.io" }),
  vercel: () => ({ CNAME: "cname.vercel-dns.com" }),
  netlify: (o) => ({ CNAME: o.target }),
  cname: (o) => ({ CNAME: o.target }),
  redirect: (o) => ({ URL: o.target })
};

function buildFile(o) {
  const owner = { username: o.username };
  if (o.email) owner.email = o.email;
  return JSON.stringify({ owner, records: TARGETS[o.host](o) }, null, 2) + "\n";
}

function prUrl(name, file) {
  return "https://github.com/is-a-dev/register/new/main/domains?filename=" +
    encodeURIComponent(name + ".json") + "&value=" + encodeURIComponent(file);
}

function fillTemplate(tpl, preview, purpose) {
  return tpl
    .replace("<!-- WEBSITE_PREVIEW_START -->", "<!-- WEBSITE_PREVIEW_START -->\n" + preview)
    .replace("<!-- WEBSITE_PURPOSE_START -->", "<!-- WEBSITE_PURPOSE_START -->\n" + purpose);
}

// "available" | "taken" | "reserved" — the live register repo is the source of truth.
async function availability(name) {
  const [file, reserved, internal] = await Promise.all([
    fetch(RAW + "domains/" + name + ".json", { cache: "no-store" }),
    fetch(RAW + "util/reserved.json").then((r) => r.json()),
    fetch(RAW + "util/internal.json").then((r) => r.json())
  ]);
  if (reserved.includes(name) || internal.includes(name)) return "reserved";
  if (file.status === 200) return "taken";
  if (file.status === 404) return "available";
  throw new Error("GitHub returned " + file.status);
}

if (typeof module !== "undefined") module.exports = { nameError, buildFile, prUrl, fillTemplate, EMAIL };

if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  let checked = "";

  $("check").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("name").value.trim();
    const err = nameError(name);
    checked = "";
    $("step2").hidden = true;
    if (err) return status(err, "bad");
    status("Checking…", "");
    try {
      const s = await availability(name);
      if (s !== "available") return status(name + ".is-a.dev is " + s + ". Try another name.", "bad");
      checked = name;
      status(name + ".is-a.dev is available.", "ok");
      $("step2").hidden = false;
      $("username").focus();
    } catch (x) {
      status("Couldn't reach GitHub: " + x.message, "bad");
    }
  });

  $("host").addEventListener("change", () => {
    const h = $("host").value;
    $("targetRow").hidden = h === "github" || h === "vercel";
    $("repoRow").hidden = h !== "github";
    $("target").placeholder = { netlify: "my-site.netlify.app", cname: "example.com", redirect: "https://github.com/you" }[h] || "";
  });

  $("details").addEventListener("submit", async (e) => {
    e.preventDefault();
    const o = {
      username: $("username").value.trim(),
      email: $("email").value.trim(),
      host: $("host").value,
      target: $("target").value.trim(),
      repo: $("repo").value.trim()
    };
    if (o.email && !EMAIL.test(o.email)) return alert("That email doesn't look valid.");
    if (!$("targetRow").hidden && !o.target) return alert("Enter where the domain should point.");
    const file = buildFile(o);
    const preview = o.host === "github"
      ? "https://" + o.username.toLowerCase() + ".github.io/" + (o.repo && !o.repo.endsWith(".github.io") ? o.repo + "/" : "")
      : o.host === "redirect" ? o.target : "https://" + o.target;

    $("file").textContent = file;
    $("fname").textContent = "domains/" + checked + ".json";
    $("pr").href = prUrl(checked, file);
    $("pages").hidden = o.host !== "github";
    $("pagesLink").href = "https://github.com/" + o.username + "/" + (o.repo || o.username + ".github.io") + "/settings/pages";
    $("cnameVal").textContent = checked + ".is-a.dev";
    try {
      const tpl = await fetch(RAW + ".github/PULL_REQUEST_TEMPLATE.md").then((r) => r.text());
      $("tpl").value = fillTemplate(tpl, preview, $("purpose").value.trim() || "Personal developer portfolio.");
    } catch {
      $("tpl").value = "Couldn't load the template. Fill in the one GitHub shows you.";
    }
    $("step3").hidden = false;
    $("step3").scrollIntoView({ behavior: "smooth" });
  });

  document.querySelectorAll("[data-copy]").forEach((b) =>
    b.addEventListener("click", () => {
      const el = $(b.dataset.copy);
      navigator.clipboard.writeText(el.value ?? el.textContent);
      b.textContent = "Copied";
      setTimeout(() => (b.textContent = "Copy"), 1500);
    })
  );

  function status(msg, cls) {
    $("status").textContent = msg;
    $("status").className = cls;
  }
}
