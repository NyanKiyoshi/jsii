import { sourceToAssemblyHelper } from 'jsii';
import reflect = require('jsii-reflect');
import { compareAssemblies } from '../lib';
import { Mismatches } from '../lib/types';

export async function expectNoError(original: string, updated: string) {
  const mms = await compare(original, updated);
  for (const msg of mms.messages()) {
    console.error(`- ${msg}`);
  }
  expect(mms.count).toBe(0);
}

export async function expectError(error: RegExp, original: string, updated: string) {
  const mms = await compare(original, updated);
  expect(mms.count).not.toBe(0);

  const msgs = Array.from(mms.messages());
  expect(msgs.some(m => error.test(m)),
    `Expected error like ${error}, got ${msgs}`).toBeTruthy();
}

export async function compare(original: string, updated: string): Promise<Mismatches> {
  const ass1 = await sourceToAssemblyHelper(original);
  const ts1 = new reflect.TypeSystem();
  const originalAssembly = ts1.addAssembly(new reflect.Assembly(ts1, ass1));

  const ass2 = await sourceToAssemblyHelper(updated);
  const ts2 = new reflect.TypeSystem();
  const updatedAssembly = ts2.addAssembly(new reflect.Assembly(ts2, ass2));

  return compareAssemblies(originalAssembly, updatedAssembly);
}
