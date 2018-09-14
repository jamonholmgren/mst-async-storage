# mst-async-storage

A [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree) extension granting your models React Native's `AsyncStorage` powers of persistance.

# Requirements

- `mobx-state-tree` 2.x or 3.x
- `react-native` >= 0.56

# Installing

```sh
yarn add mst-async-storage
```

# Usage

The following async actions are added:

```ts
import { types } from "mobx-state-tree"
import { withAsyncStorage } from "mst-async-storage"

export const NiceThingsModel = types
  .model("NiceThings")
  .props({
    unicorns: true,
    dragons: true,
    cake: true,
    spiders: false,
    nickleback: false,
  })
  .actions(self => ({
    setSpiders(value: boolean) {
      self.spiders = value
    },
  }))
  .extend(withAsyncStorage()) // <-- 🎉
```

Now you can load it:

```js
async demo () {
  // create your model as usual
  const happy = NiceThingsModel.create()

  // now load the data from async storage
  await happy.load()

  // and when you change something
  happy.setSpiders(true)

  // it will automatically save back to async storage!


}
```

# Options

`withAsyncStorage()` accepts an optional object as a parameter with these keys:

| key      | what it does                                                                        |
| -------- | ----------------------------------------------------------------------------------- |
| key      | The key to use when saving to AsyncStorage (default: the model type name)           |
| autoSave | Should we automatically save when any values change on the model? (default: `true`) |

# Contributing?

Yes plz!

```
Fork it, Clone it, Branch it, Yarn it
Build it, Test it, Push it, PR it
```

To run the tests, I like to open two shells `yarn test:compile:watch` and `yarn test --watch`. If you run `ava` manually, make sure to add `-s` to run the tests serially because I fail mocking (because the mocks are shared state and bleed into each other).
