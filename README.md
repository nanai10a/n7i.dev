# n7i.dev

nanai's main website.

## how to use

let's visit: [n7i.dev](https://n7i.dev)

or if you want to see locally, then:

```sh
# install pnpm
npm i -g pnpm

# install dependencies
pnpm i

# build pages
pnpm build

# start dev server
pnpm dev
```

... and open [localhost:3000](http://localhost:3000) in your browser.

## roadmap

[ ] **v0.10**
  [ ] separate datas as other files
[ ] **v0.9**
  [ ] construct incremental build system
[ ] **v0.8**
  [ ] as embed assets
    [ ] local css
    [ ] local js
    [ ] iconify
    [ ] twemoji
[ ] **v0.7**
  [ ] migrate as twemoji
[ ] **v0.6**
  [ ] add breadcrumbs
[ ] **v0.5**
  [ ] styling `<a />`
[ ] **v0.4**
  [ ] change layout of pages
    [ ] `/` : `/about` & `/skill` & `/contact`
    [ ] `/gallery` : `/gallery`
    [ ] `/blog` : integrated to `b.n7i.dev`
    [ ] `/hobby` : `/hobby` integrated to `h.n7i.dev`
    [ ] `/site` : `/link`
[ ] **v0.3**
  [ ] implements menubar from `/` page
[ ] **v0.2**
  [ ] make actions
    [ ] ci
      [ ] check
    [ ] cd
      [ ] versioning
      [ ] deploy
[ ] **v0.1**
  [ ] initial implements
    [ ] pages
      [ ] `/` : navigations
      [ ] `/about` : simple introduction
      [ ] `/skill` : technical skills
      [ ] `/hobby` : my hobbies
      [ ] `/gallery` : my works
      [ ] `/contact` : contacts to me
      [ ] `/link` : link to another my sites
    [ ] mixins
      [ ] html template
      [ ] header
      [ ] footer
      [ ] frequently used coloring
    [ ] systems
     [ ] `clear`
     [ ] `build`
     [ ] `dev`
  [ ] migrate to git-flow
