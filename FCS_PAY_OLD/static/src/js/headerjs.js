    const toggleButton = document.querySelector('.toggle-button');
        const headerDiv = document.querySelector('.headerdiv');

        // Toggle menu visibility when the button is clicked
        toggleButton.addEventListener('click', () => {
            headerDiv.classList.toggle('active');
        });