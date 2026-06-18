/**
 * 天气数据模块
 * 提供天气获取、预测弹窗等功能
 */

// 天气代码映射
const weatherCodeMap = {
    0:'晴',1:'晴',2:'多云',3:'阴',45:'雾',48:'雾',
    51:'细雨',53:'细雨',55:'细雨',61:'小雨',63:'中雨',
    65:'大雨',71:'小雪',73:'中雪',75:'大雪',80:'阵雨',
    81:'强阵雨',95:'雷暴'
};

// 缓存当前温度 (供背景模块使用)
let currentTempCached = 22;

/**
 * 获取当前天气并更新UI
 * @returns {Promise<number>} 当前温度
 */
async function fetchCurrentWeather() {
    try {
        const lat = 30.66, lon = 104.08;
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=sunrise,sunset&timezone=Asia/Shanghai&forecast_days=1`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi&timezone=Asia/Shanghai`;
        
        const [weatherRes, aqiRes] = await Promise.all([fetch(weatherUrl), fetch(aqiUrl)]);
        if (!weatherRes.ok || !aqiRes.ok) throw new Error('天气接口失败');
        
        const weatherData = await weatherRes.json();
        const aqiData = await aqiRes.json();
        
        const temp = Math.round(weatherData.current.temperature_2m);
        currentTempCached = temp;
        
        // 更新UI
        const tempEl = document.getElementById('weather-temp');
        const humidityEl = document.getElementById('weather-humidity');
        const descEl = document.getElementById('weather-desc');
        const aqiEl = document.getElementById('weather-aqi');
        
        if (tempEl) tempEl.innerText = `温度: ${temp}°C`;
        if (humidityEl) humidityEl.innerHTML = `湿度: ${weatherData.current.relative_humidity_2m}%`;
        
        const wCode = weatherData.current.weather_code;
        if (descEl) descEl.innerHTML = `天气: ${weatherCodeMap[wCode] || '多云'}`;
        
        const aqiVal = Math.round(aqiData.current.european_aqi);
        const aqiLv = aqiVal <= 25 ? '优' : aqiVal <= 50 ? '良' : aqiVal <= 75 ? '轻度污染' : aqiVal <= 100 ? '中度污染' : '重度污染';
        if (aqiEl) aqiEl.innerHTML = `AQI: ${aqiVal} (${aqiLv})`;
        
        // 日出日落
        const todayStr = new Date().toISOString().split('T')[0];
        const idx = weatherData.daily.time.indexOf(todayStr);
        const sunrise = idx >= 0 ? weatherData.daily.sunrise[idx].split('T')[1].slice(0,5) : '--';
        const sunset = idx >= 0 ? weatherData.daily.sunset[idx].split('T')[1].slice(0,5) : '--';
        const sunEl = document.getElementById('weather-sun');
        if (sunEl) sunEl.innerHTML = `日出/日落: ${sunrise}/${sunset}`;
        
        return temp;
    } catch(e) {
        console.warn('天气获取失败:', e);
        return currentTempCached;
    }
}

/**
 * 获取当前温度缓存值
 */
function getCurrentTemperature() {
    return currentTempCached;
}

/**
 * 获取未来7天和24小时天气预报 (用于弹窗)
 * @returns {Promise<Object>} 天气预报数据
 */
async function fetchWeatherForecast() {
    const lat = 30.66, lon = 104.08;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&timezone=Asia/Shanghai&forecast_days=7`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('预测获取失败');
    return await res.json();
}

/**
 * 渲染天气预报弹窗内容
 * @param {HTMLElement} container - 内容容器
 */
async function renderForecastContent(container) {
    if (!container) return;
    container.innerHTML = '<div class="loading-forecast">🌤️ 获取未来7日及逐4小时预报...</div>';
    try {
        const data = await fetchWeatherForecast();
        const daily = data.daily;
        const hourly = data.hourly;
        const now = new Date();
        const currentHour = now.getHours();
        
        // 未来7天渲染
        let sevenHtml = `<div class="forecast-section"><h3>📅 未来七天天气概况</h3><div class="forecast-grid">`;
        for(let i = 1; i <= 7; i++) {
            if(i >= daily.time.length) break;
            const maxT = Math.round(daily.temperature_2m_max[i]);
            const minT = Math.round(daily.temperature_2m_min[i]);
            const desc = weatherCodeMap[daily.weather_code[i]] || '晴';
            const dateLabel = new Date(daily.time[i]).toLocaleDateString('zh-CN', {month:'numeric', day:'numeric'});
            sevenHtml += `<div class="forecast-card"><div class="forecast-day">${dateLabel}</div><div class="forecast-temp">${maxT}°/${minT}°</div><div class="forecast-desc">${desc}</div></div>`;
        }
        sevenHtml += `</div></div>`;
        
        // 24小时内每隔4小时
        let hourlyHtml = `<div class="forecast-section"><h3>⏱️ 未来24小时 (每4小时)</h3><div class="hourly-grid">`;
        const startHour = currentHour - (currentHour % 4);
        for(let offset = 0; offset <= 24; offset += 4) {
            const targetHour = (startHour + offset) % 24;
            let targetDate = new Date(now);
            targetDate.setHours(targetHour, 0, 0, 0);
            if(offset > 0 && targetHour < startHour) targetDate.setDate(targetDate.getDate() + 1);
            const timeStr = targetDate.getHours().toString().padStart(2,'0') + ':00';
            
            let tempVal = '--', weatherDesc = '--';
            for(let h = 0; h < hourly.time.length; h++) {
                const ht = new Date(hourly.time[h]);
                if(ht.toISOString().slice(0,13) === targetDate.toISOString().slice(0,13)) {
                    tempVal = Math.round(hourly.temperature_2m[h]);
                    weatherDesc = weatherCodeMap[hourly.weather_code[h]] || '多云';
                    break;
                }
            }
            hourlyHtml += `<div class="hour-item"><div class="hour-time">${timeStr}</div><div class="hour-temp">${tempVal}°C</div><div class="forecast-desc">${weatherDesc}</div></div>`;
        }
        hourlyHtml += `</div></div>`;
        
        container.innerHTML = sevenHtml + hourlyHtml;
    } catch(err) {
        console.error(err);
        container.innerHTML = '<div class="loading-forecast">⚠️ 预测服务暂不可用，请稍后再试</div>';
    }
}
// 在 weather.js 末尾添加
window.getCurrentTemperature = getCurrentTemperature;