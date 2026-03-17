"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const confirm_1 = require("../../src/lib/confirm");
const output_1 = require("../../src/lib/output");
describe('confirm', () => {
    afterEach(() => {
        (0, confirm_1.setAutoConfirm)(false);
        (0, output_1.setJsonMode)(false);
    });
    it('returns true when --yes flag is set', async () => {
        (0, confirm_1.setAutoConfirm)(true);
        expect(await (0, confirm_1.confirm)('Do this?')).toBe(true);
    });
    it('returns true when --json mode is active', async () => {
        (0, output_1.setJsonMode)(true);
        expect(await (0, confirm_1.confirm)('Do this?')).toBe(true);
    });
    it('returns true when both --yes and --json are set', async () => {
        (0, confirm_1.setAutoConfirm)(true);
        (0, output_1.setJsonMode)(true);
        expect(await (0, confirm_1.confirm)('Do this?')).toBe(true);
    });
});
//# sourceMappingURL=confirm.test.js.map