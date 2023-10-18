interface Test {
  name: string
  body: () => void
}

const allTests: Test[] = []

export function test(name: string, body: () => void) {
  allTests.push({ name, body })
}

export function testCases(fn: any, cases: any[]) {
  test(fn.name, () => {
    for (let [input, output] of cases) {
      if (fn(...input) !== output) {
        throw `error: ${fn.name}(${input.join(', ')}) != ${output}`
      }
    }
  })
}

export interface TestResult {
  name: string
  error: string | null
}

function runTest(test: Test): TestResult {
  let error: string | null = null
  try {
    test.body()
  } catch (err) {
    if (typeof err == 'string') {
      error = err
    } else {
      error = `unknown error: ${err}`
    }
  }
  return {
    name: test.name,
    error,
  }
}

export function runAllTests(): TestResult[] {
  return allTests.map(runTest)
}

export const expect = {
  eq(a: any, b: any) {
    if (a !== b) {
      throw `expected [${b}] but got [${a}]`
    }
  }
}
