interface Action {
  trigglePattern: number
  deviceId: string
  toState: any
}

class ActionManager {
  actionMap: Map<number, any>
  constructor() {
    this.actionMap = new Map()
  }

  addAction(action: Action) {
    if (!this.actionMap.has(action.trigglePattern))
      this.actionMap.set(action.trigglePattern, [])
    this.actionMap.get(action.trigglePattern).push(action)
  }

  exec(pattern: number, devMan) {
    const actions = this.actionMap.get(pattern)
    console.log(actions)
    for (const action of actions) {}
  }
}
