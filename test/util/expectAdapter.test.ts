import { buildJasmineFromJestResult, jestResultToJasmine, runJestExpect, runJasmineExpect } from '../../src/util/expectAdapter';

describe('expectAdapter', () => {
    describe('buildJasmineFromJestResult', () => {
        let input: JestExpectationResult;

        beforeEach(() => {
            input = {
                pass: false,
                message: () => "Test message"
            }
        })

        test('pass (false) isNot (false)', () => {
            const output = buildJasmineFromJestResult(input, false);
            expect(output).toMatchObject({
                pass: false,
                message: "Test message"
            })
        })

        it('pass (false) isNot (true)', () => {
            const output = buildJasmineFromJestResult(input, true);
            expect(output).toMatchObject({
                pass: true,
                message: "Test message"
            })
        })
    });

    describe('jestResultToJasmine', () => {
        let input: any; 

        beforeEach(() => {
            input = {
                pass: false,
                message: () => "Test message"
            }
        })

        it('object input', () => {
            const output = jestResultToJasmine(input, false);
            expect(output).toMatchObject({
                pass: false,
                message: "Test message"
            })
        })

        it('promise input', async () => {
            const promise: Promise<JestExpectationResult> = new Promise((resolve, reject) => {
                resolve(input);
            });
            const output = await jestResultToJasmine(promise, false);
            expect(output).toMatchObject({
                pass: false,
                message: "Test message"
            })
        })
    });
    
    describe('runExpect', () => {
        describe('runJestExpect', () => {
            const testFn = jest.fn();
            const args: any = {}
            runJestExpect.call(this, testFn, args);
            expect(testFn).toHaveBeenCalled();
        })
        describe('runJasmineExpect', () => {
            let output: any;
            let testFn: any;

            beforeEach(() => {
                testFn = jest.fn(() => {
                    return {
                        pass: false, 
                        message: () => "Test message"
                    }
                });
                output = runJasmineExpect.call(this, testFn);
            })

            test('returns object of functions', () => {
                expect(output).toEqual(
                    expect.objectContaining({
                        compare: expect.any(Function),
                        negativeCompare: expect.any(Function)
                    })
                )  
            });

            test('compare should call function', () => {
                output.compare();
                expect(testFn).toHaveBeenCalled()
            })
            
            test('negaitve compare should call function', () => {
                output.negativeCompare();
                expect(testFn).toHaveBeenCalled()
            })
            
        })
    })
    
})
