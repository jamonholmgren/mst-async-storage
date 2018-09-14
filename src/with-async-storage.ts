import {
  flow,
  applySnapshot,
  IStateTreeNode,
  onSnapshot,
  getSnapshot,
  getType,
} from "mobx-state-tree"
import { load, save } from "./persist"

export interface WithAsyncStorageOptions {
  /**
   * The AsyncStorage key name (default: model name).
   */
  key?: string

  /**
   * Should we monitor for changes via onSnapshot (default: true)?
   */
  autoSave?: boolean
}

/**
 * Adds AsyncStorage support to your model.
 */
export const withAsyncStorage = (options: WithAsyncStorageOptions = {}) => (
  self: IStateTreeNode,
) => {
  let disposer: Function

  // setup the default option values
  const key = options.key || getType(self).name
  const autoSave = typeof options.autoSave === "boolean" ? options.autoSave : true

  /**
   * Turns on AsyncStorage saving when the snapshot changes.
   */
  const enableSaving = () => {
    disposer && disposer()
    disposer = onSnapshot(self, snapshot => save(key, snapshot))
  }

  return {
    actions: {
      /**
       * Loads from async storage.
       */
      load: flow(function*() {
        const data = yield load(key)
        if (data) {
          applySnapshot(self, data)
        }

        // now monitor for changes
        if (autoSave) {
          enableSaving()
        }

        // send back the data
        return data
      }) as () => Promise<any | undefined>,

      /**
       * Saves the snapshot to async storage. This only needs to be
       * called if autoSave has been turned off.
       */
      save: flow(function*() {
        yield save(key, getSnapshot(self))
      }),

      beforeDetach() {
        disposer && disposer()
      },
    },
  }
}
