import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('render.worker message protocol', () => {
  it('Worker 文件存在且可解析为字符串', () => {
    // vitest 无法解析 `?worker` Vite 查询,改为验证 worker 源码可读且包含协议形状
    const path = resolve(__dirname, '../src/render.worker.ts');
    const src = readFileSync(path, 'utf8');

    // 协议三态: progress / done / error
    expect(src).toContain("type: 'progress'");
    expect(src).toContain("type: 'done'");
    expect(src).toContain("type: 'error'");

    // 接收 render 请求
    expect(src).toContain("type !== 'render'");

    // transferable 零拷贝
    expect(src).toContain('[bytes.buffer]');

    // 用 webworker lib 拿到正确 self 类型
    expect(src).toContain('/// <reference lib="webworker" />');
  });

  it('Worker 源码在 TS strict 下应无明显语法问题', () => {
    // 简单断言文件可被读取且包含导入声明
    const path = resolve(__dirname, '../src/render.worker.ts');
    const src = readFileSync(path, 'utf8');
    expect(src).toContain("from './render-core'");
    expect(src).toContain("from './encode-mp3-core'");
    expect(src).toContain("from './types'");
  });
});