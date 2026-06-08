# 哼哼编曲 · Hummingbird

> **把哼唱变完整歌 / Turn your humming into a full song arrangement**

*🚧 简历 demo 项目,代码待写 — 等 5 项目第二个实施。*

---

## 我为什么做这个 / Why this exists

中文(超级私人):

我洗澡的时候老哼歌。

脑子里有一段旋律,但我**完全不会编曲**。我连五线谱都看不利索,更别说 Logic / Ableton / FL Studio 这种专业 DAW。

每次哼完一段特别得意的旋律,录下来,过两天再听,觉得"诶这个挺有意思的"——然后呢?没然后了。旋律卡在脑子里,变不成完整的歌。

我想:要是 AI 听到我那 30 秒走调的哼唱,能帮我**编成 4 轨 MIDI**(旋律/和弦/贝斯/鼓),我拖进 GarageBand 改两下,发到 Spotify——

那我从洗澡到出歌,**只要一个下午**。

不是要做音乐人。就是**让普通人也能有"我出过歌"**。

English:

You hum in the shower. It's good. Then nothing happens.
What if a browser tab heard it, made it into 4-track MIDI, and let you finish the song in an afternoon?
This project does that.

---

## 它应该长什么样 / What it should do

1. 浏览器开麦克风
2. 我哼 30 秒(随便什么调)
3. 选风格:lo-fi / pop / jazz / rock
4. 浏览器返回:
   - 4 轨 MIDI 文件(旋律/和弦/贝斯/鼓)
   - Tone.js 浏览器试听
   - 7 天内可重下载(R2 缓存)

拖进 GarageBand / LMMS 修两下,出歌。

---

## 技术上会怎么搞 / How it works (planned)

- **客户端**: MediaRecorder API(WebM/Opus 格式)→ blob 上传
- **音频→MIDI**: Spotify 的 **Basic Pitch**(免费,开源,音符级准确)
- **编曲**: Workers AI Llama 3.1 8B(默认免费)/ DeepSeek V3(便宜)/ Claude Haiku(BYOK 升级)
- **MIDI 拼装**: `@tonejs/midi` 客户端纯函数
- **试听**: Tone.js 浏览器播放
- **存储**: R2(7 天 TTL)
- **元数据**: D1(song_id, key, bpm, style)

**关键工程点:整个流程没有服务端音频处理**。Browser 录 → Browser 上传 → Server 只调 LLM → Browser 拼 MIDI。

---

## 有什么挑战 / What'll be hard

1. **哼唱识别的准确率**。Basic Pitch 对清晰的哼唱 80%+ 准确,口哨/含混哼唱掉到 50%。Plan 里打算用 Krumhansl-Schmuckler 算法从识别出的音符推调式,作为 fallback 兜底。
2. **"编曲"的质量天花板**。LLM 给出 4 个和弦的进行 + 1 条贝斯 + 1 个鼓 pattern——比专业编曲师差远了。但"业余能用的"应该 80% 时间够。
3. **风格一致性**。"pop" 风格 vs "lo-fi" 风格,在 LLM 输出的 200 token 描述里可能分不清。需要 prompt 模板做得细(我会在 plan 里写)。
4. **DAW 兼容性**。MIDI 1.0 标准各家 DAW 都吃,但音色库不通用。我导的是裸 MIDI(.mid),用户得自己挂音色。

---

## 为什么这项目值得做(不是噱头)

我**真的**会做完用一下。每次洗澡哼歌卡在那儿的感觉,太熟悉了。

但 LLM 能不能做出"有灵魂"的编曲?诚实说:大概率不能。LLM 不会"懂"音乐,只能按乐理规则拼。**我的预期是"够用,不出错,但惊艳不到"**。

如果做出来觉得无聊,我会:
- 加更多风格(电音/民谣/古风)
- 加节奏型模板库(每种风格 5 套)
- 加 LRC 歌词生成(虽然不接歌词输入,但能根据哼唱长度推)

但**先做 MVP**,再迭代。跟 Sry 一样。

---

## 成本画像(自己算的)

**这个项目最爽——默认 LLM 就是免费**:

- Workers AI Llama 3.1 8B:免费 10k neurons/天 ≈ **1000 次编曲/天**
- 1000 用户/月:**$0**
- 10000 用户:仍 $0(用完免费层切到缓存)
- 100000 用户:~$50/月(切 DeepSeek,或者缓存兜底)
- 100 万用户:才需要认真算成本

**这是 5 个项目里成本最低的**。因为 Workers AI 对简单任务(编曲描述生成)够用,不需要 Sonnet。

---

## 我从这项目想展示什么 / Resume angle

- **多模态整合**: 浏览器音频 → 外部 ML 模型 → LLM → MIDI 文件
- **客户端优先架构**: MediaRecorder + Tone.js 都在浏览器
- **外部 API 集成**: Spotify Basic Pitch(免费开源)
- **成本极简**: $0 默认 + 1000 编曲/天免费层
- **领域知识**: 音乐理论(Krumhansl-Schmuckler 调式识别)

---

## 进度 / Status

- ✅ 设计文档: [docs/design/2026-06-07-ai-hum-to-song-design.md](../docs/design/2026-06-07-ai-hum-to-song-design.md)
- ✅ 实施计划: [docs/plans/2026-06-07-hummingbird-hum-to-song-plan.md](../docs/plans/2026-06-07-hummingbird-hum-to-song-plan.md)
- ⏳ 代码: 0%
- ⏳ Live URL: 待定

---

## 实施完会写什么 / Future dev notes

跑完 deploy 后这里会加:
- Live URL
- 我自己哼的某段旋律 → 生成的 MIDI demo 音频
- "用户实际在用吗?"数据(用 Cloudflare Analytics 看,无 cookie 隐私友好)
- Basic Pitch 准确率实测(我会自己哼 10 段验证)
- 风格识别准确率(让朋友试不同风格,看 LLM 输出是否符合预期)

---

*P.S. 写 README 时刚哼了一段旋律,挺好听的(我老婆说走调到外太空)。如果这项目做出来,她可能会笑我"连 AI 都不如"。但好歹,AI 哼的不会跑调。*

*P.P.S. 我不会五线谱,也不会任何乐器,代码评审风格友好即可。*
