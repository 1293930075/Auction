/*
 * @Author: liuJ
 * @Date: 2025-04-02 21:17:21
 * @LastEditors: liuJ
 * @LastEditTime: 2025-04-02 22:16:30
 * @Describe: file describe
*/
// 粒子系统
function initParticles() {
    const canvas = document.querySelector('.particle-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speed = Math.random() * 0.5 + 0.5;
            this.alpha = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.y -= this.speed;
            if (this.y < 0) this.reset();
        }
        draw() {
            ctx.fillStyle = `hsla(40, 100%, 50%, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const particles = Array.from({ length: 100 }, () => new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// 倒计时更新
function startTimer(duration) {
    let timer = duration * 60;
    const timerEl = document.querySelector('.timer');
    const interval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerEl.textContent = `剩余时间: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        if (--timer < 0) clearInterval(interval);
    }, 1000);
};

//初始化
window.addEventListener('load', () => {
    initParticles();
    startTimer(3);

    // 初始化竞拍数据
    const initialPrice = 1888888;
    let currentPrice = initialPrice;
    const priceDisplay = document.querySelector('.price-digits');
    const bidButton = document.querySelector('.bid-button');
    const bidListContent = document.querySelector('.bid-list-content');
    const bidCountElement = document.getElementById('bidCount');
    let bidCount = parseInt(bidCountElement.textContent);

    // 保存所有竞拍记录的数组
    const allBids = [];

    // 弹窗相关元素
    const bidModal = document.getElementById('bidModal');
    const bidModalBody = document.querySelector('.bid-modal-body');
    const viewAllBtn = document.querySelector('.view-all-bids');
    const closeModalBtn = document.querySelector('.close-modal');

    // 生成随机用户ID
    function generateUserId() {
        return 'user' + Math.floor(Math.random() * 900 + 100);
    }

    // 格式化价格显示
    function formatPrice(price) {
        return '¥' + price.toLocaleString('zh-CN');
    }

    // 更新价格显示
    function updatePriceDisplay(price, animate = true) {
        if (animate) {
            priceDisplay.classList.add('price-change');
            setTimeout(() => priceDisplay.classList.remove('price-change'), 600);
        }
        priceDisplay.textContent = formatPrice(price);
    }

    // 更新显示的前三条记录
    function updateVisibleBids() {
        // 清空当前显示
        bidListContent.innerHTML = '';

        // 显示最新的三条记录
        const visibleBids = allBids.slice(0, 3);
        visibleBids.forEach((bid, index) => {
            const bidItem = document.createElement('div');
            bidItem.className = 'bid-item' + (index === 0 ? ' new-bid' : '');
            bidItem.innerHTML = `
        <span>用户***${bid.userId.slice(-3)}</span>
        <span class="bid-amount">${formatPrice(bid.amount)}</span>
      `;
            bidListContent.appendChild(bidItem);

            // 添加动画效果
            setTimeout(() => bidItem.classList.add('show'), 10 * (index + 1));
        });
    }

    // 添加出价记录
    function addBidRecord(userId, price) {
        // 添加到记录数组
        const newBid = {
            userId: userId,
            amount: price,
            time: new Date().toLocaleTimeString()
        };
        allBids.unshift(newBid);

        // 更新显示的记录
        updateVisibleBids();

        // 更新弹窗内容
        updateModalContent();
    }

    // 更新弹窗内容
    // 更新弹窗内容
    function updateModalContent() {
        bidModalBody.innerHTML = '';

        // 如果没有记录，显示提示信息
        if (allBids.length === 0) {
            bidModalBody.innerHTML = '<p class="no-bids">暂无出价记录</p>';
            return;
        }

        // 添加所有记录
        allBids.forEach(bid => {
            const bidItem = document.createElement('div');
            bidItem.className = 'bid-item show'; // 添加show类，确保立即可见
            bidItem.innerHTML = `
      <div class="bid-detail">
        <span class="bid-user">用户***${bid.userId.slice(-3)}</span>
        <span class="bid-time">${bid.time}</span>
      </div>
      <span class="bid-amount">${formatPrice(bid.amount)}</span>
    `;
            bidModalBody.appendChild(bidItem);
        });
    }

    // 处理出价事件
    function placeBid() {
        // 随机增加价格(在1000-10000之间)
        const increase = Math.floor(Math.random() * 9000 + 1000);
        const newPrice = currentPrice + increase;
        currentPrice = newPrice;

        // 更新价格显示
        updatePriceDisplay(newPrice);

        // 生成随机用户ID并添加出价记录
        const userId = generateUserId();
        addBidRecord(userId, newPrice);

        // 更新出价人数
        bidCount++;
        bidCountElement.textContent = bidCount;

        // 按钮动画和振动反馈
        bidButton.style.animation = 'none';
        void bidButton.offsetWidth;
        bidButton.style.animation = 'buttonPulse 0.6s ease';
        if ('vibrate' in navigator) navigator.vibrate(50);

        // 创建价格变化时的粒子爆炸效果
        createPriceChangeEffect();
    }

    // 粒子爆炸效果
    // 优化粒子爆炸效果
    function createPriceChangeEffect() {
        const priceRect = priceDisplay.getBoundingClientRect();
        const centerX = priceRect.left + priceRect.width / 2;
        const centerY = priceRect.top + priceRect.height / 2;

        // 增加粒子数量和样式变化
        const particleCount = 35; // 增加粒子数

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'price-particle';
            document.body.appendChild(particle);

            // 更多变化的粒子大小
            const size = Math.random() * 15 + 3;
            // 使用完整的圆形分布而不是随机角度
            const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.3;
            // 变化的速度
            const speed = 50 + Math.random() * 150;

            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';

            // 随机颜色 - 扩展色彩范围
            const colorType = Math.random();
            let hue;
            if (colorType < 0.6) { // 黄金色为主
                hue = 40 + Math.random() * 20;
            } else if (colorType < 0.9) { // 橙色次之
                hue = 20 + Math.random() * 15;
            } else { // 少量偏红色
                hue = 15 + Math.random() * 10;
            }

            const lightness = 50 + Math.random() * 20;
            particle.style.backgroundColor = `hsl(${hue}, 100%, ${lightness}%)`;
            particle.style.boxShadow = `0 0 ${Math.random() * 8 + 4}px hsl(${hue}, 100%, ${lightness}%)`;

            // 为粒子设置不同的初始状态，创造更自然的开始效果
            particle.style.opacity = '0.2';
            particle.style.transform = `scale(0.5)`;

            // 使用RAF和定时错开粒子出现，更平滑
            const delay = Math.random() * 50;
            setTimeout(() => {
                requestAnimationFrame(() => {
                    // 设置初始变换
                    particle.style.opacity = '1';
                    particle.style.transform = `scale(1)`;

                    // 然后设置最终变换 - 短延迟确保初始变换应用
                    setTimeout(() => {
                        particle.style.transform = `translate(${Math.cos(angle) * speed}px, ${Math.sin(angle) * speed}px) scale(0.2)`;
                        particle.style.opacity = '0';
                    }, 20);
                });
            }, delay);

            // 移除粒子
            setTimeout(() => {
                document.body.removeChild(particle);
            }, 1500); // 延长持续时间
        }
    }

    // 初始化显示
    updatePriceDisplay(currentPrice, false);

    // 绑定出价按钮点击事件
    bidButton.addEventListener('click', placeBid);

    // 模拟其他用户的自动出价
    function simulateOtherBids() {
        // 50%概率自动出价
        if (Math.random() > 0.5) {
            const increase = Math.floor(Math.random() * 5000 + 500);
            const newPrice = currentPrice + increase;
            currentPrice = newPrice;

            // 更新价格显示
            updatePriceDisplay(newPrice);

            // 生成随机用户ID并添加出价记录
            const userId = generateUserId();
            addBidRecord(userId, newPrice);

            // 更新出价人数
            bidCount++;
            bidCountElement.textContent = bidCount;

            // 创建价格变化效果
            createPriceChangeEffect();
        }

        // 随机间隔后继续模拟
        const nextInterval = Math.random() * 8000 + 3000; // 3-11秒
        setTimeout(simulateOtherBids, nextInterval);
    }

    // 弹窗控制
    viewAllBtn.addEventListener('click', () => {
        bidModal.classList.add('modal-show', 'modal-fade-in');
        document.body.style.overflow = 'hidden';
    });

    closeModalBtn.addEventListener('click', () => {
        bidModal.classList.add('modal-fade-out');
        document.body.style.overflow = '';
        setTimeout(() => {
            bidModal.classList.remove('modal-show', 'modal-fade-in', 'modal-fade-out');
        }, 300);
    });

    // 点击弹窗外部关闭弹窗
    bidModal.addEventListener('click', (e) => {
        if (e.target === bidModal) {
            bidModal.classList.add('modal-fade-out');
            setTimeout(() => {
                bidModal.classList.remove('modal-show', 'modal-fade-in', 'modal-fade-out');
            }, 300);
        }
    });
    
    // 禁用页面双击缩放
    document.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });

    var lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        var now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);


    // 添加初始示例数据
    addBidRecord('user007', 1888888);
    addBidRecord('user886', 1880000);

    // 开始模拟其他用户出价
    setTimeout(simulateOtherBids, 50000);
});
