document.addEventListener('DOMContentLoaded', () => {
    const navHTML = `
      <nav class="main-nav">
    <a href="index.html" class="nav-link nav-btn active">Home</a>
    <a href="install.html" class="nav-link nav-btn">Install App</a>
    <a href="about.html" class="nav-link nav-btn">About</a>
    <a href="contactus.html" class="nav-link nav-btn">Contact Dev</a>
    <a href="tips.html" class="nav-link nav-btn">Productivity Tips</a>
    <button class="nav-link nav-btn" id="tutorialBtn" disabled>Tutorial</button>
</nav>`;

    const footerHTML = `
        <nav class="footer-nav">
            <a href="privacy.html">Privacy Policy</a> |
            <a href="terms.html">Terms of Service</a>
        </nav>
        <p>Made with <span style="color: red;">❤️</span> by Abubaker</p>`;

    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    if (header) header.innerHTML = navHTML;
    if (footer) footer.innerHTML = footerHTML;

    // Dark mode based on saved preference
    const savedState = localStorage.getItem('officeTimeCalculatorState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            if (state.isDarkMode) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        } catch (e) {
            console.error("Error parsing stored state for dark mode:", e);
            localStorage.removeItem('officeTimeCalculatorState');
        }
    }
    
    // Logic to enable/disable the tutorial button based on the page
    const tutorialButton = document.getElementById('tutorialBtn');
    if (tutorialButton) {
        const currentPath = window.location.pathname.split('/').pop();
        if (currentPath === 'index.html' || currentPath === '') {
            tutorialButton.disabled = false;
        } else {
            tutorialButton.disabled = true;
        }

        // Add the click event listener here
        tutorialButton.addEventListener('click', () => {
            // Check if the startTutorial function exists
            if (typeof window.startTutorial === 'function') {
                window.startTutorial();
            } else {
                // Optional: Provide a fallback message if the script isn't loaded
                console.error('Tutorial functionality not available on this page.');
            }
        });
    }
});