# @atomicsmash/blocks-helpers

## 6.0.0-beta.0

### Major Changes

- [#314](https://github.com/AtomicSmash/packages/pull/314) [`81bcc70`](https://github.com/AtomicSmash/packages/commit/81bcc70635bc577f428a5aa9447362213aee511e) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Remove re-exported registerBlockType function (use base WP one with the newly applied type)

### Minor Changes

- [#314](https://github.com/AtomicSmash/packages/pull/314) [`47d97be`](https://github.com/AtomicSmash/packages/commit/47d97bee37cbe81af77e4081859e2a7d8d8e4cac) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Add fixes for external WP package types

- [#314](https://github.com/AtomicSmash/packages/pull/314) [`e1a50db`](https://github.com/AtomicSmash/packages/commit/e1a50db73e906ca77ab71006ef6f4f9fe68c7d94) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Add missing merge setting to client only register settings

### Patch Changes

- [#314](https://github.com/AtomicSmash/packages/pull/314) [`f9ad6c9`](https://github.com/AtomicSmash/packages/commit/f9ad6c922d4e5e020434ea6d3534ca4c5cdc1593) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Fix edit props

## 5.0.0

### Major Changes

- [#266](https://github.com/AtomicSmash/packages/pull/266) [`904cab2`](https://github.com/AtomicSmash/packages/commit/904cab236b48952e0287dc17aca1d36842999aab) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Add object and array block instance types

- [#266](https://github.com/AtomicSmash/packages/pull/266) [`0c8d829`](https://github.com/AtomicSmash/packages/commit/0c8d82983784b58a5853325bf7823a92014056a3) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Fix and improve the block instance type

### Patch Changes

- [#268](https://github.com/AtomicSmash/packages/pull/268) [`fb47b23`](https://github.com/AtomicSmash/packages/commit/fb47b23df2e496437d2c12c0f153beb5c8d6bfab) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Make array block instance tuple elements optional

## 5.0.0-beta.1

### Patch Changes

- [#268](https://github.com/AtomicSmash/packages/pull/268) [`fb47b23`](https://github.com/AtomicSmash/packages/commit/fb47b23df2e496437d2c12c0f153beb5c8d6bfab) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Make array block instance tuple elements optional

## 5.0.0-beta.0

### Major Changes

- [#266](https://github.com/AtomicSmash/packages/pull/266) [`904cab2`](https://github.com/AtomicSmash/packages/commit/904cab236b48952e0287dc17aca1d36842999aab) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Add object and array block instance types

- [#266](https://github.com/AtomicSmash/packages/pull/266) [`0c8d829`](https://github.com/AtomicSmash/packages/commit/0c8d82983784b58a5853325bf7823a92014056a3) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Fix and improve the block instance type

## 4.1.1

### Patch Changes

- [#258](https://github.com/AtomicSmash/packages/pull/258) [`0596250`](https://github.com/AtomicSmash/packages/commit/05962505f7e665bb61d7c603fa5ad2fc6f937280) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Update dependencies

## 4.1.1-beta.0

### Patch Changes

- [#258](https://github.com/AtomicSmash/packages/pull/258) [`0596250`](https://github.com/AtomicSmash/packages/commit/05962505f7e665bb61d7c603fa5ad2fc6f937280) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Update dependencies

## 4.1.0

### Minor Changes

- [#219](https://github.com/AtomicSmash/packages/pull/219) [`dc1df9c`](https://github.com/AtomicSmash/packages/commit/dc1df9ce638f76592867625b11959e95cf4c530c) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Improve array and object types with default value types

### Patch Changes

- [#230](https://github.com/AtomicSmash/packages/pull/230) [`0057e28`](https://github.com/AtomicSmash/packages/commit/0057e2891f46c318e3c7f4def31c0b520dfc11bc) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Update dependencies

## 4.1.0-beta.0

### Minor Changes

- [#219](https://github.com/AtomicSmash/packages/pull/219) [`dc1df9c`](https://github.com/AtomicSmash/packages/commit/dc1df9ce638f76592867625b11959e95cf4c530c) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Improve array and object types with default value types

### Patch Changes

- [#230](https://github.com/AtomicSmash/packages/pull/230) [`0057e28`](https://github.com/AtomicSmash/packages/commit/0057e2891f46c318e3c7f4def31c0b520dfc11bc) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Update dependencies

## 4.0.0

### All Changes

There's been a lot of changes to this package since the last version.
There's too much for me to document every change clearly.
You should compare your blocks to the new structure show in the tests folder to figure out what you need to do to update them.

Be aware if you are investigating commits that some changes were added and then rolled back during the beta process.
In future, changes should be smaller as this package is now fully tested in a real project, and I will do my best to
provide migration guides for future breaking changes.

### Major Changes

- [`5d7b282`](https://github.com/AtomicSmash/packages/commit/5d7b2825f13c0ef0d4348b9d96f31d714ef65b5b) Thanks [@mikeybinns](https://github.com/mikeybinns)! - BlockAttributes now requires static or dynamic type.
  Make render property optional so it can be defined in block.json instead.

- [`bd143e4`](https://github.com/AtomicSmash/packages/commit/bd143e4e7447c00f36323bfe0267c1b85a32aace) Thanks [@mikeybinns](https://github.com/mikeybinns)! - BREAKING CHANGE: New structure updates

- [`c64cbcc`](https://github.com/AtomicSmash/packages/commit/c64cbccb9ed58b2d36b2a33b27a86d630710b0fc) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Adds support for static and dynamic blocks

- [`86ffec9`](https://github.com/AtomicSmash/packages/commit/86ffec9e54b2c39323fe767b50a122ef374bff50) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Simplify attributes passing to other types
  Loosen deprecated block type on registerBlockType
  Add default block attributes where necessary, subject to supports
  Fix block/shortcode transforms and block variations

- [`1c57a65`](https://github.com/AtomicSmash/packages/commit/1c57a65a202b9765fabfcdd645efe66e1e409501) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Types now take interpreted attributes in as an argument to allow for project type narrowing

### Minor Changes

- [`a8c2d0b`](https://github.com/AtomicSmash/packages/commit/a8c2d0b4a7af521aa4225457eb88537a4bf7bd07) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Improve Block Supports and Default Attribute types

- [`794f7ff`](https://github.com/AtomicSmash/packages/commit/794f7ff92ee70fc9762cc7a70ffd435ca9c2b40f) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Add spacing default attribute

- [`5bf9c2c`](https://github.com/AtomicSmash/packages/commit/5bf9c2c2d33f1f0038ef45120e6ee1dc2950e4c4) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Add readme to help new users understand types available

- [`9d22117`](https://github.com/AtomicSmash/packages/commit/9d221175fd6e931700fa1eb303a4a5db859f8fca) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Improve/tighten attribute types

- [`91dfa8b`](https://github.com/AtomicSmash/packages/commit/91dfa8bd28581bf365e18f3f30981d571a448e84) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Add viewStyle to BlockMetaData type

- [`5948b1b`](https://github.com/AtomicSmash/packages/commit/5948b1b029f9a71d5afd15958eddf4a9b3741da7) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Further type improvements

- [`8ece549`](https://github.com/AtomicSmash/packages/commit/8ece5497bedc0e0efeb930c4b1f4846b47bf4fd3) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Improve query attribute type

- [`5bf9c2c`](https://github.com/AtomicSmash/packages/commit/5bf9c2c2d33f1f0038ef45120e6ee1dc2950e4c4) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Add block def type

- [`1c57a65`](https://github.com/AtomicSmash/packages/commit/1c57a65a202b9765fabfcdd645efe66e1e409501) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Remove "static" and "dynamic" block types in favour of one type

- [`5e5ecf2`](https://github.com/AtomicSmash/packages/commit/5e5ecf264e56994085364c129ad61451f969f07b) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Refine context types

- [`4dcbaf6`](https://github.com/AtomicSmash/packages/commit/4dcbaf6fa8e6ab87564e9d3c4a4842941e214172) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Update block supports list

- [`ecc7913`](https://github.com/AtomicSmash/packages/commit/ecc7913ef15a2d3a08325517836c1814eb9029a5) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Update BlockExample type to correct attributes

- [`33dce8d`](https://github.com/AtomicSmash/packages/commit/33dce8d609cfa344843f10137e635972ecccfef5) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Improve variation types

### Patch Changes

- [`3ae4eab`](https://github.com/AtomicSmash/packages/commit/3ae4eab91f9641d70be2907a173edc1ae2b74bc7) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Remove "flow" as a valid layout type

- [`b6630c2`](https://github.com/AtomicSmash/packages/commit/b6630c271c3d3c2c401416933c4ce877e36eb958) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Allow JSX elements for icon property

- [`1c57a65`](https://github.com/AtomicSmash/packages/commit/1c57a65a202b9765fabfcdd645efe66e1e409501) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Remove "items" property on attribute object (invalid)

- [`bf75309`](https://github.com/AtomicSmash/packages/commit/bf75309ae456e68b88e086660fb5df5105c76c80) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Remove "flow" as a valid layout type

- [`e2b6b44`](https://github.com/AtomicSmash/packages/commit/e2b6b446188689c15dd54421d137994d584ad022) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Combine and fix layout types

- [`1c57a65`](https://github.com/AtomicSmash/packages/commit/1c57a65a202b9765fabfcdd645efe66e1e409501) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Fix variations type for BlockMetaData to remove JS only types

- [`098b948`](https://github.com/AtomicSmash/packages/commit/098b948c0932f020a1385013beeb38c391c34758) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Minor fixes related to dynamic blocks

- [`909ebfb`](https://github.com/AtomicSmash/packages/commit/909ebfbd693ca2795e9a61e5e0aac1bbe688024e) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Fix block variations type

- [`d3e69d5`](https://github.com/AtomicSmash/packages/commit/d3e69d5bf718f48d5683180736e51b52e411cddb) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Update dependencies

- [`f46dbbb`](https://github.com/AtomicSmash/packages/commit/f46dbbbe58b990037ddb488b9303b2a6f17993a4) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Fix dymanic blocks on registerBlockType

- [`a8b72c7`](https://github.com/AtomicSmash/packages/commit/a8b72c71a7f2963f992041b86130f92282f09a3e) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Fix recursive partial array keys

- [`49e2765`](https://github.com/AtomicSmash/packages/commit/49e276549f33852b98c15f7efe1cefea642ac635) Thanks [@mikeybinns](https://github.com/mikeybinns)! - swap block def for current block def

- [`e058aa2`](https://github.com/AtomicSmash/packages/commit/e058aa24cc01b1240b31b161c45eb3ae59d8f973) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Fix layout vertical alignment

- [`9474fc9`](https://github.com/AtomicSmash/packages/commit/9474fc90cb765b8051c6d68af93ba30628d7a46f) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Add type for multiple deprecations array

- [`22396de`](https://github.com/AtomicSmash/packages/commit/22396de50a67801ea8063db86aed69e4388e5ec3) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Clarify interpret provides context name

## 3.0.1

### Patch Changes

- [#133](https://github.com/AtomicSmash/packages/pull/133) [`9ebcd42`](https://github.com/AtomicSmash/packages/commit/9ebcd42720afe49e08bd0b3b45e21f34f9d09f22) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Update dependencies

## 3.0.0

### Major Changes

- [#126](https://github.com/AtomicSmash/packages/pull/126) [`f3f55f1`](https://github.com/AtomicSmash/packages/commit/f3f55f1df0f84d6440410e9277955f26a0d199e9) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Improve blocks helper types

- [#126](https://github.com/AtomicSmash/packages/pull/126) [`f3f55f1`](https://github.com/AtomicSmash/packages/commit/f3f55f1df0f84d6440410e9277955f26a0d199e9) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Remove AS specific functions

## 2.1.0

### Minor Changes

- [#121](https://github.com/AtomicSmash/packages/pull/121) [`98958bf`](https://github.com/AtomicSmash/packages/commit/98958bf72441f3c85e046d42f8ac13dde8ae7f89) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Update dependencies

### Patch Changes

- [#121](https://github.com/AtomicSmash/packages/pull/121) [`98958bf`](https://github.com/AtomicSmash/packages/commit/98958bf72441f3c85e046d42f8ac13dde8ae7f89) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Fix builds

## 2.0.1

### Patch Changes

- [#95](https://github.com/AtomicSmash/packages/pull/95) [`1b446f2`](https://github.com/AtomicSmash/packages/commit/1b446f2073511a71f5e9c6eedcf803804db35942) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Update packages to new ESLint standard

## 2.0.0

### Major Changes

- [#52](https://github.com/AtomicSmash/packages/pull/52) [`bf750e9`](https://github.com/AtomicSmash/packages/commit/bf750e9f6a6eb7a0078d56232a0ddadbbb61319c) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Major bump any packages with compilation due to new testing and build processes

### Patch Changes

- [#52](https://github.com/AtomicSmash/packages/pull/52) [`bf750e9`](https://github.com/AtomicSmash/packages/commit/bf750e9f6a6eb7a0078d56232a0ddadbbb61319c) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Dependency updates

## 1.1.0

### Minor Changes

- [#24](https://github.com/AtomicSmash/packages/pull/24) [`7dd4063`](https://github.com/AtomicSmash/packages/commit/7dd4063b0e3b9de1ec81c368b51ca9d429d8f2fc) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Improve and export block example type

## 1.0.0

### Major Changes

- [#17](https://github.com/AtomicSmash/packages/pull/17) [`b90a23a`](https://github.com/AtomicSmash/packages/commit/b90a23a1390911fdb64c605b6a79ea22b0dd330d) Thanks [@mikeybinns](https://github.com/mikeybinns)! - Add new package for blocks helpers
