/**
 * 主控模块
 * 整合所有子模块，更新时间、日期、倒计时，绑定事件
 */

// 时区音频 (可选)
let audio = null;
try { audio = new Audio('voice1.mp3'); } catch(e) {}

/**
 * 更新时间显示、公历日期、农历、星期、时区
 */
function updateTimeAndDate() {
    const now = new Date();
    
    // 更新时间
    const timeEl = document.getElementById('time');
    if (timeEl) {
        timeEl.innerText = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    }
    
    // 更新公历日期
    const dateEl = document.getElementById('date');
    if (dateEl) {
        dateEl.innerText = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;
    }
    
    // 更新农历 (调用 lunar.js 模块)
    const lunarEl = document.getElementById('lunar-date');
    if (lunarEl && typeof getLunarDate === 'function') {
        lunarEl.innerText = getLunarDate(now);
    }
    
    // 更新星期
    const weekdayEl = document.getElementById('weekday');
    if (weekdayEl) {
        const weekdays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
        weekdayEl.innerText = weekdays[now.getDay()];
    }
    
    // 更新时区
    const tzEl = document.getElementById('timezone');
    if (tzEl) {
        const tz = -now.getTimezoneOffset() / 60;
        tzEl.innerText = `端午快乐哈`;
    }
    
    // 更新倒计时 (调用 countdown.js 模块)
    if (typeof updateAllCountdowns === 'function') {
        updateAllCountdowns();
    }
}

// 设置定时器每秒更新时间
setInterval(updateTimeAndDate, 1000);
updateTimeAndDate();

// 天气刷新策略: 每整30分钟刷新
function scheduleWeatherRefresh() {
    const now = new Date();
    const next = new Date(now);
    next.setMinutes(now.getMinutes() >= 30 ? 60 : 30, 0, 0);
    const delay = next - now;
    setTimeout(() => {
        if (typeof fetchCurrentWeather === 'function') {
            fetchCurrentWeather().then(temp => {
                if (typeof updateBackgroundByTemperature === 'function') {
                    updateBackgroundByTemperature(temp);
                }
            });
        }
        scheduleWeatherRefresh();
    }, delay);
}

// 初始化天气
if (typeof fetchCurrentWeather === 'function') {
    fetchCurrentWeather().then(temp => {
        if (typeof updateBackgroundByTemperature === 'function') {
            updateBackgroundByTemperature(temp);
        }
    });
}
scheduleWeatherRefresh();

// 初始化泡泡背景
if (typeof initBubbles === 'function') {
    initBubbles();
}

// 初始化背景渐变 (默认)
setTimeout(function() {
    if (typeof applyGradientToMain === 'function' && typeof getDeepRandomGradient === 'function') {
        const defaultGrad = getDeepRandomGradient(22);
        applyGradientToMain(defaultGrad);
    }
}, 100);

// 预测弹窗事件绑定
const modal = document.getElementById('forecastModal');
const triggerBtn = document.getElementById('forecastTriggerBtn');
const closeModalBtn = document.getElementById('closeForecastModalBtn');

if (triggerBtn && modal && closeModalBtn) {
    triggerBtn.addEventListener('click', async () => {
        const contentContainer = document.getElementById('forecastDynamicContent');
        if (contentContainer && typeof renderForecastContent === 'function') {
            await renderForecastContent(contentContainer);
        }
        modal.classList.add('show');
    });
    
    closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });
}

// 时区点击播放音频
const tzBtn = document.getElementById('timezone');
if (tzBtn && audio) {
    tzBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.play().catch(() => {});
    });
}