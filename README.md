# 哼哼编曲 · Hummingbird

> **哼唱变 MIDI 编曲 / Hum → MIDI arrangement**

[![Status](https://img.shields.io/badge/status-design--ready-yellow)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)
[![Stack](https://img.shields.io/badge/stack-Cloudflare_Workers-F38020?logo=cloudflare)](#)

---

## ✨ 这个想法

你脑子里有旋律——但你**不会编曲,不会乐理,打不开 DAW**。

录 30 秒哼唱,AI 帮你**编成 4 轨 MIDI**(旋律 / 和弦 / 贝斯 / 鼓)。拖进 GarageBand 改两下,**从"脑里有旋律"到"出了歌"只要一个下午**。

---

## 🎯 这件事有意思在哪

**让人和音乐的距离缩短到"会哼就行"**。

音乐创作的工具门槛一直很高——五线谱、DAW 经验、乐理知识。**哼唱**这件事每个人都会,但从哼到成歌中间隔了 10 年的"学乐理 + 学软件"。

这工具的野心是:**让创作的成本接近"会哼"**——把"想创作"和"会创作"之间那段痛苦路径,用 AI 抹平。

更深一层的价值:**好旋律不该死在脑子里**。每个人都有过"我刚才那段旋律真好听,但忘了"——这工具让那段旋律有机会变成作品。

### 🔬 有意思的技术点

- 🌐 浏览器音频 + 外部 ML(Basic Pitch)+ LLM 编排
- 💻 客户端优先架构(无服务端音频处理)
- 🎨 5 个风格的 prompt 模板差异化设计
- ⚡ 缓存层(同 audio_hash 不重调)

---

## 🚀 想要实现的样子

- 🎙️ 浏览器点"按住录音"按钮,哼 30 秒
- 🎵 选风格:lo-fi / pop / jazz / rock
- ⏱️ 15 秒后:
  - 🔊 浏览器播放 4 轨 MIDI 试听(Tone.js PolySynth 实时合成)
  - 📊 屏幕显示基本乐理信息(调式、BPM、和弦进行)
  - 💾 "Download .mid" 按钮 → 拖进 GarageBand 就能改

---

## 🔮 未来可能拓展成什么

- **📝 歌词生成**:哼完旋律后,LLM 根据节奏型生成匹配的歌词(中文 / 英文 / 日文)
- **🔄 风格迁移**:哼一段 jazz,选"做成 Adele 那种 pop" 风格
- **🎼 多轨叠加**:用户先哼主旋律,后哼贝斯线,AI 合并
- **🤖 AI 制作助理**:上传一首自己写的歌,AI 给出"编曲优化建议"或"混音问题诊断"
- **🎓 音乐教学**:哼一段,AI 标出"这里应该升半音""这里拍子错了"
- **🛒 市场**:用户上传自己编的 MIDI 卖 / 换(知识共享)

---

## 🛠️ 技术栈

| 层级 | 选型 |
|------|------|
| 🎤 音频采集 | MediaRecorder API(WebM/Opus,30s) |
| 🎵 音频→MIDI | Spotify Basic Pitch(免费,开源) |
| 🎼 调式识别 | Krumhansl-Schmuckler(纯 JS,无 ML 依赖) |
| 🤖 LLM | Workers AI Llama 3.1 8B(默认,免费)/ DeepSeek V3(便宜)/ Claude Haiku(BYOK 升级) |
| 🎹 MIDI 拼装 | `@tonejs/midi`(客户端,纯函数) |
| 🔊 试听 | Tone.js(浏览器) |
| ☁️ 后端 | Cloudflare Workers + D1 + R2 |
| 💾 缓存 | KV 哈希键(audio_hash + style),7 天 TTL |

> 🔒 **关键:Server 不碰音频字节。** 全程浏览器,带宽和 CPU 几乎为 0。

---

## 📋 To-do

- [ ] 写 MediaRecorder + 上传 UI
- [ ] 写 Basic Pitch 集成
- [ ] 写 Krumhansl-Schmuckler 调式识别
- [ ] 写 4 风格 prompt 模板
- [ ] 写 @tonejs/midi 拼装函数
- [ ] 写 Tone.js 试听播放器
- [ ] 写 KV 缓存层
- [ ] 写 R2 文件存储(7 天 TTL)
- [ ] 写 BYOK 设置
- [ ] 写 deploy 脚本
- [ ] 写 README polish(跑完后真实 demo 链接)

---

## 🤝 欢迎词

开源 + 公开 portfolio。

如果你:

- 🎤 **哼了 30 秒,生成结果跑调** → 提 issue,贴 audio(可选)+ 期望风格
- ➕ **想加新风格** (古典 / 电子 / 古风 / 8-bit)→ 提 PR,附 system prompt
- 🐛 **Basic Pitch 识别错了一堆音** → 提 issue
- 🔄 **想换 LLM 提升质量** (Sonnet 4 / Gemini Pro)→ 提 PR
- 🎧 **想集成 Logic / Ableton** (DAW 插件)→ 发邮件聊
- 🎭 **音乐人 + 觉得 MIDI 编排太死板** → 提 issue 标 "creativity",**重点讨论**

**提交 issue**:[github.com/kevin12369/hummingbird/issues](https://github.com/kevin12369/hummingbird/issues)
**发邮件**:491750329@qq.com

### 💡 特别欢迎

- 🎵 音乐人(看编曲质量)
- 🔊 音频 DSP 工程师(看 Basic Pitch 集成)
- 🌐 Web Audio / Tone.js 老手

---

> *代码还没写。设计 + 实施计划 100% 完整。这项目是 5 个里**最快**能跑通的(纯客户端,LLM 只做轻量编排)。*
