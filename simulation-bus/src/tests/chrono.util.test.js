import { getDeltaTime } from "../utils/Chrono";


describe("Testing Util Chrono.js", () => {
    test("Function -> getDeltaTime", () => {
        const before_time = new Date("2021-06-01T00:00:00.000Z");
        const after_time = new Date("2021-06-01T00:00:00.001Z");
        const delta_time = getDeltaTime(before_time, after_time);
        expect(delta_time).toBe(1);
    });

    test("Function -> getDeltaTime", ()=>{
        const before_time = Date.now();
        const after_time = Date.now();
        const delta_time = getDeltaTime(before_time, after_time);
        expect(delta_time).toBe(0);
    });
});