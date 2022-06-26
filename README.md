# fragmemo

[![Node.js CI](https://github.com/noriyotcp/fragmemo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/noriyotcp/fragmemo/actions/workflows/node.js.yml)

![This is fragmemo preview](https://user-images.githubusercontent.com/5820754/175816035-d74ce678-51f4-4257-bfa2-5285b3ab5c3a.png)


**Snippet manager built with Electron, Lit & monaco-editor**

At this time, this supports for macOS only.

## Develop

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
