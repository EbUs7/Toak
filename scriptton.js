document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.querySelector('.start-screen');
    const page = document.querySelector('.page');
    const headerBurger = document.querySelector('.header__burger');
    const headerNav = document.querySelector('.header__nav');
    const bottomNavTabs = document.querySelectorAll('.bottom-nav li');
    const sectionContents = document.querySelectorAll('.section-content');

    // --- 1. Start Screen Logic ---
    // Ensure start screen is visible initially for animation
    startScreen.classList.add('active');
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
    const spinningWheel = document.querySelector('.spinning-wheel');
    const tonConnectUI = new TonConnectUI({
        manifestUrl: 'https://tonairdrops.vercel.app/tonconnect-manifest.json', // Corrected manifest URL
    });

    // Handle TonConnectUI connection status
    tonConnectUI.onStatusChange(wallet => {
        if (wallet) {
            rollsInfoText.textContent = 'Wallet connected! Pay 2 TON to spin the wheel.';
            connectWalletBtnRolls.classList.add('hide');
            payForRollsBtn.classList.remove('hide');
            // You can get wallet address here: wallet.account.address
            // console.log('Connected wallet address:', wallet.account.address);
        } else {
            rollsInfoText.textContent = 'Connect your TON wallet to participate.';
            connectWalletBtnRolls.classList.remove('hide');
            payForRollsBtn.classList.add('hide');
            codeEntrySection.classList.add('hide'); // Hide code entry if disconnected
            referralAfterCodeMessage.classList.add('hide'); // Hide referral message if disconnected
        }
    });

    connectWalletBtnRolls.addEventListener('click', async () => {
        try {
            await tonConnectUI.openModal();
            // Status change is handled by onStatusChange listener
        } catch (e) {
            console.error('Wallet connection failed:', e);
            rollsInfoText.textContent = 'Wallet connection failed. Please try again.';
        }
    });

    // Simulate payment and spin
    payForRollsBtn.addEventListener('click', async () => {
        // In a real DApp, you would construct and send a transaction here
        // Example (commented out, as this is a simulation):
        /*
        try {
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes
                messages: [
                    {
                        address: 'UQD8J5QN9ygpY30_afh0pqnpmTVHePlt1WrTBg-otAUjDpNG', // Your specified wallet address
                        amount: '2000000000', // 2 TON in nanoton (2 * 10^9)
                    },
                ],
            };
            await tonConnectUI.sendTransaction(transaction);
            // If transaction successful, proceed with simulation below
        } catch (e) {
            console.error('Transaction failed:', e);
            rollsInfoText.textContent = 'Payment failed. Please try again.';
            return; // Stop execution if transaction fails
        }
        */

        // Simulate transaction loading
        loadingAnimation.classList.remove('hide');
        payForRollsBtn.classList.add('hide');
        rollsInfoText.classList.add('hide');
        spinningWheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        spinningWheel.style.transform = `rotate(${Math.random() * 360 + 1080}deg)`; // Spin 3+ times

        setTimeout(() => {
            loadingAnimation.classList.add('hide');
            checkmarkAnimation.classList.remove('hide');
            rollsInfoText.classList.remove('hide'); // Show text again
            rollsInfoText.textContent = 'Payment successful! Enter your code to claim your prize.';
            codeEntrySection.classList.remove('hide');
            // Ensure checkmark animation plays once and then hides
            checkmarkAnimation.addEventListener('loopComplete', () => {
                checkmarkAnimation.classList.add('hide');
            }, { once: true });
        }, 4000); // Simulate 4 seconds for spin + loading
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
    const claimRewardBtn = document.querySelector('.stat-value .claim-btn'); // Select the claim button

    // Update referral link with bot ID
    referralLinkInput.value = `http://t.me/ShuaaCapitalBot?start=YOUR_REFERRAL_CODE`;

    copyReferralBtn.addEventListener('click', () => {
        referralLinkInput.select();
        referralLinkInput.setSelectionRange(0, 99999); // For mobile devices
        document.execCommand('copy');
        copyReferralBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyReferralBtn.innerHTML = '<i class="far fa-copy"></i> Copy'; // Reset button text
        }, 2000);
    });

    if (claimRewardBtn) {
        claimRewardBtn.addEventListener('click', () => {
            alert('Claiming rewards simulated! In a real DApp, this would initiate a withdrawal transaction.');
            // In a real DApp, you would use tonConnectUI.sendTransaction here
        });
    }

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
