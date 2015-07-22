<a name="0.2.1"></a>
# 0.2.1 (2015-07-22)

## Features

- **Vertical and Horizontal Offsets**: allows fine-grained control of `tourtip` positioning

## Breaking Changes

- `offset` property has been renamed to `margin` as not to cause confusion with (optional) vertical and horizontal positioning offset properties



<a name="0.2.0"></a>
# 0.2.0 (2015-07-22)

## Features

- **Miscellaneous Improvements**: Virtual Steps, `tourComplete` callback, additional tourtip callbacks (`on-show`, `on-proceed`), tourtip container targeting, optional backdrop, `center` and `center-top` options - #28

## Breaking Changes

- `tourtip`s are now appended to the `body` element by default