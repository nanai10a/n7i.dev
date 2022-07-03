# n7i.dev

nanai's main website.

## how to use

let's visit: [n7i.dev](https://n7i.dev)

or if you want to see locally, then:

```sh
# prepare: https://deno.land/manual/getting_started/installation

# pre-download dependencies
deno task cache:r

# install required files
deno task install

# build pages
deno task build

# start dev server
deno task serve
```

... and open [localhost:3000](http://localhost:3000) in your browser.

## what's `replace.sh` ?

ex:

```sh
cargo install ripgrep sd
cat mt3-built.css | ./replace.sh
```

... then output can copy into `scripts/twind.config.ts` .  
`replace.sh` converts `mt3-built.css` as js code.

in feature, this sh is replaced as js.  
because it's depending `rg` , `sd` . they are so good tools, but take a little time (for build, install).

## roadmap

- [ ] **v0.9**
  - [ ] integrate with [umami](https://umami.is)
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
- [x] **v0.5**
  - [x] migrate node to deno
    - [x] initial deno project
    - [x] migrate node tasks
    - [x] migrate node actions
  - [x] replace systems
    - [x] [kt3k/packup](https://github.com/kt3k/packup)
    - [x] [lumeland/pug](https://github.com/lumeland/pug)
    - [x] [tw-in-js/twind](https://github.com/tw-in-js/twind)
    - [x] [iconify (web component)](https://docs.iconify.design/iconify-icon)
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
