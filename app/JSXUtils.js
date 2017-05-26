export function asyncState<T>(target: T) {
  target.prototype.asyncSetState = async function(newState: any): Promise<void> {
    return new Promise((resolve) => this.setState(newState, resolve));
  };
}