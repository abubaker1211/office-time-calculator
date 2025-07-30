document.addEventListener('DOMContentLoaded', () => {
    const navHTML = `
        <nav class="main-nav">
            <a href="index.html" class="nav-link">Home</a>
            <a href="install.html" class="nav-link">Install App</a>
            <a href="about.html" class="nav-link">About</a>
            <a href="contactus.html" class="nav-link">Contact Dev</a>
            <a href="tips.html" class="nav-link">Productivity Tips</a>
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
        const state = JSON.parse(savedState);
        if (state.isDarkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }
});