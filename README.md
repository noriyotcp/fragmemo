# fragmemo

[![Build](https://github.com/noriyotcp/fragmemo/actions/workflows/build.yml/badge.svg)](https://github.com/noriyotcp/fragmemo/actions/workflows/build.yml) [![Lint and Test](https://github.com/noriyotcp/fragmemo/actions/workflows/lint-and-test.yml/badge.svg)](https://github.com/noriyotcp/fragmemo/actions/workflows/lint-and-test.yml) [![Create Release](https://github.com/noriyotcp/fragmemo/actions/workflows/create-release.yml/badge.svg)](https://github.com/noriyotcp/fragmemo/actions/workflows/create-release.yml)

![This is fragmemo preview](https://user-images.githubusercontent.com/5820754/175816035-d74ce678-51f4-4257-bfa2-5285b3ab5c3a.png)

**Snippet manager built with Electron, Lit & monaco-editor**

At this time, this supports for macOS only.

## Development

```sh
yarn install
yarn electron:dev

# build the app (depends on your architecture)
yarn app:build
# for Mac x64
yarn app:build:mac:x64
# for Mac arm64
yarn app:build:mac:arm64
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
