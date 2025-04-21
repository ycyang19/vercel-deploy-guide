// OpenAI配置
const API_KEY = 'f7f812ba-9653-43cc-9ebe-e0c4a530c2c8'; // 火山引擎控制台-密钥管理获取
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';// 更新为正确的火山引擎API端点

// 只在index.html页面获取DOM元素
let nameInput, keywordsInput, generateBtn, loading, effectsContainer;
if (window.location.pathname.includes('index.html')) {
  nameInput = document.getElementById('nameInput');
  keywordsInput = document.getElementById('keywordsInput');
  generateBtn = document.getElementById('generateBtn');
  loading = document.getElementById('loading');
  effectsContainer = document.getElementById('effectsContainer');
}

// 添加生成按钮点击事件 - 只在index.html页面绑定
if (window.location.pathname.includes('index.html') && generateBtn && nameInput && keywordsInput) {
  generateBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const keywords = keywordsInput.value.trim();
    
    if (name && keywords) {
      // 存储输入值到sessionStorage
      sessionStorage.setItem('praiseName', name);
      sessionStorage.setItem('praiseKeywords', keywords);
      
      // 跳转到夸赞页面
      window.location.href = 'praise.html';
    }
  });
}

// 夸赞页专用API调用函数
function generatePraises(name, keywords) {
  const prompt = buildPrompt(name, keywords);
  
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7
    })
  })
  .then(response => response.json())
  .then(data => {
    const content = data.choices[0].message.content;
    const praises = content.split('\n').filter(line => line.trim());
    
    const praiseContainer = document.getElementById('praiseContainer');
    praiseContainer.innerHTML = praises.map(p => `<div class="praise-item">${p}</div>`).join('');
    
    // 显示返回按钮
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.style.display = 'block';
      backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('生成夸赞内容失败，请重试');
  });
}

// 生成提示词模板
const praiseCache = new Map();

function buildPrompt(name, keywords) {
  const cacheKey = `${name}:${keywords}`;
  
  // 检查缓存
  if (praiseCache.has(cacheKey)) {
    const cached = praiseCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 3600000) { // 1小时缓存
      return cached.prompt;
    }
  }
  
  const prompt = `为${name}生成夸赞内容！第一行显示名字加感叹号，后面围绕"${keywords}"的核心特质展开：

前3行：每行≤10字，使用最夸张的语气直接夸赞！！！
中间3行：每行≤40字，用强烈情感表达特质带来的震撼！！！
接下来2行：每行≤40字，表达对特质的极度欣赏！！！
最后1行：每行≤10字，总结升华夸赞！！！
最后一句必须从夸赞发出人的角度表达对被夸赞人的疯狂喜爱、尊敬和崇拜！！！

创作要求：
1. 只使用中文和标点符号
2. 每行必须包含3个以上感叹号！！！
3. 必须包含5句直接夸赞"${name}"的句子
4. 每行总字数不超过40字（包括标点符号）
5. 语气要极度夸张浓烈
6. 必须包含1-2句90后黑话(如"yyds"、"绝绝子")或00后弹幕体(如"awsl"、"好活当赏")
7. 其余句子保持原有的夸张表达风格

示例格式：
${name}太棒了！！！
你的${keywords}让我震惊到说不出话！！！
怎么会有这么完美的${keywords}！！！
你就是${keywords}的化身！！！
我宣布${name}是世界上最棒的人！！！
我发誓这辈子都要追随${name}的脚步！！！`;
  
  // 更新缓存
  praiseCache.set(cacheKey, {
    prompt,
    timestamp: Date.now()
  });
  
  return prompt;
}

// 处理API响应
function handleResponse(data) {
  // 保留此函数以兼容非SSE模式
  const content = data.choices[0].message.content;
  const praises = content.split('\n').filter(line => line.trim());
  
  // 存储结果到缓存
  const name = nameInput.value.trim();
  const keywords = keywordsInput.value.trim();
  const cacheKey = `${name}:${keywords}`;
  
  if (praiseCache.has(cacheKey)) {
    praiseCache.get(cacheKey).result = praises;
  }
  
  praises.forEach(praise => createPraiseElement(praise));
  
  // 所有夸赞显示完成后显示返回按钮
  setTimeout(() => {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.style.display = 'block';
      backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  }, praises.length * 2000); // 假设每条夸赞显示2秒
}

// 创建动画文字元素
// 夸赞语列表
const praiseTexts = [
  "太棒了！简直完美！",
  "天才之作！令人惊叹！",
  "这创意绝了！",
  "史上最强！",
  "无敌了！",
  "惊艳全场！",
  "超凡脱俗！",
  "前无古人后无来者！",
  "完美无瑕！",
  "惊为天人！"
];

// 创建弹幕元素
function createBarrage() {
  const barrage = document.createElement('div');
  barrage.className = 'barrage';
  
  // 随机选择夸赞语
  const randomText = praiseTexts[Math.floor(Math.random() * praiseTexts.length)];
  barrage.textContent = randomText;
  
  // 限制弹幕在页面上方30%区域，确保不遮挡标题
  const safeTop = Math.random() * 15 + 5; // 5%-20%高度
  const duration = Math.random() * 10 + 5; // 5-15秒
  
  barrage.style.top = `${safeTop}%`;
  barrage.style.animationDuration = `${duration}s`;
  barrage.style.zIndex = '1';
  barrage.style.pointerEvents = 'none';
  
  // 随机颜色
  const hue = Math.floor(Math.random() * 360);
  barrage.style.color = `hsl(${hue}, 100%, 70%)`;
  
  document.body.appendChild(barrage);
  
  // 动画结束后移除元素
  barrage.addEventListener('animationend', () => {
    barrage.remove();
  });
}

// 定时生成弹幕
function startBarrage() {
  createBarrage();
  setTimeout(startBarrage, Math.random() * 2000 + 500); // 0.5-2.5秒间隔
}

// 页面加载时启动弹幕
window.addEventListener('load', () => {
  // 如果不是praise页面才启动弹幕
  if (!window.location.pathname.includes('praise.html')) {
    startBarrage();
  }
});

function createPraiseElement(texts, onFirstLineShown) {
  const praiseContainer = document.getElementById('praiseContainer');
  if (!praiseContainer) {
    console.error('praiseContainer元素未找到');
    return;
  }
  
  // 清空容器
  praiseContainer.innerHTML = '';
  
  // 移动端适配
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    praiseContainer.style.height = `calc(${window.innerHeight}px - 15vh)`;
    praiseContainer.style.maxHeight = `calc(${window.innerHeight}px - 15vh)`;
    praiseContainer.style.padding = '5px';
    praiseContainer.style.marginTop = '7vh';
  } else {
    praiseContainer.style.height = `calc(${window.innerHeight}px - 10vh)`;
    praiseContainer.style.maxHeight = `calc(${window.innerHeight}px - 10vh)`;
    praiseContainer.style.padding = '10px';
    praiseContainer.style.marginTop = '5vh';
  }
  
  praiseContainer.style.display = 'flex';
  praiseContainer.style.flexDirection = 'column';
  praiseContainer.style.justifyContent = 'flex-start';
  praiseContainer.style.alignItems = 'center';
  praiseContainer.style.boxSizing = 'border-box';
  praiseContainer.style.overflow = 'hidden';
  praiseContainer.style.overflowX = 'hidden';
  
  // 生成10行夸赞内容
  const filteredTexts = texts.filter(text => text.trim()).slice(0, 10);
  
  function showNextLine(i) {
    if (i >= filteredTexts.length) return;
    
    const element = document.createElement('div');
    element.className = 'praise-line';
    element.style.color = `hsl(${Math.random()*30}, 100%, 50%)`;
    element.style.fontSize = '48px';
    element.style.width = '90%';
    element.style.maxWidth = '800px';
    element.style.textAlign = 'center';
    element.style.opacity = '0';
    element.style.lineHeight = '0.8';
    element.style.letterSpacing = '0.2px';
    element.style.wordSpacing = '0.3px';
    element.style.padding = '0.25px 0';
    element.style.margin = '0.175px 0';
    element.style.whiteSpace = 'normal';
    element.style.display = 'flex';
    element.style.justifyContent = 'center';
    element.style.alignItems = 'center';
    element.style.wordBreak = 'break-word';
    element.style.maxHeight = 'none';
    element.style.flexShrink = '1';
    
    // 动态计算字体大小和行距
    const containerHeight = isMobile ? window.innerHeight * 0.7 : window.innerHeight * 0.8;
    const lineCount = filteredTexts.length;
    
    // 计算已使用的总高度
    const usedHeight = Array.from(praiseContainer.children).reduce((acc, child) => {
      return acc + child.offsetHeight;
    }, 0);
    
    // 计算剩余可用高度
    const remainingHeight = containerHeight - usedHeight;
    
    // 根据剩余高度和剩余行数计算字体大小
    const remainingLines = lineCount - i;
    const maxFontSize = Math.min(
      remainingHeight / (remainingLines * (isMobile ? 2.0 : 1.8)), 
      isMobile ? 28 : 36
    );
    
    // 应用动态计算
    element.style.fontSize = `${Math.max(isMobile ? 14 : 16, maxFontSize)}px`;
    element.style.lineHeight = `${maxFontSize * (isMobile ? 1.3 : 1.2)}px`;
    element.style.margin = '0';
    element.style.width = isMobile ? '95%' : '90%';
    element.style.maxWidth = isMobile ? '100%' : '800px';
    
    // 添加过渡效果
    element.style.transition = 'font-size 0.3s ease, line-height 0.3s ease';
    
    praiseContainer.appendChild(element);
    
    // 打字机效果显示文本
    let j = 0;
    const speed = 50;
    const text = filteredTexts[i] || '';
    if(!text) {
      showNextLine(i + 1);
      return;
    }
    
    function typeWriter() {
      if (j < text.length) {
        const charSpan = document.createElement('span');
        charSpan.textContent = text.charAt(j);
        charSpan.style.display = 'inline-block';
        charSpan.style.minWidth = '0.9em';
        charSpan.style.margin = '0 2px';
        charSpan.style.verticalAlign = 'middle';
        charSpan.style.opacity = '0';
        charSpan.style.transform = 'translateY(3px)';
        charSpan.style.transition = 'all 0.3s ease';
        charSpan.style.willChange = 'transform, opacity';
        charSpan.style.animation = `fadeIn 0.15s ease ${j * 0.07}s forwards`;
        charSpan.style.lineHeight = '1.8';
        charSpan.style.wordBreak = 'break-all';
        charSpan.style.position = 'relative';
        element.appendChild(charSpan);
        j++;
        setTimeout(typeWriter, speed);
      } else {
        // 当前句子完全显示后，开始下一句
        setTimeout(() => showNextLine(i + 1), 300);
      }
    }
    
    // 开始显示当前句子
    setTimeout(() => {
      element.style.opacity = '1';
      typeWriter();
      
      // 第一句显示时触发回调
      if (i === 0 && onFirstLineShown) {
        onFirstLineShown();
      }
    }, i * 100);
  }
  
  // 开始显示第一句话
  showNextLine(0);
  
  // 跟踪所有动画完成状态
  let completedAnimations = 0;
  const totalAnimations = filteredTexts.reduce((acc, text) => acc + (text ? text.length : 0), 0);
  
  function checkAllAnimationsComplete() {
    completedAnimations++;
    if (completedAnimations === totalAnimations) {
      const backBtn = document.getElementById('backBtn');
      if (backBtn) {
        backBtn.style.display = 'block';
        backBtn.addEventListener('click', () => {
          window.location.href = 'index.html';
        });
      }
    }
  }
  
  // 修改typeWriter函数中的动画完成回调
  function typeWriter() {
    if (j < text.length) {
      const charSpan = document.createElement('span');
      charSpan.textContent = text.charAt(j);
      charSpan.style.display = 'inline-block';
      charSpan.style.minWidth = '0.9em';
      charSpan.style.margin = '0 2px';
      charSpan.style.verticalAlign = 'middle';
      charSpan.style.opacity = '0';
      charSpan.style.transform = 'translateY(3px)';
      charSpan.style.transition = 'all 0.3s ease';
      charSpan.style.willChange = 'transform, opacity';
      charSpan.style.animation = `fadeIn 0.15s ease ${j * 0.07}s forwards`;
      charSpan.style.lineHeight = '1.8';
      charSpan.style.wordBreak = 'break-all';
      charSpan.style.position = 'relative';
      charSpan.addEventListener('animationend', checkAllAnimationsComplete);
      element.appendChild(charSpan);
      j++;
      setTimeout(typeWriter, speed);
    } else {
      // 当前句子完全显示后，开始下一句
      setTimeout(() => showNextLine(i + 1), 300);
    }
  }
}

// 错误处理
function handleError(error) {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    apiStatus: navigator.onLine ? '在线' : '离线',
    apiUrl: API_URL,
    model: "deepseek-r1-250120"
  };
  
  console.error('完整错误诊断信息:', errorDetails);
  
  if (!navigator.onLine) {
    alert('网络连接已断开，请检查网络后重试');
  } else if (error.message.includes('超时')) {
    alert('请求超时，可能是服务器响应缓慢，请稍后重试');
  } else {
    alert('生成失败: ' + error.message + '\n请检查控制台获取详细信息');
  }
  
  if (loading) {
    loading.classList.add('hidden');
  }
}

// 主功能
async function generatePraises(name, keywords) {
  name = name.trim();
  keywords = keywords.trim();

  if (!name || !keywords) {
    alert('请填写姓名和关键词');
    return;
  }

  const praiseContainer = document.getElementById('praiseContainer');
  if (!praiseContainer) {
    console.error('praiseContainer元素未找到');
    return;
  }

  // 显示loading元素并初始化进度条
  const loadingContainer = document.getElementById('loadingContainer');
  const progressBar = loadingContainer?.querySelector('.progress-bar');
  if (loadingContainer) {
    loadingContainer.style.display = 'flex';
    
    // 进度条动画
    let progress = 0;
    let isPaused = false;
    let pauseCount = 0;
    
    const interval = setInterval(() => {
      if (!isPaused) {
        progress += 0.2; // 20秒完成100%
        if (progressBar) {
          progressBar.style.width = `${Math.min(progress, 95)}%`;
        }
      }
      
      // 随机暂停逻辑
      if (Math.random() < 0.1 && pauseCount < 3) {
        isPaused = true;
        pauseCount++;
        setTimeout(() => {
          isPaused = false;
        }, Math.random() * 3000 + 2000); // 暂停2-5秒
      }
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100);
  }

  // 清空容器并添加打字机效果容器
  praiseContainer.innerHTML = '';
  const typewriterContainer = document.createElement('div');
  typewriterContainer.className = 'typewriter';
  praiseContainer.appendChild(typewriterContainer);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-r1-250120",
        messages: [{
          role: "user",
          content: buildPrompt(name, keywords)
        }],
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const praises = content.split('\n').filter(line => line.trim());
    
    // 在API响应后立即将进度条设置为100%
    if (progressBar) {
      progressBar.style.width = '100%';
    }
    
    // 延迟100ms后隐藏loading并显示夸赞内容
    setTimeout(() => {
      if (loadingContainer) {
        loadingContainer.style.display = 'none';
      }
      createPraiseElement(praises);
    }, 100);
    
    // 显示返回按钮
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.style.display = 'block';
      backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  } catch (error) {
    handleError(error);
  }
}

// 测试API可用性
async function testAPI() {
  try {
    console.log('正在测试火山引擎API...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-r1-250120",
        messages: [
          {
            role: "system",
            content: "你是人工智能助手"
          },
          {
            role: "user",
            content: "测试API可用性，请回复'API服务正常'"
          }
        ],
        temperature: 0.8
      })
    });

    if (!response.ok) {
      console.error('API测试失败，状态码:', response.status);
      const errorData = await response.text();
      console.error('错误响应:', errorData);
      return;
    }
    
    const data = await response.json();
    console.log('API测试成功，完整响应:', JSON.stringify(data, null, 2));
    console.log('API服务状态: 正常');
    
  } catch (error) {
    console.error('API测试异常:', error.message);
    console.error('堆栈信息:', error.stack);
  }
}

// 事件绑定 - 只在index.html页面绑定
if (window.location.pathname.includes('index.html')) {
  const keywordsInput = document.getElementById('keywordsInput');
  const nameInput = document.getElementById('nameInput');
  const generateBtn = document.getElementById('generateBtn');
  
  if (keywordsInput && nameInput && generateBtn) {
    generateBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      const keywords = keywordsInput.value.trim();
      
      if (name && keywords) {
        sessionStorage.setItem('praiseName', name);
        sessionStorage.setItem('praiseKeywords', keywords);
        window.location.href = 'praise.html';
      }
    });
    
    [keywordsInput, nameInput].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateBtn.click();
      });
    });
  }
}

// 页面加载后自动测试API - 只在index.html页面执行
if (window.location.pathname.includes('index.html') && nameInput && keywordsInput) {
  window.addEventListener('load', () => {
    console.log('页面加载完成，开始API测试...');
    testAPI();
  });
}