document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('shortenForm');
    const urlInput = document.getElementById('urlInput');
    const shortenBtn = document.getElementById('shortenBtn');
    const btnText = shortenBtn.querySelector('.btn-text');
    const btnLoading = shortenBtn.querySelector('.btn-loading');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const shortUrlInput = document.getElementById('shortUrl');
    const originalUrlSpan = document.getElementById('originalUrl');
    const copyBtn = document.getElementById('copyBtn');
    const copyFeedback = document.querySelector('.copy-feedback');

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        if (!url) return;

        // Show loading state
        showLoading(true);
        hideResults();

        try {
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (response.ok) {
                showResult(data.shortUrl, url);
            } else {
                showError(data.error || 'An error occurred');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Network error. Please try again.');
        } finally {
            showLoading(false);
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', async function() {
        try {
            await navigator.clipboard.writeText(shortUrlInput.value);
            showCopyFeedback();
            
            // Update button temporarily
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
            copyBtn.classList.remove('btn-outline-secondary');
            copyBtn.classList.add('btn-success');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove('btn-success');
                copyBtn.classList.add('btn-outline-secondary');
            }, 2000);
            
        } catch (error) {
            console.error('Failed to copy:', error);
            // Fallback for older browsers
            shortUrlInput.select();
            document.execCommand('copy');
            showCopyFeedback();
        }
    });

    // Auto-select short URL when clicked
    shortUrlInput.addEventListener('click', function() {
        this.select();
    });

    // Input validation
    urlInput.addEventListener('input', function() {
        hideResults();
        
        const url = this.value.trim();
        if (url && !isValidUrl(url)) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });

    function showLoading(loading) {
        if (loading) {
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            shortenBtn.disabled = true;
        } else {
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
            shortenBtn.disabled = false;
        }
    }

    function showResult(shortUrl, originalUrl) {
        shortUrlInput.value = shortUrl;
        originalUrlSpan.textContent = originalUrl;
        resultDiv.classList.remove('d-none');
        errorDiv.classList.add('d-none');
        
        // Smooth scroll to result
        setTimeout(() => {
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        errorDiv.classList.remove('d-none');
        resultDiv.classList.add('d-none');
    }

    function hideResults() {
        resultDiv.classList.add('d-none');
        errorDiv.classList.add('d-none');
    }

    function showCopyFeedback() {
        copyFeedback.classList.add('show');
        setTimeout(() => {
            copyFeedback.classList.remove('show');
        }, 3000);
    }

    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    // Add some interactive effects
    const mainCard = document.querySelector('.main-card');
    
    // Subtle hover effect for the main card
    mainCard.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
    });
    
    mainCard.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
    });

    // Focus animation for URL input
    urlInput.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    urlInput.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});