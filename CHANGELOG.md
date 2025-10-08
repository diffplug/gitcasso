# Changelog
All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Version must be kept in-sync between [`package.json`](package.json) and [`wxt.config.js`](wxt.config.ts).

## [Unreleased]

## [1.1.0] - 2025-10-07
### Added
- Support for GitHub projects (draft and "real" issues). ([#108](https://github.com/diffplug/gitcasso/pull/108))
### Fixed
- Appending to GitHub issues was not being enhanced, now fixed. ([#105](https://github.com/diffplug/gitcasso/issues/105))
- Reduced unnecessary permissions (no need for `host_permissions`)

## [1.0.0] - 2025-10-02
- Fix html escaping inside single-tick and double-tick code blocks.
- Add syntax highlighting for github-style #number.
- Add syntax highlighting for html tags (such as `<img>` or `<details>`).
- Fix sync issues for things like images being dragged onto a GitHub textrea.

## [0.2.0] - 2025-09-30
- Improved the popup table for switching tabs.

## [0.1.0] - 2025-09-26
- Initial release!
- Good enough to dogfood, not good enough to put effort into marketing it yet.