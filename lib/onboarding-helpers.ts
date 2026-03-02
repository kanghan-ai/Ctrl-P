// 辅助函数：重启引导
export const restartOnboarding = () => {
    // 清除提示栏关闭标记
    localStorage.removeItem('hint_bar_dismissed');
    // 发送自定义事件,通知HintBar重新显示
    window.dispatchEvent(new CustomEvent('restart-onboarding'));
};

// 辅助函数：加载示例数据
export const loadSampleData = async () => {
    try {
        const response = await fetch('/data/cards.json');
        const data = await response.json();
        return data.cards || [];
    } catch (error) {
        console.error('Failed to load sample cards:', error);
        return [];
    }
};

// 辅助函数：检查是否为首次用户
export const isFirstTimeUser = () => {
    return !localStorage.getItem('has_visited');
};
