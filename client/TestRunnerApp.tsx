import React, { FC, useEffect, useState } from "react"
import { TestResult, runAllTests } from "./Testing"
import './SchemaData'

/**
 * an App for running client-side tests
 */
export const TestRunnerApp = () => {
  const results = runAllTests()

return <>
    {results.map((result: TestResult, idx: number) => <div key={idx}>
      <b style={{color: result.error ? 'red' : 'green'}}>
        {result.name}</b> :
      {!result.error ? <i>Passed</i> : result.error}
    </div>)}
   </>
}
