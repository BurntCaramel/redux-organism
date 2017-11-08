import { callHandler } from 'awareness'

export const ORGANISM_CHANGED = 'ORGANISM_CHANGED'

export function makeActions(
  handlersIn,
  {
    changeActionType = ORGANISM_CHANGED,
    extractFromState = (s) => s
  } = {}
) {
  const actionTypes = Object.keys(handlersIn)
  return actionTypes.reduce((out, actionType) => {
    out[actionType] = (...args) => (dispatch, getState) => {
      callHandler(
        handlersIn[actionType],
        'error',
        [ {} ].concat(args),
        (stateChanger) => {
          const newState = stateChanger(extractFromState(getState()))
          dispatch({
            type: changeActionType,
            payload: { newState }
          })
        }
      )
    }
    return out
  }, {})
}

const defaultHandlers = {
  initial: () => ({})
}

export const makeReducer = (
  handlers = defaultHandlers,
  type = ORGANISM_CHANGED
) => (
  previousState = handlers.initial(),
  action
) => {
  if (action.type === type) {
    return Object.assign({}, previousState, action.payload.newState)
  }
  else {
    return previousState
  }
}
