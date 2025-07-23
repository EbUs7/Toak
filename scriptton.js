document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.querySelector('.start-screen');
    const page = document.querySelector('.page');
    const headerBurger = document.querySelector('.header__burger');
    const headerNav = document.querySelector('.header__nav');
    const bottomNavTabs = document.querySelectorAll('.bottom-nav li');
    const sectionContents = document.querySelectorAll('.section-content');

    // --- 1. Start Screen Logic ---
    startScreen.classList.add('active'); // Ensure active class is set for animation
    setTimeout(() => {
        startScreen.classList.add('fade-out');
        startScreen.addEventListener('animationend', () => {
            startScreen.classList.add('hide');
            page.classList.remove('hide');
        }, { once: true });
    }, 3000); // Show loading for 3 seconds

    // --- 2. Header Burger Menu Toggle ---
    headerBurger.addEventListener('click', () => {
        headerBurger.classList.toggle('active');
        headerNav.classList.toggle('active');
    });

    // --- 3. Bottom Navigation Tab Switching ---
    // Set initial active section to Rolls
    document.getElementById('content-rolls').classList.add('active-section');
    bottomNavTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Haptic Feedback for tab clicks
            if (navigator.vibrate) {
                navigator.vibrate(50); // Short subtle vibration
            }

            const targetSectionId = tab.dataset.section;

            // Remove active class from all tabs and sections
            bottomNavTabs.forEach(t => t.classList.remove('active'));
            sectionContents.forEach(s => {
                s.classList.remove('active-section');
                s.classList.add('hidden-section');
            });

            // Add active class to clicked tab
            tab.classList.add('active');

            // Show the target section
            const targetSection = document.getElementById(`content-${targetSectionId}`);
            if (targetSection) {
                targetSection.classList.remove('hidden-section');
                targetSection.classList.add('active-section');
            }
        });
    });

    // --- 4. TON Connect Wallet & Rolls Logic ---
    const rollsInfoText = document.querySelector('.rolls-info-text');
    const tonConnectDiv = document.getElementById('ton-connect'); // The div where TonConnectUI renders its button
    const codeEntrySection = document.querySelector('.code-entry-section');
    const confirmationCodeInput = document.getElementById('confirmationCodeInput');
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    const codeErrorMessage = document.getElementById('codeErrorMessage');
    const referralAfterCodeMessage = document.querySelector('.referral-after-code-message');
    const loadingAnimation = document.querySelector('.loading-animation');
    const checkmarkAnimation = document.querySelector('.checkmark-animation');
    const spinningWheel = document.querySelector('.spinning-wheel');

    // Initialize TON Connect UI with the specified buttonRootId
    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://tonairdrops.vercel.app/tonconnect-manifest.json',
        buttonRootId: 'ton-connect' // TonConnectUI will render its button here
    });

    // Listen for TonConnectUI status changes
    tonConnectUI.onStatusChange(wallet => {
        if (wallet) {
            // Wallet is connected
            rollsInfoText.textContent = `Wallet connected: ${wallet.account.address.substring(0, 6)}...${wallet.account.address.substring(wallet.account.address.length - 4)}. Press the button above to pay 2 TON and roll!`;
            // Simulate the transaction success flow after a short delay, as TonConnectUI's button will handle the actual transaction.
            // In a real DApp, this would be triggered by a successful transaction callback from TonConnectUI.
            setTimeout(simulateTonConnectTransactionSuccess, 1000); // Simulate after 1 second of connection
        } else {
            // Wallet is disconnected
            rollsInfoText.textContent = 'Connect your TON wallet to participate.';
            // Hide related sections if wallet disconnects
            codeEntrySection.classList.add('hide');
            referralAfterCodeMessage.classList.add('hide');
        }
    });

    const simulateTonConnectTransactionSuccess = () => {
        loadingAnimation.classList.remove('hide');
        rollsInfoText.classList.add('hide');
        
        // Spin the wheel
        spinningWheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        spinningWheel.style.transform = `rotate(${Math.random() * 360 + 1080}deg)`; // Spin 3+ times

        setTimeout(() => {
            loadingAnimation.classList.add('hide');
            checkmarkAnimation.classList.remove('hide');
            rollsInfoText.classList.remove('hide');
            rollsInfoText.textContent = 'Payment successful! Enter your code to claim your prize.';
            codeEntrySection.classList.remove('hide');
            checkmarkAnimation.addEventListener('loopComplete', () => {
                checkmarkAnimation.classList.add('hide');
            }, { once: true });
            
            // Trigger vibration
            if (navigator.vibrate) {
                navigator.vibrate(100); // Medium vibration for successful payment/spin
            }
        }, 4000); // Simulate 4 seconds for spin + loading
    };
    
    // Simulate code verification
    verifyCodeBtn.addEventListener('click', () => {
        const enteredCode = confirmationCodeInput.value.trim();
        codeErrorMessage.classList.add('hide'); // Hide previous errors
        
        // Haptic Feedback for button click
        if (navigator.vibrate) {
            navigator.vibrate(50); // Short subtle vibration
        }

        if (enteredCode === '909986') { // Correct code
            codeEntrySection.classList.add('hide');
            referralAfterCodeMessage.classList.remove('hide');
            rollsInfoText.classList.add('hide'); // Hide previous info text
            // Optional: Disable further interaction or redirect
        } else {
            codeErrorMessage.classList.remove('hide');
            confirmationCodeInput.classList.add('error'); // Add error styling
            if (navigator.vibrate) { // Vibrate for error
                navigator.vibrate(150);
            }
            setTimeout(() => confirmationCodeInput.classList.remove('error'), 1500); // Remove error after a bit
        }
    });

    // --- 5. Staking Section Logic ---
    const stakingAmountInput = document.getElementById('stakingAmount');
    const estimatedProfitSpan = document.getElementById('estimatedProfit');
    const stakingFeeSpan = document.getElementById('stakingFee');
    const totalReturnSpan = document.getElementById('totalReturn');
    const stakeTonBtn = document.getElementById('stakeTonBtn');
    const learnMoreLink = document.querySelector('.learn-more-link');
    const learnMoreContent = document.querySelector('.learn-more-content');

    const STAKING_RATE_DAILY = 0.10 / 30; // 10% profit over 30 days, daily rate
    const FEE_RATE = 0.01; // 1% fee on total profit

    const updateStakingSummary = () => {
        const amount = parseFloat(stakingAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            estimatedProfitSpan.textContent = '0 TON';
            stakingFeeSpan.textContent = '0 TON';
            totalReturnSpan.textContent = '0 TON';
            stakeTonBtn.disabled = true;
            stakeTonBtn.style.opacity = '0.5';
            return;
        }
        stakeTonBtn.disabled = false;
        stakeTonBtn.style.opacity = '1';

        const estimatedTotalProfit = amount * STAKING_RATE_DAILY * 30; // Total profit for 30 days
        const stakingFee = estimatedTotalProfit * FEE_RATE;
        const totalReturn = amount + estimatedTotalProfit - stakingFee;

        estimatedProfitSpan.textContent = `${estimatedTotalProfit.toFixed(2)} TON`;
        stakingFeeSpan.textContent = `${stakingFee.toFixed(2)} TON`;
        totalReturnSpan.textContent = `${totalReturn.toFixed(2)} TON`;
    };

    stakingAmountInput.addEventListener('input', updateStakingSummary);
    updateStakingSummary(); // Initial calculation

    stakeTonBtn.addEventListener('click', () => {
        // Haptic Feedback for button click
        if (navigator.vibrate) {
            navigator.vibrate(50); // Short subtle vibration
        }

        const amount = parseFloat(stakingAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount to stake.');
            return;
        }
        // Simulate staking transaction (no actual blockchain interaction here)
        alert(`Simulating staking of ${amount} TON. This would initiate a transaction in a real DApp.`);
        // In a real DApp, you would use tonConnectUI.sendTransaction here
    });

    learnMoreLink.addEventListener('click', (e) => {
        e.preventDefault();
        learnMoreContent.classList.toggle('hide');
        learnMoreLink.textContent = learnMoreContent.classList.contains('hide') ? 'Learn More About Staking' : 'Show Less';
        // Haptic Feedback for toggle
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    });

    // --- 6. Earn Section Logic ---
    const referralLinkInput = document.getElementById('referralLink');
    const copyReferralBtn = document.querySelector('.copy-referral-btn');
    const claimRewardBtn = document.querySelector('.stat-value .claim-btn');

    copyReferralBtn.addEventListener('click', () => {
        referralLinkInput.select();
        referralLinkInput.setSelectionRange(0, 99999); // For mobile devices
        document.execCommand('copy');
        copyReferralBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyReferralBtn.innerHTML = '<i class="far fa-copy"></i> Copy'; // Reset button text
        }, 2000);
        // Haptic Feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    });

    if (claimRewardBtn) {
        claimRewardBtn.addEventListener('click', () => {
            alert('Claiming rewards simulated! In a real DApp, this would initiate a withdrawal transaction.');
            // Haptic Feedback
            if (navigator.vibrate) {
                navigator.vibrate(70);
            }
        });
    }

    // Placeholder for dynamic user name in Earn section
    const earnUserName = document.querySelector('.earn-user-name');
    // You would typically get the Telegram username from Telegram Mini App API or a backend.
    // For now, it remains a static placeholder.
    // Example: if (window.Telegram.WebApp) earnUserName.textContent = `@${window.Telegram.WebApp.initDataUnsafe.user.username || 'TelegramUser'}`;


    // --- 7. Team Section Photo Interaction ---
    const teamPhotos = document.querySelectorAll('.team-photo');

    teamPhotos.forEach(photo => {
        photo.addEventListener('click', () => {
            // Haptic Feedback
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }

            // Toggle elevated class for the clicked photo
            if (photo.classList.contains('elevated')) {
                photo.classList.remove('elevated');
                photo.classList.add('blurred');
            } else {
                // Remove elevated class from all other photos first
                teamPhotos.forEach(p => {
                    p.classList.remove('elevated');
                    p.classList.add('blurred');
                });
                photo.classList.remove('blurred');
                photo.classList.add('elevated');
            }
        });
    });

    // --- 8. Global Countdown Timer (Removed logic, now static) ---
    // The countdown element is now static in index.html, so no JavaScript is needed for it.
    // Removed: updateCountdown function and setInterval.
});
