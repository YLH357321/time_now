/**
 * 倒计时计算模块
 * 提供 updateAllCountdowns() 函数，更新页面上所有倒计时显示
 */

// 目标日期数组 [月, 日] (年份固定为2026)
const countdownTargets = [
    { id: 'countdown-days-competition', targetDate: new Date(2026, 5, 18) },  
    { id: 'countdown-days-physics', targetDate: new Date(2026, 5, 18) },       
    { id: 'countdown-days-extra1', targetDate: new Date(2026, 5, 18) },       
    { id: 'countdown-days-extra2', targetDate: new Date(2026, 5, 18) }        // 7月14日
];

/**
 * 更新所有倒计时显示
 */
function updateAllCountdowns() {
    const now = new Date();
    for (const item of countdownTargets) {
        const diff = Math.ceil((item.targetDate - now) / 86400000);
        const element = document.getElementById(item.id);
        if (element) {
            element.innerText = diff > 0 ? diff : 0;
        }
    }
}