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

## what's `replace.sh` ?

ex:

```sh
cargo install ripgrep sd
cat mt3-built.css | ./replace.sh
```

... then output can copy into `tailwind.config.js` .  
`replace.sh` converts `mt3-built.css` as js code.

in feature, this sh is replaced as js.  
because it's depending `rg` , `sd` . they are so good tools, but take a little time (for build, install).

## roadmap

- [ ] **v0.8**
  - [ ] add breadcrumbs
- [ ] **v0.7**
  - [ ] change layout of pages
    - [ ] `/` : `/about` & `/skill` & `/contact`
    - [ ] `/gallery` : `/gallery`
    - [ ] `/blog` : integrated to `b.n7i.dev`
    - [ ] `/hobby` : `/hobby` integrated to `h.n7i.dev`
    - [ ] `/site` : `/link`
- [ ] **v0.6**
  - [ ] implements menubar from `/` page
- [ ] **v0.5**
  - [x] migrate as twemoji
    - [x] replace raw emoji as svg image
  - [ ] construct incremental build system
    - [ ] separate css to each html
    - [ ] construct fs watcher
  - [ ] improve systems
    - [ ] separate datas as other files
    - [ ] as embed assets
      - [ ] local css
      - [ ] local js
      - [ ] iconify
      - [ ] twemoji
  - [ ] improve local server
    - [ ] make custom server
    - [ ] for dev
      - [ ] hot reloadable
    - [ ] for production
      - [ ] serve static file fastly
- [x] **v0.4**
  - [x] styling `<a />`
- [x] **v0.3**
  - [x] refactor codes
- [x] **v0.2**
  - [x] make actions
    - [x] ci
      - [x] check
    - [x] cd
      - [x] deploy
- [x] **v0.1**
  - [x] initial implements
    - [x] pages
      - [x] `/` : navigations
      - [x] `/about` : simple introduction
      - [x] `/gallery` : my works
      - [x] `/skill` : technical skills
      - [x] `/hobby` : my hobbies
      - [x] `/contact` : contacts to me
      - [x] `/link` : link to another my sites
    - [x] mixins
      - [x] html template
      - [x] header
      - [x] footer
      - [x] frequently used coloring
    - [x] systems
      - [x] `clear`
      - [x] `build`
      - [x] `dev`
