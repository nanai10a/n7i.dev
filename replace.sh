#!/bin/sh
sd -- '\s{2,}' '\n' |
  rg -- '--md-sys-color-(.*): #.*' |
  sd -- '--md-sys-color-' '' |
  sd -- '^(\S+):' '"$1":' |
  sd -- 'primary' 'prim' |
  sd -- 'container' 'cont' |
  sd -- 'secondary' 'sec' |
  sd -- 'tertiary' 'ter' |
  sd -- 'error' 'err' |
  sd -- 'outline' 'ol' |
  sd -- 'background' 'bg' |
  sd -- 'surface' 'sur' |
  sd -- 'variant' 'var' |
  sd -- 'inverse' 'inv' |
  sd -- '-light' 'l' |
  sd -- '-dark' 'd' |
  sd -- '#(.*);' '"#$1",'
