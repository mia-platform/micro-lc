const isString = (value: string): boolean => {
  const i = value.charAt(0)

  if (i !== value.charAt(value.length - 1) || (i !== '\'' && i !== '"')) {
    return false
  }

  return true
}

export function compile<T extends Record<string, unknown>>(input: string): (context: T) => unknown {
  const res = input.match(/([^.]+)/g)
  if (res !== null) {
    return (context: T) =>
      res.reduce<unknown>((acc, value) => {
        let caller: string | number = value

        if (value.startsWith('[') && value.endsWith(']')) {
          const v1 = value.slice(1, -1)
          const index = Number.parseInt(v1)

          if (!Number.isNaN(index) && index.toString() === v1) {
            caller = index
          } else if (
            (v1.startsWith('"') && v1.endsWith('"'))
              || (v1.startsWith('\'') && v1.endsWith('\''))
          ) {
            caller = v1.slice(1, -1)
          }
        }

        if (caller === '') {
          throw new TypeError(`Invalid sequence of keys on input ${input}`)
        }

        return (typeof acc === 'object' && acc !== null)
          ? (acc as T)[caller]
          : undefined
      }, context)
  }

  return () => input
}

export function interpolate(variables: string[], extra: Record<string, unknown> = {}): unknown[] {
  return variables.reduce<unknown[]>((acc, variable, i) => {
    const trimmed = variable.trim()
    const ni = Number.parseInt(trimmed)
    const nf = Number.parseFloat(trimmed)
    if (trimmed === '') {
      acc[i] = trimmed
    } else if (isString(trimmed)) {
      acc[i] = trimmed.slice(1, -1)
    } else if (['true', 'false'].includes(trimmed)) {
      acc[i] = trimmed === 'true'
    } else if (!Number.isNaN(ni) && ni.toString() === trimmed) {
      acc[i] = ni
    } else if (!Number.isNaN(nf) && nf.toString() === trimmed) {
      acc[i] = nf
    } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      acc[i] = JSON.parse(trimmed)
    } else {
      acc[i] = compile(trimmed)(extra)
    }

    return acc
  }, [])
}
