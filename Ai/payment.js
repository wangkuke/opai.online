// 收款功能配置 - 使用配置文件
const PAYMENT_CONFIG = window.CONFIG || {
    // 收款API配置
    API_BASE_URL: 'https://api.nowpayments.io', // NOWPayments API地址
    API_KEY: 'R0S2ZTC-G4R4VMT-HQYKQEA-CDKJPNF', // NOWPayments API密钥
    
    // 支付方式配置
    PAYMENT_METHODS: {
        NOWPAYMENTS: 'nowpayments',
        ALIPAY: 'alipay',
        WECHAT: 'wechat',
        BANK_CARD: 'bank_card',
        CASH: 'cash'
    },
    
    // 课程价格配置
    COURSE_PRICES: {
        BASIC: 39.9,      // 基础课程
        VIP: 399         // VIP课程
    }
};

// 收款类
class PaymentManager {
    constructor() {
        this.currentOrder = null;
        this.config = window.CONFIG || PAYMENT_CONFIG;
        this.paymentPolling = null;
        this.init();
    }

    // 初始化
    init() {
        this.bindEvents();
        this.loadPaymentHistory();
    }

    // 绑定事件
    bindEvents() {
        // 购买按钮事件
        document.addEventListener('click', (e) => {
            if (e.target.matches('.buy-course-btn')) {
                const courseType = e.target.dataset.course;
                this.showPaymentModal(courseType);
            }
            
            if (e.target.matches('.payment-method-btn')) {
                const method = e.target.dataset.method;
                this.selectPaymentMethod(method);
            }
            
            if (e.target.matches('.confirm-payment-btn')) {
                this.processPayment();
            }
            
            if (e.target.matches('.close-modal')) {
                this.closePaymentModal();
            }
            
            if (e.target.matches('.crypto-option-btn')) {
                const crypto = e.target.dataset.crypto;
                this.selectCryptocurrency(crypto);
            }
        });
    }

    // 显示支付模态框
    showPaymentModal(courseType) {
        const courseConfig = this.config.COURSES[courseType.toUpperCase()];
        if (!courseConfig) {
            this.showMessage('课程信息不存在', 'error');
            return;
        }
        
        // 如果是基础课程或VIP课程，直接显示NOWPayments iframe
        if (courseType === 'basic' || courseType === 'vip') {
            this.showNOWPaymentsIframe(courseConfig, courseType);
            return;
        }
        
        const modalHTML = `
            <div id="paymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">购买课程</h3>
                        <button class="close-modal text-gray-500 hover:text-gray-700">
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="mb-4">
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-bold text-lg">${courseConfig.name}</h4>
                            <p class="text-gray-600 text-sm">${courseConfig.description}</p>
                            <div class="mt-2 flex items-center gap-2">
                                <span class="text-2xl font-bold text-primary">$${courseConfig.price}</span>
                                <span class="text-sm text-gray-500 line-through">$${courseConfig.originalPrice}</span>
                                <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">限时优惠</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <h5 class="font-bold mb-2">选择支付方式</h5>
                        <div class="grid grid-cols-1 gap-2">
                            ${this.generatePaymentMethodButtons()}
                        </div>
                    </div>
                    
                    <div id="cryptoOptions" class="mb-4 hidden">
                        <h5 class="font-bold mb-2">选择加密货币</h5>
                        <div class="grid grid-cols-2 gap-2">
                            ${this.generateCryptocurrencyOptions()}
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2">联系方式</label>
                        <input type="text" id="contactInfo" placeholder="请输入手机号或邮箱" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2">备注信息（可选）</label>
                        <textarea id="orderNote" placeholder="请输入备注信息" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" rows="2"></textarea>
                    </div>
                    
                    <div class="flex gap-2">
                        <button class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors close-modal">
                            取消
                        </button>
                        <button class="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors confirm-payment-btn">
                            确认支付
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 存储当前订单信息
        this.currentOrder = {
            courseType,
            courseConfig,
            paymentMethod: null,
            selectedCrypto: this.config.PAYMENT.NOWPAYMENTS.DEFAULT_CRYPTO,
            contactInfo: '',
            orderNote: ''
        };
    }

    // 显示NOWPayments iframe
    showNOWPaymentsIframe(courseConfig, courseType) {
        // 根据课程类型选择不同的iid
        const iid = courseType === 'basic' ? '5521110465' : '4388908173';
        
        // 根据课程类型调整iframe高度
        const iframeHeight = courseType === 'basic' ? 600 : 600;
        
        const modalHTML = `
            <div id="paymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">购买 ${courseConfig.name}</h3>
                        <button class="close-modal text-gray-500 hover:text-gray-700">
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="mb-4">
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-bold text-lg">${courseConfig.name}</h4>
                            <p class="text-gray-600 text-sm">${courseConfig.description}</p>
                            <div class="mt-2 flex items-center gap-2">
                                <span class="text-2xl font-bold text-primary">$${courseConfig.price}</span>
                                <span class="text-sm text-gray-500 line-through">$${courseConfig.originalPrice}</span>
                                <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">限时优惠</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <p class="text-sm text-gray-600 mb-4">请使用以下支付界面完成付款</p>
                        <div class="flex justify-center">
                            <iframe 
                                src="https://nowpayments.io/embeds/payment-widget?iid=${iid}" 
                                width="410" 
                                height="${iframeHeight}" 
                                frameborder="0" 
                                scrolling="yes" 
                                style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                                Can't load widget
                            </iframe>
                        </div>
                    </div>
                    
                    <div class="mt-4 text-center">
                        <button class="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors close-modal">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 存储当前订单信息
        this.currentOrder = {
            courseType,
            courseConfig,
            paymentMethod: 'nowpayments',
            selectedCrypto: this.config.PAYMENT.NOWPAYMENTS.DEFAULT_CRYPTO,
            contactInfo: '',
            orderNote: ''
        };
    }

    // 生成支付方式按钮
    generatePaymentMethodButtons() {
        const methods = this.config.PAYMENT.METHODS;
        return Object.values(methods)
            .filter(method => method.enabled)
            .map(method => `
                <button class="payment-method-btn bg-gray-100 hover:bg-${method.color}-50 border-2 border-transparent hover:border-${method.color}-300 rounded-lg p-3 text-center transition-all" data-method="${method.id}">
                    <i class="fa ${method.icon} text-${method.color}-500 text-xl mb-1"></i>
                    <div class="text-sm font-medium">${method.name}</div>
                    ${method.description ? `<div class="text-xs text-gray-500 mt-1">${method.description}</div>` : ''}
                </button>
            `).join('');
    }

    // 生成加密货币选项
    generateCryptocurrencyOptions() {
        const cryptos = this.config.PAYMENT.NOWPAYMENTS.SUPPORTED_CRYPTOCURRENCIES;
        return cryptos.map(crypto => `
            <button class="crypto-option-btn bg-gray-100 hover:bg-orange-50 border-2 border-transparent hover:border-orange-300 rounded-lg p-3 text-center transition-all" data-crypto="${crypto}">
                <div class="text-sm font-medium uppercase">${crypto}</div>
                <div class="text-xs text-gray-500">${this.getCryptoName(crypto)}</div>
            </button>
        `).join('');
    }

    // 获取加密货币名称
    getCryptoName(symbol) {
        const names = {
            btc: 'Bitcoin',
            eth: 'Ethereum',
            usdt: 'Tether',
            usdc: 'USD Coin',
            bnb: 'BNB',
            ada: 'Cardano',
            sol: 'Solana',
            dot: 'Polkadot',
            doge: 'Dogecoin',
            matic: 'Polygon'
        };
        return names[symbol] || symbol.toUpperCase();
    }

    // 选择支付方式
    selectPaymentMethod(method) {
        // 移除所有选中状态
        document.querySelectorAll('.payment-method-btn').forEach(btn => {
            btn.classList.remove('border-primary', 'bg-primary/10');
            btn.classList.add('border-transparent', 'bg-gray-100');
        });
        
        // 添加选中状态
        const selectedBtn = document.querySelector(`[data-method="${method}"]`);
        if (selectedBtn) {
            selectedBtn.classList.remove('border-transparent', 'bg-gray-100');
            selectedBtn.classList.add('border-primary', 'bg-primary/10');
        }
        
        this.currentOrder.paymentMethod = method;
        
        // 如果是NOWPayments，显示加密货币选项
        const cryptoOptions = document.getElementById('cryptoOptions');
        if (method === 'nowpayments') {
            cryptoOptions.classList.remove('hidden');
        } else {
            cryptoOptions.classList.add('hidden');
        }
    }

    // 选择加密货币
    selectCryptocurrency(crypto) {
        // 移除所有选中状态
        document.querySelectorAll('.crypto-option-btn').forEach(btn => {
            btn.classList.remove('border-orange-500', 'bg-orange-100');
            btn.classList.add('border-transparent', 'bg-gray-100');
        });
        
        // 添加选中状态
        const selectedBtn = document.querySelector(`[data-crypto="${crypto}"]`);
        if (selectedBtn) {
            selectedBtn.classList.remove('border-transparent', 'bg-gray-100');
            selectedBtn.classList.add('border-orange-500', 'bg-orange-100');
        }
        
        this.currentOrder.selectedCrypto = crypto;
    }

    // 处理支付
    async processPayment() {
        if (!this.currentOrder.paymentMethod) {
            this.showMessage(this.config.MESSAGES.WARNING.SELECT_PAYMENT_METHOD, 'warning');
            return;
        }
        
        const contactInfo = document.getElementById('contactInfo').value.trim();
        if (!contactInfo) {
            this.showMessage(this.config.MESSAGES.WARNING.ENTER_CONTACT_INFO, 'warning');
            return;
        }
        
        const orderNote = document.getElementById('orderNote').value.trim();
        
        this.currentOrder.contactInfo = contactInfo;
        this.currentOrder.orderNote = orderNote;
        
        // 显示加载状态
        const confirmBtn = document.querySelector('.confirm-payment-btn');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 处理中...';
        confirmBtn.disabled = true;
        
        try {
            if (this.currentOrder.paymentMethod === 'nowpayments') {
                // 处理NOWPayments支付
                const result = await this.createNOWPaymentsOrder();
                if (result.success) {
                    this.showPaymentDetails(result.paymentData);
                } else {
                    this.showMessage(result.message || this.config.MESSAGES.ERROR.CRYPTO_PAYMENT_FAILED, 'error');
                }
            } else {
                // 处理其他支付方式
                const result = await this.createPaymentOrder();
                if (result.success) {
                    this.showMessage(this.config.MESSAGES.SUCCESS.PAYMENT_COMPLETED, 'success');
                    this.closePaymentModal();
                    this.savePaymentRecord(result.orderId);
                } else {
                    this.showMessage(result.message || this.config.MESSAGES.ERROR.PAYMENT_FAILED, 'error');
                }
            }
        } catch (error) {
            console.error('支付处理错误:', error);
            this.showMessage(this.config.MESSAGES.ERROR.API_ERROR, 'error');
        } finally {
            // 恢复按钮状态
            if (confirmBtn) {
                confirmBtn.innerHTML = originalText;
                confirmBtn.disabled = false;
            }
        }
    }

    // 创建NOWPayments订单
    async createNOWPaymentsOrder() {
        const orderData = {
            price_amount: this.currentOrder.courseConfig.price,
            price_currency: 'usd',
            pay_currency: this.currentOrder.selectedCrypto,
            order_id: this.generateOrderId(),
            order_description: `购买${this.currentOrder.courseConfig.name}`,
            ipn_callback_url: window.location.origin + '/api/payment-callback',
            case: 'success'
        };
        
        console.log('NOWPayments API请求数据:', orderData);
        
        try {
            const response = await fetch(`${this.config.API.BASE_URL}/v1/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.config.API.API_KEY
                },
                body: JSON.stringify(orderData)
            });
            
            console.log('NOWPayments API响应状态:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('NOWPayments API错误响应:', errorText);
                
                // 尝试解析错误响应
                let errorMessage = 'API调用失败';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${errorText}`;
                }
                
                return {
                    success: false,
                    message: errorMessage
                };
            }
            
            const result = await response.json();
            console.log('NOWPayments API成功响应:', result);
            
            if (result.payment_id) {
                return {
                    success: true,
                    paymentData: result,
                    message: this.config.MESSAGES.SUCCESS.CRYPTO_PAYMENT_INITIATED
                };
            } else {
                return {
                    success: false,
                    message: '支付订单创建失败，未返回payment_id'
                };
            }
        } catch (error) {
            console.error('NOWPayments API调用错误:', error);
            return {
                success: false,
                message: this.config.MESSAGES.ERROR.NETWORK_ERROR
            };
        }
    }

    // 显示支付详情
    showPaymentDetails(paymentData) {
        const modal = document.getElementById('paymentModal');
        if (!modal) return;
        
        const cryptoName = this.getCryptoName(this.currentOrder.selectedCrypto);
        const cryptoAmount = paymentData.pay_amount;
        const cryptoAddress = paymentData.pay_address;
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="text-center mb-6">
                    <div class="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                        <i class="fa fa-bitcoin text-orange-500 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">加密货币支付</h3>
                    <p class="text-gray-600">请使用以下信息完成支付</p>
                </div>
                
                <div class="space-y-4 mb-6">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm text-gray-600">支付金额</span>
                            <span class="font-bold">${cryptoAmount} ${this.currentOrder.selectedCrypto.toUpperCase()}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">加密货币</span>
                            <span class="font-medium">${cryptoName}</span>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">收款地址</label>
                        <div class="flex items-center gap-2">
                            <input type="text" value="${cryptoAddress}" readonly class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-mono" id="cryptoAddress">
                            <button onclick="copyToClipboard('${cryptoAddress}')" class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                <i class="fa fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div class="flex items-start">
                            <i class="fa fa-exclamation-triangle text-yellow-600 mt-1 mr-2"></i>
                            <div class="text-sm text-yellow-800">
                                <p class="font-medium mb-1">重要提醒：</p>
                                <ul class="space-y-1 text-xs">
                                    <li>• 请确保发送到正确的地址</li>
                                    <li>• 支付确认可能需要几分钟时间</li>
                                    <li>• 请勿发送其他加密货币</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors close-modal">
                        关闭
                    </button>
                    <button class="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors" onclick="window.paymentManager.checkPaymentStatus('${paymentData.payment_id}')">
                        检查支付状态
                    </button>
                </div>
            </div>
        `;
        
        // 开始轮询支付状态
        this.startPaymentPolling(paymentData.payment_id);
    }

    // 显示支付成功页面
    showPaymentSuccess() {
        const modal = document.getElementById('paymentModal');
        if (!modal) return;
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="text-center mb-6">
                    <div class="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <i class="fa fa-check-circle text-green-500 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-green-600">支付成功！</h3>
                    <p class="text-gray-600">恭喜您成功购买课程，现在可以开始学习了</p>
                </div>
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start">
                        <i class="fa fa-info-circle text-green-600 mt-1 mr-2"></i>
                        <div class="text-sm text-green-800">
                            <p class="font-medium mb-1">课程信息：</p>
                            <p>${this.currentOrder.courseConfig.name}</p>
                            <p class="text-xs mt-1">我们会尽快通过您提供的联系方式与您联系，安排课程学习事宜。</p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <a href="https://eipiemovis.feishu.cn/wiki/QgaTwixjEin3FykdIDgcStH9nnP?from=from_copylink" 
                       target="_blank" 
                       class="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors font-bold flex items-center justify-center">
                        <i class="fa fa-graduation-cap mr-2"></i>
                        立即去学习
                    </a>
                    <button class="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors close-modal">
                        关闭
                    </button>
                </div>
            </div>
        `;
        
        // 保存支付记录
        this.savePaymentRecord(this.generateOrderId());
    }

    // 开始轮询支付状态
    startPaymentPolling(paymentId) {
        let pollCount = 0;
        const maxPolls = this.config.PAYMENT.NOWPAYMENTS.MAX_POLL_COUNT;
        const interval = this.config.PAYMENT.NOWPAYMENTS.POLL_INTERVAL;
        
        this.paymentPolling = setInterval(async () => {
            pollCount++;
            
            try {
                const status = await this.getPaymentStatus(paymentId);
                
                if (status === 'confirmed' || status === 'finished') {
                    clearInterval(this.paymentPolling);
                    this.showPaymentSuccess();
                } else if (status === 'failed' || status === 'expired') {
                    clearInterval(this.paymentPolling);
                    this.showMessage(this.config.MESSAGES.ERROR.CRYPTO_PAYMENT_FAILED, 'error');
                } else if (pollCount >= maxPolls) {
                    clearInterval(this.paymentPolling);
                    this.showMessage(this.config.MESSAGES.ERROR.PAYMENT_TIMEOUT, 'error');
                }
            } catch (error) {
                console.error('支付状态检查错误:', error);
                if (pollCount >= maxPolls) {
                    clearInterval(this.paymentPolling);
                    this.showMessage(this.config.MESSAGES.ERROR.PAYMENT_TIMEOUT, 'error');
                }
            }
        }, interval);
    }

    // 检查支付状态
    async checkPaymentStatus(paymentId) {
        try {
            const status = await this.getPaymentStatus(paymentId);
            this.showMessage(`支付状态: ${this.getStatusText(status)}`, 'info');
        } catch (error) {
            this.showMessage(this.config.MESSAGES.ERROR.API_ERROR, 'error');
        }
    }

    // 获取支付状态
    async getPaymentStatus(paymentId) {
        try {
            const response = await fetch(`${this.config.API.BASE_URL}/v1/payment/${paymentId}`, {
                method: 'GET',
                headers: {
                    'x-api-key': this.config.API.API_KEY
                }
            });
            
            const result = await response.json();
            return result.payment_status;
        } catch (error) {
            console.error('获取支付状态错误:', error);
            throw error;
        }
    }

    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            'waiting': '等待支付',
            'confirming': '确认中',
            'confirmed': '已确认',
            'sending': '发送中',
            'partially_paid': '部分支付',
            'finished': '已完成',
            'failed': '失败',
            'expired': '已过期'
        };
        return statusMap[status] || status;
    }

    // 创建支付订单（传统方式）
    async createPaymentOrder() {
        const orderData = {
            amount: this.currentOrder.courseConfig.price,
            currency: this.config.PAYMENT.CURRENCY.DEFAULT,
            payment_method: this.currentOrder.paymentMethod,
            course_type: this.currentOrder.courseType,
            course_name: this.currentOrder.courseConfig.name,
            contact_info: this.currentOrder.contactInfo,
            order_note: this.currentOrder.orderNote,
            description: `购买${this.currentOrder.courseConfig.name}`,
            timestamp: new Date().toISOString(),
            order_id: this.generateOrderId()
        };
        
        try {
            const response = await fetch(`${this.config.API.BASE_URL}/api/payments/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.API.API_KEY}`,
                    'X-API-Version': this.config.API.VERSION
                },
                body: JSON.stringify(orderData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                return {
                    success: true,
                    orderId: result.order_id || orderData.order_id,
                    message: this.config.MESSAGES.SUCCESS.ORDER_CREATED
                };
            } else {
                return {
                    success: false,
                    message: result.message || this.config.MESSAGES.ERROR.ORDER_CREATE_FAILED
                };
            }
        } catch (error) {
            console.error('API调用错误:', error);
            return {
                success: false,
                message: this.config.MESSAGES.ERROR.NETWORK_ERROR
            };
        }
    }

    // 生成订单号
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${this.config.PAYMENT.ORDER.PREFIX}${timestamp}${random}`;
    }

    // 保存支付记录
    savePaymentRecord(orderId) {
        const paymentRecord = {
            orderId,
            courseType: this.currentOrder.courseType,
            courseName: this.currentOrder.courseConfig.name,
            price: this.currentOrder.courseConfig.price,
            originalPrice: this.currentOrder.courseConfig.originalPrice,
            paymentMethod: this.currentOrder.paymentMethod,
            selectedCrypto: this.currentOrder.selectedCrypto,
            contactInfo: this.currentOrder.contactInfo,
            orderNote: this.currentOrder.orderNote,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };
        
        // 保存到本地存储
        const paymentHistory = JSON.parse(localStorage.getItem(this.config.STORAGE.PAYMENT_HISTORY_KEY) || '[]');
        paymentHistory.push(paymentRecord);
        localStorage.setItem(this.config.STORAGE.PAYMENT_HISTORY_KEY, JSON.stringify(paymentHistory));
        
        // 更新支付历史显示
        this.updatePaymentHistory();
    }

    // 加载支付历史
    loadPaymentHistory() {
        this.updatePaymentHistory();
    }

    // 更新支付历史显示
    updatePaymentHistory() {
        const paymentHistory = JSON.parse(localStorage.getItem(this.config.STORAGE.PAYMENT_HISTORY_KEY) || '[]');
        const historyContainer = document.getElementById('paymentHistory');
        
        if (!historyContainer) return;
        
        if (paymentHistory.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500 text-center py-4">暂无支付记录</p>';
            return;
        }
        
        const historyHTML = paymentHistory.map(record => `
            <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-bold">${record.courseName}</h4>
                    <div class="text-right">
                        <span class="text-primary font-bold">$${record.price}</span>
                        <div class="text-xs text-gray-500 line-through">$${record.originalPrice}</div>
                    </div>
                </div>
                <div class="text-sm text-gray-600 mb-2">
                    <span class="mr-4">订单号: ${record.orderId}</span>
                    <span>支付方式: ${this.getPaymentMethodName(record.paymentMethod)}</span>
                    ${record.selectedCrypto ? `<span class="ml-4">加密货币: ${record.selectedCrypto.toUpperCase()}</span>` : ''}
                </div>
                ${record.orderNote ? `<div class="text-sm text-gray-600 mb-2">备注: ${record.orderNote}</div>` : ''}
                <div class="text-xs text-gray-500">
                    ${new Date(record.timestamp).toLocaleString('zh-CN')}
                </div>
            </div>
        `).join('');
        
        historyContainer.innerHTML = historyHTML;
    }

    // 获取支付方式名称
    getPaymentMethodName(method) {
        const methods = this.config.PAYMENT.METHODS;
        const methodConfig = Object.values(methods).find(m => m.id === method);
        return methodConfig ? methodConfig.name : '未知方式';
    }

    // 显示消息
    showMessage(message, type = 'info') {
        const messageTypes = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        const messageHTML = `
            <div id="message" class="fixed top-4 right-4 ${messageTypes[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300">
                ${message}
            </div>
        `;
        
        // 移除现有消息
        const existingMessage = document.getElementById('message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', messageHTML);
        
        // 显示消息
        setTimeout(() => {
            const messageEl = document.getElementById('message');
            if (messageEl) {
                messageEl.classList.remove('translate-x-full');
            }
        }, 100);
        
        // 自动隐藏消息
        setTimeout(() => {
            const messageEl = document.getElementById('message');
            if (messageEl) {
                messageEl.classList.add('translate-x-full');
                setTimeout(() => messageEl.remove(), 300);
            }
        }, this.config.UI.MESSAGE.DISPLAY_TIME);
    }

    // 关闭支付模态框
    closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.remove();
        }
        this.currentOrder = null;
        
        // 停止轮询
        if (this.paymentPolling) {
            clearInterval(this.paymentPolling);
            this.paymentPolling = null;
        }
    }
}

// 复制到剪贴板函数
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        if (window.paymentManager) {
            window.paymentManager.showMessage('地址已复制到剪贴板', 'success');
        }
    }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (window.paymentManager) {
            window.paymentManager.showMessage('地址已复制到剪贴板', 'success');
        }
    });
}

// 初始化支付管理器
document.addEventListener('DOMContentLoaded', function() {
    window.paymentManager = new PaymentManager();
}); 