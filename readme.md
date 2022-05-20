# mst-async-storage

A [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree) extension granting your models React Native's `AsyncStorage` powers of persistance.

# Requirements

- `mobx-state-tree` 2.x or 3.x
- `react-native` >= 0.56
- `@react-native-async-storage/async-storage` >= 1.x.x

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
  .extend(withAsyncStorage({ key: "nice.things" })) // <-- 🎉
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

You can also intercept the snapshot after it is loaded and before it is saved with `onLoad` and `onSave`.

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
  .extend(
    withAsyncStorage({
      key: "nice.things",
      // always ensures that nickelback is loaded into MST as `false` here
      onLoad: snapshot => {
        return {
          ...snapshot,
          nickleback: false,
        }
      },
      // always ensures that nickelback is saved to AsyncStorage as `false` here
      onSave: snapshot => {
        return {
          ...snapshot,
          nickelback: false,
        }
      },
    }),
  )
```

# Options

`withAsyncStorage()` accepts an optional object as a parameter with these keys:

| key      | type              | what it does                                                                             |
| -------- | ----------------- | ---------------------------------------------------------------------------------------- |
| key      | string            | The key to use when saving to AsyncStorage (default: the model type name)                |
| autoSave | boolean           | Should we automatically save when any values change on the model? (default: `true`)      |
| only     | string, string[]  | will only include the keys with these names                                              |
| except   | string, string[]  | will omit keys with these names                                                          |
| onLoad   | (snapshot) => any | Will be called after state is loaded from AsyncStorage. Return snapshot to change it.    |
| onSave   | (snapshot) => any | Will be called before AsyncStorage, allowing you to modify the snapshot by returning it. |

# Contributing?

Yes plz!

```
Fork it, Clone it, Branch it, Yarn it
Build it, Test it, Push it, PR it
```

To run the tests, I like to open two shells `yarn test:compile:watch` and `yarn test --watch`. If you run `ava` manually, make sure to add `-s` to run the tests serially because I fail mocking (because the mocks are shared state and bleed into each other).
