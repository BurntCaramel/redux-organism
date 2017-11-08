import expect from 'expect'

import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { makeActions, makeReducer } from './index'

const delay = 100

const waitMs = duration => new Promise(resolve => setTimeout(resolve, duration))
const nextFrame = () => new Promise((resolve) => {
  window.requestAnimationFrame(resolve)
})

const handlers = {
  initial: () => ({ number: 0 }),
  one: () => ({ number: 1 }),
  two: async () => {
    await waitMs(delay)
    return { number: 2 }
  },
  threeFour: function * () {
    yield waitMs(delay)
    yield { number: 3 }
    yield { number: 4 }
  }
}

describe('with default options', () => {
  let store = null
  let history = []
  let unsubscribe = null

  beforeEach(() => {
    store = createStore(
      makeReducer(handlers),
      applyMiddleware(thunk)
    )
    unsubscribe = store.subscribe(() => {
      history.push(store.getState())
    })
  })

  afterEach(() => {
    unsubscribe()
    history = []
  })

  it('handles actions', async () => {
    const actions = makeActions(handlers)

    expect(store.getState()).toEqual({ number: 0 })

    store.dispatch(actions.one())
    expect(store.getState()).toEqual({ number: 1 })

    store.dispatch(actions.two())
    await waitMs(delay)
    expect(store.getState()).toEqual({ number: 2 })

    store.dispatch(actions.threeFour())
    await nextFrame()
    await waitMs(delay)
    await nextFrame()
    await waitMs(delay)
    expect(history.slice(-2)).toEqual([
      { number: 3 },
      { number: 4 }
    ])
  })
})
