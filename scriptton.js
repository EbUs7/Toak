document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.querySelector('.start-screen');
    const page = document.querySelector('.page');
    const headerBurger = document.querySelector('.header__burger');
    const headerNav = document.querySelector('.header__nav');
    const bottomNavTabs = document.querySelectorAll('.bottom-nav li');
    const sectionContents = document.querySelectorAll('.section-content');

    // --- 1. Start Screen Logic ---
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
    bottomNavTabs.forEach(tab => {
        tab.addEventListener('click', () => {
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

    // --- 4. TON Connect Wallet (Rolls Section) ---
    const connectWalletBtnRolls = document.getElementById('connectWalletBtnRolls');
    const payForRollsBtn = document.getElementById('payForRollsBtn');
    const rollsInfoText = document.querySelector('.rolls-info-text');
    const codeEntrySection = document.querySelector('.code-entry-section');
    const confirmationCodeInput = document.getElementById('confirmationCodeInput');
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    const codeErrorMessage = document.getElementById('codeErrorMessage');
    const referralAfterCodeMessage = document.querySelector('.referral-after-code-message');
    const loadingAnimation = document.querySelector('.loading-animation');
    const checkmarkAnimation = document.querySelector('.checkmark-animation');
    const tonConnectUI = new TonConnectUI({
        manifestUrl: 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client-side-dapp/tonconnect-manifest.json',
        // This is a placeholder for the actual wallet connect logic.
        // In a real dapp, you would handle connection status and events here.
    });

    connectWalletBtnRolls.addEventListener('click', async () => {
        try {
            await tonConnectUI.openModal();
            // Simulate successful connection
            if (tonConnectUI.connected) {
                rollsInfoText.textContent = 'Wallet connected! Pay 2 TON to spin the wheel.';
                connectWalletBtnRolls.classList.add('hide');
                payForRollsBtn.classList.remove('hide');
            }
        } catch (e) {
            console.error('Wallet connection failed:', e);
            rollsInfoText.textContent = 'Wallet connection failed. Please try again.';
        }
    });

    // Simulate payment and spin
    payForRollsBtn.addEventListener('click', () => {
        // Simulate transaction loading
        loadingAnimation.classList.remove('hide');
        payForRollsBtn.classList.add('hide');
        rollsInfoText.classList.add('hide');

        setTimeout(() => {
            loadingAnimation.classList.add('hide');
            checkmarkAnimation.classList.remove('hide');
            rollsInfoText.classList.remove('hide'); // Show text again
            rollsInfoText.textContent = 'Payment successful! Enter your code to claim your prize.';
            codeEntrySection.classList.remove('hide');
            checkmarkAnimation.addEventListener('loopComplete', () => {
                checkmarkAnimation.classList.add('hide');
            }, { once: true }); // Hide checkmark after one loop
        }, 2000); // Simulate 2 seconds loading
    });

    // Simulate code verification
    verifyCodeBtn.addEventListener('click', () => {
        const enteredCode = confirmationCodeInput.value.trim();
        codeErrorMessage.classList.add('hide'); // Hide previous errors

        if (enteredCode === '909986') { // Example correct code
            codeEntrySection.classList.add('hide');
            referralAfterCodeMessage.classList.remove('hide');
            rollsInfoText.classList.add('hide'); // Hide previous info text
            // Optional: Disable further interaction or redirect
        } else {
            codeErrorMessage.classList.remove('hide');
            confirmationCodeInput.classList.add('error'); // Add error styling
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

    const STAKING_RATE = 0.10; // 10% profit
    const FEE_RATE = 0.01; // 1% fee on profit

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

        const estimatedProfit = amount * STAKING_RATE;
        const stakingFee = estimatedProfit * FEE_RATE;
        const totalReturn = amount + estimatedProfit - stakingFee;

        estimatedProfitSpan.textContent = `${estimatedProfit.toFixed(2)} TON`;
        stakingFeeSpan.textContent = `${stakingFee.toFixed(2)} TON`;
        totalReturnSpan.textContent = `${totalReturn.toFixed(2)} TON`;
    };

    stakingAmountInput.addEventListener('input', updateStakingSummary);
    updateStakingSummary(); // Initial calculation

    stakeTonBtn.addEventListener('click', () => {
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
        if (learnMoreContent.classList.contains('hide')) {
            learnMoreLink.textContent = 'Learn More About Staking';
        } else {
            learnMoreLink.textContent = 'Show Less';
        }
    });

    // --- 6. Earn Section Logic ---
    const referralLinkInput = document.getElementById('referralLink');
    const copyReferralBtn = document.querySelector('.copy-referral-btn');

    copyReferralBtn.addEventListener('click', () => {
        referralLinkInput.select();
        referralLinkInput.setSelectionRange(0, 99999); // For mobile devices
        document.execCommand('copy');
        copyReferralBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyReferralBtn.innerHTML = '<i class="far fa-copy"></i> Copy'; // Reset button text
        }, 2000);
    });

    // Placeholder for dynamic user name in Earn section
    const earnUserName = document.querySelector('.earn-user-name');
    // In a real DApp, you'd fetch this from the connected wallet or Telegram API
    // For now, it's a static placeholder.
    // Example: earnUserName.textContent = `@${userTelegramUsername}`;

    // --- 7. Team Section Photo Interaction ---
    const teamPhotos = document.querySelectorAll('.team-photo');

    teamPhotos.forEach(photo => {
        photo.addEventListener('click', () => {
            // Remove elevated class from all photos first
            teamPhotos.forEach(p => {
                p.classList.remove('elevated');
                p.classList.add('blurred'); // Ensure others are blurred
            });
            // Add elevated class to the clicked photo
            photo.classList.remove('blurred');
            photo.classList.add('elevated');
        });
    });

    // --- 8. Global Countdown Timer ---
    const countdownElement = document.getElementById('countdown');
    const endDate = new Date('July 30, 2025 12:00:00 UTC').getTime(); // Set your target date and time

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = endDate - now;

        if (distance < 0) {
            countdownElement.innerHTML = "EXPIRED";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call to display immediately
});
