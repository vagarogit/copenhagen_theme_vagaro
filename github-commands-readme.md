# GitHub Commands — Vagaro Support Theme

Git and GitHub reference for this repo: remote layout, pushing to both repos at once,
and the secret-handling playbook.

For theme development itself — ZCLI auth, preview, `yarn build:release`, commit rules —
see [README.md](README.md).

## Contents
- [Remote layout](#remote-layout)
- [Pushing](#pushing)
- [Pushing to both repos at once](#pushing-to-both-repos-at-once)
- [Fetching and syncing](#fetching-and-syncing)
- [Before you push](#before-you-push)
- [Secrets: what never goes in the repo](#secrets-what-never-goes-in-the-repo)
- [If a secret does get committed](#if-a-secret-does-get-committed)
- [Branch cleanup](#branch-cleanup)
- [Recovery](#recovery)

---

## Remote layout

The repo is mid-migration from the legacy `vagarogit` org to `vagarocorp`. Both are live.

| Remote       | URL                                                                 | Role |
|--------------|---------------------------------------------------------------------|------|
| `origin`     | `github.com/vagarogit/copenhagen_theme_vagaro.git`                   | Legacy repo. Still the one Zendesk syncs from. |
| `vagarocorp` | `github.com/vagarocorp/vagaro-support-zendesk-copenhagen-theme.git`  | New repo — migration target. |
| `upstream`   | `github.com/zendesk/copenhagen_theme.git`                            | Zendesk's Copenhagen. Fetch only, never push. |
| `both`       | (no fetch role)                                                      | Push-only fan-out to `origin` + `vagarocorp`. |

```console
$ git remote -v          # show all remotes and their fetch/push URLs
$ git remote get-url vagarocorp
```

`upstream` is where the fork came from. Never push to it.

---

## Pushing

One remote at a time:

```console
$ git push origin master
$ git push vagarocorp master
```

Everything on `master` should be a fast-forward — no `--force`. If git says the push was
rejected as non-fast-forward, **stop**. On this repo that has meant rewritten history, not
a stale branch, and forcing would clobber published commits. See
[Recovery](#recovery) before doing anything else.

Check what a push would carry before sending it:

```console
$ git rev-list --count origin/master..master        # how many commits
$ git log --oneline origin/master..master           # which ones
$ git merge-base --is-ancestor origin/master master && echo "fast-forward OK"
```

---

## Pushing to both repos at once

While both repos are live, one command keeps them in sync:

```console
$ git push both master
```

The `both` remote carries two push URLs and git pushes to each in turn.

To recreate it from scratch:

```console
$ git remote add both https://github.com/vagarogit/copenhagen_theme_vagaro.git
$ git remote set-url --add --push both https://github.com/vagarogit/copenhagen_theme_vagaro.git
$ git remote set-url --add --push both https://github.com/vagarocorp/vagaro-support-zendesk-copenhagen-theme.git
```

The first URL has to be repeated as an explicit `--push` entry: adding any `pushurl`
replaces the default push target, so without that line only `vagarocorp` would receive the
push. Verify with:

```console
$ git config --get-all remote.both.pushurl
```

Three things to know:

- **It is not atomic.** Git pushes to the URLs sequentially. If the first succeeds and the
  second is rejected — auth, push protection, non-fast-forward — the repos are left out of
  sync. Read the whole output, not just the exit status.
- **Fetching from `both` only reads `origin`'s URL.** Use `git fetch origin` or
  `git fetch vagarocorp` explicitly so you always know which repo you're tracking.
- **Branch names must match on both sides.** `git push both master` pushes `master` to
  `master` in both repos. If the new repo ever standardizes on `main`, this remote stops
  working for that branch and you go back to two pushes.

Remove it with `git remote remove both`.

### Default branch on the new repo

The new repo starts empty, so the first branch pushed becomes its default on GitHub.
Pushing `master` keeps it consistent with the legacy repo. To switch to `main` instead,
rename *before* the first push:

```console
$ git branch -m master main
$ git push vagarocorp main
$ git push origin main:master     # legacy repo keeps its master
```

---

## Fetching and syncing

```console
$ git fetch origin
$ git fetch vagarocorp
$ git fetch upstream                      # pull in Copenhagen changes from Zendesk
$ git log --oneline master..upstream/master   # what upstream has that we don't
```

Merging upstream is a deliberate, occasional operation — this fork has diverged
substantially. Do it on a branch, not on `master`.

---

## Before you push

Two rules specific to this repo, both covered in [README.md](README.md):

1. **Run `yarn build:release` first.** Compiled bundles are committed, Zendesk does not run
   the build, and dev bundles blow the 800 KB theme limit. See
   [Building before you commit](README.md#building-before-you-commit).
2. **Conventional commit messages.** `.husky/commit-msg` runs commitlint locally and CI
   re-lints every commit in a PR. See
   [Committing](README.md#committing-husky--commitlint).

Merging to `master` on the legacy repo triggers `.github/workflows/release.yml`
(`semantic-release`: analyze → tag → changelog), after which Zendesk syncs the theme.

---

## Secrets: what never goes in the repo

**A Zendesk Guide theme has no runtime environment.** Zendesk renders the templates and
serves `script.js`, `style.css`, and `assets/*` as public static files. There is no server
you control, no env var mechanism, no secret store. Anything committed to the theme is
readable by anyone viewing the help center.

Theme `manifest.json` settings are *not* a secret store either — they're interpolated into
public CSS and HTML by design, and the schema has no `secure` flag. (The `secure: true`
parameter documented for Zendesk **Apps** belongs to a different product, the Apps
framework, and does not apply to themes.)

So:

| Credential | Where it belongs |
|---|---|
| Azure Artifacts npm token (`@vagaro/*`, `vera-chat-widget`) | `~/.npmrc` locally; a GitHub Actions secret in CI |
| Zendesk API token / ZCLI login | `~/.zcli`, written by `yarn zcli login -i` |
| Anything the browser needs | Nothing. Use a short-lived, user-scoped credential (the `s_utkn` cookie pattern) or a proxy endpoint on a Vagaro origin. |

The project `.npmrc` declares the private registries but deliberately holds **no** token —
npm and yarn merge it with `~/.npmrc` at install time. `.gitignore` covers `.env` and
`.npmrc.vagaro-feed`; both are untracked and must stay that way.

Note that `.gitignore` does not untrack a file that is already tracked. If a secret file
was committed before being ignored, it stays in the index until you run:

```console
$ git rm --cached .env
```

---

## If a secret does get committed

Order matters.

**1. Rotate the credential first.** History surgery hides the value; only rotation kills
it. Do this even if the commit was never pushed.

**2. Find out how far it spread.**

```console
$ git rev-list --all --objects -- .env | wc -l      # commits carrying the file
$ git branch --contains <commit>                     # which branches
$ git for-each-ref refs/remotes | ...                # was it ever pushed?
```

If nothing is pushed, this is a local cleanup and no coordination is needed.

**3. Back up before rewriting.**

```console
$ git bundle create ~/pre-purge-all-refs.bundle --all
```

**4. Prefer promoting a clean branch over rewriting history.** If a branch exists that
never contained the secret, resetting `master` to it and cherry-picking the wanted commits
is dramatically safer than a history rewrite — no SHA churn, no force-push:

```console
$ git reset --hard <clean-branch>
$ git cherry-pick <commit-with-the-work-you-want>
$ git diff <old-master> master        # confirm the tree is unchanged
```

**5. Only if that's impossible, use `git filter-repo` — scoped to a commit range.**

```console
$ git filter-repo --invert-paths --path .env --refs origin/master..master --force
```

Two traps that cost real time here:

- **`filter-repo` strips GPG signatures.** Upstream Zendesk commits are PGP-signed.
  Removing `gpgsig` changes those commit objects and cascades new SHAs to every
  descendant — identical trees, different parents — so `master` and `origin/master` end up
  sharing zero commits and any merge explodes into whole-tree `AA` conflicts. Scoping to a
  **range** (`origin/master..master`) instead of a **ref** (`master`) confines the rewrite
  to unpushed commits and avoids this entirely.
- **A bare `filter-repo` run also removes your remotes**, rewrites
  `refs/remotes/origin/*` into local branches, and expires the reflog. `--refs` implies
  `--partial`, which disables all three. If you do run it unscoped, restore remotes
  afterward from the table above.

**6. Clean up leftovers.** A previous rewrite can leave `refs/original/*` pinning the very
commits you removed — and `git push --mirror` would carry them to the new repo:

```console
$ git for-each-ref refs/original
$ git update-ref -d refs/original/refs/heads/<branch>
```

**7. Verify.**

```console
$ git rev-list master --objects -- .env | wc -l       # expect 0
$ for c in $(git rev-list --all); do git grep -qI "<token>" $c -- && echo "HIT $c"; done
```

Unreferenced objects linger locally until garbage collection but are never pushed — only
objects reachable from a pushed ref are sent. To scrub them once you're confident:

```console
$ git reflog expire --expire=now --all && git gc --prune=now
```

Use `git push vagarocorp master`, not `--mirror`, so old remote-tracking branches and
stray refs don't follow you into the new repo.

---

## Branch cleanup

List branches by age, newest last:

```console
$ git for-each-ref --sort=committerdate \
    --format='%(committerdate:short) %(refname:short) %(objectname:short)' refs/heads
```

Check whether a branch is merged before deleting:

```console
$ git merge-base --is-ancestor <branch> master && echo merged || echo UNMERGED
```

```console
$ git branch -d <branch>     # merged only — refuses if it would lose commits
$ git branch -D <branch>     # force, for unmerged branches
```

`-d` refusing is a feature. Take a bundle before any `-D`.

---

## Recovery

Deleted branches and rewritten history are recoverable for as long as the reflog holds
them, and indefinitely from a bundle.

```console
$ git reflog master                          # every position master has held
$ git reset --hard master@{1}                # step back one
$ git reflog --all | grep <sha>              # find an orphaned commit
$ git cat-file -e <sha> && echo "still in the object database"
```

From a bundle:

```console
$ git clone ~/pre-purge-all-refs.bundle recovered-repo
$ git fetch ~/pre-purge-all-refs.bundle 'refs/heads/*:refs/heads/recovered/*'
```

`git gc --prune=now` and a bare `filter-repo` run both destroy this safety net. Take a
bundle before either.
