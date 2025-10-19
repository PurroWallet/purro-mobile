export function createGetStyles<T>(fn: (colors: any) => T): (colors: any) => T {
  return fn;
}

export function makeDebugBorder(color = 'red', width = 1) {
  return {
    borderWidth: width,
    borderColor: color,
  };
}
