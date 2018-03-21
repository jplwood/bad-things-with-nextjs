// Barebones Intellisense file to get VS to recognize Jasmine functions.
// This is our own addition; it doesn't come from NuGet.
// This file is necessary because Jasmine is managed by npm and lives outside the project.

// In the future, we could add more detailed annotations, as jQuery's intellisense does.

var jasmine = {
        createSpy: null,
        createSpyObj: null,
        any: null,
        Clock: {
            install: null,
            uninstall: null,
            tick: null
        },
        HtmlReporter: null,
        specFilter: null
    },
    jasmineEnv = {
        versionString: null,
        execute: null
    }
    describe = null,
    beforeEach = null,
    expect = {
        toBe: null,
        toBeNubeforeeachll: null,
        toMatch: null,
        toBeUndefined: null,
        toBeLessThan: null,
        toBeGreaterThan: null,
        toHaveBeenCaled: null,
        toHaveBeenCalledWith: null,
        toEqual: null,
        toThrow: null,
        not: null,
    },
    spyOn = {
        and : {
            callThrough: null,
            returnValue: null,
            callFake: null,
            throwError: null,
            stub: null
        }
    },
    createSpy = null,
    createSpyObj = null,
    it = null,
    runs = null,
    waitsFor = null,
    xdescribe = null;