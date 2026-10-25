# getme

Claim a free `yourname.is-a.dev` subdomain in a few clicks: **https://getme.deepshah.is-a.dev**

1. **Check:** reads the live [is-a-dev/register](https://github.com/is-a-dev/register) repo, plus its reserved and internal lists, to tell you whether the name is free.
2. **Generate:** builds the `domains/<name>.json` file for GitHub Pages, Vercel, Netlify, any CNAME host, or a plain redirect.
3. **Claim:** opens GitHub's new-file page in the register repo with the file pre-filled. GitHub forks the repo and opens the PR for you. You also get the PR template with your preview link and purpose already filled in. You tick the checkboxes yourself.
4. **Host:** for GitHub Pages, it links to your repo's Pages settings so you can set the custom domain once the PR is merged.

There's no backend and no tokens. Everything runs in your browser.

```sh
node test.js   # validation self-checks
```

Not affiliated with is-a.dev. Read their [docs](https://docs.is-a.dev) and [terms](https://is-a.dev/terms) before you apply.
