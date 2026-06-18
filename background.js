/**
 * 背景特效模块
 * 功能：使用同目录下的 image.png 作为背景 + 整齐排列的六边形网格
 */

// ==================== 初始化 ====================

// 窗口加载时设置背景和创建网格
window.addEventListener('load', function() {
  // 1. 设置静态图片背景
  document.body.style.background = 'url("image.png") no-repeat center center fixed';
  document.body.style.backgroundSize = 'cover';
  // 移除body的渐变过渡效果，因为我们现在是静态图片
  document.body.style.transition = 'none';

  // 2. 创建六边形网格容器
  let gridContainer = document.getElementById('hexagonGridContainer');
  if (!gridContainer) {
    gridContainer = document.createElement('div');
    gridContainer.id = 'hexagonGridContainer';
    gridContainer.style.position = 'fixed';
    gridContainer.style.top = '0';
    gridContainer.style.left = '0';
    gridContainer.style.width = '100%';
    gridContainer.style.height = '100%';
    gridContainer.style.pointerEvents = 'none';
    gridContainer.style.zIndex = '-1'; // 确保网格在内容之下
    gridContainer.style.overflow = 'hidden';
    document.body.appendChild(gridContainer);
  }

  // 3. 添加CSS样式
  const style = document.createElement('style');
  style.textContent = `
    .hexagon {
      position: absolute;
      width: ${80}px;
      height: ${80 * Math.sqrt(3)}px;
      background-color: rgba(255, 255, 255, 0.1);
      clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
      transition: opacity 0.3s ease;
    }
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
  `;
  document.head.appendChild(style);

  // 4. 创建网格
  createHexagonGrid();
});

// 监听窗口大小变化，以便重新生成网格
window.addEventListener('resize', onWindowResize);


// ==================== 六边形网格背景 ====================

/**
 * 创建整齐排列的六边形网格
 */
function createHexagonGrid() {
  const gridContainer = document.getElementById('hexagonGridContainer');
  if (!gridContainer) return;

  // 清空现有网格
  gridContainer.innerHTML = '';

  // 计算六边形的大小和间距
  const hexSize = 40; // 六边形的宽度的一半
  const hexHeight = hexSize * Math.sqrt(3); // 六边形的高度
  const hexGap = 5; // 六边形之间的间隙

  // 计算需要多少列和行来覆盖整个屏幕
  const cols = Math.ceil(window.innerWidth / (hexSize * 1.5)) + 2;
  const rows = Math.ceil(window.innerHeight / (hexHeight * 0.75)) + 2;

  // 生成六边形网格
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const hexagon = document.createElement('div');
      hexagon.classList.add('hexagon');
      
      // 计算位置，交错排列
      const x = col * hexSize * 1.5;
      const y = row * hexHeight * 0.75 + (col % 2 === 0 ? 0 : hexHeight * 0.5);
      hexagon.style.left = `${x}px`;
      hexagon.style.top = `${y}px`;

      // 随机透明度
      const opacity = 0.05 + Math.random() * 0.15;
      hexagon.style.opacity = opacity;

      // 随机颜色偏移，使网格更有层次感
      const hueOffset = Math.floor(Math.random() * 20) - 10;
      hexagon.style.filter = `hue-rotate(${hueOffset}deg)`;

      gridContainer.appendChild(hexagon);
    }
  }
}

/**
 * 窗口大小改变时重新生成网格
 */
function onWindowResize() {
  createHexagonGrid();
}

/**
 * 手动触发背景更新（此函数现在为空，仅为保持接口兼容）
 */
function triggerBackgroundUpdate() {
  // 由于背景是静态图片，此函数不再需要执行任何操作
  console.log('背景为静态图片，无需更新。');
}

// 导出全局函数供其他模块使用（如果需要）
window.triggerBackgroundUpdate = triggerBackgroundUpdate;